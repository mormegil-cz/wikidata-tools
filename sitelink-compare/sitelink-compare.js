$(() => {
    var $compareBtnSpan = $("<span class='wikibase-toolbarbutton wikibase-toolbar-item wikibase-toolbar-button wikibase-toolbar-button-add'>");
    var $compareBtn = $('<a href="#">');
    $compareBtn.text('Compare sitelinks with another item');
    $compareBtnSpan.append($compareBtn);
    var $siteLinkView = $(".wikibase-sitelinkgrouplistview")
    $siteLinkView.append($compareBtnSpan);

    var windowManager = new OO.ui.WindowManager();
    $(document.body).append(windowManager.$element);

    $compareBtn.click(() => {
        var compareWith = prompt("Compare with which item", "Q42");
        if (!compareWith) return;
        if (compareWith.startsWith("https://www.wikidata.org/wiki/")) compareWith = compareWith.substr("https://www.wikidata.org/wiki/".length);
        if (!compareWith.startsWith("Q")) {
            alert("Invalid item ID");
            return;
        }

        var otherSiteLinksPromise = retrieveSiteLinksFromItem(compareWith);
        var thisSitelinks = gatherSiteLinks($siteLinkView);

        otherSiteLinksPromise.then(otherSiteLinks => {
            if (!otherSiteLinks) return;

            var comparison = merge(thisSitelinks, otherSiteLinks);
            var groupedComparison = groupBySiteGroup(comparison);

            showResults(groupedComparison);
        });
        return false;
    });

    function retrieveSiteLinksFromItem(qid) {
        var apiUrl = new URL('https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=sitelinks%7Csitelinks%2Furls&ids=' + qid);
        return fetch(apiUrl)
            .then(response => {
                if (response.status !== 200) {
                    console.error(response);
                    alert('Failed fetching the other item');
                    return null;
                }

                return response.json();
            })
            .then(data => {
                return data.entities[qid].sitelinks;
            });
    }

    function gatherSiteLinks($siteLinkView) {
        var results = {};
        $siteLinkView.find('.wikibase-sitelinkgroupview .wikibase-sitelinkview').each(function () {
            var $siteLink = $(this);
            var wiki = $siteLink.data('wb-siteid');
            var $link = $siteLink.find('.wikibase-sitelinkview-page a');
            var title = $link.text();
            var url = $link.attr('href');
            results[wiki] = { title: title, url: url };
        });
        return results;
    }

    function merge(thisSiteLinks, otherSiteLinks) {
        var results = {};
        for (var site in thisSiteLinks) {
            results[site] = { mine: thisSiteLinks[site], other: otherSiteLinks[site] };
        }
        for (var otherSite in otherSiteLinks) {
            if (!results[otherSite]) {
                results[otherSite] = { mine: null, other: otherSiteLinks[otherSite] };
            }
        }
        return results;
    }

    function groupBySiteGroup(comparison) {
        var results = {};
        for (var site in comparison) {
            var groupName = getGroupOfSite(site);
            var group = results[groupName] || {};
            group[site] = comparison[site];
            results[groupName] = group;
        }
        return results;
    }

    function getGroupOfSite(site) {
        if (site.endsWith("wikibooks")) return "Wikibooks";
        if (site.endsWith("wikinews")) return "Wikinews";
        if (site.endsWith("wikiquote")) return "Wikiquote";
        if (site.endsWith("wikisource")) return "Wikisource";
        if (site.endsWith("wikiversity")) return "Wikiversity";
        if (site.endsWith("wikivoyage")) return "Wikivoyage";
        if (site.endsWith("wiktionary")) return "Wiktionary";
        if (!site.endsWith("wiki")) return "Other";
        if (site.length <= 7) return "Wikipedia";
        if (site.indexOf("_") >= 0) return "Wikipedia";
        return "Other";
    }

    function showResults(groupedComparison) {
        var dialog = new ComparisonDialog(groupedComparison);
        windowManager.addWindows([dialog]);
        windowManager.openWindow(dialog);
    }

    function ComparisonDialog(groupedComparison, config) {
        ComparisonDialog.super.call(this, config || {});

        this.groupedComparison = groupedComparison;
    }
    OO.inheritClass(ComparisonDialog, OO.ui.Dialog);
    ComparisonDialog.static.name = 'comparisonDialog';
    ComparisonDialog.prototype.initialize = function () {
        ComparisonDialog.super.prototype.initialize.call(this);
        this.content = new OO.ui.PanelLayout({ padded: true, expanded: false });

        var $comparison = $('<div>');
        for (var group in this.groupedComparison) {
            var links = this.groupedComparison[group];
            $comparison.append($('<h2>').text(group));
            var $table = $('<table class="wikitable">');
            $table.append('<tr><th>Site</th><th>This item</th><th>Other item</th></tr>');
            for (var siteId in links) {
                var site = links[siteId];
                if (site.mine && site.other) {
                    addSiteLinkTableRow($table, siteId, links[siteId]);
                }
            }
            for (var siteId in links) {
                var site = links[siteId];
                if (!site.mine || !site.other) {
                    addSiteLinkTableRow($table, siteId, links[siteId]);
                }
            }
            $comparison.append($table);
        }

        this.content.$element.append($comparison);
        this.$body.append(this.content.$element);
    };
    ComparisonDialog.prototype.getBodyHeight = function () {
        return this.content.$element.outerHeight(true);
    };

    function addSiteLinkTableRow($table, siteId, site) {
        var $tr = $('<tr>');
        $tr.addClass((site.mine && site.other) ? 'sitelink-compare-overlap' : 'sitelink-compare-different');
        $tr.append($('<th>').text(siteId));
        addSiteLinkToTable($tr, site.mine);
        addSiteLinkToTable($tr, site.other);
        $table.append($tr);
    }

    function addSiteLinkToTable($tr, site) {
        if (site) {
            $tr.append($('<td>').append($('<a>').attr('href', site.url).text(site.title)));
        } else {
            $tr.append('<td class="sitelink-compare-missing">(none)</td>');
        }
    }
});
