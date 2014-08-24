/*****************************************************************************
Copyright: Tencent
Description: http请求模块，主要用于登录获取公司webservice用户信息
Author: fefeding
Version: 1.0
Date: 2012/12/19
*****************************************************************************/

var http=require('http');

/**
* http请求方法
* 比如请求webservice
* 例子：option = {
      host: 'www.jm47.com',
      port: '80',
      path: '/services/recontent.asmx',
      method: 'POST',
      headers: {
          'Content-Type': 'application/soap+xml; charset=utf-8',
          'Content-Length': requestData.length,
          'SOAPAction':'http://tempuri.org/SearchRecontent'
      }
  };
  data = '<?xml version="1.0" encoding="utf-8"?>'+
'<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">'+
  '<soap12:Body>'+
    '<SearchRecontent xmlns="http://tempuri.org/">'+
     ' <count>10</count>'+
    '</SearchRecontent>'+
  '</soap12:Body>'+
'</soap12:Envelope>';
回调函数第一个参数为异常信息，如果为空表求没有异常
 callback=function(err,data){}
*/
exports.request= function (option,data,callback,ecnoding) {
		ecnoding=ecnoding ||'utf8';
		//写入请求串长度
		if(option && option.headers && !option.headers['Content-Length'] && typeof data === 'string'){
			option.headers['Content-Length']=data.length;
		}
		//console.log('request:' + data);
		var req=http.request(option,function(res) {			
			//console.log('STATUS: ' + res.statusCode);
			//console.log('HEADERS: ' + JSON.stringify(res.headers));

			if(res){
				res.setEncoding(ecnoding);
				//收集返回值
				var result='';
				res.on('data', function (chunk) {			
					result += chunk;
				});
				res.on('end',function(){
					if(callback) callback(null,result);
				});
				res.on('error',function(err){
					if(callback)callback(err);
				});	
			}
		});
		req.on('error',function(err){
			if(callback) callback(err);
		});
		req.write(data);
		req.end();
	}