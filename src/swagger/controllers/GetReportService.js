'use strict';
var logger = require('../../logger.js').logger('normal');
var fs = require('fs');
var path = require('path');

exports.getReport = function(args, res, next){
	var uuid = args.uuid.value;
	var report = `/rfq-web.git_${uuid}/coverage/lcov-report/index.html`;
	var checkPath = path.resolve('') + `/codebase` + report;

	if(fs.existsSync(checkPath)){
		res.redirect(report);
	}else{
		var log = path.resolve('') + `/logs/all_${uuid}.log`;
	    res.sendFile(log);
	}
}
