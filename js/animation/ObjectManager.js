class ObjectManager {
	constructor() {
		this.Nodes = [];
		this.Edges = [];
		this.BackEdges = [];
		this.activeLayers = [];
		this.activeLayers[0] = true;
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
		
		this.ctx.clearRect(0,0,this.width,this.height);
		this.statusReport.y = this.height - 15;
		
		for (let i = 0; i < this.Nodes.length; i++) {
			if (this.Nodes[i] != null && !this.Nodes[i].highlighted && this.Nodes[i].addedToScene && !this.Nodes[i].alwaysOnTop) {
				this.Nodes[i].draw(this.ctx);	
			}
		}
		for (let i = 0; i < this.Nodes.length; i++) {
			if (this.Nodes[i] != null && (this.Nodes[i].highlighted && !this.Nodes[i].alwaysOnTop) && this.Nodes[i].addedToScene) {
				this.Nodes[i].pulseHighlight(this.framenum);
				this.Nodes[i].draw(this.ctx);	
			}
		}
		
		for (let i = 0; i < this.Nodes.length; i++) {
			if (this.Nodes[i] != null && this.Nodes[i].alwaysOnTop && this.Nodes[i].addedToScene) {
				this.Nodes[i].pulseHighlight(this.framenum);
				this.Nodes[i].draw(this.ctx);	
			}
		}
		
		for (let i = 0; i < this.Edges.length; i++) {
			if (this.Edges[i] != null) {
				for (let j = 0; j < this.Edges[i].length; j++) {
					if (this.Edges[i][j].addedToScene) {
						this.Edges[i][j].pulseHighlight(this.framenum);	
						this.Edges[i][j].draw(this.ctx);	
					}
				}
			}
		}
		this.statusReport.draw(this.ctx);
	}
	
	update(){}
	
	setLayers(shown,layers) {
		for (let i = 0; i < layers.length; i++) {
			this.activeLayers[layers[i]] = shown;
		}
		this.resetLayers();	
	}

	addHighlightCircleObject(objectID, objectColor, radius) {
		if (this.Nodes[objectID] != null && this.Nodes[objectID] != undefined) {
			throw "addHighlightCircleObject:Object with same ID (" + String(objectID) + ") already Exists!"
		}
		let newNode = new HighlightCircle(objectID, objectColor, radius)
		this.Nodes[objectID] = newNode;		
	}
	
	setEdgeAlpha(fromID, toID, alphaVal) {
		let oldAlpha = 1.0; 
		if (this.Edges[fromID] != null &&
			this.Edges[fromID] != undefined) {
			let len = this.Edges[fromID].length;
			for (let i = len - 1; i >= 0; i--) {
				if (this.Edges[fromID][i] != null &&
					this.Edges[fromID][i] != undefined &&
					this.Edges[fromID][i].Node2 == this.Nodes[toID]) {
					oldAlpha = this.Edges[fromID][i].alpha
					this.Edges[fromID][i].alpha = alphaVal;		
				}
			}
		}	
		return oldAlpha;
	}
	
	setAlpha(nodeID, alphaVal)  {
		if (this.Nodes[nodeID] != null && this.Nodes[nodeID] != undefined) {
			this.Nodes[nodeID].setAlpha(alphaVal);
		}
	}
	
	getAlpha(nodeID) {
		if (this.Nodes[nodeID] != null && this.Nodes[nodeID] != undefined) {
			return this.Nodes[nodeID].getAlpha();
		}
		else {
			return -1;
		}
	}
	
	getTextColor(nodeID, index) {
		if (this.Nodes[nodeID] != null && this.Nodes[nodeID] != undefined) {
			return this.Nodes[nodeID].getTextColor(index);
		}
		else {
			return "#000000";
		}
			
	}
	
	setTextColor(nodeID, color, index) {
		if (this.Nodes[nodeID] != null && this.Nodes[nodeID] != undefined) {
			this.Nodes[nodeID].setTextColor(color, index);
		}
	}
	
	
	
	setAllLayers(layers) {
		this.activeLayers = [];
		for(let i = 0; i < layers.length; i++) {
			this.activeLayers[layers[i]] = true;
		}
		this.resetLayers();
	}
	
	resetLayers() {
		for (let i = 0; i <this.Nodes.length; i++) {
			if (this.Nodes[i] != null && this.Nodes[i] != undefined) {
				this.Nodes[i].addedToScene = this.activeLayers[this.Nodes[i].layer] == true;
			}
		}
		for (let i = this.Edges.length - 1; i >= 0; i--) {
		    if (this.Edges[i] != null && this.Edges[i] != undefined) {
				for (let j = 0; j < this.Edges[i].length; j++) {
					if (this.Edges[i][j] != null && this.Edges[i][j] != undefined) {
							this.Edges[i][j].addedToScene =
								this.activeLayers[this.Edges[i][j].Node1.layer] == true &&
								this.activeLayers[this.Edges[i][j].Node2.layer] == true;
					}
				}
			}
		}
	}
	
	setLayer(objectID, layer) {
		if (this.Nodes[objectID] != null && this.Nodes[objectID] != undefined) {
			this.Nodes[objectID].layer = layer;
			if (this.activeLayers[layer]) {
				this.Nodes[objectID].addedToScene = true;
			}
			else {
				this.Nodes[objectID].addedToScene = false;
			}
			if (this.Edges[objectID] != null && this.Edges[objectID] != undefined) {
				for (let i = 0; i < this.Edges[objectID].length; i++) {
					let nextEdge = this.Edges[objectID][i];
					if (nextEdge != null && nextEdge != undefined) {
						nextEdge.addedToScene = ((nextEdge.Node1.addedToScene) && (nextEdge.Node2.addedToScene));
					}
				}
			}
			if (this.BackEdges[objectID] != null && this.BackEdges[objectID] != undefined) {
				for (let i = 0; i < this.BackEdges[objectID].length; i++) {
					let nextEdge = this.BackEdges[objectID][i];
					if (nextEdge != null && nextEdge != undefined) {
						nextEdge.addedToScene = ((nextEdge.Node1.addedToScene) && (nextEdge.Node2.addedToScene));
					}
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
		if (this.Nodes[objectID] != null && this.Nodes[objectID] != undefined) {
			this.Nodes[objectID].setForegroundColor(color);	
		}
	}
	
	setBackgroundColor(objectID, color) {
		if (this.Nodes[objectID] != null) {
			this.Nodes[objectID].setBackgroundColor(color);	
		}
	}
	
	setHighlight(nodeID, val) {
		if (this.Nodes[nodeID] == null  || this.Nodes[nodeID] == undefined) {
			return;
		}
		this.Nodes[nodeID].setHighlight(val);
	}
	
	
	getHighlight(nodeID) {
		if (this.Nodes[nodeID] == null  || this.Nodes[nodeID] == undefined) {
			return false;
		}
		return this.Nodes[nodeID].getHighlight();
	}
	
	setWidth(nodeID, val) {
		if (this.Nodes[nodeID] == null  || this.Nodes[nodeID] == undefined) {
			return;
		}
		this.Nodes[nodeID].setWidth(val);
	}
	
	setHeight(nodeID, val) {
		if (this.Nodes[nodeID] == null  || this.Nodes[nodeID] == undefined) {
			return;
		}
		this.Nodes[nodeID].setHeight(val);
	}
	
	getHeight(nodeID) {
		if (this.Nodes[nodeID] == null  || this.Nodes[nodeID] == undefined) {
			return -1;
		}
		return this.Nodes[nodeID].getHeight();
	}
	
	getWidth(nodeID) {
		if (this.Nodes[nodeID] == null  || this.Nodes[nodeID] == undefined) {
			return -1;
		}
		return this.Nodes[nodeID].getWidth();
	}
	
	backgroundColor(objectID) {
		if (this.Nodes[objectID] != null) {
			return this.Nodes[objectID].backgroundColor;
		}
		else {
			return '#000000';
		}
	}
	
	foregroundColor(objectID) {
		if (this.Nodes[objectID] != null) {
			return this.Nodes[objectID].foregroundColor;
		}
		else {
			return '#000000';
		}
	}
	
			
	disconnect(objectIDfrom,objectIDto) {
		let undo = null;
		if (this.Edges[objectIDfrom] != null) {
			let len = this.Edges[objectIDfrom].length;
			for (let i = len - 1; i >= 0; i--) {
				if (this.Edges[objectIDfrom][i] != null && this.Edges[objectIDfrom][i].Node2 == this.Nodes[objectIDto]) {
					const deleted = this.Edges[objectIDfrom][i];
					undo = deleted.createUndoDisconnect();
					this.Edges[objectIDfrom][i] = this.Edges[objectIDfrom][len - 1];
					len -= 1;
					this.Edges[objectIDfrom].pop();
				}
			}
		}
		if (this.BackEdges[objectIDto] != null) {
			let len = this.BackEdges[objectIDto].length;
			for (let i = len - 1; i >= 0; i--) {
				if (this.BackEdges[objectIDto][i] != null && this.BackEdges[objectIDto][i].Node1 == this.Nodes[objectIDfrom]) {
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

		if (this.Edges[objectID] != null) {
			let len = this.Edges[objectID].length;
			for (let i = len - 1; i >= 0; i--) {
				let deleted = this.Edges[objectID][i];
				let node2ID = deleted.Node2.identifier();
				undoStack.push(deleted.createUndoDisconnect());
				
				let len2 = this.BackEdges[node2ID].length;
				for (let j = len2 - 1; j >=0; j--) {
					if (this.BackEdges[node2ID][j] == deleted) {
						this.BackEdges[node2ID][j] = this.BackEdges[node2ID][len2 - 1];
						len2 -= 1;
						this.BackEdges[node2ID].pop();
					}
				}
			}
			this.Edges[objectID] = null;
		}
		if (this.BackEdges[objectID] != null) {
			let len = this.BackEdges[objectID].length;
			for (let i = len - 1; i >= 0; i--) {
				const deleted = this.BackEdges[objectID][i];
				let node1ID = deleted.Node1.identifier();
				undoStack.push(deleted.createUndoDisconnect());

				let len2 = this.Edges[node1ID].length;
				for (let j = len2 - 1; j >=0; j--) {
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
		if (ObjectID == this.Nodes.length - 1) {
			this.Nodes.pop();
		}
		else {
			this.Nodes[ObjectID] = null;
		}
	}
	
	getObject(objectID) {
		if (this.Nodes[objectID] == null || this.Nodes[objectID] == undefined) {
			throw "getObject:Object with ID (" + String(objectID) + ") does not exist"
		}
		return this.Nodes[objectID];
		
	}
	
	addCircleObject(objectID, objectLabel) {
		if (this.Nodes[objectID] != null && this.Nodes[objectID] != undefined) {
			throw "addCircleObject:Object with same ID (" + String(objectID) + ") already Exists!"
		}
		let newNode = new AnimatedCircle(objectID, objectLabel);
		this.Nodes[objectID] = newNode;
	}
	
	getNodeX(nodeID) {
		if (this.Nodes[nodeID] == null || this.Nodes[nodeID] == undefined) {
			throw "getting x position of an object that does not exit";
		}	
		return this.Nodes[nodeID].x;
	}
	
	getTextWidth(text) {
		this.ctx.font = '10px sans-serif';
		if (text==undefined) {
			w = 3;
		}
		let strList = text.split("\n");
		let width = 0;
		if (strList.length == 1) {
			width = this.ctx.measureText(text).width;
		}
		else {
			for (let i = 0; i < strList.length; i++) {
				width = Math.max(width, this.ctx.measureText(strList[i]).width);
			}		
		}
		
		return width;
	}
	
	setText(nodeID, text, index) {
		if (this.Nodes[nodeID] == null || this.Nodes[nodeID] == undefined) {
			return;
		}			
		this.Nodes[nodeID].setText(text, index, this.getTextWidth(text));
		
	}
	
	getText(nodeID, index) {
		if (this.Nodes[nodeID] == null || this.Nodes[nodeID] == undefined) {
			throw "getting text of an object that does not exit";
		}			
		return this.Nodes[nodeID].getText(index);
	}
	
	getNodeY(nodeID) {
		if (this.Nodes[nodeID] == null || this.Nodes[nodeID] == undefined) {
			throw "getting y position of an object that does not exit";
		}	
		return this.Nodes[nodeID].y;
	}

	connectEdge(objectIDfrom, objectIDto, color, curve, directed, lab, connectionPoint) {
		let fromObj = this.Nodes[objectIDfrom];
		let toObj = this.Nodes[objectIDto];
		if (fromObj == null || toObj == null) {
			throw "Tried to connect two nodes, one didn't exist!";
		}
		let l = new Line(fromObj,toObj, color, curve, directed, lab, connectionPoint);
		if (this.Edges[objectIDfrom] == null || this.Edges[objectIDfrom] == undefined) {
			this.Edges[objectIDfrom] = [];
		}
		if (this.BackEdges[objectIDto] == null || this.BackEdges[objectIDto] == undefined) {
			this.BackEdges[objectIDto] = [];
		}
		l.addedToScene = fromObj.addedToScene && toObj.addedToScene;
		this.Edges[objectIDfrom].push(l);
		this.BackEdges[objectIDto].push(l);
	}
	
	
	setNull(objectID, nullVal) {
		if (this.Nodes[objectID] != null && this.Nodes[objectID] != undefined) {
			this.Nodes[objectID].setNull(nullVal);	
		}
	}
	
	getNull(objectID) {
		if (this.Nodes[objectID] != null && this.Nodes[objectID] != undefined) {
			return this.Nodes[objectID].getNull();
		}
		return false;
	}
	
	setEdgeColor(fromID, toID, color) {
		let oldColor ="#000000";
		if (this.Edges[fromID] != null &&
			this.Edges[fromID] != undefined) {
			let len = this.Edges[fromID].length;
			for (let i = len - 1; i >= 0; i--) {
				if (this.Edges[fromID][i] != null &&
					this.Edges[fromID][i] != undefined &&
					this.Edges[fromID][i].Node2 == this.Nodes[toID]) {
					oldColor = this.Edges[fromID][i].color();
					this.Edges[fromID][i].setColor(color);		
				}
			}
		}	
		return oldColor;
	}		
	
	alignTop(id1, id2) {
		if (this.Nodes[id1] == null || this.Nodes[id1] == undefined ||
			this.Nodes[id2] == null || this.Nodes[id2] == undefined) {
			throw "Tring to align two nodes, one doesn't exist: " + String(id1) + "," + String(id2);			
		}
		this.Nodes[id1].alignTop(this.Nodes[id2]);
	}
	
	alignLeft(id1, id2) {
		if (this.Nodes[id1] == null || this.Nodes[id1] == undefined ||
			this.Nodes[id2] == null || this.Nodes[id2] == undefined) {
			throw "Tring to align two nodes, one doesn't exist: " + String(id1) + "," + String(id2);			
		}
		this.Nodes[id1].alignLeft(this.Nodes[id2]);
	}
	
	alignRight(id1, id2) {
		if (this.Nodes[id1] == null || this.Nodes[id1] == undefined ||
			this.Nodes[id2] == null || this.Nodes[id2] == undefined) {
			throw "Tring to align two nodes, one doesn't exist: " + String(id1) + "," + String(id2);			
		}
		this.Nodes[id1].alignRight(this.Nodes[id2]);
	}
	
	alignBottom(id1, id2) {
		if (this.Nodes[id1] == null || this.Nodes[id1] == undefined ||
			this.Nodes[id2] == null || this.Nodes[id2] == undefined) {
			throw "Tring to align two nodes, one doesn't exist: " + String(id1) + "," + String(id2);			
		}
		this.Nodes[id1].alignBottom(this.Nodes[id2]);
	}
	
	
	setEdgeHighlight(fromID, toID, val) {
		let oldHighlight = false;
		if (this.Edges[fromID] != null &&
			this.Edges[fromID] != undefined) {
			let len = this.Edges[fromID].length;
			for (let i = len - 1; i >= 0; i--) {
				if (this.Edges[fromID][i] != null && 
					this.Edges[fromID][i] != undefined && 
					this.Edges[fromID][i].Node2 == this.Nodes[toID]) {
					oldHighlight = this.Edges[fromID][i].highlighted;
					this.Edges[fromID][i].setHighlight(val);		
				}
			}
		}
		return oldHighlight;
	}
	
	addLabelObject(objectID, objectLabel, centering) {
		if (this.Nodes[objectID] != null && this.Nodes[objectID] != undefined) {
			throw new Error("addLabelObject: Object Already Exists!");
		}
		
		let newLabel = new AnimatedLabel(objectID, objectLabel, centering, this.getTextWidth(objectLabel));
		this.Nodes[objectID] = newLabel;
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
		if (this.Nodes[objectID] != null) {
			throw new Error("addLinkedListObject:Object with same ID already Exists!");
		}
		let newNode  = new AnimatedLinkedList(objectID, nodeLabel, width, height, linkPer, verticalOrientation, linkPosEnd, numLabels, backgroundColor, foregroundColor);
		this.Nodes[objectID] = newNode;
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
		
		if (this.Nodes[objectID] != null && Nodes[objectID] != undefined) {
			throw "addBTreeNode:Object with same ID already Exists!";
		}

		let newNode = new AnimatedBTreeNode(objectID,widthPerElem, height, numElems, backgroundColor, foregroundColor);
		this.Nodes[objectID] = newNode;
	 }
	
	addRectangleObject(objectID,nodeLabel, width, height, xJustify , yJustify , backgroundColor, foregroundColor) {
		if (this.Nodes[objectID] != null || this.Nodes[objectID] != undefined) {
			throw new Error("addRectangleObject:Object with same ID already Exists!");
		}
		let newNode = new AnimatedRectangle(objectID, nodeLabel, width, height, xJustify, yJustify, backgroundColor, foregroundColor);
		this.Nodes[objectID] = newNode;
	}

	setNodePosition(nodeID, newX, newY) {
		if (this.Nodes[nodeID] == null || this.Nodes[nodeID] == undefined) {
			return;
		}
		if (newX == undefined || newY == undefined) {
			return;
		}
		this.Nodes[nodeID].x = newX;
		this.Nodes[nodeID].y = newY;
	}
}
