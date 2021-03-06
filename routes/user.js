const express = require('express');
const encrypt = require('../utils/encryption');
const {sqlQuery} = require("../utils/databases");
const jwtUtil = require("../utils/jwtUtils");
const chinaTime = require('china-time');
const {user, order} =  require('../utils/sql');
const {getUserInfo,getUsername, addReceiver, insertUser, insertPassword, getReceiver} = require('../utils/fn')
const router = express.Router();

// POST=>req.body.XXX, GET=>req.query.XXX
router.post('/signin',(req,res)=>{
    let telphone = req.body.telphone;
    let password = encrypt.md5(req.body.password+encrypt.MD5_SUFFIX);

    let sql = user.password.queryByTelphone
    sqlQuery(sql,[telphone],async function (err,result){
        if (err){
            console.error(err);
        }else{
            if(result.length<=0){
                console.log(telphone+"：该账号不存在，请前往注册");
                res.send({status:400,errorCode:'user.non-exist',msg:'该账号不存在，请前往注册'}).end();
            }else if(result[0].telphone===telphone && result[0].encrypt_password === password){
                console.log(telphone+"：登录成功")
                let user = await getUsername(result[0].user_id)
                let jwt_token = jwtUtil.sign({'user_id':result[0].user_id,'username':user.username},3600*2);
                console.log(jwt_token);
                res.send({status:200,errorCode:'ok',msg:'登录成功',username:user.username,token:jwt_token}).end();
            }else {
                console.log(telphone+"：登录失败，账号或者密码错误");
                res.send({status:400,errorCode:'user.params.invalid',msg:'登录失败，账号或者密码错误'}).end();
            }
        }
    })
})

router.post('/validatePhone',(req,res)=>{
    let telphone = req.body.telphone;
    let sql = user.password.queryByTelphone
    sqlQuery(sql,[telphone],function (err,result){
        if (err){
            console.error(err);
        }else{
            if(result.length<=0){
                console.log(telphone+"：该手机号可以进行注册");
                res.send({status:200,errorCode:'phone.validate',msg:'验证手机号成功，请点击下一步完成注册'}).end();
            }else{
                console.log(telphone+"：该账号已存在，请前往登录");
                res.send({status:400,errorCode:'phone.exist',msg:'该手机号已存在，请前往登录'}).end();
            }
        }
    })
})

router.post('/signup',async (req,res)=> {
    let {telphone, username, password, email} = req.body;
    let encrypt_password = encrypt.md5(password + encrypt.MD5_SUFFIX);
    let nowtime = chinaTime('YYYY-MM-DD HH:mm:ss');
    let user_id = await insertUser(username, telphone, email, nowtime)
    let result = await insertPassword(telphone,encrypt_password,user_id)
    // 注册成功
    if(result.status===200){
        console.log(telphone + "：注册成功，user_id="+user_id);
        res.send({status: 200, errorCode: 'ok', msg: '注册成功，请前往登录'}).end();
    } else {
        console.log(telphone + "：注册失败");
        res.send({status: 500, errorCode: 'user.params.invalid', msg: '注册失败，参数错误'}).end();
    }
})
router.post('/addReceiver',async (req,res)=> {
    let {telphone, name, address, is_default} = req.body;
    let decode = await getUserInfo(req.headers.authorization)
    if(!decode){
        res.send({status: 401, errorCode: 'non-get.userInfo', msg: '登录已失效，请重新登录'}).end();
    }else {
        let receiver = await addReceiver(name,telphone, address, is_default,decode.user_id)
        if (receiver.length > 0) {
            console.log('新增收货地址成功')
            res.send({status: 200, errorCode: 'addReceiver.success', msg: '新增收货地址成功', data: receiver}).end();
        } else {
            console.log('新增收货地址失败')
            res.send({status: 400, errorCode: 'addReceiver.success', msg: '新增收货地址失败'}).end();
        }
    }
})
router.get('/getReceiver',async (req, res) => {
    let sql = user.table.getReceiver
    let decode = await getUserInfo(req.headers.authorization)
    if(!decode){
        res.send({status: 401, errorCode: 'non-get.userInfo', msg: '登录已失效，请重新登录'}).end();
    }else {
        let result = await getReceiver(decode.user_id)
        if (result.length > 0) {
            console.log('获取收货地址成功')
            res.send({status: 200, errorCode: 'getReceiver.success', msg: '获取收货地址成功', data: result}).end();
        } else {
            console.log('获取收货地址失败')
            res.send({status: 400, errorCode: 'getReceiver.success', msg: '获取收货地址失败'}).end();
        }
    }
})

router.get('/getuser',async (req,res)=>{
    let token = req.headers.authorization;
    let decode = await getUserInfo(token)
    let username = decode.username
    if(username){
        res.send({status: 200, errorCode: 'ok', msg: '获取用户信息成功',username:username}).end();
    }else{
        res.send({status: 400, errorCode: 'non-get.userInfo', msg: '登录已失效，请重新登录',data:decode}).end();
    }
})


module.exports = function (){
    return router;
}
