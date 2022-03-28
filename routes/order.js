const express = require('express');
const redis = require('./redis');
const router = express.Router();
const {order} =  require('../utils/sql');
const {sqlQuery} = require("./databases");
const chinaTime = require("china-time");
const {insertOrderItemInfo} = require("../utils/fn");

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
router.post('/insert',async (req,res)=>{
    const {item,account,user_id} = req.body
    const sqlitem = order.insertItem
    const sqlinfo = order.insertItemInfo
    let nowtime = chinaTime('YYYYMMDD');
    let ordertime = chinaTime('YYYY-MM-DD HH:mm:ss');
    const order_id = nowtime+Math.random()*1000
    sqlQuery(sqlitem,[order_id,account,user_id,ordertime], async (err,result)=>{
        if(err) console.error(err)
        else{
            if(result.affectedRows > 0){
                // for(let i=0; i<item.length; i++){
                //     let {item_id,item_price,quantity} = item[i]
                //     let resultCode = await insertOrderItemInfo(order_id,item_id,item_price,quantity)
                // }
                res.send({status:200,errorCode:'insertOrder.success',msg:'下单商品成功'}).end();
            }else{
                res.send({status:400,errorCode:'insertOrder.non-success',msg:'下单商品失败'}).end();
            }
        }
    })
})

router.post('/payOrder',(req,res)=>{
    let order_id = req.body.order_id
    let sql = order.updateOrderStatus
    sqlQuery(sql,[2,order_id], (err,result)=>{
        if(err) console.error(err)
        else{
            if(result.affectedRows > 0){
                res.send({status:200,errorCode:'payOrder.success',msg:'支付订单成功'}).end();
            }else{
                res.send({status:400,errorCode:'payOrder.non-success',msg:'支付订单失败'}).end();
            }
        }
    })
})

module.exports = function (){
    return router;
}
