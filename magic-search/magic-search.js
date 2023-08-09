/* global mediaWiki, jQuery */

(function () {
    var wol;
    function initMagicSearch() {
        if (typeof wol === 'function') wol();

        (function (mw, $) {
            var entityId = mw.config.get('wbEntityId');
            if (!entityId) {
                return;
            }

            mw.loader.using(['mediawiki.util']).then(function () {
                var portletLink = mw.util.addPortletLink(
                    'p-tb',
                    '#',
                    // TODO: i18n in this loader
                    // msgs.portletlink,
                    'Hledat podle této',
                    'sbt-portletlink',
                    // msgs.portlettooltip
                    'Hledání dalších položek na základě této položky'
                );
                var uiboxLoading = false;
                $(portletLink).click(function (e) {
                    e.preventDefault();

                    if (uiboxLoading) return;
                    uiboxLoading = true;

                    var $uibox = $('<div id="sbt-uibox">');
                    $uibox.append($('<img src="https://upload.wikimedia.org/wikipedia/commons/f/f8/Ajax-loader%282%29.gif" />'));
                    $(document.body).append($uibox);

                    mw.loader.load('https://mormegil-cz.github.io/wikidata-tools/magic-search/magic-search-main.js');
                });
            });
        })(mediaWiki, jQuery);
    };
    if (document.readyState === 'complete') {
        wol = null;
        initMagicSearch();
    } else {
        wol = window.onload;
        window.onload = initMagicSearch;
    }
})();
