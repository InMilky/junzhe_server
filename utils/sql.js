const user = {
  table: {
    insert: 'insert into user_table(username,telphone,email,register_date) values(?,?,?,?)',
    queryByTelphone: 'select * from user_table where telphone = ?',
    queryByUsername: 'select * from user_table where username = ?',
    queryByUserID: 'select * from user_table where ID = ?'
  },
  password: {
    insert: 'insert into user_password(telphone,encrypt_password,user_id) values(?,?,?)',
    queryByUserID: 'select * from user_password where user_id = ?',
    queryByTelphone: 'select * from user_password where telphone = ?'
  }
}
const item = {
  search:'select * from item where title like "%"?"%" order by price DESC', //根据名字升序降序
  getItem:'select * from item where ID = ?',
  getCartItem:'select title,color,m_price,price,img_url from item where ID = ?',
  getItemInfo:'select * from item_detail where ID = ?',
  getCarousel:'select * from carousel',
  getSpecial:'select * from item order by m_price DESC limit ?,?',
  getBrand:'select * from brand order by level DESC limit 6',
  getNice:'select * from item where img_url!=\'upload/\' and sold_num>3 order by sold_num limit 8',
  getRecommond:'select * from item where img_url!=\'upload/\' and isMiaosha = 0 order by sold_num DESC limit 12',
  getMiaosha:'select * from item where isMiaosha = 1 and m_price order by m_price DESC'
}
const cart = {
  select: 'select cart.ID,item_id,title,price,m_price,quantity,color,img_url ' +
      'from cart inner join item where item.ID = cart.item_id and user_id = ?',
  selectQuantity: 'select quantity from cart where item_id=? and user_id = ?',
  insertIntoCart:'INSERT INTO cart(quantity,item_id,user_id) VALUES(?,?,?)',
  updateCartItem:'update cart set quantity=? where item_id=? and user_id=?',
  updateQuantity:'update cart set quantity=? where ID=? and user_id=?',
  getCartItem:'select item_id,quantity from cart where user_id=17 and ID in (?)'
}
const order = {
  select: 'select orders.ID,ordertime,account,title,price,m_price,quantity,color,img_url,pay_state ' +
      'from (order_detail LEFT join orders on orders.ID = order_detail.order_id) LEFT JOIN item ' +
      'ON order_detail.item_id = item.ID where orders.user_id = ?',
  getOrder:'select title,quantity,account ' +
      'from (orders inner join order_detail on orders.ID = order_detail.order_id) inner join item ' +
      'on order_detail.item_id = item.ID where order_id=? and user_id = ?',
  insertOrder:'INSERT INTO orders(ID,account,user_id,ordertime) VALUES(?,?,?,?)',
  updateOrderStatus:'update orders set pay_state=? where ID=? and user_id=?',
  deleteOrder:'delete from orders where ID=? and user_id=?',
  deleteOrderDetail:'delete from order_detail where order_id=?',
  selectAutoValue:'select currentValue from auto_increment where name = "order_No"',
  updateAutoValue:'update auto_increment set currentValue = currentValue+step where name = "order_No"',
  getReceiver:'select name,telphone,address from receiver_info where user_id = ? and is_default = 1'
}
const miaosha={
  seckill_all:'select item_id,title,price,seckill_item.m_price,amount,seckill_item.sold_num,img_url ' +
      'from seckill_item left join item on item.ID = seckill_item.item_id order by m_price DESC',
  getPromo:'select start_date,end_date from seckill_promo where ID= (select promo_id from seckill_item where item_id =?)'
}
module.exports = {
  user,
  item,
  cart,
  order,
  miaosha
}
