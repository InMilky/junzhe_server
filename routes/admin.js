const express = require('express');
const encrypt = require('./encryption');
const db = require("./databases");
const jwtUtil = require("./jwtUtils");
const {admin} =  require('./sql');

const router = express.Router();

// POST=>req.body.XXX, GET=>req.query.XXX
router.post('/signin',(req,res)=>{
    let telphone = req.body.telphone;
    let password = encrypt.md5(req.body.password+encrypt.MD5_SUFFIX);

    let sql = admin.queryByTelphone
    db.sqlQuery(sql,[telphone],async function (err,result){
        if (err){
            console.error(err);
        }else{
            if(result.length<=0){
                console.log(telphone+"：该账号没有权限登录");
                res.send({status:400,errorCode:'user.non-authorization',msg:'该账号没有权限登录'}).end();
            }else if(result[0].telphone===telphone && result[0].encrypt_password === password){
                console.log(telphone+"：登录admin成功");
                let email = await getEmail(result[0].ID)
                let jwt_token = jwtUtil.sign({'client_id':result[0].ID,'email':email},jwtUtil.SECRET_KEY,24*3600*1000);
                res.send({status:200,errorCode:'ok',msg:'登录admin成功',email:email,token:jwt_token}).end();
            }else {
                console.log(telphone+"：登录失败，账号或者密码错误");
                res.send({status:400,errorCode:'user.params.invalid',msg:'登录失败，账号或者密码错误'}).end();
            }
        }
    })
})

router.get('/getuser',async (req,res)=>{
    let token = req.headers.authorization;
    let decode = await getUserInfo(token)
    let username = decode.username
    if(username){
        res.send({status: 200, errorCode: 'ok', msg: '获取用户信息成功',username:username}).end();
    }else{
        res.send({status: 400, errorCode: 'non-get.userInfo', msg: '登录已失效，请重新登录'}).end();
    }
})

router.get('/getuserid',async (req,res)=>{
    let token = req.headers.authorization;
    let decode = await getUserInfo(token)
    let user_id = decode.user_id
    if(username){
        res.send({status: 200, errorCode: 'ok', msg: '获取用户信息成功',username:username}).end();
    }else{
        res.send({status: 400, errorCode: 'non-get.userInfo', msg: '获取用户信息失败'}).end();
    }
})

function getUserInfo(token){
    let decode = jwtUtil.verify(token,jwtUtil.SECRET_KEY)
    return new Promise((resolve => resolve({user_id:decode.client_id,email:decode.email})))
}

function getEmail(ID){
    const sql = admin.queryEmail
    return new Promise((resolve,reject) => {
        db.sqlQuery(sql,[ID],(err,result)=>{
            if(result.length>0){
                return  resolve({username:result[0].username})
            }else{
                console.error(err);
                return reject(err)
            }
        })
    })
}

module.exports = function (){
    return router;
}
