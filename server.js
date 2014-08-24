
var http=require("http");
var querystring =require('querystring');
var common = require("./common/common");
var httpcontext=require('./httpcontext.js');

/**
* 服务启动入口
*/
function start(router,port,routeCallback,sessionCallback) {
    /**
    * 请求响应函数
    */
	function onRequest(request,response) {	
		
			try {
				var context = new httpcontext.httpContext(request,response,routeCallback);
		        context.setHeader("Server",'JMNode/V2');
		        context.request.setEncoding('utf8');
		        context.session(sessionCallback);//初始化session
				context.requestContent = '';
				//接收数据
				context.request.on('data',function(chunk) {
					context.requestContent += chunk;
				});
				//接收完成
				context.request.on('end',function() {					
					context.data = querystring.parse(context.requestContent);
					router.route(context,routeCallback);
				});
			}
			catch(e) {
			   // var str = sys.inspect(e, true, null);
			    context.response.writeHead(404, { "Content-Type": "text/plain" });	
				console.log(e);			
			    context.sresponse.end(e);
			}
		  
	}

    //启动服务
	var server = http.createServer(onRequest);
	server.on('error', function (err) {
		if(err) {
			common.logger.error(err.toString());
	    	console.log('server-error',err);	 
		}		  
	});
	
	process.env.PORT = port;
	server.listen(port);
	console.log("server started." + port);
}

exports.start = start;
exports.setRoot = function(root) {
	common.config.rootPath = root;
}

