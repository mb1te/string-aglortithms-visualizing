function ordCompare(char1, char2) {
    return char1.charCodeAt(0) - char2.charCodeAt(0);
}

class Trie extends Algorithm {
    constructor(am, w, h) {
        super();
        this.MARGIN_X = 10;
        this.MARGIN_Y = 10;
        this.STATUS_LABEL_X = 100;
        this.STATUS_LABEL_Y = 100;
        this.NODE_WIDTH = 30;
        this.NODE_HEIGHT = 30;
        this.NODE_SPACING_X = 10;
        this.NODE_SPACING_Y = 10;

        this.NORMAL_FG_COLOR = "#000";
        this.EOW_FG_COLOR = "#00f";

        this.init(am, w, h);
    }

    init(am, w, h) {
        super.init.call(this, am, w, h);
        this.addControls();
        this.reset();
    }

    addControls() {
        this.controls = [];

        this.btnLookup = addControlToAlgorithmBar("Button", "Lookup");
        this.btnLookup.onclick = this.lookupWrapper.bind(this);
        this.controls.push(this.btnLookup);

        this.btnInsert = addControlToAlgorithmBar("Button", "Insert");
        this.btnInsert.onclick = this.insertWrapper.bind(this);
        this.controls.push(this.btnInsert);

        this.btnRemove = addControlToAlgorithmBar("Button", "Remove");
        this.btnRemove.onclick = this.removeWrapper.bind(this);
        this.controls.push(this.btnRemove);

        this.lblKey = addLabelToAlgorithmBar("Key:");
        this.txtKey = addControlToAlgorithmBar("Text", "");
        this.controls.push(this.txtKey);
    }

    disableUI(event) {
        this.setEnabled(false);
    }

    enableUI(event) {
        this.setEnabled(true);
    }

    setEnabled(b) {
        for (let i = 0; i < this.controls.length; ++i) {
            this.controls[i].disabled = !b;
        }
    }

    reset() {
        this.nextId = 0;

        this.animationManager.resetAll();
        this.clearHistory();

        this.commands = [];

        console.log('trie: ', this.STATUS_LABEL_X, this.STATUS_LABEL_Y);

        this.statusId = this.newId();
        this.cmd("CreateLabel", this.statusId, "Ready.", this.STATUS_LABEL_X, this.STATUS_LABEL_Y, 0);

        this.root = this.newNode("");
        this.redrawTree();

        this.animationManager.StartNewAnimation(this.commands);
    }

    newId() {
        return this.nextId++;
    }

    newNode(value, parent) {
        return {
            value: value,
            eow: false,
            parent: parent,
            childValuesSorted: [],
            children: {},
            id: undefined,
            width: undefined,
            x: undefined,
            y: undefined
        };
    }

    addNodeChild(node, child) {
        node.childValuesSorted.push(child.value);
        node.childValuesSorted.sort(this.ordCompare);
        node.children[child.value] = child;
    }

    removeNode(node) {
        let parent = node.parent;
        if (parent === undefined) {
            throw new Error("removeNode: Can't remove the root node.");
        }
        if (node.childValuesSorted.length !== 0) {
            throw new Error("removeNode: Can't remove node with children.");
        }

        this.cmd("Disconnect", parent.id, node.id);
        this.cmd("Delete", node.id);

        delete parent.children[node.value];
        parent.childValuesSorted = parent.childValuesSorted.filter(function(ch) { return ch !== node.value; });

        return parent;
    }

    setNodeEow(node, eow) {
        node.eow = eow;
        this.cmd("SetForegroundColor", node.id, eow ? this.EOW_FG_COLOR : this.NORMAL_FG_COLOR);
    }

    setStatus(msg) {
        this.cmd("SetText", this.statusId, msg);
    }

    redrawTree() {
        this.calculateWidth(this.root);
        this.repositionTree();
        this.realizePositions(this.root);
    }

    calculateWidth(node) {
        let ch;
        let width = 0;
        for (let i = 0; i < node.childValuesSorted.length; ++i) {
            ch = node.childValuesSorted[i];
            this.calculateWidth(node.children[ch]);
            width += node.children[ch].width;
        }
        width += Math.max(0, node.childValuesSorted.length - 1) * this.NODE_SPACING_X;
        width = Math.max(this.NODE_WIDTH, width);

        node.width = width;
        return width;
    }

    repositionTree() {
        this.root.x = canvas.width / 2;
        this.root.y = this.MARGIN_Y + this.NODE_HEIGHT / 2;
        this.repositionChildren(this.root);
    }

    repositionChildren(node) {
        let x = node.x - node.width / 2;
        let y = node.y + this.NODE_SPACING_Y + this.NODE_HEIGHT;
        let child;
        for (let i = 0; i < node.childValuesSorted.length; ++i) {
            child = node.children[node.childValuesSorted[i]];
            child.x = x + child.width / 2;
            child.y = y;
            this.repositionChildren(child);
            x += child.width + this.NODE_SPACING_X;
        }
    }

    realizePositions(node) {
        if (node.id === undefined) {
            node.id = this.newId();
            this.cmd("CreateCircle", node.id, node.value, node.x, node.y);
            this.setNodeEow(node, node.eow);
            if (node.parent) {
                this.cmd("Connect", node.parent.id, node.id);
            }
        } else {
            this.cmd("Move", node.id, node.x, node.y);
        }
        for (let i = 0; i < node.childValuesSorted.length; ++i) {
            this.realizePositions(node.children[node.childValuesSorted[i]]);
        }
    }

    lookupWrapper(event) {
        let key = this.txtKey.value;
        this.txtKey.value = "";
        this.implementAction(this.lookup.bind(this), key);
    }

    insertWrapper(event) {
        let key = this.txtKey.value;
        this.txtKey.value = "";
        this.implementAction(this.insert.bind(this), key);
    }

    removeWrapper(event) {
        let key = this.txtKey.value;
        this.txtKey.value = "";
        this.implementAction(this.remove.bind(this), key);
    }

    lookup(key) {
        let node = this.root;
        let fullKeyPresent = true;
        let i, ch, child;

        this.commands = [];

        this.cmd("SetHighlight", node.id, 1);

        for (let i = 0; i < key.length; ++i) {
            ch = key[i];
            child = node.children[ch];

            this.setStatus("Looking for child '" + ch + "'.");
            this.cmd("Step");
            if (child === undefined) {
                fullKeyPresent = false;
                break;
            }

            this.setStatus("");
            this.cmd("SetHighlight", node.id, 0);
            node = child;
            this.cmd("SetHighlight", node.id, 1);
            this.cmd("Step");
        }

        if (!fullKeyPresent) {
            this.setStatus("Lookup failed, '" + ch + "' not found.");
        } else if (node.eow) {
            this.setStatus("Lookup successful.");
        } else {
            this.setStatus("Lookup failed, end-of-word marker not present.");
        }

        this.cmd("Step");
        this.setStatus("");
        this.cmd("SetHighlight", node.id, 0);

        return this.commands;
    }

    insert(key) {
        let node = this.root;
        let ch, child;

        this.commands = [];

        for (let i = 0; i < key.length; ++i) {
            ch = key[i];
            child = node.children[ch];

            this.setStatus("Looking for child '" + ch + "'.");
            this.cmd("SetHighlight", node.id, 1);
            this.cmd("Step");
            this.cmd("SetHighlight", node.id, 0);

            if (child === undefined) {
                this.setStatus("'" + ch + "' not found, creating child.");
                child = this.newNode(ch, node);
                this.addNodeChild(node, child);
                this.redrawTree();
                this.cmd("SetHighlight", child.id, 1);
                this.cmd("Step");
                this.cmd("SetHighlight", child.id, 0);
            }

            node = child;
        }

        this.setStatus("Setting end-of-word marker.");
        this.cmd("SetHighlight", node.id, 1);
        this.setNodeEow(node, true);
        this.cmd("Step");
        this.setStatus("");
        this.cmd("SetHighlight", node.id, 0);

        return this.commands;
    }

    remove(key) {
        let node = this.root;
        let found = true;
        let child;

        this.commands = [];

        this.setStatus("Looking up \"" + key + "\".");
        this.cmd("Step");
        this.cmd("SetHighlight", node.id, 1);

        for (let i = 0; i < key.length; ++i) {
            const ch = key[i];
            child = node.children[ch];

            this.setStatus("Looking for child '" + ch + "'.");
            this.cmd("Step");

            if (child === undefined) {
                found = false;
                break;
            }

            this.cmd("SetHighlight", node.id, 0);
            node = child;
            this.cmd("SetHighlight", node.id, 1);
        }

        if (!found) {
            this.setStatus("'" + ch + "' not found, key not present in trie.");
            this.cmd("Step");
        } else if (!node.eow) {
            this.setStatus("End-of-word marker missing, key not present in trie.");
            this.cmd("Step");
        } else {
            this.setStatus("Removing end-of-word marker from node.");
            this.setNodeEow(node, false);
            this.cmd("Step");

            this.cmd("SetHighlight", node.id, 0);
            this.setStatus("Removing unnecessary nodes from trie.");
            this.cmd("Step");
            this.setStatus("");
            this.cmd("SetHighlight", node.id, 1);
            this.cmd("Step");

            if (node.childValuesSorted.length > 0) {
                this.setStatus("Non-leaf node, can't remove it.");
                this.cmd("Step");
            } else {
                while (!node.eow && node.childValuesSorted.length === 0 && node.parent !== undefined) {
                    this.setStatus("Leaf node for incomplete word, removing it.");
                    this.cmd("SetHighlight", node.id, 0);
                    node = this.removeNode(node);
                    this.redrawTree();
                    this.cmd("SetHighlight", node.id, 1);
                    this.cmd("Step");
                }

                if (node.parent === undefined) {
                    this.setStatus("At root, can't remove further.");
                } else if (node.eow) {
                    this.setStatus("Node is a complete word, can't remove.");
                } else if (node.childValuesSorted.length !== 0) {
                    this.setStatus("Node has children, can't remove.");
                } else {
                    // From the termination cases of the while loop above, this
                    // case shouldn't happen.  It's here for safety.
                    this.setStatus("Can't remove.");
                }
                this.cmd("Step");
            }
        }

        this.setStatus("");
        this.cmd("SetHighlight", node.id, 0);
        return this.commands;
    }
}

let algorithm;

function init() {
    let manager = initCanvas();
    algorithm = new Trie(manager, canvas.width, canvas.height);
}