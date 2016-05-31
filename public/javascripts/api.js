  angular.module('app', ['ngAnimate', 'ui.bootstrap', 'ui.router']).config(['$interpolateProvider', '$stateProvider', function ($interpolateProvider, $stateProvider) {
    $interpolateProvider.startSymbol('//');
    $interpolateProvider.endSymbol('//');
    $stateProvider.state('interface', {
      url: '/interface/:_id',
      templateUrl: '/interface/ifc.html',
      controller: 'ifcCtrl'
    });
  }]).controller('ctrl', ['$scope', '$http', '$location', function ($scope, $http, $location) {
    $http.get('/module/' + $location.search().pid).success(function (res) {
      $scope.interfaceTree = res.modules;
      angular.forEach($scope.interfaceTree, function (mod) {
        mod._name = mod.name;
      });
    });
    $scope.fold = function (flag) {
      angular.forEach($scope.interfaceTree, function (mod) {
        mod.fold = flag;
      });
    };
    $scope.addModule = function () {
      $scope.loading = true;
      $http.post('/module', {
        name: $scope.moduleName,
        pid: $location.search().pid
      }).success(function (resp) {
        if (resp) {
          $scope.interfaceTree.push(resp);
        }
        $scope.loading = false;
      });
      $scope.moduleName = '';
      $scope.moduleState = '';
    };
    $scope.editModule = function (module) {
      $scope.loading = true;
      module.state = '';
      var m = {
        _id: module._id,
        name: module._name,
        pid: module.pid
      };
      $http.put('/module/' + module._id, m).success(function (resp) {
        if (resp) {
          module.name = module._name;
        } else {
          module._name = module.name;
        }
        $scope.loading = false;
      });
    };
    $scope.deleteModule = function (module) {
      $http['delete']('/module/' + module._id).success(function (res) {
        if (res) {
          $scope.interfaceTree = _.without($scope.interfaceTree, module);
        }
      });
    };
  }]);
  angular.element(document).ready(function () {
    angular.bootstrap(document, ['app']);
  });
