var Router = class Router {

    static getInstance() {
        return this.instance?this.instance:this.instance = new Router;
    }

    static flush() {
        this.instance = null
    }

    static get(path, handler) {
        Router.getInstance().addRoute({
            method: 'get',
            path: path,
            handler: handler,
        })
    }

    static handle(request) {
        var route = Router.getInstance().routes
            //.sort(Router.routeDepthComparison)
            .filter((route) => request.method==route.method && route.regex.test(request.path))
            .shift()
        var response = { status: 200, body:""}
        if( !route ) {
            response.status = 400
            response.body = "Route not found"
        } else {
            //console.log(route)
            var match = request.path.match(route.regex)
            route.params = Router.regExpResultToParams(match, route.parameterNames);
            response.body = route.handler(route.params, request, response)
        }
        return response
    }

    static routeDepthComparison(a,b) {
        var slashCount = b.path.split("/").length - a.path.split("/").length
        if(slashCount != 0) return slashCount
        return b.path.length - a.path.length
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

module.exports = Router