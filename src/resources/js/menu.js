document.addEventListener('DOMContentLoaded', function() {
    [].forEach.call(document.querySelectorAll('[data-toggle="collapse"]'), function(el) {
        el.addEventListener('click', function() {
            var href = this.getAttribute('href'),
                link = './' + href.substr(1) + '.html';
            if (href === '#gettingStarted') link = './'
            if (href === '#additional-doc') link = './additional-documentation/'
            window.location.href = link;
        })
    })

    var menuCollapsed = false,
        mobileMenu = document.getElementById('mobile-menu');
    document.getElementById('btn-menu').addEventListener('click', function() {
        if (menuCollapsed) {
            mobileMenu.style.display = 'none';
        } else {
            mobileMenu.style.display = 'block';
            document.getElementsByTagName('body')[0].style['overflow-y'] = 'hidden';
        }
        menuCollapsed = !menuCollapsed;
    })
});
