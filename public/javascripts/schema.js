(function (window, angular) {
  'use strict';
  angular.module('app', ['validation.rule']).config(function ($interpolateProvider) {
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
  }]).controller('ctrl', ['$scope', '$http', '$interval', function ($scope, $http, $interval) {
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
        $scope.api[property + 'Verified'] = !!check._error;
        $scope.api[property + 'Validation'] = JSON.stringify(check, null, 2);
      } catch (e) {
        $scope.api[property + 'Verified'] = true;
        $scope.api[property + 'Validation'] = '参数/规则有误，校验失败';
      }
    }

    function countdown() {
      $scope.second = 3;
      $scope.interval = $interval(function () {
        $scope.second--;
        if ($scope.second <= 0) {
          $interval.cancel($scope.interval);
          window.close();
        }
      }, 1000);
    }
    if (location.hash.replace('#', '')) {
      $http.get('/interface/' + location.hash.replace('#', '')).success(function (resp) {
        $scope.versions = resp.versions;
        $scope.api = _.extend({
          inObject: '',
          inSchema: '',
          outSchema: ''
        }, resp.api);
      });
    }
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
    /**
     * 复制接口
     * @return {[type]} [description]
     */
    $scope.copy = function () {
      var txt = document.getElementById('json');
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
      var api = JSON.parse($scope.modalContent);
      $scope.api = _.extend($scope.api, api);
    };
    /**
     * 保存
     * @return {[type]} [description]
     */
    $scope.submit = function () {
      countdown();
      var method = $scope.api._id ? 'put' : 'post',
        param = $scope.api._id ? ('/' + $scope.api._id) : '',
        api = _.omit($scope.api, 'inValidation', 'inVerified', 'outValidation', 'outVerified');
      if ($scope.api._id) {
        api.version++;
      } else {
        api.createDate = api.updateDate;
      }
      $http[method]('/interface' + param, api).success(function (resp) {
        if (resp) {
          if (window.opener) {
            window.opener.location.reload();
          }
          $scope.api = resp;
          location.hash = '#' + resp._id;
          countdown();
        } else {
          window.alert('保存失败!\n' + JSON.stringify(resp, null, 2));
        }
      });
    };
    $scope.stop = function () {
      $scope.second = null;
      $interval.cancel($scope.interval);
    };
  }]);
  angular.bootstrap(document, ['app']);
}(window, angular));
