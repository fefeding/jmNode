/*****************************************************************************
Copyright: Tencent
Description: mysql数据库访问模块
Author: fefeding
Version: 1.0
Date: 2012/12/19
*****************************************************************************/

var mysql=require("mysql");
var common = require('./common');

/**
* mysql 辅助类
* param config 为连接信息，比如：{host:"localhost",user:'root',password:'123456',database:"test"}
*/
var client = function(config) {	
	/**
	* 处理连接异常
	*/
	function handleDisconnect(connection,callback) {
	    connection.on('error', function(err) {
		    if (!err.fatal) {
		      return;
		    }

		    if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
		      callback(err);
		    }

		    console.log('Re-connecting lost connection: ' + err.stack);

		    connection = mysql.createConnection(common.config.dbConfig);
		    handleDisconnect(connection);
		    connection.connect(function(error) {
		    	callback(error,connection);
		    });
	  	});
	  	//callback(null,connection);
	  	//return;
	  	connection.connect(function(error) {
	    	callback(error,connection);
	  	});
	}
	this.createConnection = function(callback) {
		var connection = mysql.createConnection(common.config.dbConfig);
		handleDisconnect(connection,callback);
		return;
		if(!this.pool) this.pool = mysql.createPool(common.config.dbConfig);
		
		this.pool.getConnection(function(err,connection) {			
			if(err) {
				callback(err);
			}
			else {
				if(!connection) {
					connection = mysql.createConnection(common.config.dbConfig);					
				}	
				handleDisconnect(connection,callback);				
			}
		});//function(err, connection) {
		  // connected! (unless `err` is set)
		//}
		//实例化访问类
	    //this.mysqlClient = mysql.createClient(config || common.config.dbConfig);
	    //return mysql.createConnection(config || common.config.dbConfig);
	}	
	
	/**
	* 执行sql
	* 通过回调返回结果，例如：callback(err,result,fields)
	*/
	/*this.query=function(){
		return this.mysqlClient.query;
	}*/
	//this.init();
	this.query = function(sql,pars,callback) {
		if(typeof pars === 'function') {
			callback = pars;
			pars = null;
		}
		//this.mysqlClient.query.apply(this.mysqlClient,arguments);
		
		this.createConnection(function(e,connection) {
			if(e) {
				if(callback) callback(e);
				return;
			}
			if(pars) {
		  		connection.query(sql,pars,function(error,data) {		  			
		  			connection.end(function(error) {
		  				if(error) console.log(error);
		  			});
		  			if(callback) callback(error,data);
		  		});
		  	}
		  	else {
		  		connection.query(sql,function(error,data) {		  			
		  			connection.end(function(error) {
		  				if(error) console.log(error);
		  			});
		  			if(callback) callback(error,data);
		  		});
		  	}
		});		
	};
}


/**
* 分页查询
*/
client.prototype.search= function(tbName,fields,where,pars,page,count,order,callback) {	
	this.createConnection(function(e,connection) {
		if(e) {
			if(callback) callback(e);
			return;
		}		
	  	if(count) {
			//先获取符合条件的总行数
			var sql= 'select count(0) as count from '+tbName+' where ' + where;			
			connection.query(sql,pars,function(err,countdata) {
				if(err) {
					connection.end(function(error) {
						if(error) console.log(error);
					});
					callback(err);						
				}
				else
				{
					var totalcount= countdata[0]['count'];
					sql= 'select '+fields+' from '+tbName+' where ' + where + ' ' + order;
					
					if(typeof page != 'undifined'){
						var newpage = page -1;
						if(newpage < 0) newpage = 0;
						sql += " limit "+(newpage * count)+"," + count;
					}
					else{
						sql += " limit 0," + count;
					}
					var pagecount = Math.ceil(totalcount / count);				
					connection.query(sql,pars,function(err,data) {
						connection.end(function(error) {							
							if(error) console.log(error);
						});
						callback(err,{data:data,count:totalcount,page:page,pageCount:pagecount});
					});
				}
			});
		}
		else {
			var sql= 'select '+fields+' from '+tbName+' where ' + where + ' ' + order;
			connection.query(sql,pars,function(err,data) {		
				connection.end(function(error) {
						if(error) console.log(error);
					});			
				callback(err,{data:data,count:0});
			});
		}
	});		
}


var instance = new client();
exports.client = instance;
