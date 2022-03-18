const jwtUtil = require("./jwtUtils");
const {user} = require("./sql");
const {sqlQuery} = require("./databases");


const getUserInfo = function(token){
    let decode = jwtUtil.verify(token,jwtUtil.SECRET_KEY)
    return new Promise((resolve => resolve({user_id:decode.client_id,username:decode.username})))
}
const getUsername = function getUsername(ID){
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

module.exports = {
    getUserInfo,
    getUsername
}
