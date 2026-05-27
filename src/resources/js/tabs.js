document.addEventListener('DOMContentLoaded', function() {
    var tabContainers = document.getElementsByClassName('nav-tabs');
    var tabLinks = [];
    var tabAliasMap = {
        'template': 'templateData',
        'dom-tree': 'tree'
    };

    function updateAddress(e) {
        if (history.pushState && e.target.dataset.link) {
            history.pushState(null, null, '#' + e.target.dataset.link);
        }
    }

    function findTabLinkByDataLink(dataLink) {
        for (var i = 0; i < tabLinks.length; i++) {
            if (tabLinks[i].dataset.link === dataLink) {
                return tabLinks[i];
            }
        }
        return null;
    }

    function getClosestTabPane(element) {
        if (!element) {
            return null;
        }
        if (element.closest) {
            return element.closest('.tab-pane');
        }
        var node = element;
        while (node) {
            if (node.classList && node.classList.contains('tab-pane')) {
                return node;
            }
            node = node.parentElement;
        }
        return null;
    }

    function findAnchorTarget(hashValue) {
        if (!hashValue) {
            return null;
        }

        var targetById = document.getElementById(hashValue);
        if (targetById) {
            return targetById;
        }

        var targetsByName = document.getElementsByName(hashValue);
        if (targetsByName && targetsByName.length > 0) {
            return targetsByName[0];
        }

        return null;
    }

    function activateTabFromHash() {
        if (location.hash === '') {
            return;
        }

        var currentHash = decodeURIComponent(location.hash.substr(1));
        if (!currentHash) {
            return;
        }

        var resolvedHash = tabAliasMap[currentHash] || currentHash;
        var directMatch = findTabLinkByDataLink(resolvedHash);
        if (directMatch) {
            directMatch.click();
            return;
        }

        if (currentHash.indexOf('source.') === 0) {
            var sourceTabLink = findTabLinkByDataLink('source');
            if (sourceTabLink) {
                sourceTabLink.click();
                return;
            }
        }

        var targetAnchor = findAnchorTarget(currentHash);
        var tabPane = getClosestTabPane(targetAnchor);
        if (!tabPane || !tabPane.id) {
            return;
        }

        var tabLink = findTabLinkByDataLink(tabPane.id);
        if (tabLink) {
            tabLink.click();
        }
    }

    if (tabContainers.length > 0) {
        tabLinks = tabContainers[0].querySelectorAll('a[data-link]');
        for (var i = 0; i < tabLinks.length; i++) {
            tabLinks[i].addEventListener('click', updateAddress);
        }
        activateTabFromHash();
        window.addEventListener('hashchange', activateTabFromHash, false);
    }
});
