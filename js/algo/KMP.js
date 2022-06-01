class KMP extends Algorithm {
    constructor(am, w, h) {
        super(am);
        this.init(am, w, h);
        
        this.MARGIN_X = 40;
        this.MARGIN_Y = 120;
        this.COUNTER_BUILD_LABEL_X  = 20;
        this.COUNTER_BUILD_LABEL_Y = 20;
        this.COUNTER_SEARCH_LABEL_X = 20;
        this.COUNTER_SEARCH_LABEL_Y = 40;
        this.STATUS_LABEL_X = 20;
        this.STATUS_LABEL_Y = 60;
        this.BOX_WIDTH = 60;
        this.BOX_HEIGHT = 60;
        this.ROW_SPACING = 20;
        this.FAILURE_FN_LABEL_X = 30;
        this.LEFT_LABEL_MARGIN = this.BOX_WIDTH;
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
        let i, lastKeys, lastStr;

        this.text = undefined;
        this.pattern = this.txtPattern.value;
        this.nextId = 0;

        this.animationManager.resetAll();
        this.clearHistory();

        this.commands = [];

        this.counterBuildId = this.newId();
        this.counterSearchId = this.newId();
        this.cmd("CreateLabel", this.counterBuildId, "", this.COUNTER_BUILD_LABEL_X, this.COUNTER_BUILD_LABEL_Y, 0);
        this.cmd("CreateLabel", this.counterSearchId, "", this.COUNTER_SEARCH_LABEL_X, this.COUNTER_SEARCH_LABEL_Y, 0);
        this.counterBuild = 0;
        this.counterSearch = 0;

        this.statusId = this.newId();
        this.cmd("CreateLabel", this.statusId, "", this.STATUS_LABEL_X, this.STATUS_LABEL_Y, 0);

        this.textIndex = undefined;
        this.patternIndex = undefined;
        this.patternShift = 0;
        this.textRects = [this.newCharBox("---", 0, 0)];
        this.patternRects = [];
        
        for (let i = 0; i < this.pattern.length; ++i) {
            this.patternRects.push(this.newCharBox(this.pattern[i], i, 1));
        }

        this.failureFnPattern = this.pattern;
        this.failureFn = [];
        this.failureFnIndexRects = [];
        this.failureFnCharRects = [];
        this.failureFnValueRects = [];
        
        for (let i = 0; i < this.pattern.length; ++i) {
            this.failureFn.push(undefined);
            this.failureFnIndexRects.push(this.newCharBox(i + "", i, 2));
            this.failureFnCharRects.push(this.newCharBox(this.pattern[i], i, 3));
            this.failureFnValueRects.push(this.newCharBox("-", i, 4));
        }

        if (this.pattern.length > 0) {
            this.cmd(
                "CreateLabel", 
                this.newId(), 
                "Failure function:",
                this.FAILURE_FN_LABEL_X,
                this.failureFnIndexRects[0].y - this.BOX_HEIGHT * 1.2,
                0
            );
            
            this.cmd(
                "CreateLabel", 
                this.newId(), 
                "j",
                this.failureFnIndexRects[0].x - this.BOX_WIDTH,
                this.failureFnIndexRects[0].y
            );
            
            this.cmd(
                "CreateLabel", 
                this.newId(), 
                "P[j]",
                this.failureFnCharRects[0].x - this.BOX_WIDTH,
                this.failureFnCharRects[0].y
            );
            
            this.cmd(
                "CreateLabel", 
                this.newId(), 
                "f(j)",
                this.failureFnValueRects[0].x - this.BOX_WIDTH,
                this.failureFnValueRects[0].y
            );
        }

        this.animationManager.StartNewAnimation(this.commands);
    }

    newId() {
        return this.nextId++;
    }

    incrementCounterBuild() {
        ++this.counterBuild;
        this.cmd("SetText", this.counterBuildId, "Build comparisons: " + this.counterBuild);
    }

    incrementCounterSearch() {
        ++this.counterSearch;
        this.cmd("SetText", this.counterSearchId, "Search comparisons: " + this.counterSearch);
    }

    setStatus(msg) {
        this.cmd("SetText", this.statusId, msg);
    }

    newCharBox(value, u, v) {
        let x = this.MARGIN_X + u * this.BOX_WIDTH;
        let y = this.MARGIN_Y + v * (this.BOX_HEIGHT + this.ROW_SPACING);
        let rect = {value: value, u: u, v: v};
        this.uvToXy(rect);
        return rect;
    }

    uvToXy(rect) {
        rect.x =
            this.MARGIN_X +
            this.BOX_WIDTH * (rect.u + (rect.v === 1 ? this.patternShift : 0)) +
            (rect.v >= 2 ? this.LEFT_LABEL_MARGIN : 0);

        rect.y =
            this.MARGIN_Y +
            (rect.v < 2 ?
            rect.v * (this.BOX_HEIGHT + this.ROW_SPACING) :
            2 * (this.BOX_HEIGHT + this.ROW_SPACING) + rect.v * this.BOX_HEIGHT);

        if (rect.id !== undefined) this.cmd("Move", rect.id, rect.x, rect.y);
        else {
            rect.id = this.newId();
            this.cmd("CreateRectangle", rect.id, rect.value, this.BOX_WIDTH, this.BOX_HEIGHT, rect.x, rect.y);
        }
    }

    setText(text, doAnim) {
        if (doAnim === undefined) doAnim = true;
        
        for (let i =0; i < this.textRects.length; ++i) this.cmd("Delete", this.textRects[i].id);

        this.text = text;
        this.textRects = [];
        if (doAnim) {
            for (let i = 0; i < this.text.length; ++i) this.textRects.push(this.newCharBox(this.text[i], i, 0));
        }
    }

    setTextIndex(index, doAnim, doShift) {
        if (doAnim === undefined) doAnim = true;
        if (doShift === undefined) doShift = true;

        if (doAnim) {
            if (this.textIndex && this.textIndex < this.text.length) {
                this.setActive(this.textRects[this.textIndex].id, false);
            }
        }

        this.textIndex = index;
        
        if (doAnim) {
            if (index < this.text.length) this.setActive(this.textRects[this.textIndex].id, true);
            if (doShift) this.updateShift();
        }
    }

    setPatternIndex(index, doAnim) {
        if (doAnim === undefined) doAnim = true;
        
        if (doAnim) {
            if (this.patternIndex) this.setActive(this.patternRects[this.patternIndex].id, false);
        }

        this.patternIndex = index < this.pattern.length ? index : undefined;
        
        if (doAnim) {
            if (this.patternIndex) this.setActive(this.patternRects[this.patternIndex].id, true);
            this.updateShift();
        }
    }

    setActive(id, b) {
        this.cmd("SetForegroundColor", id, b ? this.ACTIVE_FG_COLOR : this.NORMAL_FG_COLOR);
    }

    updateShift() {
        if (this.textIndex !== this.patternShift + this.patternIndex) {
            this.patternShift = this.textIndex - this.patternIndex;
            for (let i = 0; i < this.pattern.length; ++i) this.uvToXy(this.patternRects[i]);
        }
    }

    setFailureFnValue(index, value, doAnim) {
        if (doAnim === undefined) doAnim = true;

        let id = this.failureFnValueRects[index].id;
        this.failureFn[index] = value;
        this.cmd("SetText", id, value);
        if (doAnim) {
            this.cmd("SetHighlight", id, 1);
            this.cmd("Step");
            this.cmd("SetHighlight", id, 0);
        }
    }

    buildFailureFnWrapper() {
        this.reset();
        if (this.pattern === "") return;
        this.commands = [];
        this.implementAction(this.buildFailureFn.bind(this));
    }

    buildFailureFn(doAnim) {
        if (doAnim === undefined) doAnim = true;

        this.counterBuild = -1;
        this.incrementCounterBuild();
        this.setText(this.pattern, doAnim);  // this.text === this.pattern for this whole function!
        this.setFailureFnValue(0, 0, doAnim);
        if (doAnim) this.cmd("Step");
        
        this.setTextIndex(1, doAnim, false);
        this.setPatternIndex(0, doAnim);
        if (doAnim) this.cmd("Step");

        while (this.textIndex < this.text.length) {
            let match = this.text[this.textIndex] == this.pattern[this.patternIndex];
            this.incrementCounterBuild();

            if (doAnim) {
                if (match) {
                    this.setStatus("Match.  Setting failure function and advancing.");
                    this.cmd("Step");
                } else if (this.patternIndex > 0) {
                    this.setStatus("Mismatch.  Consulting failure function.");
                    this.cmd("Step");
                    this.cmd("SetHighlight", this.patternRects[this.patternIndex - 1].id, 1);
                    this.cmd("SetHighlight", this.failureFnValueRects[this.patternIndex - 1].id, 1);
                    this.cmd("Step");
                    this.setStatus("");
                    this.cmd("SetHighlight", this.patternRects[this.patternIndex - 1].id, 0);
                    this.cmd("SetHighlight", this.failureFnValueRects[this.patternIndex - 1].id, 0);
                } else {
                    this.setStatus("Mismatch.  Setting failure function to 0 and shifting one position.");
                    this.cmd("Step");
                }
            }

            if (match) {
                this.setFailureFnValue(this.textIndex, this.patternIndex + 1, doAnim);
                this.setTextIndex(this.textIndex + 1, doAnim, false);
                this.setPatternIndex(this.patternIndex + 1, doAnim);
            } else if (this.patternIndex > 0) {
                this.setPatternIndex(this.failureFn[this.patternIndex - 1], doAnim);
            } else {
                this.setFailureFnValue(this.textIndex, 0, doAnim);
                this.setTextIndex(this.textIndex + 1, doAnim);
            }

            if (doAnim) {
                this.setStatus("");
                this.cmd("Step");
            }
        }

        if (doAnim) {
            this.setStatus("Failure function built.");
        }

        return this.commands;
    }

    searchWrapper() {
        this.reset();
        if (this.pattern === "") return;
        this.commands = [];
        this.implementAction(this.search.bind(this));
    }

    search() {
        let found = false;

        this.buildFailureFn(false);

        this.counterSearch = -1;
        this.incrementCounterSearch();
        this.setText(this.txtText.value);
        this.setTextIndex(0, true, false);
        this.setPatternIndex(0);
        this.cmd("Step");

        while (this.textIndex < this.text.length) {
            let match = this.text[this.textIndex] === this.pattern[this.patternIndex];
            this.incrementCounterSearch();

            if (match) {
                this.setStatus("Match.  Advancing.");
                this.cmd("Step");
            } else if (this.patternIndex > 0) {
                this.setStatus("Mismatch.  Consulting failure function.");
                this.cmd("Step");
                this.cmd("SetHighlight", this.patternRects[this.patternIndex - 1].id, 1);
                this.cmd("SetHighlight", this.failureFnValueRects[this.patternIndex - 1].id, 1);
                this.cmd("Step");
                this.setStatus("");
                this.cmd("SetHighlight", this.patternRects[this.patternIndex - 1].id, 0);
                this.cmd("SetHighlight", this.failureFnValueRects[this.patternIndex - 1].id, 0);
            } else {
                this.setStatus("Mismatch.  Shifting pattern one position.");
                this.cmd("Step");
            }

            if (match) {
                if (this.patternIndex === this.pattern.length - 1) {
                    found = true;
                    break;
                }
                this.setTextIndex(this.textIndex + 1, true, false);
                this.setPatternIndex(this.patternIndex + 1);
            } else if (this.patternIndex > 0) {
                this.setPatternIndex(this.failureFn[this.patternIndex - 1]);
            } else {
                this.setTextIndex(this.textIndex + 1);
            }

            this.setStatus("");
            this.cmd("Step");
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
    algorithm = new KMP(manager, canvas.width, canvas.height);
}