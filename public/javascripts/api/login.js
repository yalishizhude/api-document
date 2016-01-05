/*global angular */
(function(window, angular) {
	'use strict';
	angular.module('loginApp', ['validation.rule'])
	.controller('mainCtrl', ['$scope', '$http', function($scope, $http){
		$scope.submit = function(){
			$http.post('/api/login.json', $scope.user).success(function(resp){
				if(resp.url) location.href = resp.url;
				else $scope.message = '用户名/密码错误';
			});
		};
		$scope.keydown = function($event){
			if($event.keyCode===13) $scope.submit();
		};
	}])
	;
	angular.bootstrap(document, ['loginApp']);
})(window, angular);