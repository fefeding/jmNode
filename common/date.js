/*****************************************************************************
Copyright: Tencent
Description: 日期处理逻辑
Author: fefeding
Version: 1.0
Date: 2012/12/19
*****************************************************************************/

/**
* 格式化时间
*/
var getFormatDate = function (date, format) {
    date = date || new Date();
    format = format || 'yyyy-MM-dd HH:mm:ss';
    var result = format.replace('yyyy', date.getFullYear().toString())
    .replace('MM', (date.getMonth()< 9?'0':'') + (date.getMonth() + 1).toString())
    .replace('dd', (date.getDate()< 10?'0':'')+date.getDate().toString())
    .replace('HH', (date.getHours() < 10 ? '0' : '') + date.getHours().toString())
    .replace('mm', (date.getMinutes() < 10 ? '0' : '') + date.getMinutes().toString())
    .replace('ss', (date.getSeconds() < 10 ? '0' : '') + date.getSeconds().toString());

    return result;
}

exports.format = getFormatDate;