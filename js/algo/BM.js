class BM extends Algorithm {
    constructor(am, w, h) {
        super(am);

        this.init(am, w, h);
        this.MARGIN_X = 40;
        this.MARGIN_Y = 100;
        this.LAST_LABEL_X = 20;
        this.LAST_LABEL_Y = 20;
        this.COUNTER_LABEL_X = 20;
        this.COUNTER_LABEL_Y = 40;
        this.STATUS_LABEL_X = 20;
        this.STATUS_LABEL_Y = 60;
        this.BOX_WIDTH = 30;
        this.BOX_HEIGHT = 30;
        this.ROW_SPACING = 20;
        
        this.NORMAL_FG_COLOR = "#000";
        this.ACTIVE_FG_COLOR = "#f00";
    }

    init(am, w, h) {
        super.init.call(this, am, w, h);
        this.addControls();
        this.reset();
    }

    addControls() {
        this.controls = [];

        this.btnReset = addControlToAlgorithmBar("Button", "Reset");
        this.btnReset.onclick = this.reset.bind(this);
        this.controls.push(this.btnReset);

        this.btnLookup = addControlToAlgorithmBar("Button", "Search");
        this.btnLookup.onclick = this.searchWrapper.bind(this);
        this.controls.push(this.btnLookup);

        this.lblText = addLabelToAlgorithmBar("Text:");
        this.txtText = addControlToAlgorithmBar("Text", "aababcabcdabcdeabcdef");
        this.controls.push(this.txtText);

        this.lblPattern = addLabelToAlgorithmBar("Pattern:");
        this.txtPattern = addControlToAlgorithmBar("Text", "abcdef");
        this.controls.push(this.txtPattern);
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
        let lastKeys, lastStr;

        this.text = this.txtText.value;
        this.pattern = this.txtPattern.value;
        this.nextId = 0;

        this.animationManager.resetAll();
        this.clearHistory();

        this.commands = [];

        this.last = {};
        for (let i = 0; i < this.text.length; ++i) {
            this.last[this.text[i]] = -1;
        }
        for (let i = this.pattern.length - 1; i >= 0; --i) {
            if (!this.last.hasOwnProperty(this.pattern[i]) ||
                this.last[this.pattern[i]] === -1) {
                this.last[this.pattern[i]] = i;
            }
        }
        lastKeys = Object.keys(this.last).sort();
        lastStr = "";
        for (let i = 0; i < lastKeys.length; ++i) {
            lastStr =
                (lastStr === "" ? "Last: {" : lastStr + ", ") +
                (lastKeys[i] + ": " + this.last[lastKeys[i]]);
        }
        if (lastStr !== "") {
            lastStr += "}";
        }
        this.lastId = this.newId();
        this.cmd("CreateLabel", this.lastId, lastStr, this.LAST_LABEL_X, this.LAST_LABEL_Y, 0);

        this.counterId = this.newId();
        this.cmd("CreateLabel", this.counterId, "", this.COUNTER_LABEL_X, this.COUNTER_LABEL_Y, 0);
        this.counter = 0;

        this.statusId = this.newId();
        this.cmd("CreateLabel", this.statusId, "", this.STATUS_LABEL_X, this.STATUS_LABEL_Y, 0);

        // Create rectangles for displaying the text and pattern.
        this.textRects = [];
        for (let i = 0; i < this.text.length; ++i) {
            this.textRects.push(this.newCharBox(this.text[i], i, 0));
        }
        this.patternRects = [];
        for (let i = 0; i < this.pattern.length; ++i) {
            this.patternRects.push(this.newCharBox(this.pattern[i], i, 1));
        }

        this.textIndex = undefined;
        this.patternIndex = undefined;
        this.patternShift = 0;
        if (this.pattern.length > 0) {
            this.setTextIndex(this.pattern.length - 1, true);
            this.setPatternIndex(this.pattern.length - 1);
        }

        this.animationManager.StartNewAnimation(this.commands);
    }

    newId() {
        return this.nextId++;
    }

    incrementCounter() {
        ++this.counter;
        this.cmd("SetText", this.counterId, "Comparisons: " + this.counter);
    }

    setStatus(msg) {
        this.cmd("SetText", this.statusId, msg);
    }

    newCharBox(value, u, v) {
        let id = this.newId();
        let x = this.MARGIN_X + u * this.BOX_WIDTH;
        let y = this.MARGIN_Y + v * (this.BOX_HEIGHT + this.ROW_SPACING);
        this.cmd("CreateRectangle", id, value, this.BOX_WIDTH, this.BOX_HEIGHT, x, y);
        return {id: id, u: u, v: v, x: x, y: y};
    }

    uvToXy(rect) {
        rect.x = this.MARGIN_X +
            this.BOX_WIDTH * (rect.u + (rect.v === 1 ? this.patternShift : 0));
        rect.y = this.MARGIN_Y + rect.v * (this.BOX_HEIGHT + this.ROW_SPACING);
        this.cmd("Move", rect.id, rect.x, rect.y);
    }

    setTextIndex(index, inhibitShift) {
        if (this.textIndex !== undefined && this.textIndex < this.text.length) {
            this.setActive(this.textRects[this.textIndex].id, false);
        }
        this.textIndex = index;
        if (index < this.text.length) {
            this.setActive(this.textRects[this.textIndex].id, true);
        }
        if (!inhibitShift) {
            this.updateShift();
        }
    }

    setPatternIndex(index) {
        if (this.patternIndex !== undefined) {
            this.setActive(this.patternRects[this.patternIndex].id, false);
        }
        this.patternIndex = index;
        this.setActive(this.patternRects[this.patternIndex].id, true);
        this.updateShift();
    }

    setActive(id, b) {
        this.cmd("SetForegroundColor", id, b ? this.ACTIVE_FG_COLOR : this.NORMAL_FG_COLOR);
    }

    updateShift() {
        let i;
        if (this.textIndex !== this.patternShift + this.patternIndex) {
            this.patternShift = this.textIndex - this.patternIndex;
            for (let i = 0; i < this.pattern.length; ++i) {
                this.uvToXy(this.patternRects[i]);
            }
        }
    }

    searchWrapper() {
        this.reset();
        this.implementAction(this.search.bind(this));
    }

    search() {
        let found = false;
        let match;
        let shift;
        this.commands = [];

        if (this.text === "" || this.pattern === "") {
            return;
        }

        this.counter = -1;
        this.incrementCounter();
        this.cmd("Step");

        while (this.textIndex < this.text.length) {
            match = this.text[this.textIndex] === this.pattern[this.patternIndex];
            this.incrementCounter();

            this.cmd("SetHighlight", this.textRects[this.textIndex].id, 1);
            this.cmd("SetHighlight", this.patternRects[this.patternIndex].id, 1);
            if (match) {
                this.setStatus("Match.  Moving backward.");
            } else {
                shift = Math.max(1, this.patternIndex - this.last[this.text[this.textIndex]]);
                this.setStatus(
                    "Mismatch.  last[" + this.text[this.textIndex] + "] = " +
                    this.last[this.text[this.textIndex]] + ".  Shifting by " + shift + ".");
            }
            this.cmd("Step");
            this.cmd("Step");
            this.cmd("SetHighlight", this.textRects[this.textIndex].id, 0);
            this.cmd("SetHighlight", this.patternRects[this.patternIndex].id, 0);
            this.setStatus("");

            if (match) {
                if (this.patternIndex === 0) {
                    found = true;
                    break;
                } else {
                    this.setTextIndex(this.textIndex - 1, true);
                    this.setPatternIndex(this.patternIndex - 1);
                }
            } else {
                this.setTextIndex(
                    this.textIndex + (this.pattern.length - this.patternIndex - 1) + shift,
                    true);
                this.setPatternIndex(this.pattern.length - 1);
                this.cmd("Step");
            }
        }

        if (found) {
            this.setStatus("Pattern found in text.");
        } else {
            this.setStatus("Pattern not found in text.");
        }

        return this.commands;
    }
}

let algorithm;

function init() {
    let manager = initCanvas();
    algorithm = new BM(manager, canvas.width, canvas.height);
}