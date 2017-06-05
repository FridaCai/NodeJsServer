// 'use strict';
// var logger = require('../../logger.js').logger('normal');

// var fs = require('fs');
// var request = require('request');
// var path = require('path');
// var AdmZip = require('adm-zip');

// exports.upload = function(args, res, next){
// 	var uuid = args.uuid.value;
// 	//var uuid = '827fa780145111e7881947bcab915998';

// 	this.uploadUtil(uuid).then(function(){
// 		res.end(JSON.stringify({
// 		  errCode: -1,
// 		}));
// 	})
// }

// exports.uploadUtil = function(uuid, branch){
// 	return new Promise(function(resolve, reject){
// 		// var log = fs.createReadStream(`logs/all_${uuid}.log`);

// 		// var zip = new AdmZip();
// 		// zip.addLocalFolder(`codebase/rfq-web.git_${uuid}/coverage`);
// 		// zip.writeZip(`codebase/rfq-web.git_${uuid}/coverage/report.zip`);
// 		// var report = fs.createReadStream(`codebase/rfq-web.git_${uuid}/coverage/report.zip`);



// 		// var report = fs.createReadStream(`sonar_report/sonar-coverage.xml`);
// 		// var formData = {
// 		// 	uuid: uuid,
// 		// 	report: report,
// 		// 	branch: branch
// 		// }

// 		// var sonarService = global.sonarService;
// 		// var url = `${sonarService}/run`;
// 		// logger.info('Start to run sonar service');
// 		// var req = request.post({
// 		// 	url: url,
// 		// 	formData: formData	
// 		// }, function (e, resp, body) {
// 		//   if (e) {
// 		//     logger.error(e.stack);
// 		//     reject();
// 		//     logger.info('Fail to run sonar service');
// 		//     return;
// 		//   } 

// 		//   debugger;

// 		//   logger.info('Success to run sonar machine');
// 		//   resolve();
// 		// });
// 	})
		
// }