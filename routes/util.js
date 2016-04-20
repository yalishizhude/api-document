var superagent = require('superagent');
var config = require('./config');
var monk = require('monk');
var db = monk(config.mongoUrl);
var cInt = db.get('interfaces');
var cUsr = db.get('users');
(function () {
  "use strict";
  var util = {
    rewrite: function () {
      superagent.get(config.mockUrl + (new Date()).getTime()).end(function (e, r) {
        if (e) {
          console.error(e);
        }
      });
    }
  };
  //创建管理员用户
  var admin = {
      name: 'admin',
      password: 'admin',
      manageable: true,
      editable: true
  };
  cUsr.find({
      name: 'admin'
  }, function(err, data) {
      if (err) {
          console.error(err);
      } else if (data.length === 0) {
          cUsr.insert(admin);
      }
  });
  //更新老接口
  if (process.argv.indexOf('--update') > -1) {
      cInt.find({
          $or: [{
              inParams: {
                  $not: {
                      $in: [null, []]
                  }
              }
          }, {
              outParams: {
                  $not: {
                      $in: [null, []]
                  }
              }
          }, {
              url: {
                  $regex: /\?/
              }
          }]
      }, function(err, ifc) {
        function backup(){
          var cIntBackup = db.get('interfacesBackup');
          cIntBackup.drop();
          cInt.find({}, function(e, r){
            cIntBackup.insert(r);
            update();
          });
        }
        function update(){
          cInt.find({}, function(e, rr) {
            var interfaceList = [];
            var hdjk = process.argv.indexOf('--hdjk') > -1;
            rr.forEach(function(r) {
              var inObject = r.inObject ? JSON.parse(r.inObject) : {};
              if (!r.url || !r.method) return;
              //将url不允许查询参数，如/s/d?_BIZCODE=006。url查询参数转为inObject
              r.url = 0 === r.url.indexOf('/') ? r.url : ("/" + r.url);
              if (r.url.indexOf('?') > -1) {
                var search = r.url.split('?')[1];
                r.url = r.url.split('?')[0];
                search.split('&').forEach(function(pair) {
                  inObject[pair.split('=')[0]] = pair.split('=')[1];
                });
              }
              //将inParams/outParams参数说明转为inSchema/outSchema，考虑到嵌套参数描述，不加规则校验
              r.inParams = r.inParams || [];
              r.outParams = r.outParams || [];
              r.inSchema = r.inSchema || {
                "properties": {}
              };
              r.outSchema = r.outSchema || {
                "properties": {}
              };
              if (r.inParams.length > 0 || r.outParams.length > 0) {
                r.inParams.forEach(function(param) {
                  r.inSchema.properties[param.name] = {
                    type: param.type.toLowerCase(),
                    description: param.desc
                  };
                });
                if (hdjk && inObject._BIZCODE) {
                  r.inSchema.properties._BIZCODE = {
                    type: "string",
                    enum: [inObject._BIZCODE]
                  };
                  r.inSchema.required = ['_BIZCODE'];
                }
                r.outParams.forEach(function(param) {
                  r.outSchema.properties[param.name] = {
                    description: param.desc
                  };
                });
              }
              r.inObject = JSON.stringify(inObject, null, 2);
              r.inSchema = JSON.stringify(r.inSchema, null, 2);
              r.outSchema = JSON.stringify(r.outSchema, null, 2);
              if(r.outObject) {
                r.outObject = JSON.stringify(JSON.parse(r.outObject), null, 2);
              }
              delete r.inParams;
              delete r.outParams;
              delete r._id;
              interfaceList.push(r);
            });
            cInt.drop();
            interfaceList.forEach(function(i) {
              cInt.insert(i, function(err, data) {
                if (err) console.error(err);
              });
            });
            console.log('已更新接口');
          });
        }
        if (err) throw err;
        if (ifc.length > 0) {
            backup();
        }
      });
  }
  module.exports = util;
}());
