class UndoDeleteLabel extends UndoBlock {
    constructor(id, lab, x, y, centered, color, l) {
        super();
        this.objectID = id;
        this.posX = x;
        this.posY = y;
        this.nodeLabel = lab;
        this.labCentered = centered;
        this.labelColor = color;
        this.layer = l;
    }

    undoInitialStep(world) {
        world.addLabelObject(this.objectID, this.nodeLabel, this.labCentered);
        world.setNodePosition(this.objectID, this.posX, this.posY);
        world.setForegroundColor(this.objectID, this.labelColor);
        world.setLayer(this.objectID, this.layer);
    }
}

class AnimatedLabel extends AnimatedObject {
    constructor(id, val, center, initialWidth) {
        super();
        this.centering = center;
        this.label = val;
        this.highlighted = false;
        this.objectID = id;
        this.alpha = 1.0;
        this.addedToScene = true;
        this.labelColor = "#000000";
        this.textWidth = 0;
        this.alwaysOnTop = true;

        if (initialWidth) this.textWidth = initialWidth;
    }

    centered() {
        return this.centering;
    }

    draw(ctx) {
        if (!this.addedToScene) return;
        
        ctx.globalAlpha = this.alpha;
        ctx.font = '20px sans-serif';

        if (this.centering) {
            ctx.textAlign = 'center';
            ctx.textBaseline   = 'middle'; 
        } else {
            ctx.textAlign = 'left';
            ctx.textBaseline   = 'top'; 
        }

        if (this.highlighted) {
            ctx.strokeStyle = "#ffaaaa";
            ctx.fillStyle = "#ff0000";
            ctx.lineWidth = this.highlightDiff;
            ctx.strokeText(this.label, this.x, this.y);
        }

        ctx.strokeStyle = this.labelColor;
        ctx.fillStyle = this.labelColor;
        ctx.lineWidth = 1;
        
        let strList = this.label.split("\n");
        if (strList.length == 1) ctx.fillText(this.label, this.x, this.y);
        else {
            let offset = this.centering ? (1.0 - strList.length) / 2.0 : 0;
            for (let i = 0; i < strList.length; i++) {
                ctx.fillText(strList[i], this.x, this.y + offset + i * 12);
            }		
        }

        ctx.closePath();
    }


    alignLeft(otherObject) {
        if (this.centering) {
            this.y = otherObject.centerY();
            this.x = otherObject.left() - this.textWidth / 2;
        } else {
            this.y = otherObject.centerY() - 5;
            this.x = otherObject.left() - this.textWidth;
        }
    }

    alignRight(otherObject) {
        if (this.centering) {
            this.y = otherObject.centerY();
            this.x = otherObject.right() + this.textWidth / 2;
        } else {
            this.y = otherObject.centerY() - 5;
            this.x = otherObject.right();
        }
    }

    alignTop(otherObject) {
        if (this.centering) {
            this.y = otherObject.top() - 5;
            this.x = otherObject.centerX();
        } else {
            this.y = otherObject.top() - 10;
            this.x = otherObject.centerX() -this.textWidth / 2;
        }
    }

    alignBottom(otherObject) {
        if (this.centering) {
            this.y = otherObject.bottom() + 5;
            this.x = otherObject.centerX();
        } else {
            this.y = otherObject.bottom();
            this.x = otherObject.centerX() - this.textWidth / 2;
        }
    }

    getWidth() {
        return this.width;
    }

    setHighlight(value) {
        this.highlighted = value;
    }
            
    createUndoDelete() {
        return new UndoDeleteLabel(this.objectID, this.label, this.x, this.y, this.centering, this.labelColor, this.layer);
    }     
            
    centerX() {
        return this.centering ? this.x : this.x + this.textWidth;
    }
        
    centerY() {
        return this.centering ? this.y : this.y + 5;
    }
        
    top() {
        return this.centering ? this.y - 5 : this.y;
    }

    bottom() {
        return this.centering ? this.y + 5 : this.y + 10;
    }  
        
    right() {
        return this.centering ? this.x + this.textWidth / 2 : this.x + this.textWidth;
    }


    left() {
        return this.centering ? this.x - this.textWidth / 2 : this.x;
    }

    getTailPointerAttachPos(fromX, fromY, anchorPoint) {			 
        return this.getClosestCardinalPoint(fromX, fromY); 
    }

    getHeadPointerAttachPos (fromX, fromY) {
        return this.getClosestCardinalPoint(fromX, fromY);			
    }

    setText(newText, textIndex, initialWidth) {
        this.label = newText;
        if (initialWidth != undefined)
        {
            this.textWidth = initialWidth;
        }
    }
}
