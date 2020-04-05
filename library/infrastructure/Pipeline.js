var Pipeline = class Pipeline {

    static getInstance() {
        return this.instance?this.instance:this.instance = new Pipeline;
    }

    static handle({
        request={},
        response={},
        data={},
        action= () => "Empty function",
        middlewares=[]
    }= {}){
        if(middlewares.length == 0) return action(data, request, response)

        var pipeline = middlewares.reduce( 
            (lastAction, middleware) => new Action(middleware, lastAction), 
            new Action(
                action,
                null, 
                true, 
                data, 
                response)
            )
        return pipeline.exec(request)
    }

}

class Action {
    constructor(fn, nextAction, action = false, data = {}, response = {}) {
        this.action = action
        this.data = data
        this.response = response
        this.run = fn
        this.nextAction = nextAction
    }

    exec(req){
        return this.run(req, this)
    }

    next(req) {
        if(this.nextAction.action) { 
            return this.nextAction.run(this.nextAction.data, req, this.nextAction.response) 
        }
        return this.nextAction.exec(req)
    }
    
}

module.exports = Pipeline
