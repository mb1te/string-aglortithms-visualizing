class UndoBlock {
    constructor() {}

    addUndoAnimation(animationList) {
	    return false;
    }

    undoInitialStep(world) {}
}

class UndoMove extends UndoBlock {
    constructor(id, fmX, fmy, tx, ty) {
        super();
        this.objectID = id;
        this.fromX = fmX;
        this.fromY = fmy;
        this.toX = tx;
        this.toY = ty;
    }

    addUndoAnimation(animationList) {
        let nextAnim = new SingleAnimation(this.objectID, this.fromX, this.fromY, this.toX, this.toY);
        animationList.push(nextAnim);
        return true;
    }
}

class UndoCreate extends UndoBlock {
    constructor(id) {
        super();
        this.objectID = id;
    }

    undoInitialStep(world) {
        world.removeObject(this.objectID);
    }
}

class UndoHighlight extends UndoBlock {
    constructor(id, val) {
        super();
        this.objectID = id;
        this.highlightValue = val;
    }

    undoInitialStep(world) {
        world.setHighlight(this.objectID, this.highlightValue);
    }
}

class UndoSetHeight extends UndoBlock {
    constructor(id, val) {
        super();
        this.objectID = id;
        this.height = val;
    }

    undoInitialStep(world) {
        world.setHeight(this.objectID, this.height);
    }
}

class UndoSetWidth extends UndoBlock {
    constructor(id, val) {
        super();
        this.objectID = id;
        this.width = val;
    }

    undoInitialStep(world) {
        world.setWidth(this.objectID, this.width);
    }
}

class UndoSetNumElements extends UndoBlock {
    constructor(obj, newNumElems) {
        super();
        this.objectID = obj.objectID;
        this.sizeBeforeChange = obj.getNumElements();
        this.sizeAfterChange = newNumElems;
        
        if (this.sizeBeforeChange > this.sizeAfterChange) {
            this.labels = new Array(this.sizeBeforeChange - this.sizeAfterChange);
            this.colors = new Array(this.sizeBeforeChange - this.sizeAfterChange);
            for (let i = 0; i < this.sizeBeforeChange - this.sizeAfterChange; i++) {
                this.labels[i] = obj.getText(i + this.sizeAfterChange);
                this.colors[i] = obj.getTextColor(i + this.sizeAfterChange);
            }
        }
    }

    undoInitialStep(world) {
        world.setNumElements(this.objectID, this.sizeBeforeChange);
        if (this.sizeBeforeChange > this.sizeAfterChange) {
            for (let i = 0; i < this.sizeBeforeChange - this.sizeAfterChange; i++) {
                world.setText(this.objectID, this.labels[i], i + this.sizeAfterChange);
                world.setTextColor(this.objectID, this.colors[i], i + this.sizeAfterChange);
            }
        }
    }
}

class UndoSetAlpha extends UndoBlock {
    constructor(id, alph) {
        super();
        this.objectID = id;
        this.alphaVal = alph;
    }

    undoInitialStep(world) {
        world.setAlpha(this.objectID, this.alphaVal);
    }
}

class UndoSetNull extends UndoBlock {
    constructor(id, nv) {
        super();
        this.objectID = id;
        this.nullVal = nv;
    }

    undoInitialStep(world) {
        world.setNull(this.objectID, this.nullVal);
    }
}

class UndoSetForegroundColor extends UndoBlock {
    constructor(id, color) {
        super();
        this.objectID = id;
        this.color = color;
    }

    undoInitialStep(world) {
        world.setForegroundColor(this.objectID, this.color);
    }
}

class UndoSetBackgroundColor extends UndoBlock {
    constructor(id, color) {
        super();
        this.objectID = id;
        this.color = color;
    }

    undoInitialStep(world) {
        world.setBackgroundColor(this.objectID, this.color);
    }
}

class UndoSetText extends UndoBlock {
    constructor(id, str, index) {
        super();
        this.objectID = id;
        this.newText = str;
        this.labelIndex = index;
    }

    undoInitialStep(world) {
        world.setText(this.objectID, this.newText, this.labelIndex);
    }
}

class UndoSetTextColor extends UndoBlock {
    constructor(id, color, index) {
        super();
        this.objectID = id;
        this.color = color;
        this.index = index;
    }

    undoInitialStep(world) {
        world.setTextColor(this.objectID, this.color, this.index);
    }
}

class UndoHighlightEdge extends UndoBlock {
    constructor(from, to, val) {
        super();
        this.fromID = from;
        this.toID = to;
        this.highlightValue = val;
    }

    undoInitialStep(world) {
        world.setHighlightEdge(this.fromID, this.toID, this.highlightValue);
    }
}

class UndoSetEdgeColor extends UndoBlock {
    constructor(from, to, color) {
        super();
        this.fromID = from;
        this.toID = to;
        this.color = color;
    }

    undoInitialStep(world) {
        world.setEdgeColor(this.fromID, this.toID, this.color);
    }
}

class UndoSetEdgeAlpha extends UndoBlock {
    constructor(from, to, alpha) {
        super();
        this.fromID = from;
        this.toID = to;
        this.alpha = alpha;
    }

    undoInitialStep(world) {
        world.setEdgeAlpha(this.fromID, this.toID, this.alpha);
    }
}

class UndoSetPosition extends UndoBlock {
    constructor(id, x, y) {
        super();
        this.objectID = id;
        this.x = x;
        this.y = y;
    }

    undoInitialStep(world) {
        world.setPosition(this.objectID, this.x, this.y);
    }
}
