var http = require('http');
var AWS = require('aws-sdk');

AWS.config.region = 'ap-northeast-1';

var config = {
  dynamoTableName: 'learnjs',
};

exports.dynamodb = new AWS.DynamoDB.DocumentClient();

function reduceItems(memo, items) {
  items.forEach(function(item) {
    memo[item.answer] = (memo[item.answer] || 0) + 1;
  });
  return memo;
}

function byCount(e1, e2) {
  return e2[0] - e1[0];
}

function filterItems(items) {
  var values = [];
  for (i in items) {
    values.push([items[i], i]);
  }
  var topFive = {};
  values.sort(byCount).slice(0, 5).forEach(function(e) {
    topFive[e[1]] = e[0];
  });
  return topFive;
}

exports.popularAnswers = function(event, context, callback) {
  var res ={
    "statusCode": 200,
    "headers": {
        "Content-Type": "*/*"
    }
  };
  exports.dynamodb.scan({
    FilterExpression: "problemId = :problemId",
    ExpressionAttributeValues: {
      ":problemId": JSON.parse(event.body).problemNumber
    },
    TableName: config.dynamoTableName,
  }, function(err, data) {
    if (err) {
      callback(err);
    } else {
      res.body = JSON.stringify(filterItems(reduceItems({}, data.Items)));
      callback(null, res);
    }
  });
};
