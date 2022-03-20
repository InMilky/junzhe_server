const jwtUtil = require("./jwtUtils");
const {user, item} = require("./sql");
const {sqlQuery,miaoshaQuery} = require("./databases");


const getUserInfo = function(token){
    let decode = jwtUtil.verify(token,jwtUtil.SECRET_KEY)
    return new Promise((resolve => resolve({user_id:decode.client_id,username:decode.username})))
}
const getUsername = (ID)=>{
    const sql = user.table.queryByUserID
    return new Promise((resolve,reject) => {
        sqlQuery(sql,[ID],(err,result)=>{
            if(result.length>0){
                return  resolve({username:result[0].username})
            }else{
                console.error(err);
                return reject(err)
            }
        })
    })
}
const getItem = (ID,sql) => {
    return new Promise((resolve,reject) => {
        sqlQuery(sql, [ID],async function (err,result){
            if(err) console.error(err)
            else{
                if(result.length<=0){
                    console.error(err);
                    return reject(err)
                }else{
                    let detail = await getItemInfo(ID)
                    if(detail){
                        result[0]['detail']=detail
                    }
                    return resolve(result[0])
                }
            }
        })
    })
}
const getItemInfo = (ID)=>{
    let sql = item.getItemInfo
    return new Promise((resolve,reject) => {
        sqlQuery(sql,[ID],(err,result)=>{
            if(result.length>0){
                let brief_img = result[0].brief.split(';')
                result[0]['brief_img'] = brief_img
                delete result[0]['brief']
                delete result[0]['ID']
                resolve(result[0])
            }else{
                resolve('')
            }
        })
    })
}
// 获取服务器时间，由于计算与客户端的时间差
const getServerTime =  ()=>{
    return Date.now()
}
// 获取活动时间
const getPromo = (ID,sql) => {
    return new Promise((resolve,reject) => {
        miaoshaQuery(sql,[ID],(err,result)=>{
            if(result.length>0){
                resolve(result)
            }else{
                resolve('')
            }
        })
    })
}

const getCartItem = (ID,sql) => {
    return new Promise((resolve,reject) => {
        sqlQuery(sql, [ID],async function (err,result){
            if(err) console.error(err)
            else{
                if(result.length<=0){
                    console.error(err);
                    return reject(err)
                }else{
                    return resolve(result[0])
                }
            }
        })
    })
}

module.exports = {
    getUserInfo,
    getUsername,
    getItem,
    getItemInfo,
    getPromo,
    getServerTime,
    getCartItem
}
