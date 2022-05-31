function addLabelToAlgorithmBar(labelName) {
    let element = document.createTextNode(labelName);

	let tableEntry = document.createElement("td");
	tableEntry.appendChild(element);

    let controlBar = document.getElementById("AlgorithmSpecificControls");

    controlBar.appendChild(tableEntry);
	return element;
}

function addCheckboxToAlgorithmBar(boxLabel) {
	let element = document.createElement("input");
    element.setAttribute("type", "checkbox");
    element.setAttribute("value", boxLabel);

    let label = document.createTextNode(boxLabel);
	let tableEntry = document.createElement("td");
	tableEntry.appendChild(element);
	tableEntry.appendChild(label);

    let controlBar = document.getElementById("AlgorithmSpecificControls");
    controlBar.appendChild(tableEntry);
	return element;
}

function addRadioButtonGroupToAlgorithmBar(buttonNames, groupName) {
	let buttonList = [];
	let newTable = document.createElement("table");

	for (let i = 0; i < buttonNames.length; i++) {
		let midLevel = document.createElement("tr");
		let bottomLevel = document.createElement("td");
		let button = document.createElement("input");
		
        button.setAttribute("type", "radio");
		button.setAttribute("name", groupName);
		button.setAttribute("value", buttonNames[i]);
		bottomLevel.appendChild(button);
		midLevel.appendChild(bottomLevel);
		
        let txtNode = document.createTextNode(" " + buttonNames[i]);
		bottomLevel.appendChild(txtNode);
		newTable.appendChild(midLevel);
		buttonList.push(button);
	}

	let topLevelTableEntry = document.createElement("td");
	topLevelTableEntry.appendChild(newTable);

	let controlBar = document.getElementById("AlgorithmSpecificControls");
	controlBar.appendChild(topLevelTableEntry);

	return buttonList
}


function addControlToAlgorithmBar(type, name) {
    let element = document.createElement("input");
    element.setAttribute("type", type);
    element.setAttribute("value", name);
    element.setAttribute("name", name);

	let tableEntry = document.createElement("td");
	tableEntry.appendChild(element);

    let controlBar = document.getElementById("AlgorithmSpecificControls");
    controlBar.appendChild(tableEntry);
	return element;
}

function controlKey(keyASCII) {
    return keyASCII == 8 || 
           keyASCII == 9 || 
           keyASCII == 37 || 
           keyASCII == 38 || 
           keyASCII == 39 || 
           keyASCII == 40 || 
           keyASCII == 46;
}

class Algorithm {
    constructor(am) {}

    setCodeAlpha(code, newAlpha) {
        for (let i = 0; i < code.length; i++) {
            for (let j = 0; j < code[i].length; j++) {
                this.cmd("SetAlpha", code[i][j], newAlpha);
            }
        }
    }

    addCodeToCanvasBase(code, start_x, start_y, line_height, standard_color, layer) {
        layer = typeof layer !== 'undefined' ? layer : 0;
        let codeID = Array(code.length);
        
        for (let i = 0; i < code.length; i++) {
            codeID[i] = new Array(code[i].length);
            
            for (let j = 0; j < code[i].length; j++) {
                codeID[i][j] = this.nextIndex++;
                this.cmd("CreateLabel", codeID[i][j], code[i][j], start_x, start_y + i * line_height, 0);
                this.cmd("SetForegroundColor", codeID[i][j], standard_color);
                this.cmd("SetLayer", codeID[i][j], layer);
                
                if (j > 0) this.cmd("AlignRight", codeID[i][j], codeID[i][j-1]);
            }
        }
        return codeID;
    }

    init(am, w, h) {
        this.animationManager = am;

        am.addListener("AnimationStarted", this, this.disableUI);
        am.addListener("AnimationEnded", this, this.enableUI);
        am.addListener("AnimationUndo", this, this.undo);
        
        this.canvasWidth = w;
        this.canvasHeight = h;
        this.actionHistory = [];
        this.recordAnimation = true;
        this.commands = []
    }

    sizeChanged(newWidth, newHeight) {}

    implementAction(funct, val) {
        let nxt = [funct, val];
        this.actionHistory.push(nxt);
        let retVal = funct(val);
        this.animationManager.StartNewAnimation(retVal);
    }

    isAllDigits(str) {
        for (let i = str.length - 1; i >= 0; i--) {
            if (str.charAt(i) < "0" || str.charAt(i) > "9") return false;
        }
        return true;
    }

    normalizeNumber(input, maxLen) {
        if (!this.isAllDigits(input) || input == "") return input;
        return ("OOO0000" +input).substr(-maxLen, maxLen);
    }

    disableUI(event) {}

    enableUI(event) {}

    returnSubmitFloat(field, funct, maxsize) {
        if (maxsize) field.size = maxsize;

        return function(event) {
            let keyASCII = 0;
            if(window.event) keyASCII = event.keyCode
            else if (event.which) keyASCII = event.which
            
            if (keyASCII == 13) funct();
            else if (controlKey(keyASCII)) return;
            else if (keyASCII == 109) return;
            else if ((maxsize || field.value.length < maxsize) && keyASCII >= 48 && keyASCII <= 57) return;
            else if ((maxsize || field.value.length < maxsize) && keyASCII == 190 && field.value.indexOf(".") == -1) return;
            else return false;
        }
    }

    returnSubmit(field, funct, maxsize, intOnly) {
        if (maxsize != undefined) field.size = maxsize;

        return function(event) {
            let keyASCII = 0;
            if(window.event) keyASCII = event.keyCode
            else if (event.which) keyASCII = event.which
            
            if (keyASCII == 13 && funct !== null) funct();
            else if (keyASCII == 59 ) return false;
            else if ((maxsize && field.value.length >= maxsize) || intOnly && (keyASCII < 48 || keyASCII > 57)) {
                if (!controlKey(keyASCII)) return false;
            }
        }
    }

    addReturnSubmit(field, action) {
        field.onkeydown = this.returnSubmit(field, action, 4, false);
    }

    reset() {}

    undo(event) {
        this.actionHistory.pop();
        this.reset();
        
        let len = this.actionHistory.length;
        this.recordAnimation = false;
        for (let i = 0; i < len; i++) this.actionHistory[i][0](this.actionHistory[i][1]);
        this.recordAnimation = true;
    }

    clearHistory() {
        this.actionHistory = [];
    }
    
    cmd() {
        if (this.recordAnimation) {
            let command = arguments[0];
            for(let i = 1; i < arguments.length; i++) command = command + "<;>" + String(arguments[i]);
            this.commands.push(command);
        }
    }
}
