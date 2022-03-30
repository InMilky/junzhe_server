const express = require("express");
const redis = require("../utils/redis");
const router = express.Router();

router.get('/set', function(req, res, next) {
    //设置key：value
    let {key,value} = req.query
    redis.set(key, value).then(result => {
        console.log(result)
        res.send({status: 200, data: result}).end()
    })
});
router.get('/get/:key', function(req, res, next) {
    //设置key：value
    let key = req.params.key
    redis.get(key).then(result=>{
        res.send({status:200,data:result}).end()
    })
});
router.get('/lpush', function(req, res, next) {
    //设置key：value
    let {key,value,time} = req.query
    redis.expire(key,time).then(result=>{
        res.send({status:200,data:result}).end()
    })
});

module.exports = function (){
    return router;
}
