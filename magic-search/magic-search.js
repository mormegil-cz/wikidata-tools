/* global mediaWiki, jQuery */

var wol = window.onload;
window.onload = function () {
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
                $uibox.append($('<img src="https://upload.wikimedia.org/wikipedia/commons/b/b1/Loading_icon.gif" />'));
                $(document.body).append($uibox);

                mw.loader.load('https://rawgit.com/mormegil-cz/wikidata-tools/master/magic-search/magic-search-main.js');
            });
        });
    })(mediaWiki, jQuery);
};
