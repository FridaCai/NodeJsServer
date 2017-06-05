'use strict';

var log4js = require('log4js');
var child = require('child_process');
var fs = require('fs');
var path = require('path');
var util = require('../../util');

const REPO = 'ssh://git@cedt-icg-bitbucketcli.nam.nsroot.net:7999/rfq/rfq-web.git';
const DEFAULT_BRANCH = 'release/release7';
const SKIP_DOWNLOAD = false;
const SKIP_TEST = false;

var uuid;
var branch;
var logger;

exports.runTest = function(args, res, next) {
	uuid = require('uuid/v1')().replace(/-/g, '');

	branch = args.branch.value || DEFAULT_BRANCH;

	log4js.loadAppender('file');
	log4js.addAppender(log4js.appenders.file(`logs/all_${uuid}.log`), `log_${uuid}`);
	logger = log4js.getLogger(`log_${uuid}`);


	res.setHeader('Content-Type', 'application/json;charset=UTF-8');
	res.end(JSON.stringify({
		testService: {
			report: `http://${res.req.headers.host}/v1/getReport/${uuid}`,
			log: `http://${res.req.headers.host}/v1/getLog/${uuid}`,
		},
		sonarService: {
			report: `http://sd-d38a-3c1a:9000`,
		},
		errCode: -1
	}));	


	download().then(function(){
		copyNodeModules();
		test().then(function(){

			setTimeout(function(){
				generateReport();
				runScanner();
			}, 5000);
		});
	}, function(e){throw new Error('in reject');}).catch(function(e){logger.error(e.stack);})
}

function generateReport(){
	logger.info('Start to convert report.');

	try{
		var istanbul = require('istanbul');
		var collector = new istanbul.Collector();
		var Report = istanbul.Report;
		var SonarReport = require('./sonar_reporter.js');
		Report.register(SonarReport);

		var path = `codebase/rfq-web.git_${uuid}/coverage/coverage-final.json`;
		var jsonReport = fs.readFileSync(path).toString();
		var coverage = JSON.parse(jsonReport);

		collector.add(coverage);

		var dir = `codebase/rfq-web.git_${uuid}/`;
		var sonarReport = new SonarReport({dir: dir});
		sonarReport.writeReport(collector, true);
	}catch(e){
		logger.error('fail to convert sonar coverage report.');
		logger.error(e.stack);
	}
}

function runScanner(){
	logger.info('Start to run scanner.');

	var path = require('path').join(process.cwd(), `codebase/rfq-web.git_${uuid}`);

	const spawnSync = child.spawnSync;
	const bat = spawnSync('cmd.exe', [
		'/c', 
		'sonar-scanner.bat'
	],{
		cwd: path
	});

	if(bat.stdout){
		logger.info(bat.stdout.toString());	
	}


	if(bat.stderr){
		logger.error(bat.stderr.toString());	
	}


	if(bat.status != 0){
		logger.info('Run scanner fail.');
	}else{
		logger.info('Run scanner successfully.');	
	}
	
}

function copyNodeModules(){
	const NODE_MODULES_PATH_SRC = 'asset/node_modules';
	const NODE_MODULES_PATH_DESC = `codebase/rfq-web.git_${uuid}`;

	var commands = [
		`cp -r ${NODE_MODULES_PATH_SRC} ${NODE_MODULES_PATH_DESC}`
	];

	child.execSync(commands, function (err) {logger.error(err.stack)});

}
function download(){
	var path = `codebase/rfq-web.git_${uuid}`;

	var options = {
	  // Remote source location (no github sources)
	  source: REPO,
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
		if(SKIP_TEST){
			logger.info('Test is skipped.');
			resolve();
			return;	
		}
		
		var commands = [
			`cd codebase/rfq-web.git_${uuid}`,
			`rm -rf coverage/*`,
			`wct`
		];
		
		try{
			util.setLogger(logger);
			var result = util.runCommand(commands, function(){
				logger.info('Run test successfully');
				resolve();
			}, reject);
			//logger.info(result);
		}catch(e){
			logger.error(e.stack);
		}
		
	})
}
