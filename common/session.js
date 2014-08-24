/*****************************************************************************
Copyright: Tencent
Description: web后台 session模块
Author: fefeding
Version: 1.0
Date: 2012/12/19
*****************************************************************************/
var common = require('./common.js');

var session_cache={};
var session_interval;
function sesstion_tick() {
	var cachetmp = {};
	for(var id in session_cache) {
		var ses = session_cache[id];
		//if(ses) console.log(common.date.format(ses.expired,'yyyy-MM-dd HH:mm:ss'));
		if(ses && ses.expired < new Date()) {	
			try {
				if(ses.callback && typeof ses.callback == 'function') {
					ses.callback('timeout',ses);//执行回调
				}	
			}
			finally {
				session_cache[id] = null;//过期
			}
		}
		else {
			cachetmp[id] = session_cache[id];
		}
	}
	session_cache = cachetmp;	
	session_interval = setTimeout(sesstion_tick,5000);
	//session_interval = false
}

/**
* session会话
*/
var session = function(cookie,callback) {
	if(!session_interval) {
		//session_interval = true;
		//定时检查session
		session_interval = setTimeout(sesstion_tick,5000);
		//sesstion_tick();
	}
	
	//从cookie中获取关联的sessionid
	this.id = cookie.get('session_id');
	if(!this.id) {
	//如果cookie中不存在sessionid..则回写一个
		this.id = (Math.random() + (new Date()).getTime());
		cookie.set('session_id',this.id);	
		////回写cookie
		//ses.cookie  = cookie;
		//ses.flush	= ses.cookie.flush;
	}

	this.cache = session_cache[this.id] || (session_cache[this.id]={});
	
		//ses = (session_cache[session_id]={id:session_id});//实例化或获取已存在的session	
	
	//写session
	this.set = function(key,value) {			
		this.cache[key]= value;
	};
	//读session
	this.get = function(key) {
		return this.cache?this.cache[key]:null;
	};	

	/**
	* 清除当前session
	*/
	this.clear = function() {			
		if(this.cache) this.cache= session_cache[this.id]={};
	};
		
	
	var now = new Date();
	var mils = Date.parse(now) + common.config.sessionTimeout * 60000;	
	this.cache.expired = new Date(mils);//设定过期时间往后延20分钟	
	if(callback) {
		this.cache.callback = callback;
	}
}

exports.session = session;