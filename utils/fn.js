const jwtUtil = require("./jwtUtils");
const {user, item, cart, order} = require("./sql");
const {sqlQuery,miaoshaQuery, selfjointSQL} = require("./databases");


const getUserInfo = function(token){
    let decode = jwtUtil.verify(token)
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

const selectQuantity = (item_id,user_id) => {
    const sql = cart.selectQuantity
    return new Promise((resolve,reject) => {
        sqlQuery(sql, [item_id,user_id],async function (err,result){
            if(err) console.error(err)
            else {
                if (result.length <= 0) {
                    return resolve(0)
                } else {
                    return resolve(result[0].quantity)
                }
            }
        })
    })
}

const getReceiver = (user_id) => {
    return new Promise((resolve,reject) => {
        const sql = order.getReceiver
        sqlQuery(sql,[user_id],async function (err,result){
            if(err) console.error(err)
            else{
                if(result.length<=0){
                    console.error(err);
                    return reject(err)
                }else{
                    await updateAutoValue()
                    return resolve(result[0])
                }
            }
        })
    })
}

const getAutoValue = () => {
    return new Promise((resolve,reject) => {
        let sql = order.selectAutoValue
        sqlQuery(sql,{},async function (err,result){
            if(err) console.error(err)
            else{
                if(result.length<=0){
                    console.error(err);
                    return reject(err)
                }else{
                    await updateAutoValue()
                    return resolve(result[0].currentValue)
                }
            }
        })
    })
}
const updateAutoValue = () => {
    return new Promise((resolve,reject) => {
        let sql = order.updateAutoValue
        sqlQuery(sql,{},async function (err,result){
            if(err) console.error(err)
            else{
                if(result.affectedRows > 0){
                    return resolve(result)
                }else{
                    console.error(err);
                    return reject(err)
                }
            }
        })
    })
}
const getCartItem = (carts_id,user_id) => {
    let sql;
    if(carts_id.length>1) { // 多商品插入到订单详情表，拼接sql——in ('XX','XX')
        sql = `select item_id,quantity from cart where user_id=${user_id} and ID in (`
        let i = 0;
        for(; i<carts_id.length-1; i++){
            sql += `${carts_id[i]},`
        }
        sql += `${carts_id[i]})`
    }else{ // 单商品查询
        sql = `select item_id,quantity from cart where user_id=${user_id} and ID = ${carts_id[0]}`
    }
    return new Promise((resolve,reject) => {
        selfjointSQL(sql, (err,result)=>{
            if(err) console.error(err)
            else{
                if(result.length > 0){
                    return resolve(result)
                }else{
                    console.error(err);
                    return reject(err)
                }
            }
        })
    })
}
const delCartItem = (carts_id,user_id) => {
    let sql;
    if(carts_id.length>1) { // 在购物车的多商品删除，拼接sql——in ('XX','XX')
        sql = `delete from cart where user_id=${user_id} and ID in (`
        let i = 0;
        for(; i<carts_id.length-1; i++){
            sql += `${carts_id[i]},`
        }
        sql += `${carts_id[i]})`
    }else{ // 单商品删除
        sql = `delete from cart where user_id=${user_id} and ID = ${carts_id[0]}`
    }
    console.log(carts_id,sql)
    return new Promise((resolve,reject) => {
        selfjointSQL(sql, (err,result)=>{
            if(err) console.error(err)
            else{
                if(result.affectedRows > 0){
                    return resolve(result)
                }else{
                    console.error(err);
                    return reject(err)
                }
            }
        })
    })
}
const insertOrder = (order_id,account,user_id,ordertime)=>{
    const sql = order.insertOrder
    return new Promise((resolve,reject) => {
        sqlQuery(sql, [order_id,account,user_id,ordertime], function (err,result){
            if(err) console.error(err)
            else{
                if(result.affectedRows<=0){
                    console.error(err);
                    return reject(err)
                }else{
                    return resolve(result)
                }
            }
        })
    })
}
const insertOrderDetail = (order_details)=>{
    let sql = `INSERT INTO order_detail(order_id,item_id,quantity) VALUES`
    order_details.forEach((item,index)=>{
        let {order_id,item_id,quantity} = item
        sql += `('${order_id}','${item_id}','${quantity}')`
        sql = (index<order_details.length-1)?sql+',':sql
    })
    return new Promise((resolve,reject) => {
        selfjointSQL(sql,async function (err,result){
            if(err) console.error(err)
            else{
                if(result.affectedRows<=0){
                    console.error(err);
                    return reject(err)
                }else{
                    return resolve(result)
                }
            }
        })
    })
}
const deleteOrder = (sql,order_id,user_id)=>{
    return new Promise((resolve,reject) => {
        sqlQuery(sql, [order_id,user_id],function (err,result){
            if(err) console.error(err)
            else{
                if(result.affectedRows<=0){
                    console.error(err);
                    return reject(err)
                }else{
                    return resolve(result)
                }
            }
        })
    })
}
const deleteOrderDetail = (sql,order_id)=>{
    return new Promise((resolve,reject) => {
        sqlQuery(sql, [order_id],function (err,result){
            if(err) console.error(err)
            else{
                if(result.affectedRows<=0){
                    console.error(err);
                    return reject(err)
                }else{
                    return resolve(result)
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
    getCartItem,
    delCartItem,
    selectQuantity,
    getReceiver,
    insertOrder,
    insertOrderDetail,
    getAutoValue,
    updateAutoValue,
    deleteOrder,
    deleteOrderDetail
}
