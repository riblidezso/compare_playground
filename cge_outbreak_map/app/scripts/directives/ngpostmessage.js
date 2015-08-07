'use strict';

/**
 * @ngdoc directive
 * @name mapVisualizationApp.directive:ngPostMessage
 * @description
 * # ngPostMessage
 */

angular.module('mapVisualizationApp')
  .directive('ngPostMessage', function($window, PostMessageService) {
  return {
    restrict: 'A',
    controller: function($scope, $attrs, PostMessageService) {
      $scope.$on('outgoingMessage', function(evt) {
        console.log(evt);
        if ($scope.sender) {
          var m = JSON.stringify({
            status: 200,
            message: PostMessageService.messages()
          });
          $scope.sender.postMessage(m, '*');
        }
      });
    },
    link: function postLink(scope, element, attrs) {
      scope.sendMessageToService = function(e) {

        if (e && e.originalEvent.data) {
          var response = null;
          scope.sender = e.originalEvent.source;
          try {
            response = angular.fromJson(e.originalEvent.data);
          } catch (error) {
            response = e.originalEvent.data;
          }
          console.log(response);
          if (response.code === 'connect') {
            console.log('Succesfully connected');
            scope.isolateResultData = response.data;
          }else{
            console.log('Post message undefined', response.message);
          }

          //PostMessageService.messages(response.message);
        }
      };
      console.log('binding message');
      angular.element($window).bind('message', scope.sendMessageToService);
    }
  };
});
