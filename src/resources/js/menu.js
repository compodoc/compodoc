document.addEventListener('DOMContentLoaded', function() {
    var menuCollapsed = false,
        mobileMenu = document.getElementById('mobile-menu');

    function hasClass(el, cls) {
        return el.className && new RegExp("(\\s|^)" + cls + "(\\s|$)").test(el.className);
    }

    document.getElementById('btn-menu').addEventListener('click', function() {
        if (menuCollapsed) {
            mobileMenu.style.display = 'none';
        } else {
            mobileMenu.style.display = 'block';
            document.getElementsByTagName('body')[0].style['overflow-y'] = 'hidden';
        }
        menuCollapsed = !menuCollapsed;
    });

    // collapse menu
    var classnameMenuToggler = document.getElementsByClassName('menu-toggler'),
        faAngleUpClass = 'fa-angle-up',
        faAngleDownClass = 'fa-angle-down',
        toggleItemMenu = function(e) {
            e.preventDefault();
            var element = $(e.target);
            if (element.hasClass(faAngleUpClass)) {
                element.addClass(faAngleDownClass);
                element.removeClass(faAngleUpClass);
            } else {
                element.addClass(faAngleUpClass);
                element.removeClass(faAngleDownClass);
            }
        };

    for (var i = 0; i < classnameMenuToggler.length; i++) {
        classnameMenuToggler[i].addEventListener('click', toggleItemMenu, false);
    }

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
        var linkType = activeLink.getAttribute('data-type');
        if (linkType === 'entity-link') {
            var parentLi = activeLink.parentNode,
                parentUl,
                parentChapterMenu;
            if (parentLi) {
                parentUl = parentLi.parentNode;
                if (parentUl) {
                    parentChapterMenu = parentUl.parentNode;
                    if (parentChapterMenu) {
                        var toggler = parentChapterMenu.querySelector('.menu-toggler');
                        if (toggler && hasClass(toggler, 'fa-angle-down')) {
                            toggler.click();
                        }
                    }
                }
            }

        } else if (linkType === 'chapter-link') {
            var toggler = activeLink.querySelector('.menu-toggler');
            if (toggler && hasClass(toggler, 'fa-angle-down')) {
                toggler.click();
            }
        }

    }
});
