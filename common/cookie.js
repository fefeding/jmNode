/*****************************************************************************
Copyright: Tencent
Description: cookie处理逻辑
Author: fefeding
Version: 1.0
Date: 2012/12/19
*****************************************************************************/

var querystring=require('querystring');

/**
* cookie读写
*/
var cookie=function(request,response){
	return{
		cookies:{},
		get:function(key){
			var coks=querystring.parse(request.headers.cookie,';');
			//console.log(coks);
			if(coks){
				for(var k in coks){
					if(k.trim() == key){
						return coks[k];
					}
				}
			}
			return coks[key];
		},
		set:function(key,value){
			this.cookies[key]=value;			
		}
		,
		flush:function(head){			
			var coks= [];	
			for(var k in this.cookies){
				coks.push(k+'='+this.cookies[k]);
			}
			if(coks.length > 0) response.setHeader('Set-Cookie',coks);
		}
	}
}

exports.cookie=cookie;