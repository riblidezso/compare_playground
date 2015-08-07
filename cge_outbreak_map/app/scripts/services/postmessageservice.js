'use strict';

/**
 * @ngdoc service
 * @name mapVisualizationApp.PostMessageService
 * @description
 * # PostMessageService
 * Factory in the mapVisualizationApp.
 */

angular.module('mapVisualizationApp')
  .factory('PostMessageService', function($rootScope) {

  var $messages = [];

  var api = {
    messages: function(_message_) {
      if (_message_) {
        $messages.push(_message_);
        $rootScope.$apply();
      }
      return $messages;
    },
    outgoing: function() {
      // better for perfomance reasons.
      //$rootScope.$emit('outgoingMessage');
      $rootScope.$broadcast('outgoingMessage');
    }
  };

  return api;
});
