let ratio = window.devicePixelRatio;

class ObjectManager {
    constructor() {
        this.Nodes = [];
        this.Edges = [];
        this.BackEdges = [];
        this.activeLayers = [true];
        this.ctx = document.getElementById('canvas').getContext('2d');
        this.framenum = 0;
        this.width = 0;
        this.height = 0;
        this.statusReport = new AnimatedLabel(-1, "XXX", false, 30);
        this.statusReport.x = 30;
    }

    draw() {
		this.framenum++;
		if (this.framenum > 1000) this.framenum = 0;
		
		this.ctx.clearRect(0, 0, this.width, this.height);
		this.statusReport.y = this.height - 15;
		
		for (let i = 0; i < this.Nodes.length; i++) {
			if (this.Nodes[i] && !this.Nodes[i].highlighted && this.Nodes[i].addedToScene && !this.Nodes[i].alwaysOnTop) {
				this.Nodes[i].draw(this.ctx);	
			}
		}

		for (let i = 0; i < this.Nodes.length; i++) {
			if (this.Nodes[i] && (this.Nodes[i].highlighted && !this.Nodes[i].alwaysOnTop) && this.Nodes[i].addedToScene) {
				this.Nodes[i].pulseHighlight(this.framenum);
				this.Nodes[i].draw(this.ctx);	
			}
		}
		
		for (let i = 0; i < this.Nodes.length; i++) {
			if (this.Nodes[i] && this.Nodes[i].alwaysOnTop && this.Nodes[i].addedToScene) {
				this.Nodes[i].pulseHighlight(this.framenum);
				this.Nodes[i].draw(this.ctx);	
			}
		}
		
		
		for (let i = 0; i < this.Edges.length; i++) {
			if (this.Edges[i]) {
				for (j = 0; j < this.Edges[i].length; j++) {
					if (this.Edges[i][j].addedToScene) {
						this.Edges[i][j].pulseHighlight(this.framenum);	
						this.Edges[i][j].draw(this.ctx);	
					}
				}
			}
		}

		this.statusReport.draw(this.ctx);
	}

    update() {}

    resetLayers() {
		for (let i = 0; i <this.Nodes.length; i++) {
			if (this.Nodes[i]) {
				this.Nodes[i].addedToScene = this.activeLayers[this.Nodes[i].layer] == true;
			}
		}
		for (let i = this.Edges.length - 1; i >= 0; i--) {
		    if (this.Edges[i]) {
				for (let j = 0; j < this.Edges[i].length; j++) {
					if (this.Edges[i][j]) {
                        this.Edges[i][j].addedToScene = !!this.activeLayers[this.Edges[i][j].Node1.layer] && 
                            !!this.activeLayers[this.Edges[i][j].Node2.layer];
					}
				}
			}
		}
	}

    setLayers(shown, layers) {
        for (let i = 0; i < layers.length; i++) this.activeLayers[layers[i]] = shown;
		this.resetLayers();
    }

    addHighlightCircleObject(objectID, objectColor, radius) {
		if (this.Nodes[objectID]){
            throw "addHighlightCircleObject:Object with same ID (" + String(objectID) + ") already Exists!"
		}
		this.Nodes[objectID] = new HighlightCircle(objectID, objectColor, radius);		
	}

    setEdgeAlpha(fromID, toID, alphaVal) {
		let oldAlpha = 1.0; 
		if (this.Edges[fromID]) {
			let len = this.Edges[fromID].length;
			for (let i = len - 1; i >= 0; i--) {
				if (this.Edges[fromID][i] && this.Edges[fromID][i].Node2 == this.Nodes[toID]) {
					oldAlpha = this.Edges[fromID][i].alpha
					this.Edges[fromID][i].alpha = alphaVal;		
				}
			}
		}	
		return oldAlpha;
	}

    getAlpha(nodeID) {
		return this.Nodes[nodeID] ? this.Nodes[nodeID] : -1;
	}

    setAlpha(nodeID, alphaVal) {
		if (this.Nodes[nodeID]) this.Nodes[nodeID].setAlpha(alphaVal);
	}

    getTextColor(nodeID, index) {
		return this.Nodes[nodeID] ? this.Nodes[nodeID].getTextColor(index) : "#000000";
	}

    setTextColor(nodeID, color, index) {
		if (this.Nodes[nodeID]) this.Nodes[nodeID].setTextColor(color, index);
	}
	
    setAllLayers(layers) {
		this.activeLayers = [];
		for(let i = 0; i < layers.length; i++) this.activeLayers[layers[i]] = true;
		this.resetLayers();
	}

    setLayer(objectID, layer) {
		if (this.Nodes[objectID]) {
			this.Nodes[objectID].layer = layer;
            this.Nodes[objectID].addedToScene = !!this.activeLayers[layer];

			if (this.Edges[objectID]) {
				for (let i = 0; i < this.Edges[objectID].length; i++) {
					let nextEdge = this.Edges[objectID][i];
					if (nextEdge) nextEdge.addedToScene = !!nextEdge.Node1.addedToScene && !!nextEdge.Node2.addedToScene;
				}
			}

			if (this.BackEdges[objectID]) {
				for (let i = 0; i < this.BackEdges[objectID].length; i++) {
					let nextEdge = this.BackEdges[objectID][i];
					if (nextEdge) nextEdge.addedToScene = !!nextEdge.Node1.addedToScene && !!nextEdge.Node2.addedToScene;
				}
			}
		}
	}

    clearAllObjects() {
		this.Nodes = [];
		this.Edges = [];
		this.BackEdges = [];
	}

    setForegroundColor(objectID, color) {
		if (this.Nodes[objectID]) this.Nodes[objectID].setForegroundColor(color);
	}

    setBackgroundColor(objectID, color) {
		if (this.Nodes[objectID]) this.Nodes[objectID].setBackgroundColor(color);
	}

    getHighlight(nodeID) {
		if (!this.Nodes[nodeID]) return false;
		return this.Nodes[nodeID].getHighlight();
	}

    setHighlight = function(nodeID, val) {
		if (!this.Nodes[nodeID]) return
		this.Nodes[nodeID].setHighlight(val);
	}
	
	getWidth(nodeID) {
		if (!this.Nodes[nodeID]) return -1;
		return this.Nodes[nodeID].getWidth();
	}

    setWidth(nodeID, val) {
		if (!this.Nodes[nodeID]) return;
		this.Nodes[nodeID].setWidth(val);
	}
	
	getHeight(nodeID) {
		if (!this.Nodes[nodeID]) return -1;
		return this.Nodes[nodeID].getHeight();
	}
	
	setHeight = function(nodeID, val) {
		if (!this.Nodes[nodeID]) return;
		this.Nodes[nodeID].setHeight(val);
	}

    backgroundColor(objectID) {
		return this.Nodes[objectID] ? this.Nodes[objectID].backgroundColor : '#000000';
	}
	
	foregroundColor(objectID) {
		return this.Nodes[objectID] ? this.Nodes[objectID].foregroundColor : '#000000';
	}

    disconnect(objectIDfrom,objectIDto) {
		let undo = null;
		
        if (this.Edges[objectIDfrom]) {
			let len = this.Edges[objectIDfrom].length;
			
            for (let i = len - 1; i >= 0; i--) {
				if (this.Edges[objectIDfrom][i] && this.Edges[objectIDfrom][i].Node2 == this.Nodes[objectIDto]) {
					let deleted = this.Edges[objectIDfrom][i];
					undo = deleted.createUndoDisconnect();
					this.Edges[objectIDfrom][i] = this.Edges[objectIDfrom][len - 1];
					len -= 1;
					this.Edges[objectIDfrom].pop();
				}
			}
		}

		if (this.BackEdges[objectIDto]) {
			let len = this.BackEdges[objectIDto].length;
			
            for (let i = len - 1; i >= 0; i--) {
				if (this.BackEdges[objectIDto][i] && this.BackEdges[objectIDto][i].Node1 == this.Nodes[objectIDfrom]) {
					deleted = this.BackEdges[objectIDto][i];
					this.BackEdges[objectIDto][i] = this.BackEdges[objectIDto][len - 1];
					len -= 1;
					this.BackEdges[objectIDto].pop();
				}
			}
		}
		return undo;
	}

    deleteIncident(objectID) {
		let undoStack = [];

		if (this.Edges[objectID]) {
			let len = this.Edges[objectID].length;
			
            for (let i = len - 1; i >= 0; i--) {
				let deleted = this.Edges[objectID][i];
				let node2ID = deleted.Node2.identifier();
				undoStack.push(deleted.createUndoDisconnect());
				
				let len2 = this.BackEdges[node2ID].length;
				for (let j = len2 - 1; j >= 0; j--) {
					if (this.BackEdges[node2ID][j] == deleted) {
						this.BackEdges[node2ID][j] = this.BackEdges[node2ID][len2 - 1];
						len2 -= 1;
						this.BackEdges[node2ID].pop();
					}
				}
			}

			this.Edges[objectID] = null;
		}

		if (this.BackEdges[objectID]) {
			let len = this.BackEdges[objectID].length;
			
            for (let i = len - 1; i >= 0; i--) {
				let deleted = this.BackEdges[objectID][i];
				let node1ID = deleted.Node1.identifier();
				undoStack.push(deleted.createUndoDisconnect());

				let len2 = this.Edges[node1ID].length;
				for (let j = len2 - 1; j >= 0; j--) {
					if (this.Edges[node1ID][j] == deleted) {
						this.Edges[node1ID][j] = this.Edges[node1ID][len2 - 1];
						len2 -= 1;
						this.Edges[node1ID].pop();
					}
				}
			}

			this.BackEdges[objectID] = null;
		}

		return undoStack;
	}

    removeObject(ObjectID) {
		if (ObjectID == this.Nodes.length - 1) this.Nodes.pop();
		else this.Nodes[ObjectID] = null;
	}
	
	getObject(objectID) {
		if (!this.Nodes[objectID]){
			throw "getObject:Object with ID (" + String(objectID) + ") does not exist"
		}

		return this.Nodes[objectID];
	}

    addCircleObject = function (objectID, objectLabel) {
			if (this.Nodes[objectID]) {
				throw "addCircleObject:Object with same ID (" + String(objectID) + ") already Exists!"
			}

			this.Nodes[objectID] = new AnimatedCircle(objectID, objectLabel);
	}
	
	getNodeX(nodeID) {
		if (!this.Nodes[nodeID]) {
			throw "getting x position of an object that does not exit";
		}

		return this.Nodes[nodeID].x;
	}

    getTextWidth(text) {
		this.ctx.font = '10px sans-serif';
		
        let strList = text.split("\n");
		let width = 0;

		if (strList.length == 1) width = this.ctx.measureText(text).width;
		else {
            for (let i = 0; i < strList.length; i++) width = Math.max(width, this.ctx.measureText(strList[i]).width);
        }
		
		return width;
	}
	
	getText(nodeID, index) {
		if (this.Nodes[nodeID] == null || this.Nodes[nodeID] == undefined) {
			throw "getting text of an object that does not exists";
		}

		return this.Nodes[nodeID].getText(index);
	}

    setText(nodeID, text, index) {
		if (!this.Nodes[nodeID]) {
			throw "setting text of an object that does not exists";
		}			

		this.Nodes[nodeID].setText(text, index, this.getTextWidth(text));
	}

    getNodeY(nodeID) {
		if (!this.Nodes[nodeID]) {
			throw "getting y position of an object that does not exit";
		}

		return this.Nodes[nodeID].y;
	}

    connectEdge(objectIDfrom, objectIDto, color, curve, directed, lab, connectionPoint) {
		let fromObj = this.Nodes[objectIDfrom];
		let toObj = this.Nodes[objectIDto];
		if (!fromObj || !toObj) {
			throw "Tried to connect two nodes, one didn't exist!";
		}

		let l = new Line(fromObj,toObj, color, curve, directed, lab, connectionPoint);
		if (!this.Edges[objectIDfrom]) this.Edges[objectIDfrom] = [];
		if (!this.BackEdges[objectIDto]) this.BackEdges[objectIDto] = [];
		
        l.addedToScene = fromObj.addedToScene && toObj.addedToScene;
		this.Edges[objectIDfrom].push(l);
		this.BackEdges[objectIDto].push(l);
	}
	
	getNull(objectID) {
		if (this.Nodes[objectID]) return this.Nodes[objectID].getNull();
		return false;
    }

    setNull(objectID, nullVal) {
		if (this.Nodes[objectID]) this.Nodes[objectID].setNull(nullVal);
	}

    setEdgeColor(fromID, toID, color) {
		let oldColor ="#000000";
		
        if (this.Edges[fromID]) {
			let len = this.Edges[fromID].length;
			for (let i = len - 1; i >= 0; i--) {
				if (this.Edges[fromID][i] && this.Edges[fromID][i].Node2 == this.Nodes[toID]) {
					oldColor = this.Edges[fromID][i].color();
					this.Edges[fromID][i].setColor(color);		
				}
			}
		}

		return oldColor;
	}	

	alignTop(id1, id2) {
		if (!this.Nodes[id1] || !this.Nodes[id2]) {
			throw "Tring to align two nodes, one doesn't exist: " + String(id1) + "," + String(id2);			
		}

		this.Nodes[id1].alignTop(this.Nodes[id2]);
	}
	
	alignLeft(id1, id2) {
		if (!this.Nodes[id1] || !this.Nodes[id2]) {
			throw "Tring to align two nodes, one doesn't exist: " + String(id1) + "," + String(id2);			
		}

		this.Nodes[id1].alignLeft(this.Nodes[id2]);
	}
	
	alignRight = function(id1, id2) {
		if (!this.Nodes[id1] || !this.Nodes[id2]) {
			throw "Tring to align two nodes, one doesn't exist: " + String(id1) + "," + String(id2);			
		}

		this.Nodes[id1].alignRight(this.Nodes[id2]);
	}
	
	alignBottom(id1, id2) {
		if (!this.Nodes[id1] || !this.Nodes[id2]) {
			throw "Tring to align two nodes, one doesn't exist: " + String(id1) + "," + String(id2);			
		}

		this.Nodes[id1].alignBottom(this.Nodes[id2]);
	}

    setEdgeHighlight(fromID, toID, val) {
		let oldHighlight = false;
		
        if (this.Edges[fromID]) {
			let len = this.Edges[fromID].length;
			for (let i = len - 1; i >= 0; i--) {
				if (this.Edges[fromID][i] && this.Edges[fromID][i].Node2 == this.Nodes[toID]) {
					oldHighlight = this.Edges[fromID][i].highlighted;
					this.Edges[fromID][i].setHighlight(val);		
				}
			}
		}

		return oldHighlight;
	}

    addLabelObject(objectID, objectLabel, centering) {
		if (this.Nodes[objectID]) {
			throw new Error("addLabelObject: Object Already Exists!");
		}
		
		this.Nodes[objectID] = new AnimatedLabel(objectID, objectLabel, centering, this.getTextWidth(objectLabel));
	}
	
		
	addLinkedListObject(
        objectID, 
        nodeLabel, 
        width, 
        height, 
        linkPer, 
        verticalOrientation, 
        linkPosEnd, 
        numLabels, 
        backgroundColor, 
        foregroundColor
    ) {
		if (this.Nodes[objectID]) {
			throw new Error("addLinkedListObject:Object with same ID already Exists!");
		}
		this.Nodes[objectID] = new AnimatedLinkedList(
            objectID, 
            nodeLabel, 
            width, 
            height, 
            linkPer, 
            verticalOrientation, 
            linkPosEnd, 
            numLabels, 
            backgroundColor, 
            foregroundColor
        );
	}

    getNumElements(objectID) {
		return this.Nodes[objectID].getNumElements();
	}
	
	setNumElements(objectID, numElems) {
		this.Nodes[objectID].setNumElements(numElems);
	}

    addBTreeNode(objectID, widthPerElem, height, numElems, backgroundColor, foregroundColor) {
		backgroundColor = (backgroundColor == undefined) ? "#FFFFFF" : backgroundColor;
		foregroundColor = (foregroundColor == undefined) ? "#FFFFFF" : foregroundColor;
		 
		if (this.Nodes[objectID]) {
		    throw "addBTreeNode:Object with same ID already Exists!";
		}

		this.Nodes[objectID] = new AnimatedBTreeNode(objectID,widthPerElem, height, numElems, backgroundColor, foregroundColor);
	 }
	
	addRectangleObject = function(objectID,nodeLabel, width, height, xJustify , yJustify , backgroundColor, foregroundColor) {
		if (this.Nodes[objectID]) {
			throw new Error("addRectangleObject:Object with same ID already Exists!");
		}

		this.Nodes[objectID] = new AnimatedRectangle(objectID, nodeLabel, width, height, xJustify, yJustify, backgroundColor, foregroundColor);;	 
	}

    setNodePosition(nodeID, newX, newY) {
		if (!this.Nodes[nodeID] == null) return;
		if (!newX || newY) return;

		this.Nodes[nodeID].x = newX;
		this.Nodes[nodeID].y = newY;
	}
}