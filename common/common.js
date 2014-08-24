/*****************************************************************************
Copyright: Tencent
Description: 基础操作库
Author: fefeding
Version: 1.0
Date: 2012/12/19
*****************************************************************************/


exports.template 	= require('./template.js');
exports.logger 		= require('./logger.js').logger;
exports.date 		= require('./date.js');
exports.io 			= require('./io.js');
try {
	exports.config 	= require('./config_runtime.js').config;
}
catch(e) {
	exports.config 	= require('./config.js').config;
}
//exports.mysql 		= require('./mysql').client;
exports.cookie 		= require('./cookie').cookie;
exports.session 	= require('./session').session;

exports.webservice 	= require('./webservice');

/**
* 生成唯一ID
*/
exports.guid = function() {
	var gid = (Math.random() + (new Date()).getTime()).toString();
	return gid;
}