'use strict';

var logger = require('../../logger.js').logger('normal');
var child = require('child_process');
var fs = require('fs');


const SKIP_DOWNLOAD = true;


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
			}, function(e){throw e;}).catch(function(e){throw e;});
		}, function(e){throw e;}).catch(function(e){throw e;})
	}, function(e){throw e;}).catch(function(e){console.log(e);})
}

function install(){
	return new Promise(function(resolve, reject){
		var commands = [];
		commands.push('cd rfq-web.git');
		commands.push('npm install --save-dev moment');
		var command = commands.join(' && ');

		var npm = child.execSync(command).toString();
		console.log(npm);

		resolve();


		/*try{
			var npm = require('npm');	 //config in node_path . work?
		}catch(e){
			debugger;
		}
		npm.load(function(err) {
		  logger.error(err);
		  npm.commands.install(['moment'], function(er, data) { //test moment.
		    if(er){
		    	logger.error(er)
		    }
		  });

		  npm.on('log', function(message) {
		    // log installation progress
		    console.log(message);
		  });
		});*/
	});
		


	//var npm = require('npm');
	//console.log(npm);


/*
			var npm = require('npm');
			npm.load(function(err) {
			  // handle errors

			  // install module ffi
			  npm.commands.install(['ffi'], function(er, data) {
			    // log errors or data
			  });

			  npm.on('log', function(message) {
			    // log installation progress
			    console.log(message);
			  });
			});
*/
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

		var commands = [];
		commands.push('cd rfq-web.git');
		commands.push('pwd');
		command.push('gulp.cmd test');

		var command = commands.join(' && ');

		require('child_process').exec(command, function (error, stdout, stderr) {
			console.log(error);
			console.log(stdout);
			console.log(stderr);
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


		/*testRunner.stdout.on('data', function (data) {   
			console.log(data.toString());
			logger.info(data.toString());
		});

		testRunner.stderr.on('data', function (data) {   
			console.log(data.toString());
			logger.info(data.toString());
		});

		testRunner.on('close', function (code) { 
			console.log("Finished with code " + code);
			logger.info("Finished with code " + code);
		});*/
	})
	
}


