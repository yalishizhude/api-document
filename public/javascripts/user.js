/*global angular*/
(function(window, angular) {
	'use strict';
	angular.module('userApp', [])
	.config(['$interpolateProvider', function($interpolateProvider) {
	  $interpolateProvider.startSymbol('//');
	  $interpolateProvider.endSymbol('//');
	}])
	.controller('mainCtrl', ['$scope', '$http', '$timeout', function($scope, $http, $timeout){
		$http.get('/user').success(function(resp){
			if(resp) $scope.userList = resp;
		});
		$scope.save = function(){
			$http.put('/user/self', $scope.self).success(function(resp){
				if(resp){
					$scope.hint('保存成功', 'success');
				} else {
					$scope.hint(resp.message);
				}
			});
		};
		$scope.edit = function(u){
			$http.put('/user/'+u._id, u).success(function(resp){
				if(!resp) $scope.hint('修改用户权限失败！\n'+resp);
			});
		};
		$scope.add = function(u){
			$http.post('/user', u).success(function(resp){
				$scope.userList = $scope.userList||[];
				if(resp.status===0){
					$scope.hint(resp.message);
				} else {
					$scope.userList.push(resp);
				}
				$scope.user = null;
			});
		};
		$scope.delete = function(_id){
			$http.delete('/user/'+_id).success(function(resp){
				if(resp){
					for(var i=$scope.userList.length-1;i>=0;i--){
						if($scope.userList[i]._id===_id){
							$scope.userList.splice(i,1);
							break;
						}
					}
				} else {
					$scope.hint('删除用户失败！\n'+resp);
				}
			});
		};
		$scope.hint = function(text, level){
			$scope.message = $scope.message||{};
			$scope.message.text = text;
			$scope.message.level = level||'danger';
			$timeout(function(){
				$scope.message = null;
			}, 5000);
		};
	}])
	;
	angular.bootstrap(document, ['userApp']);
})(window, angular);
