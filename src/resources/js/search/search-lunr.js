(function(compodoc) {

    function LunrSearchEngine() {
        this.index = null;
        this.store = {};
        this.name = 'LunrSearchEngine';
    }

    LunrSearchEngine.prototype.init = function() {
        var that = this;
        var d = new promise.Promise();

        $.ajax({
            type: 'GET',
            url: './search_index.json',
            dataType: 'json',
            success: function(data){
                that.index = lunr.Index.load(data.index);
                that.store = data.store;
                d.done();
            },
            error: function(xhr, type){
                console.error('Error loading search index json');
            }
        });

        return d;
    };

    LunrSearchEngine.prototype.search = function(q, offset, length) {
        var that = this;
        var results = [];

        if (this.index) {
            results = $.map(this.index.search(q), function(result) {
                var doc = that.store[result.ref];

                return {
                    title: doc.title,
                    url: doc.url,
                    body: doc.summary || doc.body
                };
            });
        }

        return $.Deferred().resolve({
            query: q,
            results: results.slice(0, length),
            count: results.length
        }).promise();
    };

    compodoc.addEventListener(compodoc.EVENTS.READY, function(event) {
        console.log('compodoc ready');
        var engine = compodoc.search.getEngine();
        if (!engine) {
            compodoc.search.setEngine(LunrSearchEngine);
        }
    });
})(compodoc);
