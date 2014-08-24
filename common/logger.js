/*****************************************************************************
Copyright: Tencent
Description: 日志操作
Author: fefeding
Version: 1.0
Date: 2012/12/19
*****************************************************************************/


var fs=require('fs');
var path=require('path');
var common = require('./common.js');

var logger= {
	getLogFilename:function() {
		var now=new Date();
		return common.date.format(now,'yyyyMMdd') + '.log';
	},	
	/**
	* 写调试日志
	*/
	debug:function(content) {
		var dir = path.resolve(common.config.rootPath,'log/debug');		
		fs.exists(dir,function(exists) {
			if(!exists) {
				 fs.mkdir(dir,function(err) {
					if(err) console.log(err);
					else {
						writeLog('log/debug',content);
					}
				});
			}
			else {
				writeLog('log/debug',content);
			}
		});
		
	},
	/**
	* 写出错日志信息
	*/
	error:function(content) {
		var dir = path.resolve(common.config.rootPath,'log/error');
		fs.exists(dir,function(exists) {
			if(!exists) {
				fs.mkdir(dir,function(err) {
					if(err) console.log(err);
					else {
						writeLog('log/error',content);
					}
				});	
			}
			else {
				writeLog('log/error',content);
			}		
		});
	}
};

function writeLog(dir,content) {
	var logfile=dir + "/" + logger.getLogFilename();		
	var now=new Date();
	if(typeof content == 'object') {
		content= JSON.stringify(content);
	}
	console.log(content);
	content="\r\n[" + common.date.format(now,'HH:mm:ss') + "]" + content;			
	common.io.appendContent(logfile,content);
}
exports.logger=logger;