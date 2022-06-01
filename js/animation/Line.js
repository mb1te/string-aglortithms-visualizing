let LINE_maxHeightDiff = 5;
let LINE_minHeightDiff = 3;
let LINE_range= LINE_maxHeightDiff - LINE_minHeightDiff + 1;
let LINE_highlightDiff = 3;
	
class UndoConnect {
    constructort(from, to, createConnection, edgeColor, isDirected, cv, lab, anch) {
        this.fromID = from;
        this.toID = to;
        this.connect = createConnection;
        this.color = edgeColor;
        this.directed = isDirected;
        this.curve = cv;
        this.edgeLabel = lab;
        this.anchorPoint = anch;
    }

    undoInitialStep(world) {
        if (this.connect) {
            world.connectEdge(this.fromID, this.toID, this.color, this.curve, this.directed, this.edgeLabel,this.anchorPoint);
        } else {
            world.disconnect(this.fromID,this.toID);
        }
    }

    addUndoAnimation(animationList) {
        return false;
    }
}

class Line {
    constructor(n1, n2, color, cv, d, weight, anchorIndex){
        this.arrowHeight = 8;
        this.arrowWidth = 4;
        this.Node1 = n1;
        this.Node2 = n2;
        this.Dirty = false;
        this.directed = d;
        this.edgeColor = color;
        this.edgeLabel = weight;
        this.highlighted = false;
        this.addedToScene = true;
        this.anchorPoint = anchorIndex;
        this.highlightDiff = 0;
        this.curve = cv;
        this.alpha = 1.0;
    }

    color() {
        return this.edgeColor;   
    }
    
    setColor(newColor) {
        this.edgeColor = newColor;
        Dirty = true;
    }
    
    setHighlight(highlightVal) {
        this.highlighted = highlightVal;   
    }
        
    pulseHighlight(frameNum) {
        if (this.highlighted) {
            let frameMod = frameNum / 14.0;
            let delta  = Math.abs((frameMod) % (2 * LINE_range  - 2) - LINE_range + 1)
            this.highlightDiff =  delta + LINE_minHeightDiff;
            Dirty = true;			   
        }
    }
    
    hasNode(n) {
        return ((this.Node1 == n) || (this.Node2 == n));   
    }
    
    createUndoDisconnect () {
        return new UndoConnect(
            this.Node1.objectID, 
            this.Node2.objectID, 
            true, 
            this.edgeColor, 
            this.directed, 
            this.curve, 
            this.edgeLabel, 
            this.anchorPoint
        );
    }
      
    sign(n) {
        if (n > 0) return 1;
        else return -1;
    }
    
    drawArrow(pensize, color, context) {		
        context.strokeStyle = color;
        context.fillStyle = color;
        context.lineWidth = pensize;
        let fromPos = this.Node1.getTailPointerAttachPos(this.Node2.x, this.Node2.y, this.anchorPoint);
        let toPos = this.Node2.getHeadPointerAttachPos(this.Node1.x, this.Node1.y);

        let deltaX = toPos[0] - fromPos[0];
        let deltaY = toPos[1] - fromPos[1];
        let midX = (deltaX) / 2.0 + fromPos[0];
        let midY = (deltaY) / 2.0 + fromPos[1];
        let controlX = midX - deltaY * this.curve;
        let controlY = midY + deltaX * this.curve;

        context.beginPath();
        context.moveTo(fromPos[0], fromPos[1]);
        context.quadraticCurveTo(controlX, controlY, toPos[0], toPos[1]);
        context.stroke();
        
        let labelPosX = 0.25* fromPos[0] + 0.5*controlX + 0.25*toPos[0]; 
        let labelPosY =  0.25* fromPos[1] + 0.5*controlY + 0.25*toPos[1]; 
            
        let midLen = Math.sqrt(deltaY*deltaY + deltaX*deltaX);
        if (midLen != 0) {
            labelPosX +=  (- deltaY * this.sign(this.curve))  / midLen * 10 
            labelPosY += ( deltaX * this.sign(this.curve))  / midLen * 10  
        }

        context.textAlign = 'center';
        context.font = '10px sans-serif';
        context.textBaseline = 'middle'; 
        context.fillText(this.edgeLabel, labelPosX, labelPosY);

        if (this.directed) {
            let xVec = controlX - toPos[0];
            let yVec = controlY - toPos[1];
            let len = Math.sqrt(xVec * xVec + yVec*yVec);
        
            if (len > 0) {
                xVec = xVec / len
                yVec = yVec / len;
                
                context.beginPath();
                context.moveTo(toPos[0], toPos[1]);
                context.lineTo(toPos[0] + xVec*this.arrowHeight - yVec*this.arrowWidth, toPos[1] + yVec*this.arrowHeight + xVec*this.arrowWidth);
                context.lineTo(toPos[0] + xVec*this.arrowHeight + yVec*this.arrowWidth, toPos[1] + yVec*this.arrowHeight - xVec*this.arrowWidth);
                context.lineTo(toPos[0], toPos[1]);
                context.closePath();
                context.stroke();
                context.fill();
            }
        }
    }
    
    draw(ctx) {
        if (!this.addedToScene) return;   
        ctx.globalAlpha = this.alpha;

        if (this.highlighted) this.drawArrow(this.highlightDiff, "#FF0000", ctx);
        this.drawArrow(1, this.edgeColor, ctx);
    }
}
