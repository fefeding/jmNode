/*****************************************************************************
Copyright: Tencent
Description: 后台模板处理，主要用于html生成
Author: fefeding
Version: 1.0
Date: 2012/12/19
*****************************************************************************/
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var common = require('./common');
var path = require("path");

// Simple JavaScript Templating
 // John Resig - http://ejohn.org/ - MIT Licensed

var template_cache = {};
var master_cache = {};
function tmpl(str, data){
     // Figure out if we're getting a template, or if we need to
     // load the template - and be sure to cache the result.
	
     var fn = template_cache[str] || (template_cache[str] =
      
      // Generate a reusable function that will serve as a template
       // generator (and which will be cached).
      new Function("obj",
         "var p=[],print=function(){p.push.apply(p,arguments);};" +
         
        // Introduce the data as local variables using with(){}
         "with(obj){p.push('" +
         
        // Convert the template into pure JavaScript
         str
           .replace(/[\r\t\n]/g, " ")
           .split("<%").join("\t")
           .replace(/((^|%>)[^\t]*)'/g, "$1\r")
           .replace(/\t=(.*?)%>/g, "',$1,'")
           .split("\t").join("');")
           .split("%>").join("p.push('")
           .split("\r").join("\\'")
       + "');}return p.join('');"));
     
    // Provide some basic currying to the user
     return data ? fn( data ) : fn;
 };

 var tmplRegs = [
                  /<#\s*[^=]+[\s\S]*?#>/g,
                  /<\s*%\s*[^=]+[\s\S]*?%\s*>/g,
                  /<\s*%\s*=[\s\S]*?%\s*>/g
                 ];
//最多处理动态内容个数
  var maxCount = 5000;

 /**
 * 解析html
 */
 function template(html,data) {
    try {     
      var str;    
      //console.log(1); 
      //var curCount = 0;//当前个数
       if(data) {
        data.title = data.title || '';
        data.keywords = data.keywords || '';
       }
       /**
       * 先截取<# #>语言块
       */
       var h = '';
       tmplRegs[0].lastIndex = 0;
       //var reg= /<#\s*[^=]+[\s\S]*?#>/;

       /*
       while (curCount < maxCount && (str = tmplRegs[0].exec(html)) != null) {  
          var code = str[0].replace('<#','').replace('#>','');
          //var mark = '<$'+curCount+'$>';
           h = tmpl(code, data);         
           html = html.replace(str, h);
           curCount++;
       } */
       str = html.match(tmplRegs[0]);       
       if(str && str.length > 0) {
          for(var i=0;i<str.length;i++) {
            var code = str[i].replace('<#','').replace('#>','');
             h = tmpl(code, data);         
             html = html.replace(str[i], h);             
           }
       }

       /* 
       for(var code in h) {
            html = html.replace(code, h[code]);
       }

       h = {}; */
       //curCount = 0;//当前个数 
       // 截取<% %> 包含的语言块
       //reg= /<\s*%\s*[^=]+[\s\S]*?%\s*>/;
       tmplRegs[1].lastIndex = 0;
       /*
       while ((str = tmplRegs[1].exec(html)) != null) {  
            //console.log(str);       
            //var mark = '<$'+curCount+'$>';
           h = tmpl(str[0], data);
           html = html.replace(str, h);
           curCount++;
       } */
       str = html.match(tmplRegs[1]); 
       if(str && str.length > 0) {
          for(var i=0;i<str.length;i++) {
             var code = str[i];
             h = tmpl(code, data); 
             html = html.replace(str[i], h);
           }
       }
       /* 
        for(var code in h) {
            html = html.replace(code, h[code]);
       }
       h = {}; */ 
      //curCount = 0;//当前个数
       /*接着处理<%=%>块的语言变量*/
       //reg= /<\s*%\s*=[\s\S]*?%\s*>/;
       tmplRegs[2].lastIndex = 0;
       str = html.match(tmplRegs[2]);
       //console.log(str);
       if(str && str.length > 0) {
          for(var i=0;i<str.length;i++) {
            var code = str[i];          
             h = tmpl(code, data);         
             html = html.replace(str[i], h);
           }
       }
       /*
       while ((str = tmplRegs[2].exec(html)) != null) { 
           // var mark = '<$'+curCount+'$>';
           h = tmpl(str[0], data);
           //console.log(h);     
           html = html.replace(str, h);   
           curCount++;      
       }*/
       /*
       for(var code in h) {
            html = html.replace(code, h[code]);
       }*/
       //for(var k in h) {
          //html = html.replace(k,h[k]);
       //}
    }
    catch (ex) {
      console.log(ex);
      return ex.toString();
    }
     return html;
 }
 
 /**
 * 替换模板页中的view元素
 */
 function setView(html,master){
  //如果有模板则处理模板和页面
  //否则直接返回页面html
  try {
    if(master) {

      var result = master_cache[html];
      if(result && result.master == master) {
        return result.content;
      }

    	var reg = /<view\d*>[\s\S]*?<\/view\d*>/i;
    	var str;
    	var content = master;	
       while ((str = reg.exec(content)) != null) {
           var start=/<view\d*>/i.exec(str[0]);
      		 var end=/<\/view\d*>/i.exec(str[0]);
      		 var regstr = '/'+start[0]+'[\\s\\S]*?'+end[0].replace('/','\\/')+'/i.exec(html)';
      		 //console.log(regstr);		 
           var viewhtml= eval(regstr);
      		 //console.log(viewhtml);
      		 if(viewhtml) {
      			 viewhtml=viewhtml[0].replace(start,"").replace(end,"");
      			 content = content.replace(str, viewhtml);  
      		 }	
      		else{
      			content = content.replace(str, '');
      		}		 
       }  

      master_cache[html] = {master:master,content:content};//缓存结果   
      return content;
     }
   }
   catch(ex) {
    return ex.toString();
   }
   return html;
 }
 
 /**
 * 处理模板与视图
 */
 function viewHtml(html,data,master,callback){
      if(typeof master == 'function') {
          callback = master;
          master = null;
        }
     common.io.readContent(html, function (err, content) {
         if (err) {
             callback(err);
         }
         else {
          try {
             //获取页面前面的指定模板脚本
             var reg= /^\s*<\s*%\s*[\s\S]*?%\s*>/;
             var str = reg.exec(content);
             if(str) {
                //从内容中移除当前脚本
                content= content.replace(str,'');
                //移除脚本中前面的<% 和后面的 %>
                str = str[0].replace(/^\s*<\s*%\s*/,'').replace(/%\s*>$/,'');
                eval(str);//执行脚本，处理master路径
                if(master) master = path.normalize(path.join(path.dirname(html), master));//获取模板相对于页面路径的地址
               
             }
             //如果指定了模板，则加载模板，否则直接返回页面的html	
             if (master && typeof master == 'string') {
                 common.io.readContent(master, function (error, masterContent) {
                   //console.log('master complete');
                     if (error) callback(err);
                     else {                         
                         var viewcontent = setView(content,masterContent);
                          //console.log('viewcontent complete');
                         viewcontent = template(viewcontent, data);
                         //console.log('template complete');
                         callback(null,viewcontent);
                     }
                 });
             }
             else {
                  var viewcontent = template(content, data);
                  callback(null,viewcontent);
             }
           }
           catch(e) {
            callback(e);
           }
         }
     });
	
 }

 function viewTemplate() {
    EventEmitter.call(this);
 }
 util.inherits(viewTemplate,EventEmitter);
 viewTemplate.prototype.view = function(html,data,master) {   
    var _this = this;
     common.io.readContent(html, function (err, content) {
         if (err) {
             _this.emit('error',err);
         }
         else {
          try {
             //获取页面前面的指定模板脚本
             var reg= /^\s*<\s*%\s*[\s\S]*?%\s*>/;
             var str = reg.exec(content);
             if(str) {
                //从内容中移除当前脚本
                content= content.replace(str,'');
                //移除脚本中前面的<% 和后面的 %>
                str = str[0].replace(/^\s*<\s*%\s*/,'').replace(/%\s*>$/,'');
                eval(str);//执行脚本，处理master路径
                if(master) master = path.normalize(path.join(path.dirname(html), master));//获取模板相对于页面路径的地址
               
             }
             //如果指定了模板，则加载模板，否则直接返回页面的html  
             if (master && typeof master == 'string') {
                 common.io.readContent(master, function (error, masterContent) {
                   //console.log('master complete');
                     if (error) _this.emit('error',error);
                     else {                         
                         var viewcontent = setView(content,masterContent);
                          //console.log('viewcontent complete');
                         viewcontent = template(viewcontent, data);
                         //console.log('template complete');
                         _this.emit('data',viewcontent);
                     }
                 });
             }
             else {
                  var viewcontent = template(content, data);
                  _this.emit('data',viewcontent);
             }
           }
           catch(e) {
              _this.emit('error',e);
           }
         }
     });
 }


 exports.tmpl = viewTemplate;
