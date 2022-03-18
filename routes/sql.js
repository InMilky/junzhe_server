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
const admin = {
    queryByTelphone: 'select * from admin_table where telphone = ?',
    queryByUsername: 'select * from admin_table where username = ?',
    queryEmail: 'select email from admin_table where ID = ?'
}
const item = {
  search:'select * from item where title like "%?%" order by ? ?', //根据名字升序降序
  getItem:'select * from item where ID = ?',
  getItemInfo:'select * from item_detail where ID = ?',
  getCarousel:'select * from carousel',
  getSpecial:'select * from item order by m_price DESC limit ?,?',
  getBrand:'select * from brand order by level DESC limit 6',
  getNice:'select * from item where category = 2 limit 8',
  getRecommond:'select * from item where img_url!=\'upload/\' order by sold_num DESC limit 12'
}
const cart = {
  select: 'select * from cart where user_id = ?'
}
const order = {
  select_sql: 'select * from orders where user_id = ?'
}
const miaosha={
  select_sql: 'select * from orders where user_id = ?'
}
module.exports = {
  admin,
  user,
  item,
  cart,
  order,
  miaosha
}
