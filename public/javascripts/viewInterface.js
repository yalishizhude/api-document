/*global window, angular*/
(function(window, angular) {
	'use strict';
	angular.module('interface', [])
	.service('$view', function(){
		this.log = 1;
		return this;
	})
	.directive('view', ['$view', function($view){
		return {
			scope: true,
			templateUrl: '/api/template/viewInterface.html',
			link: function($scope, $view){
				console.log($view.log);
			}
		};
	}])
	;
})(window, angular);