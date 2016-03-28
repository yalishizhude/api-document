(function (window, angular) {
  'use strict';
  angular.module('app', []).config(function ($interpolateProvider) {
    $interpolateProvider.startSymbol('//');
    $interpolateProvider.endSymbol('//');
  }).controller('ctrl', ['$scope', function ($scope) {
    JSONEditor.defaults.options.theme = 'bootstrap3';
    JSONEditor.defaults.options.iconlib= 'bootstrap3';
    var schema = {
      type: "object",
      properties: {
        name: {
          "type": "string"
        }
      }
    };
    var paramEditor = new JSONEditor(document.getElementById("inEditor"), {
      schema: schema
    });
    document.getElementById('inSchema').innerText = JSON.stringify(schema, null, '  ');
  }]);
  angular.bootstrap(document, ['app']);
}(window, angular));
