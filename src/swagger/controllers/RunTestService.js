'use strict';


var log4js = require('log4js');


var child = require('child_process');
var fs = require('fs');
var path = require('path');

// curl 10.102.170.127:8001/v1/ping
const SKIP_DOWNLOAD = false;
const SKIP_INSTALL = false;

const SELENIUM_FOLDER_SRC = '../../asset/.selenium/*';
const SELENIUM_FOLDER_DES = 'node_modules/web-component-tester/node_modules/wct-local/node_modules/selenium-standalone/.selenium';



const DEFAULT_BRANCH = 'feature/UnitTests_unmature';

const SITE_ROOT = 'http://10.102.170.127:8002/v1/getReport'; //can we get it automatically?

var uuid;
var logger;

exports.runTest = function(args, res, next) {
	uuid = require('uuid/v1')().replace(/-/g, ''); //mkdir fail with - contained in folder name.


	log4js.loadAppender('file');
	log4js.addAppender(log4js.appenders.file(`logs/all_${uuid}.log`), `log_${uuid}`);
	logger = log4js.getLogger(`log_${uuid}`);


	res.setHeader('Content-Type', 'application/json;charset=UTF-8');
	res.end(JSON.stringify({
	  errCode: -1,
	  data: {
	  	reportUrl: `${SITE_ROOT}/${uuid}`
	  }
	}));	


	//clearReport();
	download().then(function(){
		install().then(function(){
			test().then(function(endtoendTestReport){
				copyReport(endtoendTestReport);

				

			}, function(e){throw new Error('in reject');}).catch(function(e){throw e;})
		}, function(e){throw new Error('in reject');}).catch(function(e){throw e;})
	}, function(e){throw new Error('in reject');}).catch(function(e){console.log(e);})
}

function install_localcopy(){
	return new Promise(function(resolve, reject){
		logger.info('Start Local Resource');

		const INSTALL_PATH_SRC = 'asset/node_modules';
		const INSTALL_PATH_DES = `codebase/rfq-web.git_${uuid}`;

		var result;
		try{
			result = child.execSync(
				`cp -r ${INSTALL_PATH_SRC} ${INSTALL_PATH_DES}`,
				function(err){logger.error(err.stack);}
			)	
			logger.info(result);
		}catch(e){
			logger.error(e.stack);
		}
		
		logger.info('Copy Local Resource successfully');

		resolve();
	})
	
}

function clearReport(){
	var reportPath = `${REPORT_PATH_DES}/*`;

	//todo: 
	child.execSync(`rm -rf ${reportPath}`, function (err) {
    	logger.error(err.stack);
    });
}

function copyReport(endtoendTestReport){
	const REPORT_PATH_SRC = `codebase/rfq-web.git_${uuid}/coverage`;
	const REPORT_PATH_DES = `asset/static/report_${uuid}`;

	fs.mkdir(REPORT_PATH_DES);

	var commands = [
		`cp -r ${REPORT_PATH_SRC} ${REPORT_PATH_DES}`
	];

	child.execSync(commands, function (err) {logger.error(err.stack)});

	(function generateEnd2EndReport(){
		var filename = `${REPORT_PATH_DES}/end2end_report.html`;
		fs.writeFile(filename, endtoendTestReport, (err) => {
		  if(err){
		  	logger.error(err.stack);
		  }
		});
	})()
}

function _runCommand(commands, resolve, reject, stdoutCallback){
	var command = commands.join(' && ');
	var exec = child.exec(command);

	exec.stdout.on('data', function (data) { 
		var log = data.toString();
		logger.info(log);
		stdoutCallback && stdoutCallback(log);
	});

	exec.stderr.on('data', function (data) {   
		logger.info(data.toString());
	});

	exec.on('close', function (code) { 
		if(code){ //not 0
			reject('exist code is not 0');
		}else{
			resolve();
		}
	});
}

function install(){
	return new Promise(function(resolve, reject){
		//no need to install. use global wct.
		resolve();
		return;

		if(SKIP_INSTALL){
			logger.info('Install is skipped.');
			resolve();
			return;
		}

		logger.info('Start to Install.');
		var commands = [
			`cd codebase/rfq-web.git_${uuid}`,
			'npm install web-component-tester@4.3.1',
			'npm install web-component-tester-istanbul@0.10.0'
		];
		_runCommand(commands, resolve, reject);
	});
}

function download(){
	var branch = DEFAULT_BRANCH;
	var path = 'codebase/rfq-web.git_' + uuid;

	var options = {
	  // Remote source location (no github sources)
	  source: 'ssh://git@cedt-icg-bitbucketcli.nam.nsroot.net:7999/rfq/rfq-web.git',
	  // Destination for exploded files from downloaded tar file
	  dest: path,
	  // Branch and folder path to include, such as 'master:lib'
	  branch: branch,
	  // Location to save tarfile, defaults to /tmp if not specified
	  tarfile: 'tmp.tar'
	};

	var download = require('git-download');
	return new Promise(function(resolve, reject){
		if(SKIP_DOWNLOAD){
			logger.info('Download is skipped.');
			resolve();
			return;
		}
		
		/*logger.info("Clear folder.");
		child.execSync(`rm -rf ${path}`, function (err) {
	        logger.error(err.stack);
	    });*/





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
	var endtoendTestReport = '';

	return new Promise(function(resolve, reject){
		logger.info('Start to run test');
		var commands = [
			`cd codebase/rfq-web.git_${uuid}`,
			`cp -r ${SELENIUM_FOLDER_SRC} ${SELENIUM_FOLDER_DES}`, //copy the whold node modules since npm install is too slow.
			'wct' //todo: modify it to test_windows.
		];

		function stdoutCallback(data){
			if(data.indexOf('✖') != -1 || data.indexOf('✓') != -1){
				endtoendTestReport = endtoendTestReport + data + '\n';
			}
		}

		_runCommand(commands, function(){
			resolve(endtoendTestReport);
		}, reject, stdoutCallback);
	})
}
