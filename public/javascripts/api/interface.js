/*global angular, _*/
(function(window, angular) {
	'use strict';
	angular.module('indexApp', ['validation.rule'])
	.config(function($interpolateProvider) {
	    $interpolateProvider.startSymbol('//');
	    $interpolateProvider.endSymbol('//');
	})
	.controller('mainCtrl', ['$scope', '$http', '$timeout', function($scope, $http, $timeout){
		function change(version){
			var hash = location.hash.replace('#', '');
			var url = '/api/interface.json/';
			var oid = hash.split('|')[0];
			version = version||hash.split('|')[1];
			url += oid + '/' + version;
			console.log(url);
			if(oid) $http.get(url).success(function(resp){
				$scope.versions = resp.versions;
				$scope.api = resp.api;
			}).error(function(resp){
				$scope.hint(resp);
			});
		}
		change();
		$scope.change = function(){
			change($scope.api.version);
		};
		$scope.$watch('api.inObject', function(nVal){
			try{
				$scope.inObject = JSON.stringify(Mock.mock(JSON.parse(nVal)), null, '  ');
			} catch(e){
				$scope.inObject = nVal;
			}
		});
		$scope.$watch('api.outObject', function(nVal){
			try{
				$scope.outObject = JSON.stringify(Mock.mock(JSON.parse(nVal)), null, '  ');
			} catch(e){}
		});
		$scope.keyup = function(dom){
			$scope.hostport = dom.target.innerText;
		};
		$scope.keydown = function($event, arr){
			if(13===$event.keyCode){
				$scope.addParam(arr);
			}
			$event.stopPropagation();
		};
		$scope.sendRequest = function(){
			$http.post('/api/request.json', {method: $scope.api.method, hostport: $scope.hostport, url:$scope.api.url, param:$scope.inObject}).success(function(resp){
				$scope.result = JSON.stringify(resp, null, '  ');
			}).error(function(resp){
				$scope.result = JSON.stringify(resp, null, '  ');
			});
		};
		$scope.addParam = function(arr){
			arr.push({
				seq: _.now(),
				name:'',
				isNeed: 'true',
				type: 'string',
				desc: ''
			});
		};
		$scope.delParam = function(index, arr){
			angular.forEach(arr, function(item, i){
				if(item.seq===index) arr.splice(i, 1);
			});
		};
		$scope.submit = function(){
			if($scope.api._id){
				$scope.api.version++;
				$http.put('/api/interface.json/'+$scope.api._id, $scope.api).success(function(resp){
					if(resp) {
						location.hash = '#'+$scope.api._id;
						$scope.hint('保存成功!', 'success');
					} else {
						$scope.hint('保存失败!\n'+resp, 'danger');
					}
				});
			} else {
				$http.post('/api/interface.json', $scope.api).success(function(resp){
					if(resp){
						$scope.api = resp;
						location.hash = '#'+resp._id;
						$scope.hint('保存成功!', 'success');
					} else {
						$scope.hint('保存失败!\n'+resp, 'danger');
					}
				});
			}
		};
		$scope.hint = function(text, level){
			$scope.message = $scope.message||{};
			$scope.message.text = text;
			$scope.message.level = level;
			$timeout(function(){
				$scope.message = null;
			}, 5000);
		};
	}])
	;
	angular.bootstrap(document, ['indexApp']);
})(window, angular);