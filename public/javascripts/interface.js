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
    $scope.editable = location.search.indexOf('editable=') < 0;
    /**
     * 按照json schema规范校验参数
     * @param  {String} property "in"入参;"out"返回值
     * @return {[type]}          [description]
     */
    function validate(property) {
      try {
        var schema = $scope.api[property + 'Schema'] ? JSON.parse($scope.api[property + 'Schema']) : {};
        var validateSchema = jsen({
          "$ref": "http://json-schema.org/draft-04/schema#"
        });
        var isSchemaValid = validateSchema(schema);
        if (!isSchemaValid) {
          return;
        }
        var obj = $scope.api[property + 'Object'] ? JSON.parse($scope.api[property + 'Object']) : {};
        var validate = jsen(schema, {
          greedy: true
        });
        var valid = validate(obj);
        $scope.api[property + 'Verified'] = valid;
        $scope.api[property + 'Validation'] = valid ? 'valid' : JSON.stringify(validate.errors, null, 2);
      } catch (e) {
        $scope.api[property + 'Verified'] = false;
        $scope.api[property + 'Validation'] = 'invalid';
      }
    }

    function countdown() {
      $scope.second = 5;
      $scope.interval = $interval(function () {
        $scope.second--;
        if (0 === $scope.second) {
          $interval.cancel($scope.interval);
          window.close();
        }
      }, 1000);
    }
    if (location.hash.replace('#', '')) {
      $http.get('/interface/' + location.hash.replace('#', '')).success(function (resp) {
        $scope.editable = !resp.editable ? resp.editable : $scope.editable;
        $scope.api = _.extend({
          login: 'false',
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
      var method = $scope.api._id ? 'put' : 'post',
        param = $scope.api._id ? ('/' + $scope.api._id) : '',
        api = _.omit($scope.api, 'inValidation', 'inVerified', 'outValidation', 'outVerified');
      api.testStatus = 0;
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
          if (resp.api) {
            $scope.api = resp.api;
            location.hash = '#' + resp.api._id;
          }
          countdown();
        } else {
          window.alert('保存失败!\n' + JSON.stringify(resp, null, 2));
        }
      });
    };
    $scope.stop = function () {
      $interval.cancel($scope.interval);
      $scope.second = false;
    };
    /**
     * 自动缩进
     */
    $scope.indent = function (e) {
      var node = e.srcElement;
      var start = node.selectionStart;
      var end = node.selectionEnd;
      if (222 === e.keyCode) { //双引号
        node.value = node.value.substring(0, start) + '"' + node.value.substring(end, node.value.length);
        node.selectionStart = start;
        node.selectionEnd = start;
      } else if (219 === e.keyCode) { //括号
        node.value = node.value.substring(0, start) + (e.shiftKey ? '}' : ']') + node.value.substring(end, node.value.length);
        node.selectionStart = start;
        node.selectionEnd = start;
      } else if (9 === e.keyCode) { //tab
        e.preventDefault();
        e.stopPropagation();
        node.value = node.value.substring(0, start) + '  ' + node.value.substring(end, node.value.length);
        node.selectionStart = start + 2;
        node.selectionEnd = start + 2;
      } else if (13 === e.keyCode) { //回车
        e.preventDefault();
        e.stopPropagation();
        var row = node.value.substring(0, start).split('\n').pop();
        var space = '\n' + row.split(/[^\s]/)[0];
        var symbolEnd = /[\}|\]]/.test(node.value.charAt(start));
        if (start > 0) {
          var before = node.value.charAt(start - 1)
          if ('{' === before || '[' === before) {
            space += '  ';
          }
        }
        space += symbolEnd ? '\n' : '';
        node.value = node.value.substring(0, start) + space + node.value.substring(end, node.value.length);
        node.selectionStart = start + space.length + (symbolEnd ? -1 : 0); 
        node.selectionEnd = start + space.length + (symbolEnd ? -1 : 0);
      }
    }
  }]);
  angular.bootstrap(document, ['app']);
}(window, angular));
