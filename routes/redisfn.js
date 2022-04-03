const express = require("express");
const redis = require("../utils/redis");
const {setnx, expire, ttl} = require("../utils/redis");
const router = express.Router();

router.get('/setnx', async function(req, res, next) {
    //设置key：value
    let {key,value} = req.query
    // redis.set(key, value).then(result => {
    //     console.log(result)
    //     res.send({status: 200, data: result}).end()
    // })

    let result = await setnx(key, value)
    res.send({status: 200, data: result}).end()
});
router.get('/expire/:key', async function(req, res, next) {
    //设置key：value
    let key = req.params.key
    // redis.get(key).then(result=>{
    //     res.send({status:200,data:result}).end()
    // })
    let result = await expire(key, 300)
    res.send({status:200,data:result}).end()
});
router.get('/ttl/:key', async function(req, res, next) {
    //设置key：value
    // let {key,value,time} = req.query
    // redis.expire(key,time).then(result=>{
    //     res.send({status:200,data:result}).end()
    // })
    let key = req.params.key
    let result = await ttl(key)
    res.send({status:200,data:result}).end()
});

module.exports = function (){
    return router;
}
