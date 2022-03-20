const express = require('express');
const {sqlQuery} = require("./databases");
const {cart,item} =  require('./sql');
const {getUserInfo,getCartItem} = require('./fn')

const router = express.Router();

router.get('/getCart',async (req,res)=>{
    let sql = cart.select
    // let token = req.headers.authorization;
    // let decode = await getUserInfo(token)
    let decode = {user_id:17}
    sqlQuery(sql,[decode.user_id], async (err,result)=>{
        if(err) console.error(err)
        else{
            if(result.length<=0){
                res.send({status:400,errorCode:'getCart.non-success',msg:'获取购物车信息失败'}).end();
            }else{
                let sql = item.getCartItem
                for(let i=0; i<result.length; i++){
                    let item_info = await getCartItem(result[i].item_id,sql)
                    result[i] = {...result[i],...item_info}
                }
                res.send({status:200,errorCode:'getCart.success',msg:'获取购物车信息成功',data:result}).end();
            }
        }
    })
})


module.exports = function (){
    return router;
}
