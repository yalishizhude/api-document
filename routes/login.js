var monk = require('monk');
var conf = require('./config');
var db = monk(conf.mongoUrl);
var cUsr = db.get('users');

module.exports = function (req, res, next) {
  'use strict';
  //如果已登录，验证token
  if(!req.session.user&&req.cookies.token){
    try{
      var dec = decode(req.cookies.token);
      var user = JSON.parse(dec);
      cUsr.find(user, function(err, data){
        if(err) throw err;
        if(data){
          req.session.user = data[0];
          logined();
        }
      });
    } catch(e){
      throw e;
    }
  } else {
    logined();
  }
  function logined(){
    //根路径跳转
    if(/\/(index.html)?$/.test(req.path)||'/'===req.path) return res.redirect('/api/projects.html');
    //跳转登陆页面
    if(!req.session.user && !/\/api\/login.*/.test(req.path)) {
      if(/(.html)$/.test(req.path)) return res.redirect("/api/login.html");
      else return res.send(401, {message:'请重新登陆'});
    } else if('/api/login.json'===req.path){
      //登陆接口
      cUsr.find({
        name: req.body.name,
        password: req.body.password
      }, function(err, data) {
        if (err) {
          throw err;
        } else if (data.length) {
          var token = encode(JSON.stringify({name: req.body.name, password: req.body.password }));
          res.json({
            token: token,
            url: '/api/projects.html'
          });
        } else {
          res.json({
            message: '登陆失败'
          });
        }
      });
    } else {
      next();
    }
  }
};

function encode(s) {
  'use strict';
  return s.replace(/[\d\D]/g, function($) {
      return ("000" + $.charCodeAt(0).toString(16)).slice(-4);
  });
}
function decode(s) {
  'use strict';
  return s.replace(/.{4}/g, function($) {
      return String.fromCharCode(parseInt($, 16));
  });
}
