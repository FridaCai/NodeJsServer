'use strict';

var log4js = require('log4js');
var child = require('child_process');
var fs = require('fs');
var path = require('path');
var util = require('../../util');

const DEFAULT_BRANCH = 'release/release7';
const SKIP_DOWNLOAD = false;

var uuid;
var logger;

exports.runTest = function(args, res, next) {
	uuid = require('uuid/v1')().replace(/-/g, ''); 
	var branch = args.branch.value;

	log4js.loadAppender('file');
	log4js.addAppender(log4js.appenders.file(`logs/all_${uuid}.log`), `log_${uuid}`);
	logger = log4js.getLogger(`log_${uuid}`);

	res.setHeader('Content-Type', 'application/json;charset=UTF-8');
	res.end(JSON.stringify({
	  url: `http://${res.req.headers.host}/v1/getReport/${uuid}`
	}));	


	download(branch).then(function(){
		copyNodeModules();
		test();
	}, function(e){throw new Error('in reject');}).catch(function(e){console.log(e);})
}
function copyNodeModules(){
	const NODE_MODULES_PATH_SRC = 'asset/node_modules';
	const NODE_MODULES_PATH_DESC = `codebase/rfq-web.git_${uuid}`;


	var commands = [
		`cp -r ${NODE_MODULES_PATH_SRC} ${NODE_MODULES_PATH_DESC}`
	];

	child.execSync(commands, function (err) {logger.error(err.stack)});

}
function download(_branch){
	var branch = _branch || DEFAULT_BRANCH ;
	var path = `codebase/rfq-web.git_${uuid}`;

	var options = {
	  // Remote source location (no github sources)
	  source: 'ssh://git@cedt-icg-bitbucketcli.nam.nsroot.net:7999/rfq/rfq-web.git',
	  // Destination for exploded files from downloaded tar file
	  dest: path,
	  // Branch and folder path to include, such as 'master:lib'
	  branch: branch,
	  // Location to save tarfile, defaults to /tmp if not specified
	  tarfile: `tmp_${uuid}.tar`
	};

	var download = require('git-download');
	return new Promise(function(resolve, reject){
		if(SKIP_DOWNLOAD){
			logger.info('Download is skipped.');
			resolve();
			return;
		}
		
		logger.info("Start to download repository.");
		try{
			download(options, function(err, tarfile) {
				if (err) {
					logger.error(err.stack);
					reject();
				}
				logger.info(`Download source code successfully. branch: ${branch}`);
				resolve();
			})	
		}catch(e){
			reject(e.stack);
		}
	});
}

function test(){
	return new Promise(function(resolve, reject){
		logger.info('Start to run test');
		var commands = [
			`cd codebase/rfq-web.git_${uuid}`,
			`rm -rf coverage/*`,
			'wct'
		];
		
		try{
			util.setLogger(logger);
			var result = util.runCommand(commands, function(){
				logger.info('Run test successfully');
			}, reject);
			logger.info(result);
		}catch(e){
			logger.error(e.stack);
		}
		
	})
}
