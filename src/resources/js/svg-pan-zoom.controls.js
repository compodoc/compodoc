document.addEventListener('DOMContentLoaded', function() {
    panZoom = svgPanZoom(document.getElementById('module-graph-svg').querySelector('svg'), {
        zoomEnabled: true,
        minZoom: 1,
        maxZoom: 5
    });

    document.getElementById('zoom-in').addEventListener('click', function(ev) {
        ev.preventDefault();
        panZoom.zoomIn();
    });

    document.getElementById('zoom-out').addEventListener('click', function(ev) {
        ev.preventDefault();
        panZoom.zoomOut();
    });

    document.getElementById('reset').addEventListener('click', function(ev) {
        ev.preventDefault();
        panZoom.resetZoom();
        panZoom.resetPan();
    });

    var overviewFullscreen = false,
        originalOverviewHeight;

    document.getElementById('fullscreen').addEventListener('click', function(ev) {
        if (overviewFullscreen) {
            document.getElementById('module-graph-svg').style.height = originalOverviewHeight;
            overviewFullscreen = false;
            if (ev.target) {
                ev.target.classList.remove('fa-compress');
            }
        } else {
            originalOverviewHeight = document.getElementById('module-graph-svg').style.height;
            document.getElementById('module-graph-svg').style.height = '85vh';
            overviewFullscreen = true;
            if (ev.target) {
                ev.target.classList.add('fa-compress');
            }
        }
        document.getElementById('module-graph-svg').querySelector('svg').style.height = document.getElementById('module-graph-svg').clientHeight;
        setTimeout(function() {
            panZoom.resize();
            panZoom.fit();
            panZoom.center();
        }, 0)
    });

});
