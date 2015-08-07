'use strict';

angular.module('mapVisualizationApp')
  .directive('pieChart', function () {
   return {
      restrict: 'E',
      transclude: true,
      scope: { id:'@id', data:'=data' },
      //scope: true,
      link: function postLink(scope, element, attrs) {
        // Pie of countries. Visibl for all watchers
        var pieChart = dc.pieChart(element[0]);

        scope.$watch('data', function (newVal, oldVal) {
          if (newVal !== oldVal){
            var countries = d3.nest()
                .key(function(d) { return d.key; })
                .map(scope.data[1].all(), d3.map).keys();

            pieChart
              .width(160)
              .height(160)
              .radius(75)
              .innerRadius(20)
              .dimension(scope.data[0])
              .group(scope.data[1])
              .label(function (d) {
                  console.log(d);
                  return d.data.key;
              })
              .renderLabel(true)
              .colors(d3.scale.category10())
              .colorDomain(countries)
              .colorAccessor(function(d, i){return i;})
              .on('filtered', function(chart, filter){
                if(chart.filters()){
                  var countries = chart.filters();
                  // scope.$parent.filter.data = countries;
                  // scope.$parent.filter.type = 'country';
                  //scope.$parent.mydata = [];
                  scope.$emit('updateIsolates');
                }
              });

            // Render chart
            pieChart.render();
          }
        });

        scope.$on('clusterSelected', function () {
           pieChart.redraw();
        });
      }
    };
  });
