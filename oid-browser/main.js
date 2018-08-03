$(function () {
    function qidFromUrl(url) {
        var lastSlash = url.lastIndexOf('/');
        return lastSlash < 0 ? url : url.substr(lastSlash + 1);
    }

    function oidParent(oid) {
        var lastDot = oid.lastIndexOf('.');
        return lastDot < 0 ? '' : oid.substr(0, lastDot);
    }

    function oidLeaf(oid) {
        var lastDot = oid.lastIndexOf('.');
        var leafStr = lastDot < 0 ? oid : oid.substr(lastDot + 1);
        var leafNum = parseInt(leafStr);
        return isNaN(leafNum) ? 99999 : leafNum;
    }

    function makeNode(id, text, oid) {
        return {
            id: id,
            text: text,
            oidSegment: oidLeaf(oid)
        };
    }

    function ensureNodeExists(nodes, oid) {
        var existing = nodes[oid];
        if (existing) return existing;

        var parent = ensureNodeExists(nodes, oidParent(oid));

        var children = parent.children || [];
        var newNode = makeNode(null, oid, oid);
        children.push(newNode);
        nodes[oid] = newNode;
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
            var oid = item.oid.value;

            var id = qid + '-' + oid;
            var url = 'https://www.wikidata.org/wiki/' + qid;

            var node = nodes[oid];
            if (node) {
                if (!node.id) {
                    node.text = oid + ' – ' + label;
                    node.id = id;
                    node.url = url;
                } else {
                    node.text = node.text + '; ' + label;
                    console.debug('Duplicate OID', oid);
                }
            } else {
                var newNode = ensureNodeExists(nodes, oid);
                newNode.id = id;
                newNode.text = oid + ' – ' + label;
                newNode.url = url;
            }
        }

        $.each(nodes, function (_, node) {
            if (!node.children) return;

            node.children.sort(function (a, b) {
                return a.oidSegment === b.oidSegment
                    ? 0
                    : a.oidSegment > b.oidSegment ? +1 : -1;
            });
        });

        return [root];
    }

    $.ajax({
        url: 'https://query.wikidata.org/sparql',
        data: {
            query: 'SELECT ?item ?itemLabel ?oid WHERE { ?item wdt:P3743 ?oid. SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } }',
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
