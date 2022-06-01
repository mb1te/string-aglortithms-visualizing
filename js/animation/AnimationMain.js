let timer;
let swapped = false;

function reorderSibling(node1, node2) {
    node1.parentNode.replaceChild(node1, node2);
    node1.parentNode.insertBefore(node2, node1); 
}

function swapControlDiv() {
    swapped = !swapped;
    if (swapped) {
		reorderSibling(document.getElementById('canvas'), document.getElementById('generalAnimationControlSection'));
    	setCookie("VisualizationControlSwapped", "true", 30);
    } else {
		reorderSibling(document.getElementById('generalAnimationControlSection'), document.getElementById('canvas'));
        setCookie("VisualizationControlSwapped", "false", 30);
    }
}

function getCookie(cookieName) {
	let x, y;
	let cookies=document.cookie.split(";");
	for (let i = 0; i < cookies.length; i++) {
		x = cookies[i].substr(0,cookies[i].indexOf("="));
		y = cookies[i].substr(cookies[i].indexOf("=") + 1);
		x = x.replace(/^\s+|\s+$/g,"");
		if (x == cookieName) {
			return unescape(y);
		}
	}
}

function setCookie(cookieName,value,expireDays) {
	let exdate=new Date();
	exdate.setDate(exdate.getDate() + expireDays);
	let cookieValue = escape(value) + ((expireDays==null) ? "" : "; expires="+exdate.toUTCString());
	document.cookie=cookieName + "=" + value;
}

let ANIMATION_SPEED_DEFAULT = 75;
let objectManager;
let animationManager;
let canvas;

let paused = false;
let playPauseBackButton;
let skipBackButton;
let stepBackButton;
let stepForwardButton;
let skipForwardButton;

let widthEntry;
let heightEntry;
let sizeButton;

function returnSubmit(field, funct, maxsize, intOnly) {
	if (maxsize != undefined) {
		field.size = maxsize;
	}
	return function(event) {
		let keyASCII = 0;
		if(window.event) { // IE
			keyASCII = event.keyCode
		}
		else if (event.which) { // Netscape/Firefox/Opera
			keyASCII = event.which
		} 
		if (keyASCII == 13) {
			funct();
		}
		else if (keyASCII == 59 ) {
			return false;	
		}
		else if ((maxsize != undefined && field.value.length >= maxsize) ||
				 intOnly && (keyASCII < 48 || keyASCII > 57)) {
			if (!controlKey(keyASCII))
				return false;
		}
	}
}

function animWaiting() {
	stepForwardButton.disabled = false;
	if (skipBackButton.disabled == false) {
		stepBackButton.disabled = false;
	}
	objectManager.statusReport.setText("Animation Paused");
	objectManager.statusReport.setForegroundColor("#FF0000");
}

function animStarted() {
	skipForwardButton.disabled = false;
	skipBackButton.disabled = false;
	stepForwardButton.disabled = true;
	stepBackButton.disabled = true;
	objectManager.statusReport.setText("Animation Running");
	objectManager.statusReport.setForegroundColor("#009900");
}

function animEnded() {
	skipForwardButton.disabled = true;
	stepForwardButton.disabled = true;
	if (skipBackButton.disabled == false && paused) {
		stepBackButton.disabled = false;		
	}
	objectManager.statusReport.setText("Animation Completed");
	objectManager.statusReport.setForegroundColor("#000000");
}

function anumUndoUnavailable() {
	skipBackButton.disabled = true;
	stepBackButton.disabled = true;
}

function timeout() {
	timer = setTimeout('timeout()', 30); 
	animationManager.update();
	objectManager.draw();	    
}

function doStep() {
	animationManager.step();
}

function doSkip() {
	animationManager.skipForward();
}

function doSkipBack() {
	animationManager.skipBack();
}

function doStepBack() {
	animationManager.stepBack();
}

function doPlayPause() {
	paused = !paused;
	if (paused) {
		playPauseBackButton.setAttribute("value", "play");
		if (skipBackButton.disabled == false) {
			stepBackButton.disabled = false;		
		}	
	} else {
		playPauseBackButton.setAttribute("value", "pause");	
	}
	animationManager.SetPaused(paused);
}

function addControl(type, name, location) {
    let element = document.createElement("input");
    element.setAttribute("type", type);
    element.setAttribute("value", name);

	let tableEntry = document.createElement("td");
	tableEntry.appendChild(element);
	
    let controlBar = document.getElementById(tableEntry);
	controlBar.appendChild(element);
	return element;
}

function addControlToAnimationBar(type,name,containerType) {
	if (containerType == undefined) {
		containerType = "input";
	}
	
	let element = document.createElement(containerType);
    element.setAttribute("type", type);
    element.setAttribute("value", name);
	
	
	let tableEntry = document.createElement("td");
	tableEntry.appendChild(element);
	
    let controlBar = document.getElementById("GeneralAnimationControls");
	controlBar.appendChild(tableEntry);
	return element;
}

function initCanvas() {
	canvas =  document.getElementById("canvas");
	objectManager = new ObjectManager();
	animationManager = new AnimationManager(objectManager);
	
	skipBackButton = addControlToAnimationBar("Button", "Skip Back");
	skipBackButton.onclick = animationManager.skipBack.bind(animationManager);
	stepBackButton = addControlToAnimationBar("Button", "Step Back");
	stepBackButton.onclick = animationManager.stepBack.bind(animationManager);
	playPauseBackButton = addControlToAnimationBar("Button", "Pause");
	playPauseBackButton.onclick = doPlayPause ;
	stepForwardButton = addControlToAnimationBar("Button", "Step Forward");
	stepForwardButton.onclick = animationManager.step.bind(animationManager) ;
	skipForwardButton = addControlToAnimationBar("Button", "Skip Forward");
	skipForwardButton.onclick = animationManager.skipForward.bind(animationManager);
	
	let element = document.createElement("div");
	element.setAttribute("display", "inline-block");		
	element.setAttribute("float", "left");		

	let tableEntry = document.createElement("td");
    let controlBar = document.getElementById("GeneralAnimationControls");
	
	let newTable = document.createElement("table");
	let midLevel = document.createElement("tr");
	let bottomLevel = document.createElement("td");
	midLevel.appendChild(bottomLevel);
	bottomLevel.appendChild(element);
	newTable.appendChild(midLevel);	
	
	midLevel = document.createElement("tr");
	bottomLevel = document.createElement("td");
	bottomLevel.align = "center";
	let txtNode = document.createTextNode("Animation Speed"); 
	midLevel.appendChild(bottomLevel);
	bottomLevel.appendChild(txtNode);
	newTable.appendChild(midLevel);	

	tableEntry.appendChild(newTable);
	
	controlBar.appendChild(tableEntry);
		
    let speed = getCookie("VisualizationSpeed");
	if (speed == null || speed == "") speed = ANIMATION_SPEED_DEFAULT;
	else speed = parseInt(speed);
	
	$(element).slider({
		animate: true,
		value: speed,
		change: function(e, ui) {
			setCookie("VisualizationSpeed", String(ui.value), 30);
		},
		slide : function(e, ui) {
			animationManager.SetSpeed(ui.value); 
		}

	}); 
	
	animationManager.SetSpeed(speed);
	
	element.setAttribute("style", "width:200px");

	let width = getCookie("VisualizationWidth");
	if (width == null || width == "") width = canvas.width;
	else width = parseInt(width);

	let height = getCookie("VisualizationHeight");
	if (height == null || height == "") height = canvas.height;
	else height = parseInt(height);

	let swappedControls = getCookie("VisualizationControlSwapped");
	let swapped = swappedControls == "true"
	
	if (swapped) {
	    reorderSibling(document.getElementById('canvas'), document.getElementById('generalAnimationControlSection'));
	}

	canvas.style.width = width + "px";
	canvas.style.height = height + "px";

	let scale = window.devicePixelRatio;
	canvas.width = Math.floor(width * scale);
	canvas.height = Math.floor(height * scale);
	
	tableEntry = document.createElement("td");
	txtNode = document.createTextNode(" w:"); 
	tableEntry.appendChild(txtNode);
	controlBar.appendChild(tableEntry);

	widthEntry = addControlToAnimationBar("Text", canvas.width);
	widthEntry.size = 4;
	widthEntry.onkeydown = this.returnSubmit(widthEntry, animationManager.changeSize.bind(animationManager), 4, true);

	tableEntry = document.createElement("td");
	txtNode = document.createTextNode("       h:"); 
	tableEntry.appendChild(txtNode);
	controlBar.appendChild(tableEntry);
	
	heightEntry = addControlToAnimationBar("Text", canvas.height);
	heightEntry.onkeydown = this.returnSubmit(heightEntry, animationManager.changeSize.bind(animationManager), 4, true);

	heightEntry.size = 4;
	sizeButton = addControlToAnimationBar("Button", "Change Canvas Size");
	sizeButton.onclick = animationManager.changeSize.bind(animationManager);
	
	swapButton = addControlToAnimationBar("Button", "Move Controls");
	swapButton.onclick = swapControlDiv;	
	
	animationManager.addListener("AnimationStarted", this, animStarted);
	animationManager.addListener("AnimationEnded", this, this.animEnded);
	animationManager.addListener("AnimationWaiting", this, this.animWaiting);
	animationManager.addListener("AnimationUndoUnavailable", this, this.anumUndoUnavailable);
	objectManager.width = canvas.width;
	objectManager.height = canvas.height;
	return animationManager;
}

class AnimationManager extends EventListener {
	constructor(objectManager) {
		super();

		this.animatedObjects = objectManager;
		this.animationPaused = false;
		this.awaitingStep = false;
		this.currentlyAnimating = false;
		this.AnimationSteps = [];
		this.currentAnimation = 0;
		this.previousAnimationSteps = [];
		this.currFrame = 0;
		this.animationBlockLength = 0;
		this.currentBlock = null;
		this.undoStack = [];
		this.doingUndo = false;
		this.undoAnimationStepIndices = [];
		this.undoAnimationStepIndicesStack = [];
		this.animationBlockLength = 10;
	}

	lerp(from, to, percent) {
		return (to - from) * percent + from;
	}
	
	SetPaused(pausedValue) {
		this.animationPaused = pausedValue;
		if (!this.animationPaused) {
			this.step();
		}
	}
	
	SetSpeed(newSpeed) {
		this.animationBlockLength = Math.floor((100 - newSpeed) / 2);
	}
	
	parseBool(str) {
		let uppercase = str.toUpperCase();
		let returnVal =  !(uppercase == "False" || uppercase == "f" || uppercase == " 0" || uppercase == "0" || uppercase == "");
		return returnVal;
	}

	parseColor(clr) {
		if (clr.charAt(0) == "#") {
			return clr;
		}
		else if (clr.substring(0,2) == "0x") {
			return "#" + clr.substring(2);
		}
	}
	
	changeSize() {	
		let width = parseInt(widthEntry.value);
		let height = parseInt(heightEntry.value);
		
		if (width > 100) {
			canvas.width = width;
			this.animatedObjects.width = width;
			setCookie("VisualizationWidth", String(width), 30);
		}

		if (height > 100) {
			canvas.height = height;
			this.animatedObjects.height = height;
			setCookie("VisualizationHeight", String(height), 30);
		}

		width.value = canvas.width;
		heightEntry.value = canvas.height;
		
		this.animatedObjects.draw();
		this.fireEvent("CanvasSizeChanged",{width:canvas.width, height:canvas.height});		
	}
	
	startNextBlock() {
		this.awaitingStep = false;
		this.currentBlock = [];
		let undoBlock = []
		if (this.currentAnimation == this.AnimationSteps.length ) {
			this.currentlyAnimating = false;
			this.awaitingStep = false;
			this.fireEvent("AnimationEnded","NoData");
			clearTimeout(timer);
			this.animatedObjects.update();
			this.animatedObjects.draw();
			return;
		}

		this.undoAnimationStepIndices.push(this.currentAnimation);

		let foundBreak= false;
		let anyAnimations= false;
		
		while (this.currentAnimation < this.AnimationSteps.length && !foundBreak) {			
			let nextCommand = this.AnimationSteps[this.currentAnimation].split("<;>");
			if (nextCommand[0].toUpperCase() == "CREATECIRCLE") {
				this.animatedObjects.addCircleObject(parseInt(nextCommand[1]), nextCommand[2]);
				if (nextCommand.length > 4) {
					this.animatedObjects.setNodePosition(parseInt(nextCommand[1]), parseInt(nextCommand[3]), parseInt(nextCommand[4]));
				}
				undoBlock.push(new UndoCreate(parseInt(nextCommand[1])));

			} else if (nextCommand[0].toUpperCase() == "CONNECT") {
				if (nextCommand.length > 7) {
					this.animatedObjects.connectEdge(
						parseInt(nextCommand[1]), 
						parseInt(nextCommand[2]), 
						this.parseColor(nextCommand[3]), 
						parseFloat(nextCommand[4]), 
						this.parseBool(nextCommand[5]), 
						nextCommand[6], 
						parseInt(nextCommand[7])
					);
				} else if (nextCommand.length > 6) {
					this.animatedObjects.connectEdge(
						parseInt(nextCommand[1]), 
						parseInt(nextCommand[2]),
						this.parseColor(nextCommand[3]),
						parseFloat(nextCommand[4]),
						this.parseBool(nextCommand[5]),
						nextCommand[6],
						0
					);
				} else if (nextCommand.length > 5) {
					this.animatedObjects.connectEdge(
						parseInt(nextCommand[1]), 
						parseInt(nextCommand[2]),
						this.parseColor(nextCommand[3]),
						parseFloat(nextCommand[4]),
						this.parseBool(nextCommand[5]),
						"",
						0
					);
				} else if (nextCommand.length > 4) {
					this.animatedObjects.connectEdge(
						parseInt(nextCommand[1]),
						parseInt(nextCommand[2]),
						this.parseColor(nextCommand[3]),
						parseFloat(nextCommand[4]),
						true,
						"",
						0
					);
				} else if (nextCommand.length > 3) {
					this.animatedObjects.connectEdge(
						parseInt(nextCommand[1]),
						parseInt(nextCommand[2]),
						this.parseColor(nextCommand[3]),
						0.0,
						true,
						"",
						0
					);
				} else {
					this.animatedObjects.connectEdge(
						parseInt(nextCommand[1]),
						parseInt(nextCommand[2]),
						"#000000",
						0.0,
						true,
						"",
						0
					);	
				}
				undoBlock.push(new UndoConnect(parseInt(nextCommand[1]), parseInt (nextCommand[2]), false));
			} else if (nextCommand[0].toUpperCase() == "CREATERECTANGLE") {
				if (nextCommand.length == 9) {
					this.animatedObjects.addRectangleObject(
						parseInt(nextCommand[1]), // ID
						nextCommand[2], // Label
						parseInt(nextCommand[3]), // w
						parseInt(nextCommand[4]), // h
						nextCommand[7], // xJustify
						nextCommand[8],// yJustify
						"#ffffff", // background color
						"#000000" // foreground color
					);
				} else {
					this.animatedObjects.addRectangleObject(
						parseInt(nextCommand[1]), // ID
						nextCommand[2], // Label
						parseInt(nextCommand[3]), // w
						parseInt(nextCommand[4]), // h
						"center", // xJustify
						"center",// yJustify
						"#ffffff", // background color
						"#000000" // foreground color
					);
					
				}
				if (nextCommand.length > 6) {
					this.animatedObjects.setNodePosition(parseInt(nextCommand[1]), parseInt(nextCommand[5]), parseInt(nextCommand[6]));
				}
				undoBlock.push(new UndoCreate(parseInt(nextCommand[1])));
			} else if (nextCommand[0].toUpperCase() == "MOVE") {
				let objectID = parseInt(nextCommand[1]);
				let nextAnim =  new SingleAnimation(
					objectID, 
					this.animatedObjects.getNodeX(objectID), 
					this.animatedObjects.getNodeY(objectID), 
					parseInt(nextCommand[2]),
					parseInt(nextCommand[3])
				);

				this.currentBlock.push(nextAnim);
				undoBlock.push(new UndoMove(nextAnim.objectID, nextAnim.toX, nextAnim.toY, nextAnim.fromX, nextAnim.fromY));
				anyAnimations = true;
			} else if (nextCommand[0].toUpperCase() == "STEP") {
				foundBreak = true;
			} else if (nextCommand[0].toUpperCase() == "SETFOREGROUNDCOLOR") {
				let id = parseInt(nextCommand[1]);
				let oldColor = this.animatedObjects.foregroundColor(id);
				this.animatedObjects.setForegroundColor(id, this.parseColor(nextCommand[2]));
				undoBlock.push(new UndoSetForegroundColor(id, oldColor));
			} else if (nextCommand[0].toUpperCase() == "SETBACKGROUNDCOLOR") {
				id = parseInt(nextCommand[1]);
				oldColor = this.animatedObjects.backgroundColor(id);
				this.animatedObjects.setBackgroundColor(id, this.parseColor(nextCommand[2]));
				undoBlock.push(new UndoSetBackgroundColor(id, oldColor));
			} else if (nextCommand[0].toUpperCase() == "SETHIGHLIGHT") {
				let newHighlight = this.parseBool(nextCommand[2]);
				this.animatedObjects.setHighlight( parseInt(nextCommand[1]), newHighlight);
				undoBlock.push(new UndoHighlight( parseInt(nextCommand[1]), !newHighlight));
			} else if (nextCommand[0].toUpperCase() == "DISCONNECT") {
				let undoConnect = this.animatedObjects.disconnect(parseInt(nextCommand[1]), parseInt(nextCommand[2]));
				if (undoConnect != null) {
					undoBlock.push(undoConnect);
				}
			} else if (nextCommand[0].toUpperCase() == "SETALPHA") {
				let oldAlpha = this.animatedObjects.getAlpha(parseInt(nextCommand[1]));
				this.animatedObjects.setAlpha(parseInt(nextCommand[1]), parseFloat(nextCommand[2]));
				undoBlock.push(new UndoSetAlpha(parseInt(nextCommand[1]), oldAlpha));					
			} else if (nextCommand[0].toUpperCase() == "SETTEXT") {
				if (nextCommand.length > 3) {
					let oldText = this.animatedObjects.getText(parseInt(nextCommand[1]), parseInt(nextCommand[3]));
					this.animatedObjects.setText(parseInt(nextCommand[1]), nextCommand[2], parseInt(nextCommand[3]));
					if (oldText != undefined) {
						undoBlock.push(new UndoSetText(parseInt(nextCommand[1]), oldText, parseInt(nextCommand[3]) ));			
					}	
				} else {
					let oldText = this.animatedObjects.getText(parseInt(nextCommand[1]), 0);
					this.animatedObjects.setText(parseInt(nextCommand[1]), nextCommand[2], 0);
					if (oldText != undefined) {
						undoBlock.push(new UndoSetText(parseInt(nextCommand[1]), oldText, 0));	
					}
				}
			} else if (nextCommand[0].toUpperCase() == "DELETE") {
				let objectID  = parseInt(nextCommand[1]);
				
				let removedEdges = this.animatedObjects.deleteIncident(objectID);
				if (removedEdges.length > 0) {
					undoBlock = undoBlock.concat(removedEdges);
				}
				let obj = this.animatedObjects.getObject(objectID);
				if (obj != null) {
					undoBlock.push(obj.createUndoDelete());
					this.animatedObjects.removeObject(objectID);
				}
			} else if (nextCommand[0].toUpperCase() == "CREATEHIGHLIGHTCIRCLE") {
				if (nextCommand.length > 5) {
					this.animatedObjects.addHighlightCircleObject(parseInt(nextCommand[1]), this.parseColor(nextCommand[2]), parseFloat(nextCommand[5]));
				} else {
					this.animatedObjects.addHighlightCircleObject(parseInt(nextCommand[1]), this.parseColor(nextCommand[2]), 20);						
				}
				if (nextCommand.length > 4) {
					this.animatedObjects.setNodePosition(parseInt(nextCommand[1]), parseInt(nextCommand[3]), parseInt(nextCommand[4]));
				}
				undoBlock.push(new UndoCreate(parseInt(nextCommand[1])));
			} else if (nextCommand[0].toUpperCase() == "CREATELABEL") {
				if (nextCommand.length == 6) {
					this.animatedObjects.addLabelObject(parseInt(nextCommand[1]), nextCommand[2], this.parseBool(nextCommand[5]));						
				} else {
					this.animatedObjects.addLabelObject(parseInt(nextCommand[1]), nextCommand[2], true);
				}
				if (nextCommand.length >= 5) {
					
					this.animatedObjects.setNodePosition(parseInt(nextCommand[1]), parseFloat(nextCommand[3]), parseFloat(nextCommand[4]));
				}
				undoBlock.push(new UndoCreate(parseInt(nextCommand[1])));
			} else if (nextCommand[0].toUpperCase() == "SETEDGECOLOR") {
				let from = parseInt(nextCommand[1]);
				let to = parseInt(nextCommand[2]);
				let newColor = this.parseColor(nextCommand[3]);
				let oldColor = this.animatedObjects.setEdgeColor(from, to, newColor);				
				undoBlock.push(new UndoSetEdgeColor(from, to, oldColor));
			} else if (nextCommand[0].toUpperCase() == "SETEDGEALPHA") {
				let from = parseInt(nextCommand[1]);
				let to = parseInt(nextCommand[2]);
				let newAlpha = parseFloat(nextCommand[3]);
				let oldAplpha = this.animatedObjects.setEdgeAlpha(from, to, newAlpha);				
				undoBlock.push(new UndoSetEdgeAlpha(from, to, oldAplpha));
			} else if (nextCommand[0].toUpperCase() == "SETEDGEHIGHLIGHT") {
				let newHighlight = this.parseBool(nextCommand[3]);
				let from = parseInt(nextCommand[1]);
				let to = parseInt(nextCommand[2]);
				let oldHighlight = this.animatedObjects.setEdgeHighlight(from, to, newHighlight);
				undoBlock.push(new UndoHighlightEdge(from, to, oldHighlight));
			} else if (nextCommand[0].toUpperCase() == "SETHEIGHT") {
				id = parseInt(nextCommand[1]);
				let oldHeight = this.animatedObjects.getHeight(id);
				this.animatedObjects.setHeight(id, parseInt(nextCommand[2]));
				undoBlock.push(new UndoSetHeight(id, oldHeight));
			} else if (nextCommand[0].toUpperCase() == "SETLAYER") {
				this.animatedObjects.setLayer(parseInt(nextCommand[1]), parseInt(nextCommand[2]));
			} else if (nextCommand[0].toUpperCase() == "CREATELINKEDLIST") {
				if (nextCommand.length == 11) {
					this.animatedObjects.addLinkedListObject(parseInt(nextCommand[1]), nextCommand[2], 
			               parseInt(nextCommand[3]), parseInt(nextCommand[4]), parseFloat(nextCommand[7]), 
			               this.parseBool(nextCommand[8]), this.parseBool(nextCommand[9]),parseInt(nextCommand[10]), "#FFFFFF", "#000000");
				} else {
					this.animatedObjects.addLinkedListObject(parseInt(nextCommand[1]), nextCommand[2], parseInt(nextCommand[3]), parseInt(nextCommand[4]), 0.25, true, false, 1, "#FFFFFF", "#000000");
				}
				if (nextCommand.length > 6) {
					this.animatedObjects.setNodePosition(parseInt(nextCommand[1]), parseInt(nextCommand[5]), parseInt(nextCommand[6]));
					undoBlock.push(new UndoCreate(parseInt(nextCommand[1])));
				}
			} else if (nextCommand[0].toUpperCase() == "SETNULL") {
				let oldNull = this.animatedObjects.getNull(parseInt(nextCommand[1]));
				this.animatedObjects.setNull(parseInt(nextCommand[1]), this.parseBool(nextCommand[2]));
				undoBlock.push(new UndoSetNull(parseInt(nextCommand[1]), oldNull));					
			} else if (nextCommand[0].toUpperCase() == "SETTEXTCOLOR") {
				if (nextCommand.length > 3) {
					oldColor = this.animatedObjects.getTextColor(parseInt(nextCommand[1]), parseInt(nextCommand[3]));
					this.animatedObjects.setTextColor(parseInt(nextCommand[1]), this.parseColor(nextCommand[2]), parseInt(nextCommand[3]));
					undoBlock.push(new UndoSetTextColor(parseInt(nextCommand[1]), oldColor, parseInt(nextCommand[3]) ));					
				} else {
					oldColor = this.animatedObjects.getTextColor(parseInt(nextCommand[1]), 0);
					this.animatedObjects.setTextColor(parseInt(nextCommand[1]),this.parseColor(nextCommand[2]), 0);
					undoBlock.push(new UndoSetTextColor(parseInt(nextCommand[1]), oldColor, 0));					
				}
			} else if (nextCommand[0].toUpperCase() == "CREATEBTREENODE") {
				this.animatedObjects.addBTreeNode(
					parseInt(nextCommand[1]), 
					parseFloat(nextCommand[2]), 
					parseFloat(nextCommand[3]), 
					parseInt(nextCommand[4]),
					this.parseColor(nextCommand[7]), 
					this.parseColor(nextCommand[8])
				);
				this.animatedObjects.setNodePosition(parseInt(nextCommand[1]), parseInt(nextCommand[5]), parseInt(nextCommand[6]));
				undoBlock.push(new UndoCreate(parseInt(nextCommand[1])));
			} else if (nextCommand[0].toUpperCase() == "SETWIDTH") {
				let id = parseInt(nextCommand[1]);
				this.animatedObjects.setWidth(id, parseInt(nextCommand[2]));
				let oldWidth = this.animatedObjects.getWidth(id);
				undoBlock.push(new UndoSetWidth(id, oldWidth));
			} else if (nextCommand[0].toUpperCase() == "SETNUMELEMENTS") {
				let oldElem = this.animatedObjects.getObject(parseInt(nextCommand[1]));
				undoBlock.push(new UndoSetNumElements(oldElem, parseInt(nextCommand[2])));
				this.animatedObjects.setNumElements(parseInt(nextCommand[1]), parseInt(nextCommand[2]));
			} else if (nextCommand[0].toUpperCase() == "SETPOSITION") {
				let id = parseInt(nextCommand[1])
				let oldX = this.animatedObjects.getNodeX(id);
				let oldY = this.animatedObjects.getNodeY(id);
				undoBlock.push(new UndoSetPosition(id, oldX, oldY));
				this.animatedObjects.setNodePosition(id, parseInt(nextCommand[2]), parseInt(nextCommand[3]));
			} else if (nextCommand[0].toUpperCase() == "ALIGNRIGHT") {
				let id = parseInt(nextCommand[1])
				let oldX = this.animatedObjects.getNodeX(id);
				let oldY = this.animatedObjects.getNodeY(id);
				undoBlock.push(new UndoSetPosition(id, oldX. oldY));
				this.animatedObjects.alignRight(id, parseInt(nextCommand[2]));
			} else if (nextCommand[0].toUpperCase() == "ALIGNLEFT") {
				let id = parseInt(nextCommand[1])
				let oldX = this.animatedObjects.getNodeX(id);
				let oldY = this.animatedObjects.getNodeY(id);
				undoBlock.push(new UndoSetPosition(id, oldX. oldY));
				this.animatedObjects.alignLeft(id, parseInt(nextCommand[2]));
			} else if (nextCommand[0].toUpperCase() == "ALIGNTOP") {
				let id = parseInt(nextCommand[1])
				let oldX = this.animatedObjects.getNodeX(id);
				let oldY = this.animatedObjects.getNodeY(id);
				undoBlock.push(new UndoSetPosition(id, oldX. oldY));
				this.animatedObjects.alignTop(id, parseInt(nextCommand[2]));
			} else if (nextCommand[0].toUpperCase() == "ALIGNBOTTOM") {
				let id = parseInt(nextCommand[1])
				let oldX = this.animatedObjects.getNodeX(id);
				let oldY = this.animatedObjects.getNodeY(id);
				undoBlock.push(new UndoSetPosition(id, oldX. oldY));
				this.animatedObjects.alignBottom(id, parseInt(nextCommand[2]));
			}
			else {}
			this.currentAnimation = this.currentAnimation+1;
		}
		this.currFrame = 0;

		if (!anyAnimations && this.animationPaused || (!anyAnimations && this.currentAnimation == this.AnimationSteps.length)) {
			this.currFrame = this.animationBlockLength;
		}

		this.undoStack.push(undoBlock);
	}

	StartNewAnimation =  function(commands) {
		clearTimeout(timer);
		if (this.AnimationSteps != null) {
			this.previousAnimationSteps.push(this.AnimationSteps);
			this.undoAnimationStepIndicesStack.push(this.undoAnimationStepIndices);
		}
		if (commands == undefined || commands.length == 0) {
			this.AnimationSteps = ["Step"];
		} else {
			this.AnimationSteps = commands;
		}
		this.undoAnimationStepIndices = new Array();
		this.currentAnimation = 0;
		this.startNextBlock();
		this.currentlyAnimating = true;
		this.fireEvent("AnimationStarted","NoData");
		timer = setTimeout('timeout()', 30); 
	}
	
	
	stepBack() {
		if (this.awaitingStep && this.undoStack != null && this.undoStack.length != 0) {
			this.fireEvent("AnimationStarted","NoData");
			clearTimeout(timer);

			this.awaitingStep = false;
			this.undoLastBlock();
			
			clearTimeout(timer);
			timer = setTimeout('timeout()', 30);
		} else if (!this.currentlyAnimating && this.animationPaused && this.undoAnimationStepIndices != null) {
			this.fireEvent("AnimationStarted","NoData");
			this.currentlyAnimating = true;
			this.undoLastBlock();
			
			clearTimeout(timer);
			timer = setTimeout('timeout()', 30); 
		}
		
	}
	
	step() {
		if (this.awaitingStep) {
			this.startNextBlock();
			this.fireEvent("AnimationStarted","NoData");
			this.currentlyAnimating = true;
			
			clearTimeout(timer);
			timer = setTimeout('timeout()', 30); 			
		}
	}
	
	clearHistory() {
		this.undoStack = [];
		this.undoAnimationStepIndices = null;
		this.previousAnimationSteps = [];
		this.undoAnimationStepIndicesStack = [];
		this.AnimationSteps = null;
		this.fireEvent("AnimationUndoUnavailable","NoData");
		clearTimeout(timer);
		this.animatedObjects.update();
		this.animatedObjects.draw();
	}
	
	skipBack() {
		let keepUndoing = this.undoAnimationStepIndices != null && this. undoAnimationStepIndices.length != 0;
		if (keepUndoing) {
			let i;
			for (let i = 0; this.currentBlock != null && i < this.currentBlock.length; i++) {
				let objectID = this.currentBlock[i].objectID;
				this.animatedObjects.setNodePosition(objectID, this.currentBlock[i].toX, this.currentBlock[i].toY);
			}
			if (this.doingUndo) {
				this.finishUndoBlock(this.undoStack.pop())
			}
			while (keepUndoing) {
				this.undoLastBlock();
				for (let i = 0; i < this.currentBlock.length; i++) {
					objectID = this.currentBlock[i].objectID;
					this.animatedObjects.setNodePosition(objectID, this.currentBlock[i].toX, this.currentBlock[i].toY);
				}
				keepUndoing = this.finishUndoBlock(this.undoStack.pop());
			}
			clearTimeout(timer);
			this.animatedObjects.update();
			this.animatedObjects.draw();
			if (this.undoStack == null || this.undoStack.length == 0) {
				this.fireEvent("AnimationUndoUnavailable","NoData");
			}
		}			
	}
	
	resetAll() {
		this.clearHistory();
		this.animatedObjects.clearAllObjects();
		this.animatedObjects.draw();
		clearTimeout(timer);
	}
	
	skipForward() {
		if (this.currentlyAnimating) {
			this.animatedObjects.runFast = true;
			while (this.AnimationSteps != null && this.currentAnimation < this.AnimationSteps.length) {
				for (let i = 0; this.currentBlock != null && i < this.currentBlock.length; i++) {
					let objectID = this.currentBlock[i].objectID;
					this.animatedObjects.setNodePosition(objectID, this.currentBlock[i].toX, this.currentBlock[i].toY);
				}
				if (this.doingUndo) {
					this.finishUndoBlock(this.undoStack.pop())
				}
				this.startNextBlock();
				for (let i = 0; i < this.currentBlock.length; i++) {
					let objectID = this.currentBlock[i].objectID;
					this.animatedObjects.setNodePosition(objectID, this.currentBlock[i].toX, this.currentBlock[i].toY);
				}
			}
			this.animatedObjects.update();
			this.currentlyAnimating = false;
			this.awaitingStep = false;
			this.doingUndo = false;
			
			this.animatedObjects.runFast = false;
			this.fireEvent("AnimationEnded","NoData");
			clearTimeout(timer);
			this.animatedObjects.update();
			this.animatedObjects.draw();			
		}
	}
	
	
	finishUndoBlock(undoBlock) {
		for (let i = undoBlock.length - 1; i >= 0; i--) {
			undoBlock[i].undoInitialStep(this.animatedObjects);
		}
		this.doingUndo = false;
		
		if (this.undoAnimationStepIndices.length == 0) {
			this.awaitingStep = false;
			this.currentlyAnimating = false;
			this.undoAnimationStepIndices = this.undoAnimationStepIndicesStack.pop();
			this.AnimationSteps = this.previousAnimationSteps.pop();
			this.fireEvent("AnimationEnded","NoData");
			this.fireEvent("AnimationUndo","NoData");
			this.currentBlock = [];
			if (this.undoStack == null || this.undoStack.length == 0) {
				this.currentlyAnimating = false;
				this.awaitingStep = false;
				this.fireEvent("AnimationUndoUnavailable","NoData");
			}
			
			clearTimeout(timer);
			this.animatedObjects.update();
			this.animatedObjects.draw();
			
			return false;
		}
		return true;
	}
	
	
	undoLastBlock() {	
		if (this.undoAnimationStepIndices.length == 0) {
			return;
		}
		if (this.undoAnimationStepIndices.length > 0) {
			this.doingUndo = true;
			let anyAnimations = false;
			this.currentAnimation = this.undoAnimationStepIndices.pop();
			this.currentBlock = [];
			let undo = this.undoStack[this.undoStack.length - 1];
			
			for (let i = undo.length - 1; i >= 0; i--) {
				let animateNext  =  undo[i].addUndoAnimation(this.currentBlock);
				anyAnimations = anyAnimations || animateNext;	
			}
			this.currFrame = 0;
			
			if (!anyAnimations && this.animationPaused  ) {
				this.currFrame = this.animationBlockLength;
			}
			this.currentlyAnimating = true;				
		}
	}

	setLayer(shown, layers) {
		this.animatedObjects.setLayer(shown, layers)
		this.animatedObjects.draw();
	}
	
	
	setAllLayers(layers) {
		this.animatedObjects.setAllLayers(layers);
		this.animatedObjects.draw();
	}
	 
	
	update() {	
		if (this.currentlyAnimating) {
			this.currFrame = this.currFrame + 1;
			for (let i = 0; i < this.currentBlock.length; i++) {
				if (this.currFrame == this.animationBlockLength || (this.currFrame == 1 && this.animationBlockLength == 0)) {
					this.animatedObjects.setNodePosition(this.currentBlock[i].objectID, this.currentBlock[i].toX, this.currentBlock[i].toY);
				}
				else if (this.currFrame < this.animationBlockLength) {
					let objectID = this.currentBlock[i].objectID;
					let percent = 1 / (this.animationBlockLength - this.currFrame);
					let newX = this.lerp(this.animatedObjects.getNodeX(objectID), this.currentBlock[i].toX, percent);
					let newY = this.lerp(this.animatedObjects.getNodeY(objectID), this.currentBlock[i].toY, percent);
					this.animatedObjects.setNodePosition(objectID, newX, newY);
				}
			}
			if (this.currFrame >= this.animationBlockLength) {
				if (this.doingUndo) {
					if (this.finishUndoBlock(this.undoStack.pop())) {
						this.awaitingStep = true;
						this.fireEvent("AnimationWaiting","NoData");
					}
				}
				else {
					if (this.animationPaused && (this.currentAnimation < this.AnimationSteps.length)) {
						this.awaitingStep = true;
						this.fireEvent("AnimationWaiting","NoData");
						this.currentBlock = [];
					}
					else {
						this.startNextBlock();
					}
				}
			}
			this.animatedObjects.update();		
		}
	}
}

class SingleAnimation {
	constructor(id, fromX, fromY, toX, toY) {
		this.objectID = id;
		this.fromX = fromX;
		this.fromY = fromY;
		this.toX = toX;
		this.toY = toY;	
	}
}
