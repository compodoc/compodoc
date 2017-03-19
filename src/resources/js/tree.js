document.addEventListener('DOMContentLoaded', function() {
    var handler = new Tautologistics.NodeHtmlParser.HtmlBuilder(function(error, dom) {
        if (error) {
            console.log('handler ko');
        }
    });
    var parser = new Tautologistics.NodeHtmlParser.Parser(handler);
    parser.parseComplete(COMPONENT_TEMPLATE);

    var newNodes = [],
        newEdges = [],
        parsedHtml = handler.dom[0],
        nodeCount = 0,
        nodeLevel = 0;

    newNodes.push({
        _id: 0,
        label: parsedHtml.name,
        type: parsedHtml.type
    })
    //Add id for nodes
    var traverseIds = function(o) {
        for (i in o) {
            if (!!o[i] && typeof(o[i]) == "object") {
                if (!o[i].length && o[i].type === 'tag') {
                    nodeCount += 1;
                    o[i]._id = nodeCount;
                }
                traverseIds(o[i]);
            }
        }
    }
    parsedHtml._id = 0;
    traverseIds(parsedHtml);


    var DeepIterator = deepIterator.default,
        it = DeepIterator(parsedHtml);
    for (let {
            value,
            parent,
            parentNode,
            key,
            type
        } of it) {
        if (type === 'NonIterableObject' && typeof key !== 'undefined' && value.type === 'tag') {
            newNodes.push({
                id: value._id,
                label: value.name,
                type: value.type
            });
            newEdges.push({
                from: parentNode._parent._id,
                to: value._id,
                arrows: 'to'
            });
        }
    }

    newNodes.shift();

    var container = document.getElementById('tree-container'),
        data = {
            nodes: newNodes,
            edges: newEdges
        },
        options = {
            layout: {
                hierarchical: {
                    sortMethod: 'directed',
                    enabled: true
                }
            },
            nodes: {
                shape: 'ellipse',
                fixed: true
            },
            interaction:{
                zoomView: false
            }
        };

    var myTabs = document.getElementsByClassName('nav-tabs')[0],
        myTabsCollection = myTabs.getElementsByTagName('A'),
        myLastTab = myTabsCollection[myTabsCollection.length - 1];
    myLastTab.addEventListener('click', function(event) {
        setTimeout(function() {
            container.style.height = document.getElementsByClassName('content')[0].offsetHeight - 140 + 'px';
            var network = new vis.Network(container, data, options);
        }, 200); // Fade is 0.150
    });
});
