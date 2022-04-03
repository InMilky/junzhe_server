const express = require('express');
const bP = require('body-parser');
const debug = require('debug')('my-application'); // debug模块
const path = require('path')
const userRouter = require('./routes/user');
const itemRouter = require('./routes/item');
const cartRouter = require('./routes/cart');
const orderRouter = require('./routes/order');
const miaoshaRouter = require('./routes/miaosha');
const redisRouter = require('./routes/redisfn');

var server = express();

server.all('*',(req,res,next)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Header","*");
    res.header("Access-Control-Allow-Methods","*");
    if(req.method.toLowerCase()==='options'){
        res.sendStatus(200);
    }else{
        next();
    }
})


server.use(express.json());
server.use(bP.urlencoded({extended:false}));

server.use('/upload/',express.static(path.join(__dirname,'upload')));

server.use('/user',userRouter());
server.use('/item',itemRouter());
server.use('/cart',cartRouter());
server.use('/order',orderRouter());
server.use('/miaosha',miaoshaRouter());
server.use('/redis',redisRouter());

server.listen(5129,"127.0.0.1",function (){
    console.log('running at http://127.0.0.1:5129');
    debug('Express server listening on port '+5129);//监听端口号
});
