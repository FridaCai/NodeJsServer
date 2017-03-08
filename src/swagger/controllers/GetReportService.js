'use strict';
var logger = require('../../logger.js').logger('normal');
var fs = require('fs');
var path = require('path');

exports.getReport = function(args, res, next) {
	res.setHeader("Content-Type","text/html;charset='utf-8'");

	fs.readFile("asset/static/report.html","utf-8", function(err,data){
        if(err) {
       		console.log("index.html loading is failed :" + err);
        }
        else{
            res.end(data);
        }
    });
} 
