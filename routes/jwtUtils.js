// 产生和验证token
const jwt = require('jsonwebtoken');
/**
 * 签名
 * @param payload 载荷
 * @param secretKey 秘钥
 * @param expiresIn 过期时间(s)
 * @returns {*}
 */
function sign(payload,secretKey,expiresIn){
    let token = jwt.sign(payload,secretKey,{expiresIn:expiresIn});
    return token;
}

/**
 * 验证权限
 * @param token
 * @param secretKey 秘钥
 */
function verify (token,secretKey) {
    let result = '';
    jwt.verify(token, secretKey, (err, decode) => {
        if (err) {
            console.error(err);
        } else {
            result = decode;
        }
    })
    return result;
}

module.exports = {
    SECRET_KEY : 'gongJUN&ZHANGzheHan.love051129FOREVER!jzp*REAL1640',
    verify,
    sign
}
