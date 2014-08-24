/*****************************************************************************
Copyright: Tencent
Description: io操作和静态文件访问逻辑模块
Author: fefeding
Version: 1.0
Date: 2012/12/19
*****************************************************************************/

var path = require("path");
var fs = require("fs");
var zlib = require("zlib");
var config = require("./config").config;

/**
* 静态资源处理
* 通过http协义304状态码处一静态文件缓存，加快网页浏览
*/
function downloadStaticSource(context,file,ext,tp) {
	fs.stat(file,function(err,stat) {
		var lastModified= stat.mtime.toUTCString();					
    	context.response.setHeader("Last-Modified", lastModified);
    	var expires= new Date();
        expires.setTime(expires.getTime() + 1200 * 1000);//缓存20分钟
        context.response.setHeader("Expires", expires.toUTCString());
        context.response.setHeader("Cache-Control", "max-age=" + 1200);
        var IfModifiedSince= "If-Modified-Since".toLowerCase();
        //如果浏览器缓存时间与当前最后修改日期相同，则直接返回没有修改信息。采用缓存数据
        if (context.headers[IfModifiedSince] && lastModified == context.headers[IfModifiedSince]) {
            context.response.writeHead(304, "Not Modified");
            context.end();
    	}
    	else {						
			var fstream = fs.createReadStream(file); 				
			fstream.on("error",function(err){
				console.log('获取文件出错:' + file);		
				console.log(err);				
				context.end();
			});
			fstream.on("end", function () {
				context.end();
			});		

			//如果文件是可压缩类型
			if(config.textMime[ext]){
				//获取浏览器支持的压缩类型
				var acceptEncoding= context.headers['accept-encoding'] || "";	                    	

                if (acceptEncoding.match(/\bgzip\b/)) {
                    context.response.writeHead(200, { "Content-Type": tp,'Content-Encoding':'gzip' });
                    fstream.pipe(zlib.createGzip()).pipe(context.response);
                    return;
                } 
                else if (acceptEncoding.match(/\bdeflate\b/)) {		                        
                    context.response.writeHead(200, { "Content-Type": tp ,'Content-Encoding': 'deflate'});
                    fstream.pipe(zlib.createDeflate()).pipe(context.response);
                    return;
                }	
            }	
            context.response.writeHead(200, { "Content-Type": tp });
			fstream.pipe(context.response);
        }
	});		
}

/**
* 下载二进制文件
*/
var downloadFile = function (context, file) {    
	context.canWriteCookie = false; 
    var ext = (path.extname(file) || '.*').toLowerCase();
    var tp = config.streamMime[ext] || "application/octet-stream";   
	file = path.resolve(context.rootPath, file);
	fs.exists(file, function (exists) {
		//console.log("file:" + file + " exists " + exists.toString());
		if (exists) {
			downloadStaticSource(context,file,ext,tp);
		}
		else {				
			context.writeHead(404, { "Content-Type": tp});
			context.end();
		}
	});	
}

/**
* 读取文件文本内容
*/
var readContent = function(file,callback) {
	file = path.normalize(path.resolve(config.rootPath ,file));
	
	//如果有回调，则异步读取
	if(callback) {
		fs.readFile(file,'utf8',callback);
	}
	//如果没有回调，则同步返回内容
	else {
		return fs.readFileSync(file,'utf8');
	}
}

/**
* 向文件写入内容
*/
var writeFile = function(file,content,option,callback) {
	if(typeof option == 'function') {
		callback = option;
		option = null;
	}
	file = path.resolve(config.rootPath, file);
	file = path.normalize(file);	
	var fw = fs.createWriteStream(file, option);
	fw.on('open',function(fd){
		fw.write(content);
		fw.end();
	});
	
	fw.on('error',function(err) {
		fw.end();
		if(callback) callback(err);
	});
	fw.on('close', function () {
		if(callback) callback();               
	});
}

/**
* 向文件追加内容
*/
var appendContent = function(file,content,callback) {	
	writeFile(file,content,{ flags: 'a', encoding: 'utf-8', mode: 0666 },callback);
}

exports.download 		= downloadFile;
exports.readContent 	= readContent;
exports.appendContent 	= appendContent;
exports.write 			= writeFile;
