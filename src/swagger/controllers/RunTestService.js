'use strict';

var log4js = require('log4js');
var child = require('child_process');
var fs = require('fs');
var path = require('path');

const DEFAULT_BRANCH = 'release/release7';
const SKIP_DOWNLOAD = false;

var uuid;
var logger;

exports.runTest = function(args, res, next) {
	uuid = require('uuid/v1')().replace(/-/g, ''); 
	var branch = args.branchname.value;

	log4js.loadAppender('file');
	log4js.addAppender(log4js.appenders.file(`logs/all_${uuid}.log`), `log_${uuid}`);
	logger = log4js.getLogger(`log_${uuid}`);

	res.setHeader('Content-Type', 'application/json;charset=UTF-8');
	res.end(JSON.stringify({
	  url: `http://${res.req.headers.host}/v1/getReport/${uuid}`
	}));	


	download(branch).then(function(){
		test();
	}, function(e){throw new Error('in reject');}).catch(function(e){console.log(e);})
}

function _runCommand(commands, resolve, reject, stdoutCallback){
	var command = commands.join(' && ');

	try{
		var exec = child.exec(command, {}, function(err, stdout, stderr){
			err && logger.error(`runcmd_err: ${err.stack}` );
			logger.info(`runcmd_stdout: ${stdout.toString()}`);
			logger.info(`runcmd_stderr: ${stderr.toString()}`);
		});	
		logger.info(exec);
	}catch(e){
		logger.error(e.stack);
	}
	

	exec.stdout.on('data', function (data) { 
		var log = data.toString();
		logger.info(log);
		stdoutCallback && stdoutCallback(log);
	});

	exec.stderr.on('data', function (data) {   
		logger.info(data.toString());
	});

	exec.on('close', function (code) { 
		if(code){ 
			logger.error('exist code is not 0')
			reject('exist code is not 0');
		}else{
			logger.info('exist code is 0');
			resolve();
		}
	});
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
			var result = _runCommand(commands, function(){
				logger.info('Run test successfully');
			}, reject);
			logger.info(result);
		}catch(e){
			logger.error(e.stack);
		}
		
	})
}
