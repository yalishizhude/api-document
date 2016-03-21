/*global angular, _, Mock*/
(function(window, angular) {
	'use strict';
	angular.module('indexApp', [])
	.config(['$interpolateProvider', function($interpolateProvider) {
	  $interpolateProvider.startSymbol('//');
	  $interpolateProvider.endSymbol('//');
	}])
	.controller('mainCtrl', ['$scope', '$http', '$timeout', function($scope, $http, $timeout){
		var pid = location.hash.replace('#', '');
		$http.get('/module/'+pid).success(function(resp){
			$scope.modules = resp;
		});
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
		$scope.sort = function(col){
			$http.get('/module/'+pid+'?sort='+col).success(function(resp){
				$scope.modules = resp;
			});
		};
		$scope.sendRequest = function(){
			$http.post('/request', {method: $scope.api.method, hostport: $scope.hostport, url:$scope.api.url, param:$scope.inObject, referenceId: $scope.api.referenceId}).success(function(resp){
				$scope.result = JSON.stringify(resp, null, '  ');
			}).error(function(resp){
				$scope.result = JSON.stringify(resp, null, '  ');
			});
		};
		$scope.keydown = function($event, module){
			if(13===$event.keyCode) $scope.save(module);
		};
		$scope.keyup = function(dom){
			$scope.hostport = dom.target.innerText;
		};
		$scope.save = function(module){
			if(module){
				$http.put('/module/'+module._id, {pid: module.pid, interfaces: module.interfaces, name: module.text}).success(function(resp){
					if(resp){
						module.name = module.text;
						module.text = null;
					} else {
						$scope.hint('保存模块失败!\n'+resp);
					}
				});
			} else {
				$http.post('/module', {name: $scope.mod.name, pid: pid}).success(function(resp){
					if(resp){
						$scope.modules = $scope.modules||[];
						$scope.modules.push(resp);
						$scope.mod = null;
					} else {
						$scope.hint('保存模块失败!\n'+resp);
					}
				});
			}
		};
		$scope.remove = function(_id){
			$http.delete('/module/'+_id).success(function(resp){
				if(resp){
					for(var i=$scope.modules.length-1;i>=0;i--){
						if($scope.modules[i]._id===_id){
							$scope.modules.splice(i, 1);
							break;
						}
					}
				} else {
					$scope.hint('删除模块失败!');
				}
			});
		};
		$scope.cancel = function(module){
			if(module) module.text = null;
			else $scope.mod = null;
		};
		$scope.showReference = function($event, refering){
			$event.stopPropagation();
			$scope.refering = refering;
		};
		$scope.setReference = function($event, reference){
			$event.stopPropagation();
			$http.put('/interface/'+$scope.refering._id+'/'+(reference?'reference._id':'/1')).success(function(resp){
				if(reference){
					$scope.refering.referenceId = reference._id;
					$scope.refering.referenceName = reference.name;
				} else {
					$scope.refering.referenceId = null;
					$scope.refering.referenceName = null;
				}
				$scope.cancelRefer();
			});
		};
		$scope.cancelRefer = function(){
			$scope.refering = null;
		};
		$scope.showInterfaceDetail = function(_id){
			$http.get('/interface/'+_id).success(function(resp){
				$scope.api = resp.api;
				$scope.result = '';
			});
		};
		$scope.edit = function(module){
			if(module){
				module.text = module.name;
				$timeout(function(){
					document.getElementById('_moduleName').focus();
				},0);
			} else {
				$scope.mod = $scope.mod||{};
				$timeout(function(){
					document.getElementById('moduleName').focus();
				},0);
			}
		};
    $scope.showParam = function(title, content){
      $scope.modalTitle = title;
      $scope.modalContent = content;
    };
		$scope.deleteInterface = function(_id, list){
			$http.delete('/interface/'+_id).success(function(resp){
				if(resp){
					for(var i=list.length-1;i>=0;i--){
						if(list[i]._id===_id){
							list.splice(i,1);
							break;
						}
					}
				} else {
					$scope.hint('删除接口失败');
				}
			});
		};
		$scope.hint = function(text){
			$scope.message = text;
			$timeout(function(){
				$scope.message = '';
			}, 5000);
		};
	}])
	;
	angular.bootstrap(document, ['indexApp']);
})(window, angular);
