// 给密码加密md5签名
const crypto = require('crypto');

module.exports = {
    MD5_SUFFIX : 'gongJUN&ZHANGzheHan.love051129FOREVER!jzp*REAL1640',
    md5:function (psw){
        var obj = crypto.createHash('md5');
        obj.update(psw);
        var str = obj.digest('hex');
        return str;
    }
}