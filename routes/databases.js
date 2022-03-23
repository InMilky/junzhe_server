// 连接数据库
const mysql = require('mysql');
const redis = require('redis');
// 连接mysql数据库junzhe
const db = mysql.createPool({
    host:'localhost',
    port:'3306',
    user:'root',
    password:'root',
    database:'junzhe',
    connectionLimit:'30'
});
// 连接mysql数据库miaosha
const miaoshadb = mysql.createPool({
    host:'localhost',
    port:'3306',
    user:'root',
    password:'root',
    database:'miaosha',
    connectionLimit:'30'
});
const redisdb = redis.createClient({
    host: '127.0.0.1',
    port: 6379
    // auth_pass: 'root'
})
// module.exports = db;
/**
 * sqlQuery(sql, async(err,result)=>{if else{ if(await XX )}})
 * @type {{sqlQuery: exports.sqlQuery}}
 */
module.exports = {
    redisdb,
    sqlQuery:function (sql,params,callback) {
        db.getConnection((err, connection) => {
            if (err) throw err;
            connection.query(sql,params,(err, result) => {
                if (err) throw err;
                callback(err, result);
                connection.release();
            })
        })
    },
    miaoshaQuery:function (sql,params,callback) {
        miaoshadb.getConnection((err, connection) => {
            if (err) throw err;
            connection.query(sql,params,(err, result) => {
                if (err) throw err;
                callback(err, result);
                connection.release();
            })
        })
    }
}
