const express = require('express');
const db = require("./databases");
const fs = require('fs')
const path = require('path')
const multer = require('multer');
const {item} =  require('./sql');

const router = express.Router();

router.use(multer({dest:'./upload/'}).any());

router.get('/getCarousel',(req,res)=>{
    let sql = item.getCarousel
    db.sqlQuery(sql,{},(err,result)=>{
        if(err) console.error(err)
        else{
            if(result.length<=0){
                // console.log("获取carousel列表失败");
                res.send({status:400,errorCode:'getCarousel.non-success',msg:'获取carousel列表失败'}).end();
            }else{
                // console.log("获取carousel列表成功");
                res.send({status:200,errorCode:'getCarousel.success',msg:'获取carousel列表成功',data:result}).end();
            }
        }
    })
})

router.get('/getBrand',(req,res)=>{
    let sql = item.getBrand
    db.sqlQuery(sql, {},(err,result)=>{
        if(err) console.error(err)
        else{
            if(result.length<=0){
                // console.log("获取品牌brand列表失败");
                res.send({status:400,errorCode:'getBrand.non-success',msg:'获取品牌brand列表失败'}).end();
            }else{
                // console.log("获取品牌brand列表成功");
                res.send({status:200,errorCode:'getBrand.success',msg:'获取品牌brand列表成功',data:result}).end();
            }
        }
    })
})

router.get('/getNice',(req,res)=>{
    let sql = item.getNice
    db.sqlQuery(sql, {},(err,result)=>{
        if(err) console.error(err)
        else{
            if(result.length<=0){
                res.send({status:400,errorCode:'getNice.non-success'}).end();
            }else{
                res.send({status:200,errorCode:'getNice.success',data:result}).end();
            }
        }
    })
})

router.get('/getRecommond',(req,res)=>{
    let sql = item.getRecommond
    db.sqlQuery(sql, {},(err,result)=>{
        if(err) console.error(err)
        else{
            if(result.length<=0){
                // console.log("获取推荐列表失败");
                res.send({status:400,errorCode:'getRecommond.non-success',msg:'获取推荐列表失败'}).end();
            }else{
                // console.log("获取推荐列表成功");
                res.send({status:200,errorCode:'getRecommond.success',msg:'获取推荐列表成功',data:result}).end();
            }
        }
    })
})

router.post('/getItem',(req,res)=>{
    let sql = item.getItem
    let ID = req.body.ID
    db.sqlQuery(sql, [ID],async function (err,result){
        if(err) console.error(err)
        else{
            if(result.length<=0){
                console.log(ID+"：该商品不存在，请选择其他商品");
                res.send({status:400,errorCode:'getRecommond.non-success',msg:'该商品不存在，请选择其他商品'}).end();
            }else{
                console.log(ID+"：获取商品信息成功");
                let detail = await getItemInfo(ID)
                if(detail){
                    result[0]['detail']=detail
                }
                res.send({status:200,errorCode:'getRecommond.success',msg:'获取商品信息成功',data:result}).end();
            }
        }
    })
})

// enctype='multipart/form-data'
router.use('/upload',(req,res)=>{
    let file = req.files[0];
    let pathObj = path.parse(file.originalname);
    let newname = file.path+pathObj.ext;
    fs.rename(file.path,newname,(err)=>{
        if (err){
            console.error(err)
        }else{
            //    修改数据库
            res.send({status:200,name:file.originalname,path:newname}).end();
        }
    })
//    删除文件
//     if(data.length>0) {
//         fs.unlink('./upload/' + data[0].src,(err)=>{
//             if(err){
//                 console.error(err)
//             }else{
//                 db.query('DELETE FROM ',(err))
//             }
//         })
//     }
})

// router.get('/getuser',async (req,res)=>{
//     let token = req.headers.authorization;
//     let decode = await getUserInfo(token)
//     let username = decode.username
//     if(username){
//         res.send({status: 200, errorCode: 'ok', msg: '获取用户信息成功',username:username}).end();
//     }else{
//         res.send({status: 400, errorCode: 'non-get.userInfo', msg: '登录已失效，请重新登录'}).end();
//     }
// })

// router.get('/getuserid',async (req,res)=>{
//     let token = req.headers.authorization;
//     let decode = await getUserInfo(token)
//     let user_id = decode.user_id
//     if(username){
//         res.send({status: 200, errorCode: 'ok', msg: '获取用户信息成功',username:username}).end();
//     }else{
//         res.send({status: 400, errorCode: 'non-get.userInfo', msg: '获取用户信息失败'}).end();
//     }
// })

// function getUserInfo(token){
//     let decode = jwtUtil.verify(token,jwtUtil.SECRET_KEY)
//     return new Promise((resolve => resolve({user_id:decode.client_id,email:decode.email})))
// }


router.post('/getItemInfo',async (req,res)=>{
    let result = await getItemInfo(req.body.ID)
    res.send({result:result})
})

function getItemInfo(ID){
    let sql = item.getItemInfo
    return new Promise((resolve,reject) => {
        db.sqlQuery(sql,[ID],(err,result)=>{
            if(result.length>0){
                let brief_img = result[0].brief.split(';')
                result[0]['brief_img'] = brief_img
                delete result[0]['brief']
                delete result[0]['ID']
                resolve(result)
            }else{
                resolve('')
            }
        })
    })
}

module.exports = function (){
    return router;
}
