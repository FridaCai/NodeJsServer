'use strict';

var Upload = require('./UploadService');
var logger = require('../../logger.js').logger('normal');

module.exports.upload = function upload (req, res, next) {
	try{
		Upload.upload(req.swagger.params, res, next);
	}catch(e){
		logger.error(e.stack);
	}
};
