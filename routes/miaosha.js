const express = require('express');
const {miaoshaQuery} = require("./databases");
const jwtUtil = require("./jwtUtils");
const {miaosha} =  require('./sql');

const router = express.Router();

router.get('/getSeckill',async (req,res)=>{
    let sql = miaosha.select_sql
    miaoshaQuery(sql,{},(err,result)=>{
        if(err) console.error(err)
        else{
            if(result.length>0) {
                res.send({status: 200, msg: '',data:result})
            }else{
                res.send({status: 400, msg: ''})
            }
        }
    })
})


function getUserInfo(token){
    let decode = jwtUtil.verify(token,jwtUtil.SECRET_KEY)
    return new Promise((resolve => resolve({user_id:decode.client_id,username:decode.username})))
}

module.exports = function (){
    return router;
}
