var wol = window.onload;
window.onload = function () {
    if (typeof wol === 'function') wol();

    (function (mw, $) {
        var uiVisible = false;
        var model = [];
        var $uirulelist = null;
        var $searchbtn = null;
        var $clearbtn = null;

        mw.loader.using(['mediawiki.util']).then(function () {
            var entityId = mw.config.get('wbEntityId');
            if (!entityId) {
                return;
            }
            var portletLink = mw.util.addPortletLink(
                'p-tb',
                '#',
                'Hledat podle této',
                't-wdtree',
                'Hledání dalších položek na základě této položky'
            );
            $(portletLink).click(function (e) {
                e.preventDefault();

                if (uiVisible) return;
                uiVisible = true;

                // TODO: mode for NONE OF?
                /*
                model = [
                    {
                        property: 'P31',
                        link: 'https://www.wikidata.org/wiki/Property:P31',
                        caption: 'instance of',
                        mode: true,
                        values: [{
                            link: 'https://www.wikidata.org/wiki/Q5',
                            caption: 'human',
                            sparql: 'wd:Q5'
                        }]
                    },
                    {
                        property: 'P54',
                        link: 'https://www.wikidata.org/wiki/Property:P54',
                        caption: 'member of sports team',
                        mode: false,
                        values: [
                            {
                                link: 'https://www.wikidata.org/wiki/Q193481',
                                caption: 'AC Sparta Prague',
                                sparql: 'wd:Q193481'
                            },
                            {
                                link: 'https://www.wikidata.org/wiki/Q839313',
                                caption: 'SK Dynamo České Budějovice',
                                sparql: 'wd:Q839313'
                            },
                        ]
                    },
                    {
                        property: 'P413',
                        link: 'https://www.wikidata.org/wiki/Property:P413',
                        caption: 'position played on team / speciality',
                        mode: false,
                        values: null
                    },
                ];
                */

                var $uibox = $('<div class="sbt-uibox">');
                $uibox.append($('<a href="#" class="sbt-close">').text('x').click(function () {
                    uiVisible = false;
                    $uibox.remove();
                    $('.sbt-btn').remove();
                    $uirulelist = null;
                    $searchbtn = null;
                    $clearbtn = null;
                    return false;
                }));
                $uibox.append($('<h3>Hledat podle této</h3>'));
                $uirulelist = $('<ul class="sbt-rulelist">');
                $uibox.append($uirulelist);
                $searchbtn = $('<button>').text('Hledat');
                $searchbtn.click(executeSearch);
                $uibox.append($searchbtn);
                $clearbtn = $('<button>').text('Smazat vše');
                $clearbtn.click(function () {
                    if (model.length === 0) return false;
                    if (!confirm('Opravdu smazat vše?')) return false;
                    model = [];
                    rerenderUiRules();
                });
                $uibox.append($clearbtn);

                rerenderUiRules();
                $(document.body).append($uibox);

                $('.wikibase-statementgroupview-property-label').append($('<button class="sbt-btn">+</button>').click(addProperty));
            });
        });

        function addProperty() {
            var $button = $(this);
            var $link = $button.parent().children('a').first();
            var url = $link.attr('href');
            var colon = url.lastIndexOf(':');
            var property = url.substr(colon + 1);
            for (var i = 0; i < model.length; ++i) {
                if (model[i].property === property) return;
            }
            model.push({
                property: property,
                link: url,
                caption: $link.text(),
                mode: true,
                values: null
            });
            rerenderUiRules();
        }

        function executeSearch() {
            var sparql = 'SELECT DISTINCT ?item ?itemLabel WHERE {\n';
            for (var i = 0; i < model.length; ++i) {
                var item = model[i];
                if (item.values && item.values.length) {
                    if (item.values.length > 1 || item.mode) {
                        var tabs = item.mode ? '\t' : '\t\t';
                        if (!item.mode) sparql += '\t{';
                        for (var j = 0; j < item.values.length; ++j) {
                            var value = item.values[j];
                            sparql += tabs;
                            if (!item.mode) {
                                if (j > 0) sparql += 'OR ';
                                sparql += '{ ';
                            }
                            sparql += '?item wdt:' + item.property + ' ' + value.sparql + ' .\n';
                            if (!item.mode) sparql += ' }';
                        }
                        if (!item.mode) sparql += '\t}';
                    } else {
                        sparql += '\tMINUS { ?item wdt:' + item.property + ' ' + item.values[0].sparql + ' }\n';
                    }
                } else {
                    if (item.mode) {
                        sparql += '\t?item wdt:' + item.property + ' ?any' + item.property + ' .\n';
                    } else {
                        sparql += '\tMINUS { ?item wdt:' + item.property + ' ?any' + item.property + ' }\n';
                    }
                }
            }
            sparql += '\tSERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". ?item rdfs:label ?itemLabel. }\n}\nLIMIT 30';

            var sparqlUrl = 'https://query.wikidata.org/embed.html#' + encodeURI(sparql);
            window.open(sparqlUrl);

            //alert(sparql);
        }

        function rerenderUiRules() {
            $uirulelist.html('');
            var validModel = false;
            for (var i = 0; i < model.length; ++i) {
                var item = model[i];
                var $item = $('<li>');
                $item.append($('<a>').attr('href', item.link).append($('<i>').text(item.caption)));
                if (item.values && item.values.length) {
                    item.validModel = true;
                    if (item.values.length > 1) {
                        if (item.mode) $item.append(' IS ALL OF');
                        else $item.append(' IS ONE OF');

                        var $values = $('<ul>');
                        $item.append($values);
                        for (var j = 0; j < item.values.length; ++j) {
                            var $value = $('<li>');
                            renderSingleValue(item.values[j], $value);
                            $values.append($value);
                        }
                    } else {
                        if (item.mode) {
                            $item.append(' IS ');
                            renderSingleValue(item.values[0], $item);
                        } else {
                            $item.append(' IS NOT ');
                            renderSingleValue(item.values[0], $item);
                        }
                    }
                } else {
                    if (item.property !== 'P31') validModel = true;

                    if (item.mode) {
                        $item.append(' IS PRESENT');
                    } else {
                        $item.append(' IS NOT PRESENT');
                    }
                }
                $uirulelist.append($item);
            }
            $searchbtn.prop('disabled', !validModel);
            $clearbtn.prop('disabled', !model.length);
        }

        function renderSingleValue(value, $container) {
            if (value.link) {
                $container.append($('<a>').attr('href', value.link).append($('<i>').text(value.caption)));
            } else {
                $container.append($('<i>').text(value.caption));
            }
        }

    }(mediaWiki, jQuery));

};
