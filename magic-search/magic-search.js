var wol = window.onload;
window.onload = function () {
    if (typeof wol === 'function') wol();

    (function (mw, $) {
        var PROP_INSTANCE_OF = 'P31';
        var RuleType = Object.freeze({
            PRESENT: { value: 1, text: 'IS PRESENT' },
            NOT_PRESENT: { value: 2, text: 'IS NOT PRESENT' },
            EQUAL: { value: 3, text: 'EQUALS' },
            NOT_EQUAL: { value: 4, text: 'DOES NOT EQUAL' },
            ANY_OF: { value: 5, text: 'IS ANY OF' },
            ALL_OF: { value: 6, text: 'IS ALL OF' },
            NONE_OF: { value: 7, text: 'IS NONE OF' }
        });
        var valueToRuleType = [];
        for (var idx in RuleType) {
            if (RuleType.hasOwnProperty(idx)) {
                var type = RuleType[idx];
                valueToRuleType['' + type.value] = type;
            }
        }

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
                        type: RuleType.IS,
                        property: 'P31',
                        link: 'https://www.wikidata.org/wiki/Property:P31',
                        caption: 'instance of',
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
                $('.wikibase-snakview-variation-valuesnak a[href^="/wiki/Q"]').after($('<button class="sbt-btn">+</button>').click(addItemValue));
                // TODO: .wikibase-snakview-variation-novaluesnak, .wikibase-snakview-variation-somevaluesnak
            });
        });

        function addProperty() {
            var $button = $(this);
            var $link = $button.parent().children('a').first();
            var url = $link.attr('href');
            var property = getPropertyFromUrl(url);
            for (var i = 0; i < model.length; ++i) {
                if (model[i].property === property) return;
            }
            model.push({
                property: property,
                link: url,
                caption: $link.text(),
                type: RuleType.PRESENT,
                values: null
            });
            rerenderUiRules();
        }

        function getPropertyFromUrl(url) {
            var colon = url.lastIndexOf(':');
            return url.substr(colon + 1);
        }

        function getEntityFromUrl(url) {
            var slash = url.lastIndexOf('/');
            return url.substr(slash + 1);
        }

        function addItemValue() {
            var $button = $(this);
            var $entityLink = $button.parent().children('a').first();
            var entityUrl = $entityLink.attr('href');
            var entity = getEntityFromUrl(entityUrl);
            var $propertyLink = $button.closest('.wikibase-statementgroupview').find('.wikibase-statementgroupview-property-label').children('a').first();
            var propertyUrl = $propertyLink.attr('href');
            var property = getPropertyFromUrl(propertyUrl);
            var existingItem = null;
            for (var i = 0; i < model.length; ++i) {
                if (model[i].property === property) {
                    existingItem = model[i];
                    break;
                }
            }
            if (existingItem && existingItem.values && existingItem.values.length) {
                for (var j = 0; j < existingItem.values.length; ++j) {
                    var value = existingItem.values[i];
                    if (value.link === entityUrl) {
                        return;
                    }
                }
            }
            var newValue = {
                link: entityUrl,
                caption: $entityLink.text(),
                sparql: 'wd:' + entity
            };
            if (!existingItem) {
                model.push({
                    property: property,
                    link: propertyUrl,
                    caption: $propertyLink.text(),
                    type: RuleType.EQUAL,
                    values: [newValue]
                });
            } else {
                existingItem.values = (existingItem.values || []);
                existingItem.values.push(newValue);

                switch (existingItem.type) {
                    case RuleType.EQUAL:
                        existingItem.type = RuleType.ALL_OF;
                        break;
                    case RuleType.NOT_EQUAL:
                        existingItem.type = RuleType.NONE_OF;
                        break;
                    case RuleType.PRESENT:
                        existingItem.type = RuleType.EQUAL;
                        break;
                    case RuleType.NOT_PRESENT:
                        existingItem.type = RuleType.NOT_EQUAL;
                        break;
                }
            }
            rerenderUiRules();
        }

        function executeSearch() {
            var sparql = 'SELECT DISTINCT ?item ?itemLabel WHERE {\n';
            for (var i = 0; i < model.length; ++i) {
                var item = model[i];
                switch (item.type) {
                    case RuleType.EQUAL:
                    case RuleType.NOT_EQUAL:
                    case RuleType.ANY_OF:
                    case RuleType.ALL_OF:
                    case RuleType.NONE_OF:
                        var noneOfType = item.type === RuleType.NONE_OF;
                        var negativeType = noneOfType || item.type === RuleType.NOT_EQUAL;
                        var cumulativeType = noneOfType || item.type === RuleType.ANY_OF;
                        var anyOfType = item.type === RuleType.ANY_OF;
                        var typeWithBlock = negativeType || anyOfType;
                        if (negativeType) sparql += '\tMINUS {\n';
                        else if (anyOfType) sparql += '\t{\n';
                        var tabs = typeWithBlock ? '\t\t' : '\t';

                        for (var j = 0; j < item.values.length; ++j) {
                            var value = item.values[j];
                            sparql += tabs;
                            if (cumulativeType) {
                                if (j > 0) sparql += 'OR ';
                                sparql += '{ ';
                            }
                            sparql += '?item wdt:' + item.property + ' ' + value.sparql;
                            if (cumulativeType) sparql += ' }\n';
                            else sparql += ' .\n';
                        }

                        if (typeWithBlock) sparql += '\t}\n';
                        break;
                    case RuleType.PRESENT:
                        sparql += '\t?item wdt:' + item.property + ' ?any' + item.property + ' .\n';
                        break;
                    case RuleType.NOT_PRESENT:
                        sparql += '\tMINUS { ?item wdt:' + item.property + ' ?any' + item.property + ' }\n';
                        break;
                }
            }
            sparql += '\tSERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". ?item rdfs:label ?itemLabel. }\n}\nLIMIT 30';

            var sparqlUrl = 'https://query.wikidata.org/embed.html#' + encodeURI(sparql);
            window.open(sparqlUrl);

            // alert(sparql);
        }

        function rerenderUiRules() {
            $uirulelist.html('');
            var searchableModel = false;
            for (var i = 0; i < model.length; ++i) {
                var item = model[i];
                if ((item.type !== RuleType.PRESENT && item.type !== RuleType.NOT_PRESENT) || item.property !== PROP_INSTANCE_OF) searchableModel = true;
                var $item = $('<li>');
                $item.append($('<a>').attr('href', item.link).append($('<i>').text(item.caption)));
                switch (item.type) {
                    case RuleType.EQUAL:
                    case RuleType.NOT_EQUAL:
                        renderTypeSelector(item, $item);
                        $item.append(' ');
                        renderSingleValue(item.values[0], $item);
                        break;
                    case RuleType.ANY_OF:
                    case RuleType.ALL_OF:
                    case RuleType.NONE_OF:
                        renderTypeSelector(item, $item);
                        var $values = $('<ul>');
                        $item.append($values);
                        for (var j = 0; j < item.values.length; ++j) {
                            var $value = $('<li>');
                            renderSingleValue(item.values[j], $value);
                            $values.append($value);
                        }
                        break;
                    case RuleType.PRESENT:
                    case RuleType.NOT_PRESENT:
                        renderTypeSelector(item, $item);
                        break;
                }
                $uirulelist.append($item);
            }
            $searchbtn.prop('disabled', !searchableModel);
            $clearbtn.prop('disabled', !model.length);
        }

        function renderTypeSelector(item, $container) {
            var $select = $('<select>').data('wd-prop', item.property);
            switch (item.type) {
                case RuleType.EQUAL:
                case RuleType.NOT_EQUAL:
                    renderOption(RuleType.EQUAL, item.type, $select);
                    renderOption(RuleType.NOT_EQUAL, item.type, $select);
                    break;
                case RuleType.ANY_OF:
                case RuleType.ALL_OF:
                case RuleType.NONE_OF:
                    renderOption(RuleType.ANY_OF, item.type, $select);
                    renderOption(RuleType.ALL_OF, item.type, $select);
                    renderOption(RuleType.NONE_OF, item.type, $select);
                    break;
                case RuleType.PRESENT:
                case RuleType.NOT_PRESENT:
                    renderOption(RuleType.PRESENT, item.type, $select);
                    renderOption(RuleType.NOT_PRESENT, item.type, $select);
                    break;
            }
            $select.change(typeChanged);
            $container.append(' ');
            $container.append($select);
        }

        function typeChanged() {
            var $select = $(this);
            var property = $select.data('wd-prop');
            var selectedType = valueToRuleType[$select.val()];
            for (var i = 0; i < model.length; ++i) {
                var item = model[i];
                if (item.property === property) {
                    item.type = selectedType;
                    // TODO: validateSearchability();
                    return;
                }
            }
        }

        function renderOption(ruleType, currentType, $select) {
            var $option = $('<option>', { value: ruleType.value }).text(ruleType.text).prop('selected', ruleType === currentType);
            $select.append($option);
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
