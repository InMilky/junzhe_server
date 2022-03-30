const express = require('express');
const {miaoshaQuery, redisdb} = require("../utils/databases");
const {item,miaosha} =  require('../utils/sql');
const {getItem,getServerTime,getPromo} = require("../utils/fn");

const redisClient = require("../utils/redis");
const Redis = require("ioredis");
const redis = new Redis(6379, "127.0.0.1");
const miaosha_lua = require('../utils/miaosha_lua')(redis)

const router = express.Router();

router.get('/getSeckill',(req,res)=>{
    let sql = miaosha.seckill_all
    miaoshaQuery(sql,{},(err,result)=>{
        if(err) console.error(err)
        else{
            if(result.length>0) {
                res.send({status: 200, errorCode:'getMiaosha.success',msg:'获取秒杀列表成功',data:result}).end()
            }else{
                res.send({status: 400,errorCode:'getMiaosha.non-success',msg:'获取秒杀列表失败'}).end()
            }
        }
    })
})
router.get('/get/:key',async (req,res)=>{
    const key = req.params.key
    const result = await redisdb.get(key)
    if(result){
        res.send({status:200,msg:result})
    }else{
        res.send({status:400,msg:result})
    }
})
router.post('/getItem',async (req,res)=>{
    let ID = req.body.ID
    let result  = await getItem(ID,item.getItem)
    let time  = await getPromo(ID,miaosha.getPromo)
    if(result){
        res.send({status:200,errorCode:'getSeckillItem.success',msg:'获取秒杀商品信息成功',serverTime:getServerTime(),timeSeries:time,data:result}).end();
    }else{
        res.send({status:400,errorCode:'getSeckillItem.non-success',msg:'该秒杀商品已售罄，请选择其他商品'}).end();
    }
})

router.get('/order',(req,res)=>{
    let user_id= req.query.user_id
    let item_id = "ff8f1a89-5e86-46bd-9f99-4d6b3eaaa9f4"
    // user_id = 'miaosha-'+user_id
    miaosha_lua.run('miaosha',user_id,item_id)
        .then(result=>{
            const data = [':库存不足',':商品秒杀成功',':已经购买该商品',':访问次数太多，请稍后再试',':排队中']
            if(result){
                console.log(result+"---"+user_id+data[result])
                res.send({code:result,msg:user_id+data[result]}).end();
            }else {
                console.log(result+"---"+user_id+data[result])
                res.send({code: result,msg: user_id + data[result]}).end();
            }
        }).catch(err=>{
            console.error(err)
            Promise.reject(err)
        })
})
router.get('/checkout', async (req,res)=>{
    // let {user_id} = req.body
    let user_id= req.query.user_id
    let item_id = "ff8f1a89-5e86-46bd-9f99-4d6b3eaaa9f4"
    // user_id = 'seckill-'+user_id
    // console.log(user_id,item_id)
    let code = await checkout(user_id,item_id)
    const data = [':库存不足',':商品秒杀成功',':已经购买该商品',':访问次数太多，请稍后再试',':排队中']
    if(code){
        console.log(code+"---"+user_id+data[code])
        res.send({'code':code,msg:user_id+data[code]}).end();
    }else {
        console.log(code+"---"+user_id+data[code])
        res.send({'code':code,msg: user_id + data[code]}).end();
    }
})
async function checkout(user_id,item_id){
    await redisClient.setnx(user_id,0)
    let num = await redisClient.incr(user_id)
    let value;
    if(num > 3) {
        await redisClient.expire(user_id, 1)
        value = 3
        return value;
    }
    let item_stock = "seckill:"+item_id+":stock"
    let user_exists = "seckill:"+item_id+":users"
    let user_num = await redisClient.sismember(user_exists, user_id )
    if(user_num === 1){
        value = 2
        return value;
    }
    let left_items_count = await redisClient.get(item_stock )
    if(left_items_count <= 0 ){
        value = 0
        return value;
    }
    else{
        await redisClient.decr(item_stock)
        await redisClient.sadd(user_exists, user_id)
        value = 1
        return value;
    }
}

module.exports = function (){
    return router;
}
