(function (window, angular) {
  'use strict';
  angular.module('app', []).config(function ($interpolateProvider) {
    $interpolateProvider.startSymbol('//');
    $interpolateProvider.endSymbol('//');
  }).directive('textarea', [function () {
    return {
      restrict: 'E',
      link: function ($scope, element, attrs) {
        /*        element.on('keydown', function (e) {
                  var value = '';
                  var index = 0;
                  var lastChar = '';
                  var spaceNum = 0;
                  var pos = e.srcElement.selectionStart;
                  var rows = element.val().split('\n');
                  if (13 === e.keyCode) {
                    _.each(rows, function (r, i) {
                      var spaceNum = '';
                      for (var j = 0; j < r.length; j++) {
                        index++;
                        if (index === pos) {
                          lastChar = r.trim().split('').pop();
                          if (',' === lastChar) {
                            spaceNum = r.search(/\w/);
                          } else if ('[' === lastChar || '{' === lastChar) {
                            spaceNum = r.search(/\w/) + 2;
                          }
                        }
                      }
                      value += i === length - 1 ? '' : '\n';
                    });
                    e.preventDeafult();
                    e.srcElement.value = value;
                  }
                });
        */
      }
    };
  }]).controller('ctrl', ['$scope', '$http', function ($scope, $http) {
    /**
     * 按照json schema规范校验参数
     * @param  {String} property "in"入参;"out"返回值
     * @return {[type]}          [description]
     */
    function validate(property) {
      try {
        var obj = $scope.api[property + 'Object'] ? JSON.parse($scope.api[property + 'Object']) : {};
        var schema = $scope.api[property + 'Schema'] ? JSON.parse($scope.api[property + 'Schema']) : {};
        if (schema.test) {
          schema.test = window.eval(schema.test);
        }
        var validator = new Validator(schema);
        var check = validator.check(obj);
        $scope.api[property + 'Validation'] = JSON.stringify(check, null, 2);
      } catch (e) {
        $scope.api[property + 'Validation'] = '参数/规则有误，校验失败';
        console.log(e);
      }
    }
    $http.get('/interface/' + location.hash.replace('#', '')).success(function (resp) {
      $scope.versions = resp.versions;
      $scope.api = _.extend({
        inObject: '',
        inSchema: '',
        outSchema: ''
      }, resp.api);
      $scope.$watch('api.inObject', function (newVal, oldVal) {
        validate('in');
      });
      $scope.$watch('api.inSchema', function (newVal, oldVal) {
        validate('in');
      });
      $scope.$watch('api.outObject', function (newVal, oldVal) {
        validate('out');
      });
      $scope.$watch('api.outSchema', function (newVal, oldVal) {
        validate('out');
      });
    });
    /**
     * 复制接口
     * @return {[type]} [description]
     */
    $scope.copy = function () {
      var txt = document.getElementById('json');

    //   "_id" : ObjectId("56d63e0b21931a201ebad436"),
    //  "pid" : "56d4f0b5d1f45d581b4f1726",
    //  "mid" : "56d5099e3393f30c2205d5c8",
    //  "version" : 2,
    //  "author" : "admin",
    //  "updateDate" : "2016-03-01",
    //  "method" : "get",
    //  "inParams" : [],
    //  "outParams" : [
    //      {
    //          "seq" : 1456816582682.0000000000000000,
    //          "name" : "data",
    //          "isNeed" : "true",
    //          "type" : "boolean",
    //          "desc" : "是否已经填写过问卷"
    //      }
    //  ],
    //  "url" : "/answer",
    //  "name" : "查询已回答问卷",
    //  "outObject" : "{\n  \"data|1\": [\n    true,false\n  ] \n}",
    //  "oid" : "56d541da33afd8882e130dea"

      txt.value = JSON.stringify(_.pick($scope.api, 'name', 'url', 'method', 'remark', 'inObject', 'inSchema', 'outObject', 'outSchema'), null, 2);
      txt.select();
      document.execCommand("Copy");
      alert("已复制好，可贴粘。");
    };
    /**
     * 粘贴接口
     * @return {[type]} [description]
     */
    $scope.paste = function () {
      console.log($scope.modalContent);
    };
    /**
     * 保存
     * @return {[type]} [description]
     */
    $scope.submit = function () {
      if (window.opener) {
        window.opener.location.reload();
      }
      if ($scope.api._id) {
        $scope.api.version++;
        $http.put('/interface/' + $scope.api._id, $scope.api).success(function (resp) {
          if (resp) {
            $scope.api = resp.api;
            location.hash = '#' + resp.api._id;
            $scope.versions = resp.versions;
            $scope.hint('保存成功!', 'success');
          } else {
            $scope.hint('保存失败!\n' + resp, 'danger');
          }
        });
      } else {
        $http.post('/interface', $scope.api).success(function (resp) {
          if (resp) {
            $scope.api = resp;
            location.hash = '#' + resp._id;
            $scope.hint('保存成功!', 'success');
          } else {
            $scope.hint('保存失败!\n' + resp, 'danger');
          }
        });
      }
    };
  }]);
  angular.bootstrap(document, ['app']);
}(window, angular));
