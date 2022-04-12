// 给密码加密md5签名
const crypto = require('crypto');

module.exports = {
    MD5_SUFFIX : 'gongJUN&ZHANGzheHan.love051129FOREVER!jzp*REAL1640',
    md5:function (psw){
        const obj = crypto.createHash('md5');
        obj.update(psw);
        const str = obj.digest('hex');
        return str;
    }
}
