/*global angular, _, Mock*/
(function (window, angular) {
  'use strict';
  angular.module('indexApp', ['validation.rule', 'angular-json-editor', 'xeditable']).config(function ($interpolateProvider, JSONEditorProvider) {
    $interpolateProvider.startSymbol('//');
    $interpolateProvider.endSymbol('//');
    JSONEditorProvider.configure({
      plugins: {
        sceditor: {
          style: 'sce/development/jquery.sceditor.default.css'
        }
      },
      defaults: {
        options: {
          iconlib: 'bootstrap3',
          theme: 'bootstrap3',
          ajax: true
        }
      }
    });
  }).run(function(editableOptions) {
    editableOptions.theme = 'bs3';
  }).controller('mainCtrl', ['$scope', '$http', '$timeout', function ($scope, $http, $timeout) {
    $http.get('/interface/' + location.hash.replace('#', '')).success(function (resp) {
      $scope.versions = resp.versions;
      $scope.api = resp.api;
    }).error(function (resp) {
      $scope.hint(resp);
    });
    $scope.$watch('api.inObject', function (nVal) {
      try {
        $scope.inObject = JSON.stringify(Mock.mock(JSON.parse(nVal)), null, '  ');
      } catch (e) {
        $scope.inObject = nVal;
      }
    });
    $scope.$watch('api.outObject', function (nVal) {
      try {
        $scope.outObject = JSON.stringify(Mock.mock(JSON.parse(nVal)), null, '  ');
      } catch (e) {}
    });
    $scope.keyup = function (dom) {
      $scope.hostport = dom.target.innerText;
    };
    $scope.keydown = function ($event, arr) {
      if (13 === $event.keyCode) {
        $scope.addParam(arr);
      }
      $event.stopPropagation();
    };
    $scope.sendRequest = function () {
      $http.post('/request', {
        method: $scope.api.method,
        hostport: $scope.hostport,
        url: $scope.api.url,
        param: $scope.inObject,
        referenceId: $scope.api.referenceId
      }).success(function (resp) {
        $scope.result = JSON.stringify(resp, null, '  ');
      }).error(function (resp) {
        $scope.result = JSON.stringify(resp, null, '  ');
      });
    };
    $scope.addParam = function (arr) {
      arr.push({
        seq: _.now(),
        name: '',
        isNeed: 'true',
        type: 'string',
        desc: ''
      });
    };
    $scope.delParam = function (index, arr) {
      angular.forEach(arr, function (item, i) {
        if (item.seq === index) arr.splice(i, 1);
      });
    };
    $scope.submit = function () {
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
    $scope.hint = function (text, level) {
      $scope.message = $scope.message || {};
      $scope.message.text = text;
      $scope.message.level = level;
      $timeout(function () {
        $scope.message = null;
      }, 5000);
    };
    $scope.types = ['string', 'number', 'double', 'boolean', 'object', 'array', 'stream'];
  }]).controller('SyncButtonsController', [function(){}]);
  angular.bootstrap(document, ['indexApp']);
})(window, angular);
