const redis = require("redis");
const {redisdb} = require("./databases");

redisdb.on('error', function (err) {
    console.log(err);
});
/**
 * 字符串 String命令:
 *  .set key value 设置字符串 key-value
 *  .get key 获取 key的值 value
 *  .expire key time 设置key的过期时间(s),返回结果 1表示设置成功 或者 set key value EX time 过期则返回null
 *  .ttl key 查看 key的剩余过期时间
 *  .del key 删除指定数据:
 *  .flushall 删除全部数据:
 * @param key
 * @param value
 * @returns {Promise<unknown>}
 */
function set(key,value){
    return new Promise((resolve,reject)=> {
        if (typeof value === "object") {
            value = JSON.stringify(value);
        } else if (value === undefined) {
            reject("value 不能为 undefined");
            return;
        }
        redisdb.set(key, value,(err, result) => {
            err && reject(err);
            resolve(result);
        });
    })
}
function get(key){
    return new Promise((resolve,reject)=> {
        redisdb.get(key, (err, result) => {
            err && reject(err);
            if(result && result.startsWith("{")){
                result = JSON.parse(result)
            }
            resolve(result);
        });
    })
}
function expire(key,expire){
    return new Promise((resolve,reject)=> {
        redisdb.expire(key, expire, (err, result) => {
            err && reject(err);
            resolve(result);
        });
    })
}
function ttl(key){
    return new Promise((resolve,reject)=> {
        redisdb.ttl(key, (err, result) => {
            err && reject(err);
            resolve(result);
        });
    })
}

/**
 * 列表 list命令:
 *  .lpush列表(前)左侧增加值, .lpop key左侧删除值,
 *  .rpush列表(前)左侧增加值, .rpop key左侧删除值
 *  .lrange key start end 取出[start,end]范围的列表值，全部则end=-1
 * @param key
 * @param value
 * @returns {Promise<unknown>}
 */
function lpush(key,value){
    return new Promise((resolve,reject)=> {
        if (typeof value === "object") {
            value = JSON.stringify(value);
        } else if (value === undefined) {
            reject("value 不能为 undefined");
            return;
        };
        redisdb.lpush(key, value, (err, result) => {
            err && reject(err);
            resolve(result);
        });
    })
}
function lpop(key){
    return new Promise((resolve,reject)=> {
        redisdb.lpop(key, (err, result) => {
            err && reject(err);
            resolve(result);
        });
    })
}
function lrange(key,start,end){
    return new Promise((resolve,reject)=> {
        redisdb.lrange(key,start,end, (err, result) => {
            err && reject(err);
            resolve(result);
        });
    })
}

/**
 * 哈希 Hash命令:
 *  .hset table key value  给哈希表插入一个值
 *  .hmset table key1 value1 key2 value2 给哈希表插入多个值
 *  .hgetall table 获取哈希表数据
 * @param key
 * @param value
 * @returns {Promise<unknown>}
 */
function hset(table,key,value) {
    return new Promise((resolve,reject)=> {
        if (typeof value === "object") {
            value = JSON.stringify(value);
        } else if (value === undefined) {
            reject("value 不能为 undefined");
            return;
        };
        redisdb.hset(key, value, (err, result) => {
            err && reject(err);
            resolve(result);
        });
    })
}
function hmset(table,params){
    return new Promise((resolve,reject)=> {
        redisdb.hmset(table, (err, result) => {
            err && reject(err);
            if(result && result.startsWith("{")){
                result = JSON.parse(result)
            }
            resolve(result);
        });
    })
}
//遍历哈希表"hash key"
function hkeys(table) {
    redisdb.hkeys(table, function (err, result) {
        console.log(result.length + " result:");
        result.forEach(function (item, index) {
            console.log("    " + index + ": " + item);
        });
        redisdb.hget("hash key", "hashtest 1", redis.print);

    })
}
function hgetall(table,value){
    return new Promise((resolve,reject)=> {
        redisdb.hgetall(table, (err, result) => {
            err && reject(err);
            if(result && result.startsWith("{")){
                result = JSON.parse(result)
            }
            resolve(result);
        });
    })
}

/**
 * 集合 Set命令:
 *  .sadd key value 给集合增数据, 重复则覆盖
 *  .smembers key 获取数据
 *  .srem key value 删除集合中的一个值
 * @param key
 * @param value
 * @returns {Promise<unknown>}
 */
function sadd(set,key) {
    return new Promise((resolve,reject)=> {
        if (typeof key === "object") {
            key = JSON.stringify(key);
        } else if (key === undefined) {
            reject("value 不能为 undefined");
            return;
        };
        redisdb.sadd(set,key, (err, result) => {
            err && reject(err);
            resolve(result);
        });
    })
}
function smembers(key){
    return new Promise((resolve,reject)=> {
        redisdb.smembers(key, (err, result) => {
            err && reject(err);
            if(result && result.startsWith("{")){
                result = JSON.parse(result)
            }
            resolve(result);
        });
    })
}
function sismember(set,key){
    return new Promise((resolve,reject)=> {
        redisdb.sismember(set,key, (err, result) => {
            err && reject(err);
            resolve(result);
        });
    })
}
function srem(key,value){
    return new Promise((resolve,reject)=> {
        redisdb.srem(key, value, (err, result) => {
            err && reject(err);
            if(result && result.startsWith("{")){
                result = JSON.parse(result)
            }
            resolve(result);
        });
    })
}

// 秒杀函数需要的redis命令
function setnx(key,num){
    return new Promise((resolve,reject)=> {
        redisdb.setnx(key, num,(err, result) => {
            err && reject(err);
            resolve(result);
        });
    })
}
function incr(key){
    return new Promise((resolve,reject)=> {
        redisdb.incr(key, (err, result) => {
            err && reject(err);
            resolve(result);
        });
    })
}
function decr(key){
    return new Promise((resolve,reject)=> {
        redisdb.decr(key, (err, result) => {
            err && reject(err);
            resolve(result);
        });
    })
}


module.exports = {
    set,get,expire,ttl,
    lpush,lrange, lpop,
    sadd,smembers,srem,sismember,
    hset,hmset,hgetall,hkeys,
    setnx,incr,decr
}
