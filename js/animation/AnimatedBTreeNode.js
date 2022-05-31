

class UndoDeleteBTreeNode extends UndoBlock {
    constructor(id, numLab, labelText, x, y, wPerElement, nHeight, lColors, bgColor, fgColor, l, highlighted) {
        this.objectID = id;
        this.posX = x;
        this.posY = y;
        this.widthPerElem = wPerElement;
        this.nodeHeight = nHeight;
        this.backgroundColor= bgColor;
        this.foregroundColor = fgColor;
        this.numElems = numLab;
        this.labels = labelText;
        
        this.labelColors = lColors;
        this.layer = l;
        this.highlighted = highlighted;
    }
    
    undoInitialStep(world) {
        world.addBTreeNode(this.objectID, this.widthPerElem, this.nodeHeight, this.numElems, this.backgroundColor, this.foregroundColor);
        world.setNodePosition(this.objectID, this.posX, this.posY);
        for (let i = 0; i < this.numElems; i++) {
            world.setText(this.objectID, this.labels[i], i);
            world.setTextColor(this.objectID, this.labelColors[i],i);
        }
        world.setHighlight(this.objectID, this.highlighted);
        world.setLayer(this.objectID, this.layer);
    }
}

class AnimatedBTreeNode extends AnimatedObject {
    constructor (id, widthPerElem, h, numElems,  fillColor, edgeColor) {
        super();
        fillColor = (fillColor == undefined)? "#FFFFFF" : fillColor;
        edgeColor = (edgeColor == undefined)? "#000000" : edgeColor;
        this.init(id, widthPerElem, h, numElems,  fillColor, edgeColor);
        this.MIN_WIDTH = 10;
        this.EDGE_POINTER_DISPLACEMENT = 5;
    }

    init(id, widthPerElem, h, numElems,  fillColor, edgeColor) {
        let MIN_WIDTH = 10;
        this.super.init.call(this);
        this.objectID = id;
        
        this.backgroundColor = fillColor;
        this.foregroundColor = edgeColor;
        
        this.widthPerElement = widthPerElem;
        this.nodeHeight = h;
        this.numLabels = numElems;
        this.labels = new Array(this.numLabels);
        this.labelColors = new Array(this.numLabels);
        for (let i = 0; i < this.numLabels; i++) this.labelColors[i] = this.foregroundColor;
    }
        
    getNumElements() {
        return this.numLabels;
    }

    getWidth() {
        if (this.numLabels > 0) return  (this.widthPerElement * this.numLabels);
        else return this.MIN_WIDTH;
    }

    setNumElements(newNumElements) {
        if (this.numLabels < newNumElements) {
            for (let i = this.numLabels; i < newNumElements; i++) {
                this.labels[i] = "";
                this.labelColors[i] = this.foregroundColor;
            }
            this.numLabels = newNumElements;
        } else if (this.numLabels > newNumElements) {
            for (let i = newNumElements; i < this.numLabels; i++) {
                this.labels[i] = null;
            }
            this.numLabels = newNumElements;
        }
    }

    left() {
        return this.x  - this.getWidth() / 2.0;
    }

    right() {
        return this.x  + this.getWidth() / 2.0;
    } 

    top() {
        return this.y - this.nodeHeight / 2.0;
    }

    bottom() {
        return this.y + this.nodeHeight / 2.0;
    }

    draw(context) {
        let startX;
        let startY;
        
        startX = this.left();
        if (startX == NaN) startX  = 0;
        startY = this.top();
        
        if (this.highlighted) {
            context.strokeStyle = "#ff0000";
            context.fillStyle = "#ff0000";
            
            context.beginPath();
            context.moveTo(startX - this.highlightDiff,startY- this.highlightDiff);
            context.lineTo(startX+this.getWidth() + this.highlightDiff,startY- this.highlightDiff);
            context.lineTo(startX+this.getWidth() + this.highlightDiff,startY+this.nodeHeight + this.highlightDiff);
            context.lineTo(startX - this.highlightDiff,startY+this.nodeHeight + this.highlightDiff);
            context.lineTo(startX - this.highlightDiff,startY - this.highlightDiff);				
            context.closePath();
            context.stroke();
            context.fill();
        }
        
        context.strokeStyle = this.foregroundColor;
        context.fillStyle = this.backgroundColor;
        
        context.beginPath();
        context.moveTo(startX ,startY);
        context.lineTo(startX + this.getWidth(), startY);
        context.lineTo(startX + this.getWidth(), startY + this.nodeHeight);
        context.lineTo(startX, startY + this.nodeHeight);
        context.lineTo(startX, startY);
        context.closePath();
        context.stroke();
        context.fill();
        
        context.textAlign = 'center';
        context.textBaseline   = 'middle'; 

        
        for (let i = 0; i < this.numLabels; i++) {
            let labelx  = this.x - this.widthPerElement * this.numLabels / 2 + this.widthPerElement / 2 + i * this.widthPerElement; 
            let labely = this.y			   

            context.fillStyle = this.labelColors[i];
            context.fillText(this.labels[i], labelx, labely); 
        }	
    }

    getHeight() {
        return this.nodeHeight;
    }

    setForegroundColor(newColor) {
        this.foregroundColor = newColor;
        for (let i = 0; i < numLabels; i++) {
            labelColor[i] = newColor;
        }
    }

    getTailPointerAttachPos(fromX, fromY, anchor) {
        if (anchor == 0) {
            return [this.left() + this.EDGE_POINTER_DISPLACEMENT, this.y];
        }
        else if (anchor == this.numLabels) {
            return [this.right() - this.EDGE_POINTER_DISPLACEMENT, this.y];	
        }
        else {
            return [this.left() + anchor * this.widthPerElement, this.y]
        }
    }

    getHeadPointerAttachPos(fromX, fromY) {
        if (fromY < this.y - this.nodeHeight / 2) {
            return [this.x, this.y - this.nodeHeight / 2];
        }
        else if (this.fromY > this.y + this.nodeHeight /  2) {
            return [this.x, this.y + this.nodeHeight / 2];			
        }
        else if (fromX  <  this.x  - this.getWidth() / 2) {
            return [this.x - this.getWidth() / 2, this.y];
        }
        else {
            return [this.x + this.getWidth() / 2, this.y];
        }
    }

    createUndoDelete() {
        return new UndoDeleteBTreeNode(this.objectID, this.numLabels, this.labels, this.x, this.y, this.widthPerElement, this.nodeHeight, this.labelColors, this.backgroundColor, this.foregroundColor, this.layer, this.highlighted);
    }
    
    getTextColor(textIndex) {
        textIndex = !textIndex ? 0 : textIndex;
        return this.labelColors[textIndex];
    }

    getText(index) {
        index = !index ? 0 : index;
        return this.labels[index];
    }

    setTextColor(color, textIndex) {
        textIndex = !textIndex ? 0 : textIndex;
        this.labelColors[textIndex] = color;
    }

    setText(newText, textIndex) {
        textIndex = !textIndex ? 0 : textIndex;
        this.labels[textIndex] = newText;
    }
}
