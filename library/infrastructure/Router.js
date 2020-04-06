var Router = class Router {

    static getInstance() {
        return this.instance?this.instance:this.instance = new Router;
    }

    static flush() {
        this.instance = null
    }

    static get(path, handler, ...middlewares) {
        Router.getInstance().addRoute({
            method: 'get',
            path: path,
            handler: handler,
            middlewares: middlewares
        })
    }

    static handle(request) {
        var route = Router.getInstance().routes
            .filter((route) => request.method==route.method && route.regex.test(request.path))
            .shift()
        var response = { status: 200, body:""}
        if( !route ) {
            response.status = 400
            response.body = "Route not found"
        } else {
            try {
                var match = request.path.match(route.regex)
                route.params = Router.regExpResultToParams(match, route.parameterNames);
                response = Router.pipeline(route.params, request, response, route.handler, route.middlewares)
            } catch (error) {
                response.status = 500
                response.body = error.toString()
            }
        }
        return response
    }

    static pipeline(data, request, response, handler, middlewares = []){
        //if(middlewares.length == 0) return handler(data, request, response)

        var pipeline = middlewares.reduce( 
            (lastAction, middleware) => PipelineAction.middleware(middleware, lastAction), 
            PipelineAction.action(handler, data, response)
        )
        return pipeline.exec(request)
    }

    static regExpResultToParams(match, names) {
        if (names.length === 0) return [];
        if (!match) return [];
        return match.slice(1, match.length).reduce(function (params, value, index) {
          if (params === null) params = {};
          params[names[index]] = decodeURIComponent(value);
          return params;
        }, null);
      }

    constructor() {
        this.routes = []
        this.PARAMETER_REGEXP = /\{(.*?)\}/g;
        this.WILDCARD_REGEXP = /\*/g;
        this.REPLACE_VARIABLE_REGEXP = '([^\/]+)';
        this.REPLACE_WILDCARD = '(?:.*)';
        this.FOLLOWED_BY_SLASH_REGEXP = '(?:\/$|$)';  
    }

    addRoute(route) {
        route.parameterNames = [];
        route.regex = new RegExp(
                "^" 
                + route.path 
                    .replace(this.PARAMETER_REGEXP,(nameInBrackets, name) => route.parameterNames.push(name)?this.REPLACE_VARIABLE_REGEXP:"")
                    //.replace(this.WILDCARD_REGEXP, this.REPLACE_WILDCARD) 
                + "\/*$"
        )
        ;
        this.routes.push(route)
    }
}

class PipelineAction {
    
    static middleware(runnable, innerAction) {
        return new PipelineAction(runnable, innerAction)
    }

    static action(runnable, data, response) {
        return new PipelineAction(runnable, null, data, response)
    }
    
    constructor(runnable, nextAction, data = null, response = null) {
        this.runnable = runnable
        this.nextAction = nextAction
        this.data = data
        this.response = response
    }

    exec(req){
        if(this.data) { 
            var actionResponse = this.runnable(this.data, req, this.response)
            if(typeof actionResponse == "string" || Array.isArray(actionResponse)){ 
                this.response.body = actionResponse
                return this.response
            }else{ // If no String must be response object
                return actionResponse
            }
        }
        var middlewareResponse=this.runnable(req, this)
        if(typeof middlewareResponse != "object"){
            throw new Error("Middleware is no responding with an Response (Object)")
        }
        return middlewareResponse
    }

    next(req) {
        return this.nextAction.exec(req)
    }
    
}

module.exports = Router
