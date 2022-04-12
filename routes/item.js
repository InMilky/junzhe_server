const express = require('express');
const {sqlQuery} = require("../utils/databases");
const fs = require('fs')
const path = require('path')
const multer = require('multer');
const {item} =  require('../utils/sql');
const {
    getItem,
    getItemInfo, getNice
} = require('../utils/fn')

const router = express.Router();

router.use(multer({dest:'./upload/'}).any());

router.get('/getCarousel',(req,res)=>{
    let sql = item.getCarousel
    sqlQuery(sql,{},(err,result)=>{
        if(err) console.error(err)
        else{
            if(result.length<=0){
                res.send({status:400,errorCode:'getCarousel.non-success',msg:'获取carousel列表失败'}).end();
            }else{
                res.send({status:200,errorCode:'getCarousel.success',msg:'获取carousel列表成功',data:result}).end();
            }
        }
    })
})

router.get('/getBrand',(req,res)=>{
    let sql = item.getBrand
    sqlQuery(sql, {},(err,result)=>{
        if(err) console.error(err)
        else{
            if(result.length<=0){
                res.send({status:400,errorCode:'getBrand.non-success',msg:'获取品牌brand列表失败'}).end();
            }else{
                res.send({status:200,errorCode:'getBrand.success',msg:'获取品牌brand列表成功',data:result}).end();
            }
        }
    })
})

router.get('/getNice',async (req,res)=>{
    const arr = await getNice(item.getNice1)
    const arr2= await getNice(item.getNice2)
    const result = [arr, arr2]
    if(arr && arr2) {
        res.send({status: 200, errorCode: 'getNice.success', data: result}).end();
    }else{
        res.send({status: 400, errorCode: 'getNice.non-success', data: result}).end();
    }
})

router.get('/getRecommond',(req,res)=>{
    let sql = item.getRecommond
    sqlQuery(sql, {},(err,result)=>{
        if(err) console.error(err)
        else{
            if(result.length<=0){
                res.send({status:400,errorCode:'getRecommond.non-success',msg:'获取推荐列表失败'}).end();
            }else{
                res.send({status:200,errorCode:'getRecommond.success',msg:'获取推荐列表成功',data:result}).end();
            }
        }
    })
})

router.get('/getMiaosha',(req,res)=>{
    let sql = item.getMiaosha
    sqlQuery(sql, {},(err,result)=>{
        if(err) console.error(err)
        else{
            if(result.length<=0){
                res.send({status:400,errorCode:'getMiaosha.non-success',msg:'获取秒杀列表失败'}).end();
            }else{
                res.send({status:200,errorCode:'getMiaosha.success',msg:'获取秒杀列表成功',data:result}).end();
            }
        }
    })
})

router.post('/getItem',async (req,res)=>{
    let ID = req.body.ID
    let result = await getItem(ID,item.getItem)
    if(result){
        res.send({status:200,errorCode:'getItem.success',msg:'获取商品信息成功',data:result}).end();
    }else{
        res.send({status:400,errorCode:'getItem.non-success',msg:'该商品不存在，请选择其他商品'}).end();
    }
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
//                 query('DELETE FROM ',(err))
//             }
//         })
//     }
})

router.get('/search',(req,res)=>{
    let key = req.query.key
    let sql = item.search
    sqlQuery(sql,[key],(err,result)=>{
        if(err){
            console.error(err)
        }else{
            if(result.length>0){
                res.send({status: 200, errorCode: 'ok', msg: '关键字搜索商品成功',data:result}).end();
            }else{
                res.send({status: 400, errorCode: 'non-get.userInfo', msg: '抱歉，没有找到与"'+key+'"相关的商品'}).end();
            }
        }
    })
})


router.post('/getItemInfo',async (req,res)=>{
    let result = await getItemInfo(req.body.ID)
    res.send({result:result})
})


module.exports = function (){
    return router;
}
