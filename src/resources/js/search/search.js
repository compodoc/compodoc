(function(compodoc) {
    var MAX_RESULTS = 15;
    var MAX_DESCRIPTION_SIZE = 500;

    var usePushState = (typeof history.pushState !== 'undefined');

    // DOM Elements
    var $body = $('body');
    var $bookSearchResults;
    var $searchInput;
    var $searchList;
    var $searchTitle;
    var $searchResultsCount;
    var $searchQuery;

    console.log($body);

    // Throttle search
    function throttle(fn, wait) {
        var timeout;

        return function() {
            var ctx = this, args = arguments;
            if (!timeout) {
                timeout = setTimeout(function() {
                    timeout = null;
                    fn.apply(ctx, args);
                }, wait);
            }
        };
    }

    function displayResults(res) {
        console.log('displayResults: ', res);
    }

    function launchSearch(q) {
        console.log('launchSearch: ', q);
    }

    function closeSearch() {
        console.log('closeSearch');
    }

    function launchSearchFromQueryString() {
        var q = getParameterByName('q');
        if (q && q.length > 0) {
            // Update search input
            $searchInput.val(q);

            // Launch search
            launchSearch(q);
        }
    }

    function bindSearch() {
        // Bind DOM
        $searchInputs        = $('#book-search-input input');
        console.log($searchInputs);
        /*
        $bookSearchResults  = $('#book-search-results');
        $searchList         = $bookSearchResults.find('.search-results-list');
        $searchTitle        = $bookSearchResults.find('.search-results-title');
        $searchResultsCount = $searchTitle.find('.search-results-count');
        $searchQuery        = $searchTitle.find('.search-query');*/

        // Launch query based on input content
        function handleUpdate(item) {
            var q = item.val();

            if (q.length == 0) {
                closeSearch();
            }
            else {
                launchSearch(q);
            }
        }

        // Detect true content change in search input
        var propertyChangeUnbound = false;

        $.each($searchInputs, function(index, item){
            console.log(item);
            var item = $(item);
            // HTML5 (IE9 & others)
            item.on('input', function(e) {
                // Unbind propertychange event for IE9+
                if (!propertyChangeUnbound) {
                    $(this).unbind('propertychange');
                    propertyChangeUnbound = true;
                }

                handleUpdate($(this));
            });
            // Workaround for IE < 9
            item.on('propertychange', function(e) {
                if (e.originalEvent.propertyName == 'value') {
                    handleUpdate($(this));
                }
            });
            // Push to history on blur
            item.on('blur', function(e) {
                // Update history state
                if (usePushState) {
                    var uri = updateQueryString('q', $(this).val());
                    history.pushState({ path: uri }, null, uri);
                }
            });
        });
    }

    function launchSearchFromQueryString() {

    }

    compodoc.addEventListener(compodoc.EVENTS.SEARCH_READY, function(event) {
        console.log('compodoc search.ready');

        bindSearch();

        launchSearchFromQueryString();
    });

    function getParameterByName(name) {
        var url = window.location.href;
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)', 'i'),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

    function updateQueryString(key, value) {
        value = encodeURIComponent(value);

        var url = window.location.href;
        var re = new RegExp('([?&])' + key + '=.*?(&|#|$)(.*)', 'gi'),
            hash;

        if (re.test(url)) {
            if (typeof value !== 'undefined' && value !== null)
                return url.replace(re, '$1' + key + '=' + value + '$2$3');
            else {
                hash = url.split('#');
                url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
                if (typeof hash[1] !== 'undefined' && hash[1] !== null)
                    url += '#' + hash[1];
                return url;
            }
        }
        else {
            if (typeof value !== 'undefined' && value !== null) {
                var separator = url.indexOf('?') !== -1 ? '&' : '?';
                hash = url.split('#');
                url = hash[0] + separator + key + '=' + value;
                if (typeof hash[1] !== 'undefined' && hash[1] !== null)
                    url += '#' + hash[1];
                return url;
            }
            else
                return url;
        }
    }
})(compodoc);
