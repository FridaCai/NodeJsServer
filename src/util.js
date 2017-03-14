var child = require('child_process');

exports.runCommand = function(commands, resolve, reject, stdoutCallback) {
	var logger = require('./logger').logger('normal');
	var command = commands.join(' && ');

	try{
		var exec = child.exec(command, {}, function(err, stdout, stderr){
			err && logger.error(`runcmd_err: ${err.stack}` );
			logger.info(`runcmd_stdout: ${stdout.toString()}`);
			logger.info(`runcmd_stderr: ${stderr.toString()}`);
		});	
		logger.info(exec);

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
				logger.error('exist code is not 0');
				reject && reject('exist code is not 0');
			}else{
				logger.info('exist code is 0');
				resolve && resolve();
			}
		});
	}catch(e){
		logger.error(e.stack);
	}
}