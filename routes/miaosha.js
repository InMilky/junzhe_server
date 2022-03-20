const express = require('express');
const {miaoshaQuery} = require("./databases");
const jwtUtil = require("./jwtUtils");
const {item,miaosha} =  require('./sql');
const {getItem,getServerTime,getPromo} = require("./fn");

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
    let ID = req.body.ID
    let result  = await getItem(ID,item.getItem)
    let time  = await getPromo(ID,miaosha.getPromo)
    if(result){
        res.send({status:200,errorCode:'getSeckillItem.success',msg:'获取秒杀商品信息成功',serverTime:getServerTime(),timeSeries:time,data:result}).end();
    }else{
        res.send({status:400,errorCode:'getSeckillItem.non-success',msg:'该秒杀商品已售罄，请选择其他商品'}).end();
    }
})


module.exports = function (){
    return router;
}
