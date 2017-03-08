var express = require('express');
var app = express();
var http = require('http');
var swagger = require('./src/swagger/index.js');
var logger = require('./src/logger.js');
var fs = require('fs');

var serverPort = 8002;

var preBootActions = [
	logger.init(app),
	swagger.execute(app)
]

app.all('*', function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With, accept, origin, content-type, x-access-token");
	res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
	res.header("Content-Type", "application/json;charset=utf-8");
	next();
});


app.get('/report', function(req, res){
	res.setHeader("Content-Type","text/html;charset='utf-8'");

	fs.readFile("./asset/static/report.html","utf-8", function(err,data){
         if(err) {
           console.log("index.html loading is failed :"+err);
         }
         else{
             res.end(data);
         }
     });
})

Promise.all(preBootActions).then(function(){
	http.createServer(app).listen(serverPort, function () {
		logger.logger('normal').info('Start server. Listening on port %d (http://localhost:%d)', serverPort, serverPort);
  });
});