'use strict';

var logger = require('../../logger.js').logger('normal');
var child = require('child_process');
var fs = require('fs');


// curl 10.102.170.127:8001/v1/ping
const SKIP_DOWNLOAD = false;
const SKIP_INSTALL = false;

const SELENIUM_FOLDER_SRC = '../asset/.selenium/*';
const SELENIUM_FOLDER_DES = 'node_modules/web-component-tester/node_modules/wct-local/node_modules/selenium-standalone/.selenium';

exports.runTest = function(args, res, next) {
	download().then(function(){
		install().then(function(){
			test().then(function(){
				res.setHeader('Content-Type', 'application/json;charset=UTF-8');
				res.end(JSON.stringify({
				  errCode: -1
				}));
			}, function(e){throw new Error('in reject');}).catch(function(e){throw e;});
		}, function(e){throw new Error('in reject');}).catch(function(e){throw e;})
	}, function(e){throw new Error('in reject');}).catch(function(e){console.log(e);})
}

function _runCommand(commands, resolve, reject){
	var command = commands.join(' && ');

	var exec = child.exec(command);


	exec.stdout.on('data', function (data) { 
		logger.info(data.toString());
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
		if(SKIP_INSTALL){
			logger.info('Install is skipped.');
			resolve();
			return;
		}

		logger.info('Start to Install.');
		var commands = [
			'cd rfq-web.git',
			'npm install'
		];
		_runCommand(commands, resolve, reject);
	});
}

function download(){
	var branch = 'feature/UnitTests_unmature';
	var path = 'rfq-web.git';

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

		
		logger.info("Clear folder.");
		child.execSync(`rm -rf ${path}`, function (err) {
	        logger.error(err.stack);
	    });


		logger.info("Start to download repository.");
		download(options, function(err, tarfile) {
			if (err) {
				logger.error(err.stack);
				reject();
			}
			logger.info(`Download source code successfully. branch: ${branch}`);
			resolve();
		})
	});
}

function test(){
	//run test.
	return new Promise(function(resolve, reject){
		logger.info('Start to run test');

		var commands = [
			'cd rfq-web.git',
			`cp -r ${SELENIUM_FOLDER_SRC} ${SELENIUM_FOLDER_DES}`,
			'gulp test' //todo: modify it to test_windows.
		];

		_runCommand(commands, resolve, reject);
	})
	
}
