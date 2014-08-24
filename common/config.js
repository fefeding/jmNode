/*****************************************************************************
Copyright: Tencent
Description: 配置信息
Author: fefeding
Version: 1.0
Date: 2012/12/19
*****************************************************************************/
/**
* 配置文件
*/
exports.config = {    
    /**
    * 当前站点的根跟径
    */
    rootPath:"",

    /**
    * session过期时间。单位分钟
    */
    sessionTimeout :20,

    /**
    * content-type映射
    */
    streamMime:{ ".*": "application/octet-stream",
                ".zip":"application/zip",
                ".css":"text/css",
                ".html":"text/html",
                ".xml":"text/xml",
                ".htm":"text/html",
                ".txt":"text/plain",
                ".jpeg":"image/jpeg",
                ".jpg": "image/jpeg",
                ".png": "image/png",
                ".bmp": "image/bmp",
                ".gif": "image/gif",
                ".ico": "image/ico",
                ".js": "application/javascript",
                ".mp3":"audio/mp3",
                ".mp4": "video/mp4",
                ".swf": "application/x-shockwave-flash",
                ".wav": "audio/wav",
                ".xls":"application/vnd。ms-excel"
                },
    textMime:{
                //".css":"text/css"
                //,".js": "application/javascript"            
            } 
};
