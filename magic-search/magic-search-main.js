/* global jQuery */

(function ($) {
    var PROP_INSTANCE_OF = 'P31';
    var RuleType = Object.freeze({
        PRESENT: 1,
        NOT_PRESENT: 2,
        EQUAL: 3,
        NOT_EQUAL: 4,
        ANY_OF: 5,
        ALL_OF: 6,
        NONE_OF: 7
        // TODO: DIFFERENT_THAN, DIFFERENT_THAN_ALL_OF
    });
    var ValueType = Object.freeze({
        VALUE: 1,
        NOVALUE: 2,
        SOMEVALUE: 3
    });
    var recursiveDefinitions = Object.freeze({
        // complicated cases:
        // - (father | mother)* father
        'P22': '(wdt:P22|wdt:P25)*/wdt:P22',
        // - (father | mother)* mother
        'P25': '(wdt:P22|wdt:P25)*/wdt:P25',
        // - lake inflow / origin of the watercourse / tributary
        'P200': '(wdt:P200|wdt:P885|wdt:P974)+',
        // - lake outflow / mouth of the watercourse
        'P201': '(wdt:P201|wdt:P403)+',
        // - mouth of the watercourse / lake outflow
        'P403': '(wdt:P201|wdt:P403)+',
        // - origin of the watercourse / lake inflow / tributary
        'P885': '(wdt:P200|wdt:P885|wdt:P974)+',
        // - tributary / lake inflow / origin of the watercourse
        'P974': '(wdt:P200|wdt:P885|wdt:P974)+',
        // apply subclasses:
        // - instance of
        'P31': 'wdt:P31/wdt:P279*',
        // - canonization status
        'P411': 'wdt:P411/wdt:P279*',
        // apply "said to be the same as"
        // - family name
        'P734': 'wdt:P734/wdt:P460*',
        // - given name
        'P735': 'wdt:P735/wdt:P460*',
        // plain recursion:
        // - child
        'P40': 'wdt:P40+',
        // - located in the administrative territorial entity
        'P131': 'wdt:P131+',
        // - named after
        'P138': 'wdt:P138+',
        // - parent taxon
        'P171': 'wdt:P171+',
        // - location
        'P276': 'wdt:P276+',
        // - subclass of
        'P279': 'wdt:P279+',
        // - part of
        'P361': 'wdt:P361+',
        // - said to be the same as
        'P460': 'wdt:P460+',
        // - has part
        'P527': 'wdt:P527+',
        // - anatomical location
        'P927': 'wdt:P927+',
        // - relative
        'P1038': 'wdt:P1038+',
        // - equivalent class
        'P1709': 'wdt:P1709+',
        // - exact match
        'P2888': 'wdt:P2888+',
        // - sibling
        'P3373': 'wdt:P3373+',
        // - step parent
        'P3448': 'wdt:P3448+'
    });
    var i18n = {
        cs: {
            portletlink: 'Hledat podle této',
            portlettooltip: 'Hledání dalších položek na základě této položky',
            heading: 'Hledat podle této',
            searchbtn: 'Hledat',
            sparqlbtn: 'SPARQL',
            clearbtn: 'Smazat vše',
            clearconfirm: 'Opravdu smazat vše?',
            remove: '❌',

            type1: 'je definováno',
            type2: 'není definováno',
            type3: 'je rovno',
            type4: 'není rovno',
            type5: 'je libovolné z',
            type6: 'je všechno z',
            type7: 'je žádné z'
        },
        en: {
            portletlink: 'Search by this',
            portlettooltip: 'Search for other items based on this one',
            heading: 'Search by this',
            searchbtn: 'Search',
            sparqlbtn: 'SPARQL',
            clearbtn: 'Clear all',
            clearconfirm: 'Really clear all?',
            remove: '❌',

            type1: 'is present',
            type2: 'is not present',
            type3: 'is equal to',
            type4: 'is not equal to',
            type5: 'is any of',
            type6: 'is all of',
            type7: 'is none of'
        }
    };
    var lang = $('html').attr('lang') || 'en';
    var msgs = i18n[lang] || i18n['en'];

    var model = [];
    var $uibox = null;
    var $uirulelist = null;
    var $searchbtn = null;
    var $sparqlbtn = null;
    var $clearbtn = null;

    reinstallFull();

    function reinstallFull() {
        var $portletLink = $('#sbt-portletlink');
        $portletLink.click(function (e) {
            e.preventDefault();
            displayUiBox();
        });

        $('#sbt-uibox').remove();
        displayUiBox();
    }

    function displayUiBox() {
        if ($uibox) return;

        $uibox = $('<div id="sbt-uibox">');
        $uibox.append($('<a href="#" class="sbt-close">').text('x').click(closeUibox));
        $uibox.append($('<h3>').text(msgs.heading));
        $uirulelist = $('<ul class="sbt-rulelist">');
        $uibox.append($uirulelist);
        $searchbtn = $('<button>').text(msgs.searchbtn);
        $searchbtn.click(executeSearch);
        $uibox.append($searchbtn);
        $sparqlbtn = $('<button>').text(msgs.sparqlbtn);
        $sparqlbtn.click(editSparql);
        $uibox.append($sparqlbtn);
        $clearbtn = $('<button>').text(msgs.clearbtn);
        $clearbtn.click(clearModel);
        $uibox.append($clearbtn);

        rerenderUiRules();
        $(document.body).append($uibox);

        $('.wikibase-statementgroupview-property-label').append($('<button class="sbt-btn">+</button>').click(addProperty));
        $('.wikibase-statementview-mainsnak .wikibase-snakview-variation-valuesnak a[href^="/wiki/Q"]').after($('<button class="sbt-btn">+</button>').click(addItemValue));
        $('.wikibase-statementview-mainsnak .wikibase-snakview-value.wikibase-snakview-variation-novaluesnak').append($('<button class="sbt-btn">+</button>').click(addNoValue));
        $('.wikibase-statementview-mainsnak .wikibase-snakview-value.wikibase-snakview-variation-somevaluesnak').append($('<button class="sbt-btn">+</button>').click(addSomeValue));
    }

    function clearModel() {
        if (model.length === 0) return false;
        if (!confirm(msgs.clearconfirm)) return false;
        model = [];
        rerenderUiRules();
    }

    function closeUibox() {
        $uibox.remove();
        $uibox = null;
        $('.sbt-btn').remove();
        $uirulelist = null;
        $searchbtn = null;
        $sparqlbtn = null;
        $clearbtn = null;
    }

    function addProperty() {
        var $button = $(this);
        var $link = $button.parent().children('a').first();
        // TODO: Instead of screenscraping, retrieve from JS data model
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
        // TODO: Instead of screenscraping, retrieve from JS data model
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
                var value = existingItem.values[j];
                if (value.type === ValueType.VALUE && value.link === entityUrl) {
                    return;
                }
            }
        }
        var newValue = {
            type: ValueType.VALUE,
            entity: entity,
            link: entityUrl,
            caption: $entityLink.text(),
            sparql: 'wd:' + entity,
            recursive: ''
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

    function addSpecialValue($button, type) {
        var $noValueSpan = $button.parent().children('span').first();
        var $propertyLink = $button.closest('.wikibase-statementgroupview').find('.wikibase-statementgroupview-property-label').children('a').first();
        // TODO: Instead of screenscraping, retrieve from JS data model
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
                var value = existingItem.values[j];
                if (value.type === type) {
                    return;
                }
            }
        }
        var newValue = {
            type: type,
            caption: $noValueSpan.text()
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

    function addNoValue() {
        addSpecialValue($(this), ValueType.NOVALUE);
    }

    function addSomeValue() {
        addSpecialValue($(this), ValueType.SOMEVALUE);
    }

    function editSparql() {
        doSparql(false);
    }

    function executeSearch() {
        doSparql(true);
    }

    function doSparql(runQuery) {
        var positivePatterns = [];
        var negativePatterns = [];
        for (var i = 0; i < model.length; ++i) {
            var item = model[i];
            switch (item.type) {
                case false:
                //case RuleType.ALL_OF:
                    var requireSomeValue = false;
                    var requireNoValue = false;
                    var values = [];
                    for (var k = 0; k < item.values.length; ++k) {
                        var valueK = item.values[k];
                        switch (valueK.type) {
                            case ValueType.VALUE:
                                if (values.length) values.push(', ');
                                else values.push('\t?item wdt:', item.property, ' ');
                                values.push(valueK.sparql);
                                break;
                            case ValueType.SOMEVALUE:
                                requireSomeValue = true;
                                break;
                            case ValueType.NOVALUE:
                                requireNoValue = true;
                                break;
                        }
                    }
                    if (values.length) {
                        values.push(' .\n');
                        positivePatterns.push(values.join(''));
                    }
                    if (requireNoValue) {
                        positivePatterns.push('\t?item a wdno:' + item.property + ' .\n');
                    }
                    if (requireSomeValue) {
                        positivePatterns.push('\t?item wdt:' + item.property + ' ?some' + item.property + ' .\n');
                        positivePatterns.push('\tMINUS { ?some' + item.property + ' rdfs:label [] }\n');
                    }
                    break;

                case RuleType.EQUAL:
                case RuleType.NOT_EQUAL:
                case RuleType.ALL_OF:
                case RuleType.ANY_OF:
                case RuleType.NONE_OF:
                    var noneOfType = item.type === RuleType.NONE_OF;
                    var negativeType = noneOfType || item.type === RuleType.NOT_EQUAL;
                    var cumulativeType = noneOfType || item.type === RuleType.ANY_OF;
                    var anyOfType = item.type === RuleType.ANY_OF;
                    var typeWithBlock = negativeType || anyOfType;
                    var pattern = '';
                    if (negativeType) pattern += '\tMINUS {\n';
                    else if (anyOfType) pattern += '\t{\n';
                    var tabs = typeWithBlock ? '\t\t' : '\t';

                    for (var j = 0; j < item.values.length; ++j) {
                        var valueJ = item.values[j];
                        pattern += tabs;
                        if (cumulativeType) {
                            if (j > 0) pattern += 'UNION ';
                            pattern += '{ ';
                        }
                        var needsDot;
                        switch (valueJ.type) {
                            case ValueType.VALUE:
                                pattern += '?item ' + (valueJ.recursive ? valueJ.recursive : ('wdt:' + item.property)) + ' ' + valueJ.sparql;
                                needsDot = true;
                                break;
                            case ValueType.NOVALUE:
                                pattern += '?item a wdno:' + item.property;
                                needsDot = true;
                                break;
                            case ValueType.SOMEVALUE:
                                if (cumulativeType) pattern += '\n';
                                pattern += tabs;
                                if (cumulativeType) pattern += '\t';
                                pattern += '?item wdt:' + item.property + ' ?some' + item.property + ' .\n';
                                pattern += tabs;
                                if (cumulativeType) pattern += '\t';
                                pattern += 'MINUS { ?some' + item.property + ' rdfs:label [] }\n';
                                pattern += tabs;
                                needsDot = false;
                                break;
                        }
                        if (cumulativeType) pattern += ' }\n';
                        else if (needsDot) pattern += ' .\n';
                    }

                    if (typeWithBlock) pattern += '\t}\n';
                    (negativeType ? negativePatterns : positivePatterns).push(pattern);
                    break;
                case RuleType.PRESENT:
                    positivePatterns.push('\t?item wdt:' + item.property + ' ?any' + item.property + ' .\n');
                    break;
                case RuleType.NOT_PRESENT:
                    negativePatterns.push('\tMINUS { ?item wdt:' + item.property + ' ?any' + item.property + ' }\n');
                    break;
            }
        }

        // TODO: DISTINCT enable/disable?
        var sparql =
            'SELECT DISTINCT ?item ?itemLabel WHERE {\n'
            + positivePatterns.join('')
            + negativePatterns.join('')
            + '\tSERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". ?item rdfs:label ?itemLabel. }\n}\nLIMIT 30';

        var sparqlUrl = runQuery
            ? 'https://query.wikidata.org/embed.html#' + encodeURI(sparql)
            : 'https://query.wikidata.org/#' + encodeURI(sparql);
        window.open(sparqlUrl);
    }

    function rerenderUiRules() {
        $uirulelist.html('');
        for (var i = 0; i < model.length; ++i) {
            var item = model[i];
            var $item = $('<li>');
            $item.data('idx', i);
            $item.append($('<a>').attr('href', item.link).append($('<i>').text(item.caption)));
            renderTypeSelector(item, $item);
            var $removeBtn = $('<a>').text(msgs.remove).click(removeRule);
            // TODO: "show value in result" switch for NOT_EQUAL, ANY_OF, NONE_OF, PRESENT
            switch (item.type) {
                case RuleType.EQUAL:
                case RuleType.NOT_EQUAL:
                    renderSingleValue(item, item.values[0], $item);
                    $item.append(' ');
                    $item.append($removeBtn);
                    break;
                case RuleType.ANY_OF:
                case RuleType.ALL_OF:
                case RuleType.NONE_OF:
                    $item.append(' ');
                    $item.append($removeBtn);
                    var $values = $('<ul>');
                    $item.append($values);
                    for (var j = 0; j < item.values.length; ++j) {
                        var $value = $('<li>');
                        $value.data('idx', j);
                        renderSingleValue(item, item.values[j], $value);
                        var $valueRemoveBtn = $('<a>').text(msgs.remove).click(removeValue);
                        $value.append(' ');
                        $value.append($valueRemoveBtn);
                        $values.append($value);
                    }
                    break;
                case RuleType.PRESENT:
                case RuleType.NOT_PRESENT:
                    $item.append(' ');
                    $item.append($removeBtn);
                    break;
            }
            $uirulelist.append($item);
        }
        var noRules = !model.length;
        $sparqlbtn.prop('disabled', noRules);
        $clearbtn.prop('disabled', noRules);
        validateSearchability();
    }

    function removeRule() {
        var $rule = $(this).closest('li');
        var idx = +$rule.data('idx');
        model.splice(idx, 1);
        rerenderUiRules();
    }

    function removeValue() {
        var $value = $(this).closest('li');
        var $rule = $value.parent().closest('li');
        var valueIdx = +$value.data('idx');
        var ruleIdx = +$rule.data('idx');
        var rule = model[ruleIdx];
        rule.values.splice(valueIdx, 1);
        switch (rule.values.length) {
            case 0:
                rule.type = rule.type === RuleType.EQUAL ? RuleType.PRESENT : RuleType.NOT_PRESENT;
                break;
            case 1:
                rule.type = rule.type === RuleType.NONE_OF ? RuleType.NOT_EQUAL : RuleType.EQUAL;
                break;
        }
        rerenderUiRules();
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
        var selectedType = +$select.val();
        for (var i = 0; i < model.length; ++i) {
            var item = model[i];
            if (item.property === property) {
                item.type = selectedType;
                validateSearchability();
                return;
            }
        }
    }

    function recursionChanged() {
        var $checkBox = $(this);
        var property = $checkBox.data('wd-prop');
        var value = $checkBox.data('wd-value');
        for (var i = 0; i < model.length; ++i) {
            var item = model[i];
            if (item.property === property) {
                for (var j = 0; j < item.values.length; ++j) {
                    var valueJ = item.values[j];
                    if (valueJ.entity === value) {
                        valueJ.recursive = this.checked ? recursiveDefinitions[property] : '';
                        return;
                    }
                }
                return;
            }
        }
    }

    function validateSearchability() {
        var searchableModel = false;
        for (var i = 0; !searchableModel && i < model.length; ++i) {
            var item = model[i];
            switch (item.type) {
                case RuleType.PRESENT:
                    if (item.property !== PROP_INSTANCE_OF) searchableModel = true;
                    break;
                case RuleType.ALL_OF:
                case RuleType.ANY_OF:
                case RuleType.EQUAL:
                    searchableModel = true;
                    break;
                case RuleType.NOT_PRESENT:
                case RuleType.NONE_OF:
                case RuleType.NOT_EQUAL:
                    break;
            }
        }
        $searchbtn.prop('disabled', !searchableModel);
    }

    function renderOption(ruleType, currentType, $select) {
        var $option = $('<option>', { value: ruleType }).text(msgs['type' + ruleType]).prop('selected', ruleType === currentType);
        $select.append($option);
    }

    function renderSingleValue(item, value, $container) {
        switch (value.type) {
            case ValueType.VALUE:
                if (value.link) {
                    $container.append($('<a>').attr('href', value.link).append($('<i>').text(value.caption)));
                    if (recursiveDefinitions[item.property]) {
                        var cbId = 'sbt-subtree-' + item.property + '-' + value.entity;
                        $container.append(' ');
                        $container.append($('<input type="checkbox" class="sbt-subtree" />').attr('id', cbId).data({ 'wd-prop': item.property, 'wd-value': value.entity }).change(recursionChanged));
                        $container.append($('<label />').attr('for', cbId));
                    }
                } else {
                    $container.append($('<i>').text(value.caption));
                }
                break;
            case ValueType.NOVALUE:
                $container.append($('<span>').attr('class', 'wikibase-snakview-variation-novaluesnak').text(value.caption));
                break;
            case ValueType.SOMEVALUE:
                $container.append($('<span>').attr('class', 'wikibase-snakview-variation-somevaluesnak').text(value.caption));
                break;
        }
    }
})(jQuery);
