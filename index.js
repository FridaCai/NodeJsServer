var express = require('express');
var app = express();
var http = require('http');
var swagger = require('./src/swagger/index.js');
var logger = require('./src/logger.js');
var schedule = require('./src/schedule.js');


global.serverPort = 8004; //8004 is port for debug.
global.testService = 'http://localhost:8003/v1';

var preBootActions = [
	logger.init(app),
	swagger.execute(app),
	schedule.run()
]


app.use(express.static('codebase'));


app.all('*', function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With, accept, origin, content-type, x-access-token");
	res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
	next();
});

Promise.all(preBootActions).then(function(){
	http.createServer(app).listen(global.serverPort, function () {
		logger.logger('normal').info('Start server. Listening on port %d (http://localhost:%d)', global.serverPort, global.serverPort);
  });
});
