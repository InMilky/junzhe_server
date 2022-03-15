// 连接数据库
const mysql = require('mysql');

const db = mysql.createPool({
    host:'localhost',
    port:'3306',
    user:'root',
    password:'root',
    database:'junzhe',
    connectionLimit:'30'
});
const miaoshadb = mysql.createPool({
    host:'localhost',
    port:'3306',
    user:'root',
    password:'root',
    database:'miaosha',
    connectionLimit:'30'
});
// module.exports = db;
/**
 * sqlQuery(sql, async(err,result)=>{if else{ if(await XX )}})
 * @type {{sqlQuery: exports.sqlQuery}}
 */
module.exports = {
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
