/*global angular */
(function(window, angular) {
	'use strict';
	angular.module('loginApp', ['validation.rule'])
	.controller('mainCtrl', ['$scope', '$http', function($scope, $http){
		if(location.search.indexOf('loginout')>-1)document.cookie="token=";
		$scope.submit = function(){
			$http.post('/login', $scope.user).success(function(resp){
				if(resp.url){
          document.cookie="token="+resp.token;
					location= resp.url;
				}
				else $scope.message = '用户名/密码错误';
			});
		};
		$scope.keydown = function($event){
			if($event.keyCode===13) {
				$scope.submit();
			}
		};
	}])
	;
	angular.bootstrap(document, ['loginApp']);
})(window, angular);
