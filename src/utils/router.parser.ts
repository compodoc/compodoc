export let RouterParser = (function() {

    var routes = [];

    return {
        addRoute: function(route) {
            routes.push(route);
        }
    }
})();
