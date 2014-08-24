
//var http=require("http");
//var sys=require("util");
var url = require("url");
var path = require("path");
var common = require("./common/common");

/**
* 访问句柄
*/
exports.httpContext= function(req,res,callback){
	this.request=req;	
	this.response=res;
	this.url= url.parse(req.url,true);
	this.headers = req.headers;
	this.common = common;
	this.rootPath = common.config.rootPath || __dirname;//当前程序根路径

	this.host = function() {
		return this.headers['x-forwarded-host'] || this.headers.host;		
	}
	this.address = function() {
		return this.headers['x-forwarded-for'] || this.request.connection.remoteAddress;	
	}
	//当前根url
	this.rootUrl = 'http://' + this.host();

	//将会写回的html信息	
	this.content='';

	res.on('error',function(err){
		console.log(err);
		res.end();
	});

	this.cookie = function() {
		if(!this._cookie) {
			this._cookie = new common.cookie(req,res);//当前访问cookie
		}
		return this._cookie;
	}
	this.session = function(callback) {
		if(!this._session) {
			this._session = new common.session(this.cookie(),callback);
		}
		return this._session;		
	} 
	
	var resHeader={};
	/**
	* 写响应头
	*/
	this.writeHead= function(state,head){
		try
		{
			resHeader.state=state;
			if(head) {
				if(!resHeader.head) resHeader.head={};
				for(var k in head){
					resHeader.head[k] = head[k];
				}
			}	
			//this.response.writeHead(resHeader.state,resHeader.head);
		}
		catch(e){
			console.log(e);
		}
	};

	/**
	* 设置响应头信息
	*/
	this.setHeader= function(key,value){
		try
		{
			//this.response.setHeader(key,value);
			if(!resHeader.head) resHeader.head= {};
			resHeader.head[key]= value;
		}
		catch(e){}
	};

	/**
	* 重定向路径
	*/
	this.redirect= function(url){
		if(url && url[0] == '/') url = this.rootUrl + url;
		this.writeHead(302,{'Location':url});
		//this.appendScript('window.location="'+url+'"');
		this.end();
	};

	/**
	* 写客户端写入字符串
	*/
	this.write = function(content,encode){
		encode = encode || 'utf8';
		this.content += content;
	};

	/**
	* 向response末尾追加内容
	*/
	this.appendToEnd = function(content) {
		if(!this.endContent) this.endContent = '';
		this.endContent += content;
	}

	/**
	* 向页面末尾追加脚本
	*/
	this.appendScript = function(script) {
		this.appendToEnd('<script type="text/javascript">'+script+'</script>');
	}
	
	/**
	* 结束请求
	*/
	this.end = function(content){
		if(this.completed) return;//如果已经终结的不再重新执行
		//if(!resHeader.state) resHeader.state= 200;
		resHeader.head= resHeader.head || {};
		//resHeader.head["Server"]='JMNode/V2';		
		if(content) {
			if(typeof content == 'object') {
				content= JSON.stringify(content);
			}
			this.content += content;
		}
		if(this.canWriteCookie !== false && resHeader.state) {	
			var cookie = this.cookie();		
			if(cookie && cookie.cookies) {
				var cokhead = [];
				for(var k in cookie.cookies){
					cokhead.push(k+'=' + cookie.cookies[k]);
				}
				if(cokhead.length > 0)
				{
					this.setHeader('Set-Cookie',cokhead);		
				}
			}
			this.response.writeHead(resHeader.state,resHeader.head);	
		}

		if(this.content) {			
			if(this.content.toString) this.content= this.content.toString();			
			this.response.write(this.content);
		}
		if(this.endContent)	this.response.write(this.endContent);	
		this.response.end();
		//console.log(this.response);
		this.completed=true;
		
		if(callback) callback(this,null,'end');
	};

	this.error = function(status,err) {
		this.writeHead(404, { "Content-Type": "text/plain" });
        this.end(err.toString());
	}

	/**
	* 模板处理
	* 利用模板处理前端html和后台数据，并可根据母板生成html页面
	*/
	this.view= function(page,data,matser,callback) {
		var _this=this;
		//如果数据中没有设定根url,则写入根url
		if(!data) data= {};
		//console.log(this.headers);
		if(!data.rootUrl) data.rootUrl= this.rootUrl;
		data.version= '1.0'; 
		if(typeof matser === 'function') {
			callback = matser;
			matser = null;
		}  
        page = path.resolve(this.rootPath, page);
        var tmpl = new common.template.tmpl();        
        tmpl.on('data',function(html) {        	
			_this.writeHead(200,{'Content-Type':'text/html'});   			
			if(callback) callback(null,html);
			else {
				_this.end(html);
			}			
        });
        tmpl.on('error',function(err) {
        	_this.writeHead(424,{'Content-Type':'text/plain'});   
				if(callback) callback(err);
				else {
					_this.end(err);
				}
        });
        tmpl.view(page, data, matser);
        /*
		html = common.template.tmpl(page, data, matser,function (err,content) {
			//console.log('tmpl complete');
			if(err) {
				_this.writeHead(424,{'Content-Type':'text/plain'});   
				if(callback) callback(err);
				else{
					_this.end(err.toString());
				}
			}
			else {	
				_this.writeHead(200,{'Content-Type':'text/html'});   			
				if(callback) callback(null,content);
				else{
					_this.end(content);
				}
			}
        });	*/ 
	}
	/*
	var _res_end=res.end;
	res.end=function(content){
	try{
		header.head = header.head || {};
		if(header.state == 200){
			var cokhead = [];
			for(var k in cookie.cookies){
				cokhead.push(k+'='+cookie.cookies[k]);
			}
			header.head['Set-Cookie']=cokhead;
		}
		
		if(header.state){ 
			_res_writeHead.call(res,header.state,header.head);
		}
		
		if(content){		
			return _res_end.call(res,content);			
		}
		else {		
			return _res_end.call(res);
		}		
	}
	catch(e){
		console.log(e);
		_res_end.call(res,e.toString());
	}
	}*/
}