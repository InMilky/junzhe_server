const express = require('express');
const {sqlQuery} = require("./databases");
const {cart} =  require('./sql');
const {getUserInfo} = require('./fn')
const router = express.Router();


router.get('/getCart',async (req,res)=>{
    let sql = cart.select
    let token = req.headers.authorization;
    let decode = await getUserInfo(token)
    sqlQuery(sql,[decode.user_id],(err,result)=>{
        if(err) console.error(err)
        else{
            if(result.length<=0){
                res.send({status:400,errorCode:'getCart.non-success',msg:'获取购物车信息失败'}).end();
            }else{
                res.send({status:200,errorCode:'getCart.success',msg:'获取购物车信息成功',data:result}).end();
            }
        }
    })
})

module.exports = function (){
    return router;
}
