'use strict';
var schedule = require('node-schedule');
var logger = require('./logger').logger('normal');
var util = require('./util');

//worry about logger.
module.exports = {
  run: function(){
      var j = schedule.scheduleJob('* * 22 * * 2', function(){
        try{
          var commands = [
            `find codebase/* -maxdepth 1 -name "rfq-web.git*"  -type d -mtime +7 -exec sh -c "rm -rf '{}'" \;`
          ];

          util.runCommand(commands);
          logger.info('Clear work...');
        }catch(e){
          logger.error('Clear work fail');
          logger.error(e.stack);
        }
      });
  }
}
module.exports.run();