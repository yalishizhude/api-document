/*global angular*/
(function (window, angular) {
  'use strict';
  angular.module('validation.rule', ['validation']).config(['$validationProvider', function ($validationProvider) {
    var expression = {
      required: function (value) {
        return !!value;
      },
      url: /^http[s]?:\/\/.*/,
      // url: /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/,
      email: /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/,
      number: /^\d+$/,
      minlength: function (value, scope, element, attrs, param) {
        return value.length >= param;
      },
      maxlength: function (value, scope, element, attrs, param) {
        return value.length <= param;
      },
      json: function (value, scope, element, attrs, param) {
        try {
          if (jsl) {
            return value ? !!jsl.parser.parse(value) : true;
          } else {
            return value ? 'object' === typeof JSON.parse(value) : true;
          }
        } catch (e) {
          $validationProvider.setDefaultMsg({
            json: {
              error: e.toString()
            }
          });
          return false;
        }
      },
      jsonString: function (value) {
        try {
          return value ? !!JSON.parse(value) : true;
        } catch (e) {
          return false;
        }
      },
      noSearch: function (value) {
        return value ? value.indexOf('?') < 0 : true;
      },
      path: function (value) {
        return value ? value.indexOf('/') === 0 : true;
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
      },
      jsonString: {
        error: '必须为json格式或者字符串'
      },
      noSearch: {
        error: 'URL参数填写到“请求参数”，非GET请求不支持URL参数'
      },
      path: {
        error: '请求路径必须以"/"开头'
      }
    };
    $validationProvider.setExpression(expression).setDefaultMsg(defaultMsg);
  }]);
})(window, angular);
