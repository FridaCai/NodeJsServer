'use strict';

var Ping = require('./PingService');
var logger = require('../../logger.js').logger('normal');

module.exports.pingGet = function pingGet (req, res, next) {
	try{
		Ping.pingGet(req.swagger.params, res, next);
	}catch(e){
		logger.error(e.stack);
	}
};
