const Router = require('Infrastructure/Router.js');
const sinon = require('sinon')

describe('Router', () => {
    
    beforeEach(() => {
        Router.flush()
    });

    describe('Basic', () => {
        test('put string returned in body & ok status is 200', () => 
        {
            Router.get("/", () =>  "Hello World!");
            
            var response = Router.handle({ method: "get", path: "/" });
            expect(response.status).toBe(200);
            expect(response.body).toBe("Hello World!");
        });

        test('if try to handle route that doesnt exists return 400 - Route not found', () => 
        {
            Router.get("/", () =>  "Hello World!");
            
            var response = Router.handle({ method: "get", path: "/doesnt/exists" });
            
            expect(response.status).toBe(400);
            expect(response.body).toBe("Route not found");
        });

        test('put array returned in body', () => 
        {
            Router.get("/numbers", () =>  [1,2,3]);
            
            var response = Router.handle({ method: "get", path: "/numbers/" });
            
            expect(response.body).toStrictEqual([1,2,3]);
        });

        test('pass parameter /user/{id} to function as data.id', () => 
        {
            Router.get("/users/{id}", (data) =>  `Hi ${data.id}!`);
            
            var response = Router.handle({ method: "get",   path: "/users/raultm" });
            
            expect(response.body).toBe("Hi raultm!");
        });

        test('pass request to Route handle action', () => 
        {
            Router.get("/check/request", (data, req) =>  req.method + "-" + req.path);
            
            var response = Router.handle({ method: "get", path: "/check/request" });
            
            expect(response.body).toBe("get-/check/request");
        });

        test('pass response to Route handle action', () => 
        {
            Router.get("/check/request", (data, req, res) =>  { res.status = 201; return res });
            
            var response = Router.handle({ method: "get", path: "/check/request" });
            
            expect(response.status).toBe(201);
        });
    })
    
    describe("Middlewares", () => {
        test('with one middleware that doesnt call next', () => 
        {
            Router.get("/middleware/test", 
                () =>  "Hi", 
                (req, next) => { return { status: 404, body:"Not authorized"} }
            );

            var response = Router.handle({ method: "get", path: "/middleware/test" });
            expect(response.status).toBe(404);
            expect(response.body).toBe("Not authorized");
        });

        test('with one middleware that work after response', () =>
        {
            Router.get("/middleware/test", 
                () =>  "Hi", 
                (req, nextAction) => {
                    var response = nextAction.next(req)
                    response.body+= " Raul!"
                    return response
                }
            );

            var response = Router.handle({ method: "get", path: "/middleware/test" });
            expect(response.body).toBe("Hi Raul!");
        });

        test('with two middleware that work after response', () => 
        {
            Router.get("/middleware/test/{id}", 
                    (data) => data.id,
                    middlewareSumNumber(2),
                    middlewareSumNumber(3),
                );
            var response = Router.handle({ method: "get", path: "/middleware/test/4" });
            expect(response.body).toBe(9);
        });

        test('with n middleware that work after response', () => 
        {
            Router.get("/middleware/test/{id}", 
                    (data) => data.id,
                    middlewareSumNumber(1),
                    middlewareSumNumber(2),
                    middlewareSumNumber(3),
                    middlewareSumNumber(4),
                    middlewareSumNumber(5),
                    middlewareSumNumber(6),
                    middlewareSumNumber(7),
                );
            var response = Router.handle({ method: "get", path: "/middleware/test/4" });
            expect(response.body).toBe(32);
        });

        test('with n middleware one of them return something that is not an object', () => 
        {
            Router.get("/middleware/test/{id}", 
                    (data) => data.id,
                    middlewareSumNumber(1),
                    middlewareSumNumber(2),
                    middlewareSumNumber(3),
                    (request, nextaction) => 4,
                    middlewareSumNumber(5),
                    middlewareSumNumber(6),
                    middlewareSumNumber(7),
                );
            var response = Router.handle({ method: "get", path: "/middleware/test/4" });
            expect(response.status).toBe(500);
            expect(response.body).toBe("Error: Middleware is no responding with an Response (Object)");
        });
    })
    
})

const middlewareSumNumber = number => {
    return (request, nextaction) => {
        var response = nextaction.next(request)
        response.body = parseInt(response.body) + number;
        return response 
    }
};