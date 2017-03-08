'use strict';

var logger = require('../../logger.js').logger('normal');
var child = require('child_process');
var fs = require('fs');


// curl 10.102.170.127:8001/v1/ping
const SKIP_DOWNLOAD = true;
const SKIP_INSTALL = true;

exports.runTest = function(args, res, next) {
	//delete rfq-web.git folder if it exists.
	//download code.
	//run test.
	//return success or fail.
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

function install(){
	return new Promise(function(resolve, reject){
		if(SKIP_INSTALL){
			logger.info('Install is skipped.');
			resolve();
			return;
		}

		logger.info('logger out execSync result');

		var commands = [];
		commands.push('cd rfq-web.git');
		commands.push('npm install');
		var command = commands.join(' && ');

		var npm = child.exec(command);


		npm.stdout.on('data', function (data) { 
			logger.info('listen to stdout')  ;
			logger.info(data.toString());
		});

		npm.stderr.on('data', function (data) {   
			logger.info('listen to stderr')  ;
			logger.info(data.toString());
		});

		npm.on('close', function (code) { 
			logger.info("Finished with code " + code);
			resolve();
		});
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


		child.execSync(`rm -rf ${path}`, function (err) {
	        console.log(err);
	    });


		download(options, function(err, tarfile) {
			if (err) {
				logger.error(err.stack);
				reject();
			}
			logger.info(`Download source code successfully. branch: ${branch}`);
		})
	});
}

function test(){
	//run test.
	return new Promise(function(resolve, reject){
		logger.info('Start to run test');

		var commands = [];
		commands.push('cd rfq-web.git');

		//todo: modify it to test_windows.
		
		commands.push('cp -r ../asset/.selenium/* node_modules/web-component-tester/node_modules/wct-local/node_modules/selenium-standalone/.selenium')
		commands.push('gulp.cmd test'); 

		var command = commands.join(' && ');

		var testRunner = child.exec(command);


		testRunner.stdout.on('data', function (data) {   
			logger.info('test runner stdout');
			logger.info(data.toString());
		});

		testRunner.stderr.on('data', function (data) {   
			logger.info('test runner stderr');
			logger.info(data.toString());
		});

		testRunner.on('close', function (code) { 
			logger.info("Finished with code " + code);
			resolve();
		});

		

		//var testRunner = child.spawnSync('gulp test', [], {stdio:[0,1,2], env:env});	

		//console.log('============================ check env ============================');
		//console.log(process.env);


		//var env = process.env;
		//env.GOOS = 'linux';
		//env.GOARCH = 'amd64';

		//var testRunner = child.spawn('c/nodejs/gulp', ['-h'], {
			//env: env
		//});

		//var pwd = child.spawnSync('pwd');
		//console.log(pwd.stdout.toString());



		//var testRunner = child.spawnSync('gulp.cmd', ['test'], {env: env});


	})
	
}


