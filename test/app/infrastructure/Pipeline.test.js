const Pipeline = require('Infrastructure/Pipeline.js');
const sinon = require('sinon')

describe('Pipeline - ', () => {
    
    xtest('with no middlewares', () => 
    {
        var response = Pipeline.handle({
            data: {id:4},
            action: (data) => data.id
        })
        
        expect(response).toBe(4);
    });

    xtest('with one middleware that doesnt call next', () => 
    {
        var response = Pipeline.handle({
            data: {id:4},
            action: (data) => data.id,
            middlewares: [(req, next) => 1]
        })
        
        expect(response).toBe(1);
    });

    test('with one middleware that work after response', () => 
    {
        var response = Pipeline.handle({
            data: {id:4},
            action: (data) => data.id,
            middlewares: [(req, nextAction) => nextAction.next(req) + 2]
        })
        
        expect(response).toBe(6);
    });

    test('with two middleware that work after response', () => 
    {
        var response = Pipeline.handle({
            data: {id:4},
            action: (data) => data.id,
            middlewares: [
                (req, nextAction) => nextAction.next(req) + 2,
                (req, nextAction) => nextAction.next(req) + 3,
            ]
        })
        
        expect(response).toBe(9);
    });

    
    
})