'use strict';

var RunTest = require('./RunTestService');
var logger = require('../../logger.js').logger('normal');

module.exports.runTest = function runTest (req, res, next) {
	try{
		RunTest.runTest(req.swagger.params, res, next);
	}catch(e){
		logger.error(e.stack);
	}
};
