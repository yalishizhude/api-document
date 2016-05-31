/*global angular, _*/
(function (window, angular) {
  'use strict';
  angular.module('projectsApp', ['ui.bootstrap', 'ngAnimate']).config(['$interpolateProvider', function ($interpolateProvider) {
    $interpolateProvider.startSymbol('{%');
    $interpolateProvider.endSymbol('%}');
  }]).controller('mainCtrl', ['$scope', '$http', '$timeout', function ($scope, $http, $timeout) {
    function initProjectList(projectList) {
      angular.forEach($scope.projects, function (p, i) {
        p._name = p.name;
        switch (i % 5) {
          case 0:
            p.className = 'btn-info';
            break;
          case 1:
            p.className = 'btn-primary';
            break;
          case 2:
            p.className = 'btn-success';
            break;
          case 3:
            p.className = 'btn-warning';
            break;
          case 4:
            p.className = 'btn-danger';
            break;
        }
      });
    }
    $http.get('/project').success(function (resp) {
      $scope.projects = resp || [];
      initProjectList();
    });
    $scope.setLock = function(flag){
      $scope.lock = flag;
    };
    $scope.edit = function (p, $event) {
      $event.stopPropagation();
      $event.preventDefault();
      p.editing = true;
      if (p._id) {
        angular.element('#' + p._id).focus();
      } else {
        p.name = '';
        angular.element('#addBtn').focus();
      }
    };
    $scope.save = function (project, $event) {
      project.editing = false;
      $event.stopPropagation();
      if(!project.name){
        project.name = project._name;
      } else {
        var p = _.pick(project, '_id', 'name');
        if (p._id) {
          $http.put('/project/' + p._id, p).success(function (resp) {
            project._name = project.name;
          });
        } else {
          $http.post('/project', p).success(function (resp) {
            $scope.projects = $scope.projects || [];
            $scope.projects.push(resp);
            project.name = project._name;
            initProjectList();
          });
        }
      }
    };
    $scope.cancel = function (p, $event) {
      if ($scope.lock) return;
      $event.stopPropagation();
      p.name = p._name;
      p.editing = false;
    };
    $scope.remove = function (p, $event) {
      $event.stopPropagation();
      //delete为关键字，避免在IE下报错
      $http['delete']('/project/' + p._id).success(function (resp) {
        $scope.projects = _.without($scope.projects, p);
        initProjectList();
      });
    };
  }]);
  angular.bootstrap(document, ['projectsApp']);
})(window, angular);
