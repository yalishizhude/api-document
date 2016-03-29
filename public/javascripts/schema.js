(function (window, angular) {
  'use strict';
  angular.module('app', []).config(function ($interpolateProvider) {
    $interpolateProvider.startSymbol('//');
    $interpolateProvider.endSymbol('//');
  }).controller('ctrl', ['$scope', '$http', function ($scope, $http) {
    $http.get('/interface/' + location.hash.replace('#', '')).success(function (resp) {
      $scope.versions = resp.versions;
      $scope.api = resp.api;
      $scope.$watch(function () {
        return $scope.api;
      }, function(o, n){
        console.log('inObject', o.inObject===n.inObject);
      });
    }).error(function (resp) {
      $scope.hint(resp);
    });
  }]);
  angular.bootstrap(document, ['app']);
}(window, angular));
