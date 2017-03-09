'use strict';
var logger = require('../../logger.js').logger('normal');
var fs = require('fs');
var path = require('path');

exports.getReport = function(args, res, next) {
	var uuid = args.uuid; //work?

	res.setHeader("Content-Type","text/html;charset='utf-8'");


	var hasReport = (function(){
		var end2endReportPath = 'asset/static/report_${uuid}/end2end_report.html';
		var coverageReportPath = 'asset/static/report_${uuid}/coverage/lcov-report/index.html';

		if(fs.existsSync(end2endReportPath) && fs.existsSync(coverageReportPath)){
			return true;
		}
		return false;
	})();

	var htmlReport;
	if(hasReport){
		htmlReport = `asset/static/report.html?uuid=${uuid}`;
	}else{
		htmlReport = 'logs/all_${uuid}.log';
	}


	fs.readFile(htmlReport, "utf-8", function(err,data){ //work? send uuid to html page.
        if(err) {
       		console.log("index.html loading is failed :" + err);
        }
        else{
            res.end(data);
        }
    });	


	
} 
