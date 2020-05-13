describe('lambda function', function() {
  var index = require('index');
  var context;
  var callback;

  beforeEach(function() {
    callback = jasmine.createSpy('callback');
    context = jasmine.createSpyObj('context', ['succeed', 'fail']);
    index.dynamodb = jasmine.createSpyObj('dynamo', ['scan']);
  });

  describe('popularAnswers', function() {
    it('requests problems with the given problem number', function() {
      index.popularAnswers({ body: '{ "problemNumber": 42 }' }, context, callback);
      expect(index.dynamodb.scan).toHaveBeenCalledWith({
        FilterExpression: "problemId = :problemId",
        ExpressionAttributeValues: { ":problemId": 42 },
        TableName: 'learnjs'
      }, jasmine.any(Function));
    });
  });

  it('groups answers by minified code', function() {
    index.popularAnswers({ body: '{ "problemNumber": 42 }' }, context, callback);
    index.dynamodb.scan.calls.first().args[1](undefined, {
      Items: [
        { answer: "true" },
        { answer: "true" },
        { answer: "true" },
        { answer: "!false" },
        { answer: "!false" },
      ]
    })
  });
});
