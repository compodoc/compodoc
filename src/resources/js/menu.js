document.addEventListener('DOMContentLoaded', function() {
    $('a[data-toggle=collapse]').click(function(e) {
        var href = $(this).attr('href'),
            link = './' + href.substr(1) + '.html';
        if(href === '#gettingStarted') link = './'
        window.location.href = link;
    })
});
