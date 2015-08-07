'use strict';

angular.module('mapVisualizationApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ngActivityIndicator',
  'ngGrid',
  'mapVisualizationApp.config',
  'ui.bootstrap',
  'colorpicker.module'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
