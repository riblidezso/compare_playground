'use strict';

angular.module('mapVisualizationApp')
 .directive('attributePicker', function ($timeout) {
    return {
      templateUrl: 'templates/attibutePickerTemplate.html',
      restrict: 'A',
      transclude: true,
      controller: function ($scope){
         $scope.nodata = true;
      },
      scope: { id:'@id', name:'@name', data:'=data' },
      //scope: true,
      link: function postLink(scope, element, attrs) {
         scope.$watch('data', function (newVal, oldVal) {
            if (newVal !== oldVal){
               scope.elements = newVal[1].all();
               // Hide element if there is no data
               if (scope.elements.length !== 0 &&
                 !(scope.elements.length === 1 && scope.elements[0].key === '')
               ){
                  scope.nodata = false;
               }
               var dimension = newVal[0];
               scope.selected = scope.name;
               // Listener to event: 'click on list element'
               scope.filterDimension = function(data){
                  // Filter selected dimension
                  dimension.filter(data.key);
                  // Redraw all the other charts
                  dc.redrawAll();
                  scope.selected = data.key;
                  scope.$emit('updateIsolates');
               };

               // Listener to event: 'click on reset'
               scope.resetDimension = function(){
                  dimension.filterAll();
                  dc.redrawAll();
                  scope.selected = scope.name;
                  scope.$emit('updateIsolates');
              };
           }
        });
      }
    };
  });
