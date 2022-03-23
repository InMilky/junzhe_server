const express = require('express');
const encrypt = require('./encryption');
const {sqlQuery} = require("./databases");
const jwtUtil = require("./jwtUtils");
const chinaTime = require('china-time');
const {user} =  require('./sql');
const {getUserInfo,getUsername} = require('./fn')
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
                console.log(telphone+"：登录成功");
                let user = await getUsername(result[0].user_id)
                let expiresIn = 3600*2
                let jwt_token = jwtUtil.sign({'client_id':result[0].ID,'username':user.username},jwtUtil.SECRET_KEY,expiresIn);
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
    let user_id = await InsertUser(username, telphone, email, nowtime)
    let result = await InsertPassword(telphone,encrypt_password,user_id)
    // 注册成功
    if(result.status===200){
        console.log(telphone + "：注册成功，user_id="+user_id);
        res.send({status: 200, errorCode: 'ok', msg: '注册成功，请前往登录'}).end();
    } else {
        console.log(telphone + "：注册失败");
        res.send({status: 500, errorCode: 'user.params.invalid', msg: '注册失败，参数错误'}).end();
    }
})

router.get('/getuser',async (req,res)=>{
    let token = req.headers.authorization;
    let decode = await getUserInfo(token)
    let username = decode.username
    if(username){
        res.send({status: 200, errorCode: 'ok', msg: '获取用户信息成功',username:username}).end();
    }else{
	    // res.sendStatus(401);
        res.send({status: 401, errorCode: 'non-get.userInfo', msg: '登录已失效，请重新登录',data:decode}).end();
    }
})

router.get('/test',async (req,res)=>{
    let token = req.headers.authorization;
    let decode = await getUserInfo(token)
    if(decode){
        res.send({status: 200, errorCode: 'ok', msg: decode}).end();
    }else{
        res.send({status: 400, errorCode: 'non-get.userInfo', msg: decode}).end();
    }
})

function InsertUser(username, telphone, email, nowtime){
    const sql = user.table.insert
    return new Promise((resolve,reject) => {
        sqlQuery(sql, [username, telphone, email, nowtime], function (err, result) {
            if (result.affectedRows > 0) {
                // return result.insertId;
                return resolve(result.insertId)
            } else {
                console.error(err);
                return reject(err)
            }
        })
    })
}
function InsertPassword(telphone,encrypt_password,user_id){
    const sql = user.password.insert;
    return new Promise((resolve,reject) => {
        sqlQuery(sql,[telphone,encrypt_password,user_id],function (err,result) {
            if (result.affectedRows > 0) {
                // return new Promise(resolve=>{resolve({status:200})});
                return  resolve({status:200})
            } else {
                console.error(err);
                return reject(err)
            }
        })
    })
}

module.exports = function (){
    return router;
}
