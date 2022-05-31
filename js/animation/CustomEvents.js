class EventListener {
    constructor() {
        this.events = []
    }

    removeListener(kind, scope, func) {
        if (!this.events[kind]) return;
        
        let scopeFunctions = null;
        
        for (let i = 0; i < this.events[kind].length; i++) {
            if (this.events[kind][i].scope == scope) {
                scopeFunctions = this.events[kind][i];
                break;
            }
        }

        if (scopeFunctions == null) return;

        for (i = 0; i < scopeFunctions.functions.length; i++) {
            if (scopeFunctions.functions[i] == func) {
                scopeFunctions.functions.splice(i,1);
                return;
            }
        }
    }
    
    addListener(kind, scope, func) {
        if (this.events[kind] === undefined) {
            this.events[kind] = [];
        }

        let scopeFunctions = null;
        
        for (let i = 0; i < this.events[kind].length; i++) {
            if (this.events[kind][i].scope == scope) {
                scopeFunctions = this.events[kind][i];
                break;
            }
        }

        if (scopeFunctions === null) {
            this.events[kind].push({scope:scope, functions:[] });
            scopeFunctions = this.events[kind][this.events[kind].length - 1];
        }
        
        for (let i = 0; i < scopeFunctions.functions.length; i++) {
            if (scopeFunctions.functions[i] == func) return;
        }

        scopeFunctions.functions.push(func);
    }

    fireEvent(kind, event) {
        if (this.events[kind]) {
            for (let i = 0; i < this.events[kind].length; i++) {
                let objects = this.events[kind][i];
                let functs = objects.functions;
                let scope = objects.scope

                for (let j = 0; j <functs.length; j++) {
                    let func = functs[j];
                    func.call(scope,event);
                }
            }
        }
    }
}
