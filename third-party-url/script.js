$(function() {
    let lastClickedUrl = '';
    let lastOpenTime = -1;
    function linkOnClickOpener(url) {
        return function() {
            const now = Date.now();
            if (url === lastClickedUrl && now - lastOpenTime < 100) return;
            lastClickedUrl = url;
            lastOpenTime = now;
            window.open(url);
            return false;
        }
    }
    function selectChanged(evt) {
        var url = evt.target.value;
        if (url && url !== lastClickedUrl) {
            window.open(url);
            lastOpenTime = Date.now();
        }
        lastClickedUrl = url;
        return false;
    }
    function init(propertyData) {
        $('.wikibase-statementgroupview').each(function() {
            var $property = $(this);
            var pid = $property.data('property-id');
            var propDef = propertyData[pid];
            if (!propDef) return;

            $property.find('.wikibase-statementview').each(function() {
                var $statement = $(this);
                var $valueSnak = $statement.find('.wikibase-statementview-mainsnak .wikibase-snakview-variation-valuesnak');
                var ident = $valueSnak.text();
                var $dropdown = $('<select><option value="">More links</value></select>');
                $dropdown.change(selectChanged);
                var linkCount = 0;
                for (var i = 0; i < propDef.length; ++i) {
                    var linkDef = propDef[i];
                    var regexp = linkDef.r;
                    if (regexp && !(new RegExp(regexp).test(ident))) continue;
                    var url = linkDef.u.replace('$1', encodeURIComponent(ident));
                    $linkOption = $('<option>');
                    $linkOption.text(linkDef.c);
                    $linkOption.attr('title', url);
                    $linkOption.prop('value', url);
                    $linkOption.click(linkOnClickOpener(url));
                    $dropdown.append($linkOption);
                    ++linkCount;
                }
                if (linkCount) {
                    var $dropdownContainer = $('<span> </span>');
                    $dropdownContainer.append($dropdown);
                    $valueSnak.append($dropdownContainer);
                }
            });
        });
    }

    var entityId = mediaWiki.config.get('wbEntityId');
    if (!entityId) {
        return;
    }

    $.ajax({
        dataType: "json",
        url: "https://mormegil-cz.github.io/wikidata-tools/third-party-url/propertyData.json",
        success: init
      });
});
