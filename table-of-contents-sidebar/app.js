chrome.storage.sync.get({
    position: 'right',
    tocs_toggle: true,
    hover: false
}, function (items) {
    var toggle = items.tocs_toggle;

    if (!toggle) return;
    if (isBlocked()) return;
    var nodes = parseLinkableNodes();
    if (nodes.length < 3) return;
    injectCss();

    var fixedSidebarNode = createFixedSidebarNode();
    var fixedMenuNode = createFixedMenuNode();
    fixedSidebarNode.appendChild(createOptionsNode());
    fixedSidebarNode.appendChildren(nodes);
    restoreOptions(items, fixedSidebarNode, fixedMenuNode);
    document.body.appendChild(fixedSidebarNode);
    document.body.appendChild(fixedMenuNode);
});
function restoreOptions(optionsItems, sidebar, menu) {
    if (optionsItems) {
        var position = optionsItems.position;
        var hover = optionsItems.hover;
        if (position == "right") {
            activeRight(sidebar, menu);
        } else {
            activeLeft(sidebar, menu);
        }
        if (hover) {
            activeHover(sidebar, menu);
        } else {
            inactiveHover(sidebar, menu);
        }

    } else {
        chrome.storage.sync.get({
            position: 'right',
            tocs_toggle: false,
            hover: false
        }, function (items) {
            if (items.tocs_toggle == false) {
                return;
            }
            restoreOptions(items);
        });
    }
}

function injectCss() {
    var link = document.createElement("link");
    link.href = chrome.extension.getURL("table-of-contents-sidebar.css");
    link.type = "text/css";
    link.rel = "stylesheet";
    var headNode = document.getElementsByTagName("head");
    if (headNode) {
        headNode[0].appendChild(link);
    } else {
        document.body.appendChild(link);
    }
}

function fixedSidebarNode() {
    var element = document.getElementById("table-of-contents-sidebar-id");
    return element;
}

function fixedSidebarMenuNode() {
    var element = document.getElementById("table-of-contents-sidebar-hover-menu-id");
    return element;
}

function isBlocked() {
    var blocklist = ["google", "baidu.com", "stackoverflow.com", "github.com", "localhost"];
    var domain = document.domain;
    var block = false;
    for (var i = 0; i < blocklist.length; i++) {
        if (domain.indexOf(blocklist[i]) != -1) {
            block = true;
        }
    }
    return block;
}

function parseLinkableNodes() {
    var documents = document.getElementsByTagName('*');
    var iteratorAbsTop = 0;
    var sidebarCount = 0;
    var matchesNodes = [];
    for (var i = 0, l = documents.length; i < l; i++) {
        var node = documents[i];
        if (!!node && !!node.textContent && !!node.textContent.trim()
            && (node.nodeName == "H1" || node.nodeName == "H2" || node.nodeName == "H3"
            || node.nodeName == "H4" || node.nodeName == "H5" || node.nodeName == "H6")) {
            var absTop = node.getBoundingClientRect().top + document.documentElement.scrollTop;
            if (sidebarCount > 0 && absTop < iteratorAbsTop) {
                break;
            }
            if (!node.id) {
                node.id = uuid();
            }
            var data = {
                id: node.id,
                text: node.textContent,
                name: node.nodeName
            };
            matchesNodes.push(data);
            iteratorAbsTop = absTop;
        }
    }
    return matchesNodes;
}

function createFixedSidebarNode() {
    var fixedSidebarNode = document.createElement('div');
    fixedSidebarNode.id = "table-of-contents-sidebar-id";
    fixedSidebarNode.className = "table-of-contents-sidebar-fixed-sidebar";
    return fixedSidebarNode;
}

function createFixedMenuNode() {
    var sidebar = fixedSidebarNode();
    var left = null, right = "0px";
    if (sidebar) {
        sidebar.style.left;
        sidebar.style.right;
    }
    var fixedSidebarHoverMenu = document.createElement('img');
    fixedSidebarHoverMenu.id = "table-of-contents-sidebar-hover-menu-id";
    fixedSidebarHoverMenu.src = getImageUrl("images/icon/icon_blue_128x128.png");
    fixedSidebarHoverMenu.className = "table-of-contents-sidebar-menu";
    fixedSidebarHoverMenu.style.left = left;
    fixedSidebarHoverMenu.style.right = right;
    fixedSidebarHoverMenu.addEventListener('mouseover', function (e) {
        e.stopPropagation();
        var sidebar = fixedSidebarNode();
        sidebar.style.display = "block";
        sidebar.addEventListener('mouseout', function (e) {
            e.stopPropagation();
            sidebar.style.display = "none";
        });
        sidebar.addEventListener('mouseover', function (e) {
            e.stopPropagation();
            sidebar.style.display = "block";
        });
    });
    fixedSidebarHoverMenu.addEventListener('mouseout', function (e) {
        e.stopPropagation();
        var sidebar = fixedSidebarNode();
        sidebar.style.display = "none";
        sidebar.addEventListener('mouseout', function (e) {
            e.stopPropagation();
            sidebar.style.display = "none";
        });
        sidebar.addEventListener('mouseover', function (e) {
            e.stopPropagation();
            sidebar.style.display = "block";
        });
    });
    return fixedSidebarHoverMenu;
}

function uuid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

function activeLeft(sidebar, menu) {
    var sidebar = !!sidebar ? sidebar : fixedSidebarNode();
    var menu = !!menu ? menu : fixedSidebarMenuNode();
    if (sidebar) {
        sidebar.style.left = "0px";
        sidebar.style.right = null;
    }
    if (menu) {
        menu.style.left = "0px";
        menu.style.right = null;
    }
}
function activeRight(sidebar, menu) {
    var sidebar = !!sidebar ? sidebar : fixedSidebarNode();
    var menu = !!menu ? menu : fixedSidebarMenuNode();
    if (sidebar) {
        sidebar.style.right = "0px";
        sidebar.style.left = null;
    }
    if (menu) {
        menu.style.right = "0px";
        menu.style.left = null;
    }
}
function activeClose(sidebar, menu) {
    var sidebar = !!sidebar ? sidebar : fixedSidebarNode();
    var menu = !!menu ? menu : fixedSidebarMenuNode();
    if (sidebar) {
        sidebar.style.display = "none";
    }
    if (menu) {
        menu.style.display = "none";
    }
}
function activeHover(sidebar, menu) {
    var sidebar = !!sidebar ? sidebar : fixedSidebarNode();
    var menu = !!menu ? menu : fixedSidebarMenuNode();
    if (sidebar) {
        sidebar.style.display = "none";
    }
    if (menu) {
        menu.style.display = "block";
    }
}

function inactiveHover(sidebar, menu) {
    var sidebar = !!sidebar ? sidebar : fixedSidebarNode();
    var menu = !!menu ? menu : fixedSidebarMenuNode();
    if (sidebar) {
        sidebar.style.display = "block";
    }
    if (menu) {
        menu.style.display = "none";
    }
}

function createOptionsNode() {
    var optionsContainer = createSpanNode("");
    var leftBtn = createImageNode("images/left.png", "Float Left");
    leftBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        activeLeft();
    });
    var rightBtn = createImageNode("images/right.png", "Float Right");
    rightBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        activeRight();
    });
    var closeBtn = createImageNode("images/close.png", "Close", "18px");
    closeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        activeClose();
    });
    var hoverBtn = createImageNode("images/hover.png", "Display on Hover", "18px");
    hoverBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        activeHover();
    });
    var optionBtn = createImageNode("images/settings.png", "Settings", "18px");
    optionBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        window.open(chrome.runtime.getURL('options.html'), '_blank');
    });
    var bugBtn = createImageNode("images/bug.png", "Report Bugs", "18px");
    bugBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        window.open('https://github.com/codedrinker/table-of-contents-sidebar/issues', '_blank');
    });

    optionsContainer.appendChild(leftBtn);
    optionsContainer.appendChild(rightBtn);
    optionsContainer.appendChild(closeBtn);
    optionsContainer.appendChild(hoverBtn);
    optionsContainer.appendChild(optionBtn);
    optionsContainer.appendChild(bugBtn);
    optionsContainer.appendChild(document.createElement('br'));
    return optionsContainer;
}

function createImageNode(url, title, size) {
    var image = document.createElement('img');
    image.style.marginLeft = "5px";
    image.style.height = !!size ? size : "20px";
    image.style.width = !!size ? size : "20px";
    image.style.cursor = "pointer";
    image.alt = title;
    image.title = title;
    image.src = getImageUrl(url);
    return image;
}

function createSpanNode(text) {
    var span = document.createElement('span');
    var textNode = document.createTextNode(text);
    span.appendChild(textNode);
    return span;
}

function getImageUrl(name) {
    var image = chrome.extension.getURL(name);
    return image;
}

Node.prototype.appendChildren = function (children) {
    var that = this;
    for (var i = 0, l = children.length; i < l; i++) {
        var refNode = document.createElement('a');
        var text = document.createTextNode(children[i].text);
        refNode.appendChild(text);
        refNode.title = children[i].text;
        refNode.href = "#" + children[i].id;
        var size = Number(children[i].name[1]);
        refNode.style.marginLeft = ((size - 1 ) * 20) + "px";
        that.appendChild(refNode);
        that.appendChild(document.createElement('br'));
    }
};