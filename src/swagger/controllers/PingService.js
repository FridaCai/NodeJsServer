'use strict';
var logger = require('../../logger.js').logger('normal');
exports.pingGet = function(args, res, next) {
	logger.info('hit! happy.');
} 
