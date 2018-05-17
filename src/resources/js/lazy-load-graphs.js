document.addEventListener('DOMContentLoaded', () => {
    let lazyGraphs = [].slice.call(document.querySelectorAll('[lazy]'));
    let active = false;

    const lazyLoad = () => {
        if (active === false) {
            active = true;

            setTimeout(() => {
                lazyGraphs.forEach(lazyGraph => {
                    if (
                        lazyGraph.getBoundingClientRect().top <= window.innerHeight &&
                        lazyGraph.getBoundingClientRect().bottom >= 0 &&
                        getComputedStyle(lazyGraph).display !== 'none'
                    ) {
                        lazyGraph.data = lazyGraph.getAttribute('lazy');
                        lazyGraph.removeAttribute('lazy');

                        lazyGraphs = lazyGraphs.filter(image => image !== lazyGraph);

                        if (lazyGraphs.length === 0) {
                            document.removeEventListener('scroll', lazyLoad);
                            window.removeEventListener('resize', lazyLoad);
                            window.removeEventListener('orientationchange', lazyLoad);
                        }
                    }
                });

                active = false;
            }, 200);
        }
    };

    // initial load
    lazyLoad();
    
    const container = document.querySelector('.container-fluid.modules');
    if (container) {
      container.addEventListener('scroll', lazyLoad);
      window.addEventListener('resize', lazyLoad);
      window.addEventListener('orientationchange', lazyLoad);
    }

});
