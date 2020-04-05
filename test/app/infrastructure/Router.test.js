const Router = require('Infrastructure/Router.js');
const sinon = require('sinon')

describe('Router - ', () => {
    
    beforeEach(() => {
        Router.flush()
    });

    test('put string returned in body & ok status is 200', () => 
    {
        Router.get("/", () =>  "Hello World!");
        
        var response = Router.handle({ method: "get", path: "/" });
        
        expect(response.status).toBe(200);
        expect(response.body).toBe("Hello World!");
    });

    test('put string returned in body & ok status is 200', () => 
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

    test('pass parameter to function', () => 
    {
        Router.get("/users/{id}", (data) =>  `Hi ${data.id}!`);
        
        var response = Router.handle({ method: "get", path: "/users/raultm" });
        
        expect(response.body).toBe("Hi raultm!");
    });

    test('pass request to handle', () => 
    {
        Router.get("/check/request", (data, req) =>  req.method + "-" + req.path);
        
        var response = Router.handle({ method: "get", path: "/check/request" });
        
        expect(response.body).toBe("get-/check/request");
    });

    test('pass response to handle', () => 
    {
        Router.get("/check/request", (data, req, res) =>  res.status = 201);
        
        var response = Router.handle({ method: "get", path: "/check/request" });
        
        expect(response.status).toBe(201);
    });
    
})