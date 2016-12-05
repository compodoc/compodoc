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
    })
});
