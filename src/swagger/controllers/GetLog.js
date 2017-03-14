'use strict';

var GetLog = require('./GetLogService');
var logger = require('../../logger.js').logger('normal');

module.exports.getLog = function getLog (req, res, next) {
	try{
		GetLog.getLog(req.swagger.params, res, next);
	}catch(e){
		logger.error(e.stack);
	}
};
