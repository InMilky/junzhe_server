const express = require('express');
const {sqlQuery,selfjointSQL} = require("../utils/databases");
const {cart} =  require('../utils/sql');
const {selectQuantity, getUserInfo} = require('../utils/fn')

const router = express.Router();

router.get('/getCart',async (req,res)=>{
    let sql = cart.select
    let decode = await getUserInfo(req.headers.authorization)
    if(!decode){
        res.send({status: 401, errorCode: 'non-get.userInfo', msg: '登录已失效，请重新登录'}).end();
    }else {
        sqlQuery(sql, [decode.user_id], (err, result) => {
            if (err) console.error(err)
            else {
                console.log('获取购物车信息成功,length = ' + result.length)
                res.send({status: 200, errorCode: 'getCart.success', msg: '获取购物车信息成功', data: result}).end();
            }
        })
    }
})
router.post('/updateCart',async (req,res)=>{
    let decode = await getUserInfo(req.headers.authorization)
    if(!decode){
        res.send({status: 401, errorCode: 'non-get.userInfo', msg: '登录已失效，请重新登录'}).end();
    }else {
        let {item_id, buyNum} = req.body
        let quantity = await selectQuantity(item_id, decode.user_id)
        const sql = quantity ? cart.updateCartItem : cart.insertIntoCart
        quantity = parseInt(quantity) + parseInt(buyNum)
        sqlQuery(sql, [quantity, item_id, decode.user_id], (err, result) => {
            if (err) console.error(err)
            else {
                if (result.affectedRows > 0) {
                    console.log('商品加入购物车成功')
                    res.send({
                        status: 200,
                        errorCode: 'updateItemfromCart.success',
                        sql: sql,
                        quantity: quantity
                    }).end();
                } else {
                    console.log('商品加入购物车失败')
                    res.send({status: 400, errorCode: 'updateItemfromCart.non-success', msg: '商品加入购物车失败'}).end();
                }
            }
        })
    }
})
router.get('/updateQuantity',async (req,res)=>{
    let decode = await getUserInfo(req.headers.authorization)
    if(!decode){
        res.send({status: 401, errorCode: 'non-get.userInfo', msg: '登录已失效，请重新登录'}).end();
    }else {
        let {cart_id,num} = req.query
        sqlQuery(cart.updateQuantity,[num,cart_id,decode.user_id], (err,result)=>{
            if(err) console.error(err)
            else{
                if(result.affectedRows > 0){
                    console.log('购物车商品数量更新成功')
                    res.send({status:200,errorCode:'updateCartItemQuantity.success',msg:'购物车商品数量更新成功'}).end();
                }else{
                    console.log('购物车商品数量更新失败')
                    res.send({status:400,errorCode:'updateCartItemQuantity.non-success',msg:'购物车商品数量更新失败'}).end();
                }
            }
        })
    }
})
router.get('/deleteCartItem',async (req,res)=>{
    let decode = await getUserInfo(req.headers.authorization)
    if(!decode){
        res.send({status: 401, errorCode: 'non-get.userInfo', msg: '登录已失效，请重新登录'}).end();
    }else {
        let {carts_id} = req.query
        let sql;
        if (carts_id.length > 1) {
            sql = `DELETE FROM cart where user_id=${decode.user_id} and ID in (`
            let i = 0;
            for (; i < carts_id.length - 1; i++) {
                sql += `'${carts_id[i]}',`
            }
            sql += `'${carts_id[i]}')`
        } else { // 单商品删除
            sql = `DELETE FROM cart where user_id=${decode.user_id} and ID = '${carts_id}'`
        }
        selfjointSQL(sql, (err, result) => {
            if (err) console.error(err)
            else {
                if (result.affectedRows > 0) {
                    console.log('从购物车删除商品成功')
                    res.send({status: 200, errorCode: 'deleteCartItem.success', msg: '从购物车删除商品成功', sql: sql}).end();
                } else {
                    console.log('从购物车删除商品失败')
                    res.send({status: 400, errorCode: 'deleteCartItem.non-success', msg: '从购物车删除商品失败'}).end();
                }
            }
        })
    }
})
module.exports = function (){
    return router;
}
