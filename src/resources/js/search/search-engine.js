(function(compodoc) {
    var engine      = null;
    var initialized = false;

    function setEngine(Engine) {
        initialized = false;
        engine      = new Engine();

        init();
    }

    function init() {
        if (!engine) throw new Error('No engine set for research. Set an engine using compodoc.search.setEngine(Engine).');

        return engine.init()
        .then(function() {
            initialized = true;
            compodoc.dispatchEvent({
                type: compodoc.EVENTS.SEARCH_READY
            });
        });
    }

    function query(q, offset, length) {
        if (!initialized) throw new Error('Search has not been initialized');
        return engine.search(q, offset, length);
    }

    function getEngine() {
        return engine? engine.name : null;
    }

    function isInitialized() {
        return initialized;
    }

    compodoc.search = {
        setEngine:     setEngine,
        getEngine:     getEngine,
        query:         query,
        isInitialized: isInitialized
    };
})(compodoc);
