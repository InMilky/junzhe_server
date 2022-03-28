const {redisdb} = require("./databases");

redisdb.on('error', function (err) {
    console.log(err);
});

function setnx(key,num){
    redisdb.setnx(key, num,(err, result) => {
        if(err) console.error(err);
        else{
            return result;
        }
    })
}
function set(key,value){
    if (typeof value === "object") {
        value = JSON.stringify(value);
    } else if (value === undefined) {
        console.error("value 不能为 undefined");
    }
    redisdb.set(key, value,(err, result) => {
        if(err) console.error(err);
        else{
            return result;
        }
    })
}
function get(key){
    redisdb.get(key, (err, result) => {
        if(err) {
            console.error(err)
        }
        else {
            if (result && result.startsWith("{")) {
                result = JSON.parse(result)
            }
            return result;
        }
    });
}
function expire(key,expire){
    redisdb.expire(key, expire, (err, result) => {
        err && reject(err);
       return result;
    });
}

function sadd(set,key) {
    if (typeof key === "object") {
        key = JSON.stringify(key);
    } else if (key === undefined) {
        reject("value 不能为 undefined");
        return;
    };
    redisdb.sadd(set,key, (err, result) => {
        err && reject(err);
       return result;
    })
}

function sismember(set,key){
    redisdb.sismember(set,key, (err, result) => {
        err && reject(err);
       return result;
    })
}

function incr(key){
    redisdb.incr(key, (err, result) => {
        err && reject(err);
       return result;
    })
}
function decr(key){
    redisdb.decr(key, (err, result) => {
        err && reject(err);
       return result;
    })
}

module.exports = {
    setnx,set,get,expire,
    sadd,sismember,
    incr,decr
}
