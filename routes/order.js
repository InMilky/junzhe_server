const express = require('express');
const {order} =  require('../utils/sql');
const {sqlQuery,selfjointSQL} = require("../utils/databases");
const chinaTime = require("china-time");
const {getUserInfo, getAutoValue, insertOrder, insertOrderDetail, deleteOrderDetail, deleteOrder,
    getCartItem, getReceiver, delCartItem
} = require("../utils/fn");

const router = express.Router();

router.get('/getOrder',async (req,res)=>{
    let sql = order.select
    let decode = await getUserInfo(req.headers.authorization)
    sqlQuery(sql,[decode.user_id], (err,result)=>{
        if(err) console.error(err)
        else{
            console.log('获取订单信息成功,length = '+result.length)
            res.send({status:200,errorCode:'getOrder.success',msg:'获取订单信息成功',data:result}).end();
        }
    })
})
router.get('/getOrderByID',async (req,res)=>{
    let sql = order.getOrder
    let decode = await getUserInfo(req.headers.authorization)
    let order_id = req.query.orderID
    sqlQuery(sql,[order_id,decode.user_id], (err,result)=>{
        if(err) console.error(err)
        else{
            if(result.length>0) {
                console.log('获取该订单商品信息成功')
                res.send({status: 200, errorCode: 'getOrderItem.success', msg: '获取该订单商品信息成功', data: result}).end();
            }else{
                console.log('获取该订单商品信息成功')
                res.send({status: 400, errorCode: 'getOrderItem.non-success', msg: '获取该订单商品信息失败'}).end();
            }
        }
    })
})
router.get('/confirmOrder',async (req,res)=>{
    let decode = await getUserInfo(req.headers.authorization)
    let {ID} = req.query
    let receiver = await getReceiver(decode.user_id)
    let sql;
    if(ID instanceof Array) {
        if (ID.length > 1) { // 多购物车商品查询，拼接sql——in ('XX','XX')
            sql = `select cart.ID,user_id,item_id,quantity,title,price,m_price,color,img_url from cart inner join item on item.ID = cart.item_id AND user_id=${decode.user_id} and cart.ID in (`
            let i = 0;
            for (; i < ID.length - 1; i++) {
                sql += `${ID[i]},`
            }
            sql += `${ID[i]})`
        } else { // 单商品查询
            sql = `select cart.ID,user_id,item_id,quantity,title,price,m_price,color,img_url from cart inner join item on item.ID = cart.item_id AND user_id=${decode.user_id} and cart.ID = ${ID[0]}`
        }
    }else{
        sql = `select ID,title,price,m_price,color,img_url from item where ID = '${ID}'`
    }
    selfjointSQL(sql, (err,result)=>{
        if(err) console.error(err)
        else{
            if(result.length > 0){
                console.log('进入确认订单页面,length = ',result.length)
                res.send({status:200,errorCode:'enterCheckoutView.success',msg:'进入确认订单页面',data:result,receiver:receiver}).end();
            }else{
                console.log('进入确认订单页面失败')
                res.send({status:400,errorCode:'enterCheckoutView.non-success',msg:'进入确认订单页面失败'}).end();
            }
        }
    })
})
router.post('/checkout',async (req,res)=>{
    let decode = await getUserInfo(req.headers.authorization)
    let {ID,account,quantity} = req.body
    // 生成order_id
    let nowtime = chinaTime('YYYYMMDD');
    let autoValue = await getAutoValue()
    let order_id = nowtime+autoValue+Math.floor((Math.random() * 100))
    let ordertime = chinaTime('YYYY-MM-DD HH:mm:ss');
    let order_details = []
    let result3
    if(ID instanceof Array){
        order_details = await getCartItem(ID,decode.user_id)
        result3 = await delCartItem(ID, decode.user_id)
    }else{
        order_details = [{'item_id':ID,'quantity':quantity}]
    }
    order_details = order_details.map(item=>{
        item['order_id'] = order_id
        return item
    })
    let result1 = await insertOrder(order_id,account,decode.user_id,ordertime)
    let result2= await insertOrderDetail(order_details)
    if(result1.affectedRows > 0 && result2.affectedRows>0 && result3.affectedRows>0){
        res.send({status:200,errorCode:'payOrder.success',msg:'支付订单成功',data:order_id}).end();
    }else{
        res.send({status:400,errorCode:'payOrder.non-success',msg:'支付订单失败'}).end();
    }
})
router.get('/getReceiver',async (req, res) => {
    let sql = order.getReceiver
    let decode = await getUserInfo(req.headers.authorization)
    sqlQuery(sql, [decode.user_id], (err, result) => {
        if (err) console.error(err)
        else {
            if(result.length>0) {
                console.log('获取收货地址成功')
                res.send({status: 200, errorCode: 'getReceiver.success', msg: '获取收货地址成功', data: result}).end();
            }else{
                console.log('获取收货地址失败')
                res.send({status: 400, errorCode: 'getReceiver.success', msg: '获取收货地址失败'}).end();
            }
        }
    })
})
router.get('/updateOrderStatus',async (req,res)=>{
    // let decode = await getUserInfo(req.headers.authorization)
    let {pay_state,order_id,user_id} = req.query
    let sql = order.updateOrderStatus
    sqlQuery(sql,[pay_state,order_id,user_id], (err,result)=> {
        if (err) console.error(err)
        else {
            if (result.affectedRows > 0) {
                console.log('订单状态更新成功')
                res.send({status: 200, errorCode: 'getOrder.success', msg: '订单状态更新成功'}).end();
            } else {
                console.log('订单状态更新失败')
                res.send({status: 400, errorCode: 'getOrder.non-success', msg: '订单状态更新失败'}).end();
            }
        }
    })
})
router.get('/deleteOrder',async (req,res)=>{
    let decode = await getUserInfo(req.headers.authorization)
    let {order_id} = req.query
    let result1 = await deleteOrder(order.deleteOrder,order_id,decode.user_id)
    let result2 = await deleteOrderDetail(order.deleteOrderDetail,order_id)
    if(result1.affectedRows>0 && result2.affectedRows>0){
        console.log('删除订单信息成功')
        res.send({status:200,errorCode:'getOrder.success',msg:'删除订单信息成功'}).end();
    }else{
        console.log('删除订单信息失败')
        res.send({status:400,errorCode:'getOrder.non-success',msg:'删除订单信息失败'}).end();
    }
})

module.exports = function (){
    return router;
}
