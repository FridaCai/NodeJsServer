'use strict';
var logger = require('../../logger.js').logger('normal');
exports.pingGet = function(args, res, next) {
	logger.info('I am alive.');
	res.end(JSON.stringify({
	  errCode: -1,
	  msg: 'I am alive'
	}));
} 
