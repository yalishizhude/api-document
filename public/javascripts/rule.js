/*global angular*/
(function(window, angular) {
  'use strict';
  angular
    .module('validation.rule', ['validation'])
    .config(['$validationProvider', function($validationProvider) {
      var expression = {
        required: function(value) {
          return !!value;
        },
        url: /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/,
        email: /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/,
        number: /^\d+$/,
        minlength: function(value, scope, element, attrs, param) {
          return value.length >= param;
        },
        maxlength: function(value, scope, element, attrs, param) {
          return value.length <= param;
        },
        json: function(value, scope, element, attrs, param){
          try{
            if(value) JSON.parse(value);
            return true;
          } catch(e) {
            return false;
          }
        }
      };

      var defaultMsg = {
        required: {
          error: '不能为空'
        },
        url: {
          error: '必须是Url'
        },
        email: {
          error: '必须是Email'
        },
        number: {
          error: '必须是数字'
        },
        minlength: {
          error: '太短了'
        },
        maxlength: {
          error: '太长了'
        },
        json: {
          error: '必须为json格式'
        }
      };
      $validationProvider.setExpression(expression).setDefaultMsg(defaultMsg);
    }]);
})(window, angular);
