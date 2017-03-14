'use strict';
var schedule = require('node-schedule');
var logger = require('./logger').logger('normal');
var util = require('./util');

//worry about logger.
module.exports = {
  run: function(){
      var j = schedule.scheduleJob('5 * * * * *', function(){
        try{
          //var commands = ['find ./ -maxdepth 1 -type d -mtime +7 | rm -rf *'];
          var commands = ['find ./codebase/* -name "rfq-web.git*" -maxdepth 1 -type d -mmin +1 | rm -rf *'];
          util.runCommand(commands);
          logger.info('Clear work...');
        }catch(e){
          logger.error('Clear work fail');
          logger.error(e.stack);
        }
      });
  }
}
  