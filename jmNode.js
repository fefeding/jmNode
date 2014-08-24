var util = require('util');
var EventEmitter = require('events').EventEmitter;
var common = require("./common/common");
var server = require('./server.js');
var router = require('./router.js').router;

var jm = function(root) {
	EventEmitter.call(this);
	this.router = router;
	this.config = common.config;
	this.root = root;
	this.start = function(port,routeCallback) {
		this.config.rootPath = this.root;	
		var _this = this;	
		if(!routeCallback) {			
			routeCallback = function(context,err,arg) {				
				_this.emit('route',context,err,arg);
			};
		}
		server.start(router,port,routeCallback,function(name,session) {
			if(name == 'timeout') {
				_this.emit('session_timeout',session);
			}			
		});
	}
}
util.inherits(jm,EventEmitter);

exports.create = function(root) {
	var jmnode = new jm(root);
	return jmnode;
}