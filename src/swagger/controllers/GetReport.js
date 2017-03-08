'use strict';

var GetReport = require('./GetReportService');
var logger = require('../../logger.js').logger('normal');

module.exports.getReport = function getReport (req, res, next) {
	try{
		GetReport.getReport(req.swagger.params, res, next);
	}catch(e){
		logger.error(e.stack);
	}
};
