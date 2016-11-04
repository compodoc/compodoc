document.addEventListener('DOMContentLoaded', function() {
    [].forEach.call(document.querySelectorAll('[data-toggle="collapse"]'), function(el) {
        el.addEventListener('click', function() {
            var href = this.getAttribute('href'),
                link = './' + href.substr(1) + '.html';
            if (href === '#gettingStarted') link = './'
            window.location.href = link;
        })
    })
});
