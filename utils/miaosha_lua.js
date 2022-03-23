/**
 *  lua 脚本, 用于秒杀服务中 保证 查询库存和扣除库存 原子性 操作
 */
// -- redis连接
const redisClient;
let instance = {
    script : {

    }
};
// 用于记录已在redis缓存过的脚本sha码
let bufferScript = {};
/**
 * 查询扣件 秒杀商品 动作脚本定义
 * KEYS[1] user_id
 * KEYS[2] goods_id
 * keysLength key的个数
 * return 0-秒杀失败, 1-秒杀成功, 2-已经购买, 3-访问次数太多, 4-等待购买
 * @type {{code: string, keysLength: number}}
 */
instance.script.miaosha = {
    code: `
        local user_id  = KEYS[1]
        local goods_id = KEYS[2]
        redisClient.setnx user_id 0
        local num = redisClient.call( 'incr', user_id )  
        if  (tonumber(num) >5)  then
            redisClient.call('expire', user_id, expire_time) 
            return 3
        end
        local item_stock = "miaosha:"..item_id..":stock"
        local user_exists = "miaosha:"..item_id..":users"
        local user_num = redisClient.call( 'sismember', user_exists, user_id ) 
        if  tonumber (user_num, 10) == 1  then
            return 2
        end
        local left_items_count = redisClient.call( 'get', item_stock )
        if tonumber( left_goods_count, 10 ) <= 0  then
            return 0
        end
        else
            redisClient.call( 'decr', item_stock )
            redisClient.call( 'sadd', user_exists, user_id )
        end
        return 1
    `,
    keysLength:2
}

instance.run = function (lua_name,...params){
    return new Promise(async (resolve,reject) =>{
        if (!redisClient) {
            reject('redisClient is no ready');
        } else if (!instance.script[lua_name]) {
            reject('this command is not supported');
        } else {
            if (!bufferScript[lua_name]) {
                const sha = await scriptLua(lua_name)
                bufferScript[lua_name] = sha;
            }
            const result = await evalLua(lua_name,...params)
            resolve(result)
        }
    })
}
instance.run2 = function (lua_name,...params){
    return new Promise(async (resolve,reject) =>{
        if (!redisClient) {
            reject('redisClient is no ready');
        } else if (!instance.script[lua_name]) {
            reject('this command is not supported');
        } else {
            if (!bufferScript[lua_name]) {
                const sha = await redisClient.script('load', instance.script[lua_name].code)
                bufferScript[lua_name] = sha;
            }
            const result = await redisClient.evalsha(bufferScript[lua_name], instance.script[lua_name].keysLength, ...params)
            resolve(result)
        }
    })
}

function scriptLua(lua_name){
    //1 return new Promise((resolve,reject) =>{
        redisClient.script('load', instance.script[lua_name].code, (err, sha) => {
            if (err) {
                //1 reject(err);
                Promise.reject(err)
            } else {
                // bufferScript[lua_name] = sha;
                Promise.resolve(sha)
                //1 resolve(sha);
            }
        })
    //1 })
}
function evalLua(lua_name,...params){
    return new Promise((resolve,reject) =>{
        redisClient.evalsha(bufferScript[lua_name], instance.script[lua_name].keysLength, ...params, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    })
}

module.exports = function(client) {
    if (!client) {
        return;
    }
    redisClient = client;
    return instance;
}
