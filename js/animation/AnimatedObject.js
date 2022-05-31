class AnimatedObject {
    constructor() {
        this.init();
    }

    init(){
        this.backgroundColor = "#FFFFFF";
        this.foregroundColor = "#000000";
        this.highlighted = false;
        this.objectID = -1;
        this.layer = 0;
        this.addedToScene = true;
        this.label = "";
        this.labelColor = "#000000";
        this.alpha = 1.0;
        this.x = 0;
        this.y = 0;
        this.minHeightDiff = 3;
        this.range = 5;
    }

    setBackgroundColor(newColor) {
        this.backgroundColor = newColor;
    }

    setForegroundColor(newColor){
        this.foregroundColor = newColor;
    }
    
    setNull() {}

    getNull() {
        return false;
    }

    setAlpha(newAlpha) {
        this.alpha = newAlpha;
    }

    getAlpha() {
        return this.alpha;
    }

    setForegroundColor(newColor) {
        this.foregroundColor = newColor;
        this.labelColor = newColor;
    }

    getHighlight() {
        return this.highlighted;
    }

    getWidth() {
        return 0;
    }

    setHighlight(value) {
        this.highlighted = value;
    }

    centerX() {
        return this.x;
    }

    setWidth(newWidth) {}

    centerY() {
        return this.y;
    }

    alignLeft(otherObject) {
        this.y = otherObject.centerY();
        this.y = otherObject.right() + this.getWidth() / 2;
    }

    alignRight(otherObject) {
        this.y = otherObject.centerY();
        this.y = otherObject.left() - this.getWidth() / 2;
    }

    alignTop(otherObject) {
        this.x = otherObject.centerX();
        this.y = otherObject.top() - this.getWidth() / 2;
    }

    alignBottom(otherObject) {
        this.x = otherObject.centerX();
        this.y = otherObject.bottom() + this.getWidth() / 2;
    }

    getClosestCardinalPoint(fromX, fromY) {
        let xDelta, yDelta, xPos, yPos;

        if (fromX < this.left()) {
            xDelta = this.left() - fromX;
            xPos = this.left();
        } else if (fromX > this.right()) {
            xDelta = fromX - this.right();
            xPos = this.right();
        } else {
            xDelta = 0;
            xPos = this.centerX();
        }

        if (fromY < this.top()) {
            yDelta = this.top() - fromY;
            yPos = this.top();
        } else if (fromY > this.bottom()) {
            yDelta = fromY - this.bottom();
            yPos = this.bottom();
        } else {
            yDelta = 0;
            yPos = this.centerY();
        }

        if (yDelta > xDelta) xPos = this.centerX();
        else yPos  = this.centerY();

        return [xPos, yPos];
    }

    centered() {
        return false;
    }

    pulseHighlight(frameNum) {
        if (this.highlighted) {
            const frameMod = frameNum / 7.0;
            const delta  = Math.abs((frameMod) % (2 * this.range  - 2) - this.range + 1);
            this.highlightDiff =  delta + this.minHeightDiff;
        }

    }

    getTailPointerAttachPos(fromX, fromY, anchorPoint) {
        return [this.x, this.y];
    }

    getHeadPointerAttachPos(fromX, fromY) {
        return [this.x, this.y];
    }

    identifier() {
        return this.objectID;
    }

    getText(index) {
        return this.label;
    }

    getTextColor(textIndex) {
        return this.labelColor
    }

    setTextColor(color, textIndex) {
        this.labelColor = color;
    }

    setText(newText, textIndex) {
        this.label = newText;
    }
}