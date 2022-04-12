const express = require('express');
const {miaoshaQuery} = require("../utils/databases");
const {item,miaosha} =  require('../utils/sql');
const {getItem, getUserInfo, getAutoValue, insertOrder, insertOrderDetail, insertSeckillOrder, insertSeckillOrderDetail,
    updateStock
} = require("../utils/fn");

const redisClient = require("../utils/redis");
const Redis = require("ioredis");
const {hmget, hset, smembers, hget, hkeys, hvals, setnx, expire, set, get} = require("../utils/redis");
const chinaTime = require("china-time");
const jwtUtil = require("../utils/jwtUtils");
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
router.post('/getItem',async (req,res)=>{
    let {itemID} = req.body
    let result  = await getItem(itemID,item.getItem)
    if(result){
        res.send({status:200,errorCode:'getSeckillItem.success',msg:'获取秒杀商品信息成功',data:result}).end();
    }else{
        res.send({status:400,errorCode:'getSeckillItem.non-success',msg:'该秒杀商品不存在，请选择其他商品'}).end();
    }
})
router.post('/getSecTime',async (req,res)=>{
    let {itemID} = req.body
    let data = await hmget('miaosha:'+itemID,'start_date','end_date','activity','stock')
    let [start_date,end_date,activityFlag,stock] = data
    let serverTime = Date.now()
    let startTime = new Date(start_date).getTime()
    let endTime = new Date(end_date).getTime()
    if(activityFlag) {
        if (serverTime >= startTime && serverTime <= endTime && stock > 0) {
            const randomnum = (51129+Math.random()*51129164033) //生成随机数，进入doSeckill
            const doSeckillRandom = (randomnum+serverTime).toString(32);
            await setnx('miaosha:' + itemID + ':doSeckillKey', doSeckillRandom)
            await expire('miaosha:' + itemID + ':doSeckillKey', 51)
            console.log('\ndoSeckillKey: ',doSeckillRandom)
            activityFlag = 1
        } else if (serverTime > endTime || stock <= 0) {
            activityFlag = 2
        } else {
            activityFlag = 0
        }
        await hset('miaosha:' + itemID, 'activity', activityFlag)
    }
    // activityFlag=0活动未开始，1已经开始，2已结束
    let diffTime = activityFlag==0?startTime-serverTime:endTime-serverTime
    const doSeckillKey = await get('miaosha:'+itemID+':doSeckillKey')
    if(activityFlag&&stock&&doSeckillKey){
        res.send({status:200,errorCode:'getSecTime.success',msg:'获取秒杀活动时间成功',
            data: {start_date:start_date,end_date:end_date,activityFlag:activityFlag,diffTime:diffTime,stock:stock,doSeckillKey:doSeckillKey}}).end();
    }else{
        res.send({status:400,errorCode:'getSecTime.non-success',msg:'获取秒杀活动时间失败'}).end();
    }
})

router.post('/order/:seckillKey',async (req,res,next)=>{
    let {seckillKey} = req.params
    let {itemID, nowtime} = req.body
    const doSeckillKey = await get('miaosha:'+itemID+':doSeckillKey')
    if(doSeckillKey !== seckillKey) {
        res.send({status: 400, msg: '购买途径有误，请稍后尝试！'}).end();
    }else {
        let decode = await getUserInfo(req.headers.authorization)
        if (!decode) {
            res.send({status: 401, msg: '请先登录再进行购买'}).end();
        } else {

            let data = await hmget('miaosha:' + itemID, 'start_date', 'end_date')
            let [start_date, end_date] = data
            let startTime = new Date(start_date).getTime()
            let endTime = new Date(end_date).getTime()

            if (nowtime < startTime || nowtime > endTime) {
                res.send({status: 400, msg: '该活动尚未开始或已结束，敬请期待！'}).end();
            } else {
                next()
            }
        }
    }
})
router.post('/order/:seckillKey',async (req,res)=> {
    console.log("\n============= into doSeckill =============\n")
    let decode = await getUserInfo(req.headers.authorization)
    let username = decode.username
    let user_id = decode.user_id
    let {itemID} = req.body
    let ordertime = chinaTime('YYYY-MM-DD HH:mm:ss');
    miaosha_lua.run('seckill', user_id, itemID,ordertime)
        .then(result => {
            const data = ['：库存不足', '：商品秒杀成功', '：已经购买该商品，该商品限购一件', '：访问次数太多，请稍后再试', '：排队中']
            if (result) {
                console.log(result + "---" + username + data[result])
                res.send({status:200,code: result, msg: username + data[result]}).end();
            } else {
                console.log(result + "---" + username + data[result])
                res.send({status:400,code: result, msg: username + data[result]}).end();
            }
        }).catch(err => {
        console.error(err)
        Promise.reject(err)
    })
})

router.post('/insertOrders',async (req,res)=>{
    let {itemID} = req.body
    let users = await hkeys('miaosha:'+itemID+':users')
    let ordertimes = await hvals('miaosha:'+itemID+':users')
    let amount = await hget('miaosha:'+itemID,'stock')
    let price = await hget('miaosha:'+itemID,'price')
    for(let i=0; i<users.length; i++){
        // 生成order_id
        let ordertime = ordertimes[i].split(" ")[0].replace(/(\d+)-(\d+)-(\d+)/g,'$1$2$3')
        let autoValue = await getAutoValue()
        let order_id = ordertime+autoValue+Math.floor((Math.random() * 100))
        // {'order_id':order_id,'user_id':user_id,'item_id':itemID,'amount':price,'order_price':price,'ordertime':ordertime}
        await insertSeckillOrder(order_id,users[i],itemID,price,price,ordertimes[i])
        await insertOrder(order_id,price,users[i],ordertimes[i])
        //{'item_id':ID,'quantity':quantity,'order_id':order_id}
        await insertSeckillOrderDetail(order_id,itemID,1)
    }
    await updateStock(amount,users.length,itemID)
    res.send({status:200,errorCode:'saveSeckillOrder.success',msg:'存储秒杀订单和更新秒杀商品库存成功'}).end();
})

router.get('/checkout', async (req,res)=>{
    // let {user_id} = req.body
    let user_id= req.query.user_id
    let item_id = "ff8f1a89-5e86-46bd-9f99-4d6b3eaaa9f4"
    // user_id = 'seckill-'+user_id
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
