'use strict';
var logger = require('../../logger.js').logger('normal');
var fs = require('fs');
var path = require('path');

exports.getLog = function(args, res, next){
	var uuid = args.uuid.value;
	var log = path.resolve('') + `/logs/all_${uuid}.log`;
    res.sendFile(log);
}
