document.addEventListener('DOMContentLoaded', function () {
    function htmlEntities(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function foundLazyModuleWithPath(path) {
        //path is like app/customers/customers.module#CustomersModule
        var split = path.split('#'),
            lazyModulePath = split[0],
            lazyModuleName = split[1];
        return lazyModuleName;
    }

    function foundLazyComponentWithPath(path) {
        var split = path.split('#'),
            lazyComponentName = split[1];
        return lazyComponentName;
    }

    function safeHref(href) {
        return String(href || '').replace(/"/g, '&quot;');
    }

    function resolveNodeHref(d) {
        if (!d) {
            return '';
        }

        if (d.href) {
            return d.href;
        }

        if (d.component && d.component !== 'default') {
            return './components/' + d.component + '.html';
        }

        if (d.module && d.module !== 'default') {
            return './modules/' + d.module + '.html';
        }

        if (d.loadComponent) {
            var lazyComponent = foundLazyComponentWithPath(d.loadComponent);
            if (lazyComponent && lazyComponent !== 'default') {
                return './components/' + lazyComponent + '.html';
            }
        }

        if (d.loadChildren) {
            var lazyModule = foundLazyModuleWithPath(d.loadChildren);
            if (lazyModule && lazyModule !== 'default') {
                return './modules/' + lazyModule + '.html';
            }
        }

        return '';
    }

    function wrapLabelWithLink(label, href) {
        if (!href) {
            return label;
        }
        return '<a href="' + safeHref(href) + '" target="_top">' + label + '</a>';
    }

    function withLeadingSlash(routeValue) {
        var value = String(routeValue || '');
        if (value.length === 0) {
            return '/';
        }
        return value.charAt(0) === '/' ? value : '/' + value;
    }

    function getBB(selection) {
        selection.each(function (d) {
            d.bbox = this.getBBox();
        });
    }

    var test_cases, test_case, test_case_num, engine;

    var tree = ROUTES_INDEX;

    function cleanStringChildren(obj) {
        if (!obj || typeof obj !== 'object') {
            return;
        }
        for (var property in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, property)) {
                if (property === 'children') {
                    if (typeof obj[property] === 'string') {
                        obj[property] = [];
                        continue;
                    }

                    if (Array.isArray(obj[property])) {
                        for (var i = obj[property].length - 1; i >= 0; i--) {
                            if (
                                typeof obj[property][i] !== 'object' ||
                                obj[property][i] === null
                            ) {
                                obj[property].splice(i, 1);
                            }
                        }
                    } else if (obj[property] && typeof obj[property] === 'object') {
                        obj[property] = [];
                    }
                }

                if (obj[property] && typeof obj[property] === 'object') {
                    cleanStringChildren(obj[property]);
                }
            }
        }
    }
    cleanStringChildren(tree);

    engine = d3.layout.tree().setNodeSizes(true);

    engine.spacing(function (a, b) {
        return a.parent == b.parent ? 0 : engine.rootXSize();
    });

    engine.nodeSize(function (d) {
        return [
            document.getElementById(d.id).getBBox()['height'] + 70,
            document.getElementById(d.id).getBBox()['width'] + 30
        ];
    });

    var nodes = d3.layout.hierarchy()(tree),
        svg = d3.select('#body-routes').append('svg'),
        svg_g = svg.append('g'),
        svg_p = svg.append('g'),
        last_id = 0,
        node = svg_g
            .selectAll('.node')
            .data(nodes, function (d) {
                return d.id || (d.id = ++last_id);
            })
            .enter()
            .append('g')
            .attr('class', 'node');

    svg.attr('id', 'main');

    svg_g.attr('transform', 'translate(20,0)').attr('id', 'main-group');

    svg_p.attr('transform', 'translate(20,0)').attr('id', 'paths');

    var infos_group = node.append('g').attr({
        id: function (d) {
            return d.id;
        },
        dx: 0,
        dy: 0
    });

    infos_group
        .style('cursor', function (d) {
            return resolveNodeHref(d) ? 'pointer' : null;
        })
        .on('click', function (d) {
            var href = resolveNodeHref(d);
            if (href) {
                window.location.href = href;
            }
        });

    //Node icon
    infos_group
        .append('text')
        .attr('font-family', 'Ionicons')
        .attr('y', 5)
        .attr('x', 0)
        .attr('class', function (d) {
            return d.children || d._children ? 'icon has-children' : 'icon';
        })
        .attr('font-size', function (d) {
            return '15px';
        })
        .text(function (d) {
            return '\uf183';
        });

    //node infos
    infos_group
        .append('svg:text')
        .attr('x', function (d) {
            return 0;
        })
        .attr('y', function (d) {
            return 10;
        })
        .attr('dy', '.35em')
        .attr('class', 'text')
        .attr('text-anchor', function (d) {
            return 'start';
        })
        .html(function (d) {
            // if kind === module name + module
            // if kind === component component + path
            var _name = '';
            var nodeHref = resolveNodeHref(d);
            if (d.kind === 'module') {
                if (d.module) {
                    _name +=
                        '<tspan x="0" dy="1.4em">' +
                        wrapLabelWithLink(d.module, nodeHref || './modules/' + d.module + '.html') +
                        '</tspan>';
                    if (d.name) {
                        _name += '<tspan x="0" dy="1.4em">' + d.name + '</tspan>';
                    }
                } else {
                    _name +=
                        '<tspan x="0" dy="1.4em">' +
                        wrapLabelWithLink(htmlEntities(d.name), nodeHref) +
                        '</tspan>';
                }
            } else if (d.kind === 'component') {
                _name +=
                    '<tspan x="0" dy="1.4em">' +
                    wrapLabelWithLink(d.path || d.name, nodeHref) +
                    '</tspan>';
                if (d.component) {
                    _name +=
                        '<tspan x="0" dy="1.4em">' +
                        wrapLabelWithLink(d.component, nodeHref) +
                        '</tspan>';
                } else if (d.name && d.name.includes('Component')) {
                    _name += '<tspan x="0" dy="1.4em">' + wrapLabelWithLink(d.name, nodeHref) + '</tspan>';
                }
                if (d.outlet) {
                    _name += '<tspan x="0" dy="1.4em">&lt;outlet&gt; : ' + d.outlet + '</tspan>';
                }
            } else {
                if (d.kind === 'route-redirect') {
                    var fromPath = d.path === '' ? "''" : withLeadingSlash(d.path || '');
                    var redirectTo = withLeadingSlash(d.redirectTo || d.name);
                    _name += '<tspan x="0" dy="1.4em">' + fromPath + ' &rarr; ' + redirectTo + '</tspan>';
                    if (d.pathMatch) {
                        _name += '<tspan x="0" dy="1.4em">pathMatch: ' + d.pathMatch + '</tspan>';
                    }
                } else {
                    _name +=
                        '<tspan x="0" dy="1.4em">' +
                        wrapLabelWithLink(withLeadingSlash(d.path || d.name), nodeHref) +
                        '</tspan>';
                }
                if (d.component) {
                    _name +=
                        '<tspan x="0" dy="1.4em">' +
                        wrapLabelWithLink(d.component, nodeHref) +
                        '</tspan>';
                }
                if (d.loadChildren) {
                    var moduleName = foundLazyModuleWithPath(d.loadChildren);
                    if (moduleName && moduleName !== 'default') {
                        _name +=
                            '<tspan x="0" dy="1.4em">' +
                            wrapLabelWithLink(moduleName, './modules/' + moduleName + '.html') +
                            '</tspan>';
                    }
                }
                if (d.canActivate) {
                    _name += '<tspan x="0" dy="1.4em">&#10003; canActivate</tspan>';
                }
                if (d.canDeactivate) {
                    _name += '<tspan x="0" dy="1.4em">&#215;&nbsp;&nbsp;canDeactivate</tspan>';
                }
                if (d.canActivateChild) {
                    _name += '<tspan x="0" dy="1.4em">&#10003; canActivateChild</tspan>';
                }
                if (d.canLoad) {
                    _name += '<tspan x="0" dy="1.4em">&#8594; canLoad</tspan>';
                }
                if (d.kind !== 'route-redirect' && d.redirectTo) {
                    _name += '<tspan x="0" dy="1.4em">&rarr; ' + d.redirectTo + '</tspan>';
                }
                if (d.kind !== 'route-redirect' && d.pathMatch) {
                    _name += '<tspan x="0" dy="1.4em">&gt; ' + d.pathMatch + '</tspan>';
                }
                if (d.outlet) {
                    _name += '<tspan x="0" dy="1.4em">&lt;outlet&gt; : ' + d.outlet + '</tspan>';
                }
            }
            return _name;
        })
        .call(getBB);

    //
    // Node lazy loaded ?
    //
    infos_group
        .append('svg:text')
        .attr('y', function (d) {
            return 45;
        })
        .attr('x', function (d) {
            return -18;
        })
        .attr('font-family', 'Ionicons')
        .attr('class', function (d) {
            return 'icon';
        })
        .attr('font-size', function (d) {
            return '15px';
        })
        .text(function (d) {
            var _text = '';
            if (d.loadChildren || d.loadComponent) {
                _text = '\uf4c1';
            }
            if (d.guarded) {
                _text = '\uf1b0';
            }
            return _text;
        });

    //Node text background
    infos_group
        .insert('rect', 'text')
        .attr('width', function (d) {
            return d.bbox.width;
        })
        .attr('height', function (d) {
            return d.bbox.height;
        })
        .attr('y', function (d) {
            return 15;
        })
        .style('fill', 'white')
        .style('fill-opacity', 0.75);

    nodes = engine.nodes(tree);

    function node_extents(n) {
        return [n.x - n.x_size / 2, n.y, n.x + n.x_size / 2, n.y + n.y_size];
    }
    var root_extents = node_extents(nodes[0]);
    var xmin = root_extents[0],
        ymin = root_extents[1],
        xmax = root_extents[2],
        ymax = root_extents[3],
        area_sum = (xmax - xmin) * (ymax - ymin),
        x_size_min = nodes[0].x_size,
        y_size_min = nodes[0].y_size;

    nodes.slice(1).forEach(function (n) {
        var ne = node_extents(n);
        xmin = Math.min(xmin, ne[0]);
        ymin = Math.min(ymin, ne[1]);
        xmax = Math.max(xmax, ne[2]);
        ymax = Math.max(ymax, ne[3]);
        area_sum += (ne[2] - ne[0]) * (ne[3] - ne[1]);
        x_size_min = Math.min(x_size_min, n.x_size);
        y_size_min = Math.min(y_size_min, n.y_size);
    });

    var area_ave = area_sum / nodes.length;
    var scale = 80 / Math.sqrt(area_ave);
    var depthHorizontalSpacing = 40;

    function svg_x(node_y) {
        return node_y - ymin;
    }

    function projected_x(node) {
        return svg_x(node.y) + (node.depth || 0) * depthHorizontalSpacing;
    }

    function svg_y(node_x) {
        return (node_x - xmin) * scale;
    }

    var nodebox_right_margin = Math.min(x_size_min * scale, 10);
    var nodebox_vertical_margin = Math.min(y_size_min * scale, 3);

    node.attr('transform', function (d) {
        return 'translate(' + projected_x(d) + ',' + svg_y(d.x) + ')';
    });

    var diagonal = d3.svg.diagonal().projection(function (d) {
        return [projected_x(d), svg_y(d.x)];
    });

    var links = engine.links(nodes);
    var links = svg_p
        .selectAll('.link')
        .data(links)
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('d', diagonal);

    var _svg = document.getElementById('main'),
        main_g = _svg.childNodes[0];

    _svg.removeChild(main_g);
    _svg.appendChild(main_g);

    svg.attr({
        width: document.getElementById('main-group').getBBox()['width'] + 30,
        height: document.getElementById('main-group').getBBox()['height'] + 50
    });
});
