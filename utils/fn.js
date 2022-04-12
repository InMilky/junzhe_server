const jwtUtil = require("./jwtUtils");
const {user, item, cart, order, miaosha} = require("./sql");
const {sqlQuery,miaoshaQuery, selfjointSQL} = require("./databases");

// user

function insertUser(username, telphone, email, nowtime){
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
function insertPassword(telphone,encrypt_password,user_id){
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
const getUserInfo = function(token){
    let decode = jwtUtil.verify(token)
    return new Promise(
        (resolve => resolve(decode))
    ).catch(()=>{Promise.reject('尚未登录或者登录已失效，请先进行登录再操作')})
}
const getUsername = (ID)=>{
    const sql = user.table.queryByUserID
    return new Promise((resolve,reject) => {
        sqlQuery(sql,[ID],(err,result)=>{
            if(err) {
                console.error(err)
                return reject(err)
            }
            if(result.length>0){
                return  resolve({username:result[0].username})
            }else{
                console.error(err);
                return reject(err)
            }
        })
    })
}
// item
const getItem = (ID,sql) => {
    return new Promise((resolve,reject) => {
        sqlQuery(sql, [ID],async function (err, result) {
            if(err) {
                console.error(err)
                return reject(err)
            }
            if (result.length > 0) {
                let detail = await getItemInfo(ID)
                if (detail) {
                    result[0]['detail'] = detail
                }
                return resolve(result[0])
            } else {
                console.error(err);
                return resolve('')
            }
        })
    }).catch(()=>{})
}
const getItemInfo = (ID)=>{
    let sql = item.getItemInfo
    return new Promise((resolve,reject) => {
        sqlQuery(sql,[ID],(err,result)=>{
            if(err) {
                console.error(err)
                return reject(err)
            }
            if(result.length>0){
                let brief_img = result[0].brief.split(';')
                result[0]['brief_img'] = brief_img
                delete result[0]['brief']
                resolve(result[0])
            }else{
                resolve('')
            }
        })
    }).catch(()=>{})
}
const getNice = (sql) => {
    return new Promise((resolve,reject) => {
        sqlQuery(sql, {},(err,result)=>{
            if(err) {
                console.error(err)
                return reject(err)
            }
            return resolve(result)
        })
    }).catch(()=>{})
}
// 获取活动时间
const getPromo = (ID,sql) => {
    return new Promise((resolve,reject) => {
        miaoshaQuery(sql,[ID],(err,result)=>{
            if(err) {
                console.error(err)
                return reject(err)
            }
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
            if(err) {
                console.error(err)
                return reject(err)
            }
            if (result.length <= 0) {
                return resolve(0)
            } else {
                return resolve(result[0].quantity)
            }
        })
    })
}

const addReceiver = (name,telphone, address, is_default,user_id) => {
    return new Promise((resolve,reject) => {
        const sql = user.table.addReceiver
        sqlQuery(sql,[name,telphone, address, is_default,user_id],async function (err,result){
            if(err) console.error(err)
            if(result.affectedRows > 0){
                const receiver = await getReceiver(user_id)
                return resolve(receiver)
            }else{
                console.error(err);
                return reject(err)
            }
        })
    })
}
const getReceiver = (user_id) => {
    return new Promise((resolve,reject) => {
        const sql = user.table.getReceiver
        sqlQuery(sql,[user_id],async function (err,result){
            if(err) console.error(err)
            else{
                if(result.length<=0){
                    console.error(err);
                    return resolve('')
                }else{
                    await updateAutoValue()
                    return resolve(result)
                }
            }
        })
    })
}
// order
const getAutoValue = () => {
    return new Promise((resolve,reject) => {
        let sql = order.selectAutoValue
        sqlQuery(sql,{},async function (err,result){
            if(err) {
                console.error(err)
                return reject(err)
            }
            if(result.length<=0){
                console.error(err);
                return reject(err)
            }else{
                await updateAutoValue()
                return resolve(result[0].currentValue)
            }
        })
    })
}
const updateAutoValue = () => {
    return new Promise((resolve,reject) => {
        let sql = order.updateAutoValue
        sqlQuery(sql,{},async function (err,result){
            if(err) {
                console.error(err)
                return reject(err)
            }
            if(result.affectedRows > 0){
                return resolve(result)
            }else{
                console.error(err);
                return reject(err)
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
            if(err) {
                console.error(err)
                return reject(err)
            }
            if(result.length > 0){
                return resolve(result)
            }else{
                console.error(err);
                return reject(err)
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
    return new Promise((resolve,reject) => {
        selfjointSQL(sql, (err,result)=>{
            if(err) {
                console.error(err)
                return reject(err)
            }
            if(result.affectedRows > 0){
                return resolve(result)
            }else{
                console.error(err);
                return reject(err)
            }
        })
    })
}
const insertSeckillOrder = (order_id,user_id,item_id,account,price,ordertime)=>{
    const sql = miaosha.insertOrder
    return new Promise((resolve,reject) => {
        miaoshaQuery(sql, [order_id,user_id,item_id,account,price,ordertime], function (err,result){
            if(err) {
                console.error(err)
                return reject(err)
            }
            if(result.affectedRows<=0){
                console.error(err);
                return reject(err)
            }else{
                return resolve(result)
            }

        })
    })
}
const insertSeckillOrderDetail = (order_id,item_id,quantity)=>{
    const sql = miaosha.insertOrderDetail
    return new Promise((resolve,reject) => {
        sqlQuery(sql, [order_id,item_id,quantity], function (err,result){
            if(err) {
                console.error(err)
                return reject(err)
            }
            if(result.affectedRows<=0){
                console.error(err);
                return reject(err)
            }else{
                return resolve(result)
            }

        })
    })
}
const updateStock = (amount,sold_num,item_id)=>{
    const sql = miaosha.updateStock
    return new Promise((resolve,reject) => {
        sqlQuery(sql, [amount,sold_num,item_id], function (err,result){
            if(err) {
                console.error(err)
                return reject(err)
            }
            if(result.affectedRows<=0){
                console.error(err);
                return reject(err)
            }else{
                return resolve(result)
            }

        })
    })
}

const insertOrder = (order_id,account,user_id,ordertime)=>{
    const sql = order.insertOrder
    return new Promise((resolve,reject) => {
        sqlQuery(sql, [order_id,account,user_id,ordertime], function (err,result){
            if(err) {
                console.error(err)
                return reject(err)
            }
            if(result.affectedRows<=0){
                console.error(err);
                return reject(err)
            }else{
                return resolve(result)
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
            if(err) {
                console.error(err)
                return reject(err)
            }
            if(result.affectedRows<=0){
                console.error(err);
                return reject(err)
            }else{
                return resolve(result)
            }

        })
    })
}
const deleteOrder = (sql,order_id,user_id)=>{
    return new Promise((resolve,reject) => {
        sqlQuery(sql, [order_id,user_id],function (err,result){
            if(err) {
                console.error(err)
                return reject(err)
            }
            if(result.affectedRows<=0){
                console.error(err);
                return reject(err)
            }else{
                return resolve(result)
            }

        })
    })
}
const deleteOrderDetail = (sql,order_id)=>{
    return new Promise((resolve,reject) => {
        sqlQuery(sql, [order_id],function (err,result){
            if(err) {
                console.error(err)
                return reject(err)
            }
            if(result.affectedRows<=0){
                console.error(err);
                return reject(err)
            }else{
                return resolve(result)
            }

        })
    })
}
const allOrder = (user_id) => {
    return new Promise((resolve,reject) => {
        let sql = order.allOrder
        sqlQuery(sql,[user_id],function (err,result){
            if(err) {
                console.error(err)
                return reject(err)
            }
            return resolve(result)
        })
    })

}
const allOrderDetail = (order_id) => {
    return new Promise((resolve,reject) => {
        let sql = order.selectDetailByOrderID
        sqlQuery(sql,[order_id],function (err,result){
            if(err) {
                console.error(err)
                return reject(err)
            }
            return resolve(result)
        })
    })

}

module.exports = {
    insertUser,insertPassword,
    getUserInfo, getUsername,
    getItem, getItemInfo,getNice,
    getPromo,
    getCartItem, delCartItem,
    selectQuantity,
    addReceiver,getReceiver,
    insertOrder, insertOrderDetail,
    insertSeckillOrder,insertSeckillOrderDetail,updateStock,
    getAutoValue, updateAutoValue,
    deleteOrder, deleteOrderDetail,
    allOrder,allOrderDetail
}
