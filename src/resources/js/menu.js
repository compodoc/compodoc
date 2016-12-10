document.addEventListener('DOMContentLoaded', function() {
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
    });

    // Scroll to active link
    var menus = document.querySelectorAll('.menu'),
        i = 0,
        len = menus.length,
        activeMenu,
        activeMenuClass,
        activeLink;

    for (i; i<len; i++) {
        if (getComputedStyle(menus[i]).display != 'none') {
            activeMenu = menus[i];
            activeMenuClass = activeMenu.getAttribute('class').split(' ')[0];
        }
    }

    if (activeMenu) {
        activeLink = document.querySelector('.' + activeMenuClass + ' .active');
        activeMenu.scrollTop = activeLink.offsetTop;
        if (activeLink.innerHTML.toLowerCase().indexOf('readme') != -1 || activeLink.innerHTML.toLowerCase().indexOf('overview') != -1) {
            activeMenu.scrollTop = 0;
        }
    }
});
