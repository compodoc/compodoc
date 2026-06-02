document.addEventListener("DOMContentLoaded", function () {
    var container = document.getElementById("architecture-graph");
    if (!container) {
        return;
    }
    if (
        typeof ARCHITECTURE_DEP_GRAPH === "undefined" ||
        !ARCHITECTURE_DEP_GRAPH ||
        !ARCHITECTURE_DEP_GRAPH.nodes
    ) {
        return;
    }
    if (typeof vis === "undefined" || !vis.Network) {
        return;
    }

    var typeColors = {
        component: "#10b39c",
        directive: "#6747dd",
        pipe: "#de3b91",
        module: "#2973f0",
        injectable: "#b77006",
    };
    var isDarkMode = function () {
        return !!(document.body && document.body.classList.contains("dark"));
    };
    var getNodeTextColor = function () {
        return isDarkMode() ? "#f0f0f0" : "#2d2d2d";
    };
    var getEdgeColor = function () {
        return isDarkMode() ? "#b5b5b5" : "#8b8b8b";
    };
    var getEdgeOpacity = function () {
        return isDarkMode() ? 0.8 : 0.65;
    };

    var allNodes = ARCHITECTURE_DEP_GRAPH.nodes.map(function (node) {
        return {
            id: node.id,
            label: node.name,
            type: node.type,
            url: node.url,
        };
    });
    var allEdges = ARCHITECTURE_DEP_GRAPH.edges.map(function (edge) {
        return {
            from: edge.source,
            to: edge.target,
        };
    });

    if (!allNodes.length || !allEdges.length) {
        container.innerHTML =
            '<p class="alert alert-warning">No dependency links to render.</p>';
        return;
    }

    var degreeByNodeId = {};
    allEdges.forEach(function (edge) {
        degreeByNodeId[edge.from] = (degreeByNodeId[edge.from] || 0) + 1;
        degreeByNodeId[edge.to] = (degreeByNodeId[edge.to] || 0) + 1;
    });

    allNodes = allNodes.map(function (node) {
        var degree = degreeByNodeId[node.id] || 1;
        return {
            id: node.id,
            label: node.label,
            title: node.label + " (" + node.type + ")",
            type: node.type,
            url: node.url,
            color: typeColors[node.type] || typeColors.module,
            size: Math.min(30, 10 + degree * 1.3),
            font: { color: getNodeTextColor(), size: 12 },
            borderWidth: 1,
        };
    });

    var activeTypes = {};
    var knownTypes = ["component", "directive", "pipe", "module", "injectable"];
    knownTypes.forEach(function (type) {
        activeTypes[type] = true;
    });

    var nodeById = {};
    allNodes.forEach(function (node) {
        nodeById[node.id] = node;
    });

    var network;
    var currentScale = 1;

    var applyGraphTheme = function () {
        var textColor = getNodeTextColor();
        var edgeColor = getEdgeColor();
        var edgeOpacity = getEdgeOpacity();

        for (var i = 0; i < allNodes.length; i++) {
            allNodes[i].font = allNodes[i].font || {};
            allNodes[i].font.color = textColor;
        }

        if (network) {
            network.setOptions({
                edges: {
                    color: { color: edgeColor, opacity: edgeOpacity },
                },
            });
        }
    };

    var getFilteredGraphData = function () {
        var visibleNodes = allNodes.filter(function (node) {
            return activeTypes[node.type];
        });
        var visibleNodeIds = {};
        visibleNodes.forEach(function (node) {
            visibleNodeIds[node.id] = true;
        });
        var visibleEdges = allEdges.filter(function (edge) {
            return visibleNodeIds[edge.from] && visibleNodeIds[edge.to];
        });
        return { nodes: visibleNodes, edges: visibleEdges };
    };

    var renderFilteredGraph = function () {
        var filtered = getFilteredGraphData();
        network.setData({
            nodes: new vis.DataSet(filtered.nodes),
            edges: new vis.DataSet(filtered.edges),
        });
        network.stabilize(120);
    };

    var options = {
        autoResize: true,
        layout: {
            improvedLayout: true,
        },
        interaction: {
            hover: true,
            dragView: true,
            zoomView: true,
        },
        physics: {
            enabled: true,
            stabilization: {
                enabled: true,
                iterations: 180,
                fit: true,
            },
            barnesHut: {
                gravitationalConstant: -6000,
                centralGravity: 0.35,
                springLength: 130,
                springConstant: 0.02,
                damping: 0.2,
            },
        },
        edges: {
            arrows: { to: { enabled: true, scaleFactor: 0.6 } },
            color: { color: getEdgeColor(), opacity: getEdgeOpacity() },
            smooth: {
                enabled: true,
                type: "dynamic",
            },
        },
        nodes: {
            shape: "dot",
            scaling: {
                min: 9,
                max: 32,
            },
        },
    };

    var initialData = getFilteredGraphData();
    network = new vis.Network(
        container,
        {
            nodes: new vis.DataSet(initialData.nodes),
            edges: new vis.DataSet(initialData.edges),
        },
        options,
    );

    network.on("click", function (params) {
        if (!params.nodes || params.nodes.length === 0) {
            return;
        }
        var node = nodeById[params.nodes[0]];
        if (node && node.url) {
            document.location.href = node.url;
        }
    });

    network.once("stabilizationIterationsDone", function () {
        network.fit({ animation: { duration: 250, easingFunction: "easeOutQuad" } });
        currentScale = 1;
    });
    applyGraphTheme();

    var legendButtons = document.querySelectorAll("[data-architecture-filter]");
    var updateLegendState = function () {
        for (var i = 0; i < legendButtons.length; i++) {
            var button = legendButtons[i];
            var type = button.getAttribute("data-architecture-filter");
            var active = !!activeTypes[type];
            button.setAttribute("aria-pressed", active ? "true" : "false");
            if (active) {
                button.classList.remove("is-disabled");
            } else {
                button.classList.add("is-disabled");
            }
        }
    };

    for (var i = 0; i < legendButtons.length; i++) {
        legendButtons[i].addEventListener("click", function (event) {
            event.preventDefault();
            var type = this.getAttribute("data-architecture-filter");
            if (!type) {
                return;
            }

            activeTypes[type] = !activeTypes[type];

            var activeCount = 0;
            knownTypes.forEach(function (entry) {
                if (activeTypes[entry]) {
                    activeCount += 1;
                }
            });
            if (activeCount === 0) {
                knownTypes.forEach(function (entry) {
                    activeTypes[entry] = true;
                });
            }

            updateLegendState();
            renderFilteredGraph();
        });
    }
    updateLegendState();

    var zoomIn = document.getElementById("architecture-zoom-in");
    var zoomOut = document.getElementById("architecture-zoom-out");
    var reset = document.getElementById("architecture-reset");

    if (zoomIn) {
        zoomIn.addEventListener("click", function (ev) {
            ev.preventDefault();
            currentScale = Math.min(4, currentScale * 1.25);
            network.moveTo({
                scale: currentScale,
                animation: { duration: 160, easingFunction: "easeOutQuad" },
            });
        });
    }
    if (zoomOut) {
        zoomOut.addEventListener("click", function (ev) {
            ev.preventDefault();
            currentScale = Math.max(0.2, currentScale / 1.25);
            network.moveTo({
                scale: currentScale,
                animation: { duration: 160, easingFunction: "easeOutQuad" },
            });
        });
    }
    if (reset) {
        reset.addEventListener("click", function (ev) {
            ev.preventDefault();
            network.fit({ animation: { duration: 180, easingFunction: "easeOutQuad" } });
            currentScale = 1;
        });
    }

    if (window.MutationObserver && document.body) {
        var bodyThemeObserver = new MutationObserver(function () {
            applyGraphTheme();
            renderFilteredGraph();
        });
        bodyThemeObserver.observe(document.body, {
            attributes: true,
            attributeFilter: ["class"],
        });
    }
});
