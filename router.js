var path=require('path');
//var fs=require('fs');
//var url = require("url");

var common = require("./common/common");

/**
* 站点路由辅助类
*/
var router = {
    /**
    * 所有静态资源
    * 设置静态文件路径。其下所有资源直接访问
    */
    statics:[],
    /*
    * 设围起静态访问路径
    */
    setStatic:function(reg) {
        this.statics.push(reg);
    },
    /**
    * 所有动态view
    */
    views:[],
    /*
    * 设置动态页面，并指定其后台处理controller
    */
    setView:function(reg,controller) {
        this.views.push({'reg':reg,'controller':controller});
    },
    /**
    * 所有自定义处理路由
    * 交由用户自已定义处理函数
    */
    events:[],
    /**
    * 设定自定义回调请求
    */
    setEvent:function(reg,callback) {
        this.events.push({'reg':reg,'callback':callback});
    }
}

/**
* 处理mvc-controler
*/
router.view = function(context,controler,args) {
    controler = path.normalize(path.resolve(common.config.rootPath ,controler));
    if(args) {
        require(controler).view.apply(context,[context].concat(args));
    }
    else {
        require(controler).view(context); 
    }    
}

/**
* 直接请求服务
*/
router.request = function(context,controler,method,args) {
    controler = path.normalize(path.resolve(common.config.rootPath ,controler));
    if(typeof method === 'array') {
        args = method;
        method = 'request';
    }
    else {
        method = method || 'request';
    }
    if(args) {
        require(controler)[method].apply(context,[context].concat(args));
    }
    else {
        require(controler)[method](context); 
    }    
}

/**
* ·路由
* �根据配置定向请求
*/
router.route = function (context,callback) {
    try {
        console.log('request:' + context.url.pathname);
        //console.log('request :' + context.url.pathname);
        var routed = false;
        //如果路径为静态资源，则直接下载当前资源
        for (var i in router.statics) {
            if (router.statics[i].test(context.url.pathname)) { 
                common.io.download(context, "./web" + context.url.pathname);                
                routed = true;
                break;
            }
            
        }

        if(routed == false) {
            //如果路径为动态资源，则交由controller处理
            for (var i in router.views) {
                if (router.views[i].reg.test(context.url.pathname)) {   
                    this.view(context,router.views[i].controller);
                    routed = true; 
                    break;
                }
                
            }
        }
        
        if(routed == false) {
            //如果路径为自定义资源，则交由回调函数处理
            for (var i in router.events) {
                if (router.events[i].reg.test(context.url.pathname)) {                         
                        router.events[i].callback(context);
                        routed = true;
                        break;
                }
                
            }
        }
    }
    catch(ex) {
        common.logger.error(ex.toString());    
        console.log(ex);    
    }
    if(routed == false && !context.completed) {
        if(callback) {
            callback(context,{status:404,message:'check error:' + context.url.pathname},context.url.pathname);
        }
        else {
            context.writeHead(404, {"content-type":"text/plain"});
            context.end('404 Not Found');  
        }        
        console.log('check error:' + context.url.pathname);
    } 
    else {
        if(callback) {
            callback(context,routed?null:{status:404,message:'route faild'},context.url.pathname);
        }
    }  
}

//默认将content下的文件静态处理
router.setStatic(/^\/content\//i);

exports.router = router;