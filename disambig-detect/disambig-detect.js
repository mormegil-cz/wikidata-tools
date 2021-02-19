$(() => {
    $('#sitelinks-wikipedia').each(function () {
        var $sitelinkSection = $(this);
        $detectBtn = $('<a href="#">');
        $detectBtn.text('[disambig]');
        $sitelinkSection.nextAll('.wikibase-toolbar-container').first().append($detectBtn);
        $detectBtn.click(() => {
            $sitelinkSection.parents('.wikibase-sitelinkgroupview').find('.wikibase-sitelinkview-link').each(function () {
                $detectBtn.remove();
                var $sitelink = $(this);
                var url = new URL($sitelink.find('a').attr('href'));
                var pageName = url.pathname.substr(url.pathname.lastIndexOf('/') + 1);

                var $icon = $('<img width="20" height="20">');
                $icon.attr('src', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Loading_icon_cropped.gif/20px-Loading_icon_cropped.gif');
                $icon.prependTo($sitelink);

                var apiUrl = new URL('/w/api.php?action=query&format=json&origin=*&prop=info%7Cpageprops&titles=' + pageName, url.origin);
                fetch(apiUrl)
                    .then((response) => {
                        if (response.status !== 200) {
                            console.error('Failed fetching info about ' + url, response);
                            $icon.attr('src', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Icon_Simple_Error.png/20px-Icon_Simple_Error.png');
                            return;
                        }

                        return response.json();
                    })
                    .then((data) => {
                        for (var page in data.query.pages) {
                            if (!data.query.pages.hasOwnProperty(page)) continue;

                            var pageData = data.query.pages[page];
                            var isRedirect = pageData.hasOwnProperty('redirect');
                            var isDisambig = pageData.pageprops && pageData.pageprops.hasOwnProperty('disambiguation');

                            $icon.attr('src', isRedirect ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Redirect_arrow_without_text_(cropped).svg/20px-Redirect_arrow_without_text_(cropped).svg.png' : (isDisambig ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Disambig.svg/20px-Disambig.svg.png' : 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Article_icon_cropped.svg/20px-Article_icon_cropped.svg.png'));
                            break;
                        }
                    });
            });
            return false;
        });
    });
});
