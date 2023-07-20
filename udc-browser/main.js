$(function () {
    function qidFromUrl(url) {
        var lastSlash = url.lastIndexOf('/');
        return lastSlash < 0 ? url : url.substr(lastSlash + 1);
    }

    function udcParent(udc) {
		if (!udc.length) return '';
		return (udc.length > 1) && (udc[udc.length - 2] === '.') ? udc.substr(0, udc.length - 2) : udc.substr(0, udc.length - 1);
    }

    function udcLeaf(udc) {
		var leafNum = udc.charCodeAt(udc.length - 1);
        return isNaN(leafNum) ? 0 : leafNum;
    }

    function makeNode(id, text, udc) {
        return {
            id: id,
            text: text,
            udcSegment: udcLeaf(udc)
        };
    }

    function ensureNodeExists(nodes, udc) {
        var existing = nodes[udc];
        if (existing) return existing;

        var parent = ensureNodeExists(nodes, udcParent(udc));

        var children = parent.children || [];
        var newNode = makeNode(null, udc, udc);
        children.push(newNode);
        nodes[udc] = newNode;
        parent.children = children;

        return newNode;
    }

    function buildTree(queryData) {
        var root = makeNode('ROOT', 'Tree root', '');
        root.state = { opened: true };
        var nodes = { '': root };

        for (var i = 0; i < queryData.length; ++i) {
            var item = queryData[i];

            var qid = qidFromUrl(item.item.value);
            var label = item.itemLabel.value;
            var udc = item.udc.value;

            var id = qid + '-' + udc;
            var url = 'https://www.wikidata.org/wiki/' + qid;

            var node = nodes[udc];
            if (node) {
                if (!node.id) {
                    node.text = udc + ' – ' + label;
                    node.id = id;
                    node.url = url;
                } else {
                    node.text = node.text + '; ' + label;
                    console.debug('Duplicate udc', udc);
                }
            } else {
                var newNode = ensureNodeExists(nodes, udc);
                newNode.id = id;
                newNode.text = udc + ' – ' + label;
                newNode.url = url;
            }
        }

        $.each(nodes, function (_, node) {
            if (!node.children) return;

            node.children.sort(function (a, b) {
                return a.udcSegment === b.udcSegment
                    ? 0
                    : a.udcSegment > b.udcSegment ? +1 : -1;
            });
        });

        return [root];
    }

    $.ajax({
        url: 'https://query.wikidata.org/sparql',
        data: {
            query: 'SELECT ?item ?itemLabel ?udc WHERE { ?item wdt:P1190 ?udc. SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } }',
            format: 'json'
        },
        dataType: 'json'
    }).done(function (queryData) {
        var treeData = buildTree(queryData.results.bindings);
        $('#tree-container').empty().jstree({
            'core': {
                'data': treeData
            }
        }).on("activate_node.jstree", function (e, data) {
            var url = data.node.original.url;
            if (url) {
                window.open(url);
            }
        });
    }).fail(function (error) {
        console.log(error);
        alert('Failed to load data');
    });
});
