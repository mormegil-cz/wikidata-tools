$(function() {
    function linkOpener(url) {
        return function() {
            window.open(url);
            return false;
        }
    }
    function init(propertyData) {
        $('.wikibase-statementgroupview').each(function() {
            var $property = $(this);
            var pid = $property.data('property-id');
            var propDef = propertyData[pid];
            if (!propDef) return;

            $property.find('.wikibase-statementview').each(function() {
                var $statement = $(this);
                var $link = $statement.find('.wikibase-statementview-mainsnak .wb-external-id');
                var ident = $link.text();
                var $dropdown = $('<select><option value="">More links</value></select>');
                for (var i = 0; i < propDef.length; ++i) {
                    var linkDef = propDef[i];
                    var url = linkDef.u.replace('$1', encodeURIComponent(ident));
                    $linkOption = $('<option>');
                    $linkOption.text(linkDef.c);
                    $linkOption.attr('title', url);
                    $linkOption.click(linkOpener(url));
                    $dropdown.append($linkOption);
                }
                var $dropdownContainer = $('<span> </span>');
                $dropdownContainer.append($dropdown);
                $link.parent().append($dropdownContainer);
            });
        });
    }

    $.ajax({
        dataType: "json",
        url: "https://raw.githubusercontent.com/mormegil-cz/wikidata-tools/master/third-party-url/propertyData.json",
        success: init
      });
});
