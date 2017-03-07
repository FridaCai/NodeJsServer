var app = require('express')();
var http = require('http');
var swagger = require('./src/swagger/index.js');
var logger = require('./src/logger.js');

var serverPort = 8001;

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

Promise.all(preBootActions).then(function(){
	http.createServer(app).listen(serverPort, function () {
		logger.logger('normal').info('Start server. Listening on port %d (http://localhost:%d)', serverPort, serverPort);
  });
});