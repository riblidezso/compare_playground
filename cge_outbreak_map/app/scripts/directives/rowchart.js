'use strict';

angular.module('mapVisualizationApp')
  .directive('rowChart', function() {
    return {
      templateUrl: 'templates/rowChartTemplate.html',
      restrict: 'EA',
      transclude: true,
      scope: {
        id: '@id',
        name: '@name',
        data: '=data'
      },
      //scope: true,
      link: function postLink(scope, element, attrs) {
        var pathRowChart = dc.rowChart('#path-chart');
        scope.$watch('data', function(newVal, oldVal) {
          if (newVal !== oldVal) {
            var group = scope.data[1].all();
            var dimensions = {
              'Unknown': 0,
              'Pathogenic': 0,
              'Non Pathogenic': 0
            };
            group.forEach(function(d) {
              dimensions[d.key] += 1;
            });

            // Add default value to show the dimension on the chart
            if (dimensions['Unknown'] === 0) {
              group.push({
                key: 'Unknown',
                value: 0
              });
            }
            if (dimensions['Pathogenic'] === 0) {
              group.push({
                key: 'Pathogenic',
                value: 0
              });
            }
            if (dimensions['Non Pathogenic'] === 0) {
              group.push({
                key: 'Non Pathogenic',
                value: 0
              });
            }

            // Pathogenic bar chart distribution
            pathRowChart
              .height(130)
              .width(160)
              .margins({
                top: 10,
                right: 10,
                bottom: 20,
                left: 10
              })
              .group(scope.data[1])
              .dimension(scope.data[0])
            //.colors(['#6BF536','#EF6922','#0E64F5'])
            .label(function(d) {
              return d.key;
            })
              .title(function(d) {
                return d.value;
              })
              .elasticX(true)
              .on('filtered', function(chart, filter) {
                //var clusterSelected = scope.$parent.selectedClusters.length == 0;
                // Filter the points in the map with the filter
                var dimensionExist = false;
                //if(chart.filters() && clusterSelected){
                if(chart.filters()){
                    var filters = chart.filters();
                    filters.forEach(function(d) {
                      if (dimensions[d] !== 0) {
                        dimensionExist = true;
                      }
                    });
                    if (dimensionExist || filters.length === 0) {
                      scope.$emit('updateIsolates');
                    }

                  }
              })
              .xAxis().ticks(4).tickFormat(d3.format('d'))
            ;

            pathRowChart.render();
          }
        });

        scope.$on('clusterSelected', function() {
          pathRowChart.redraw();
        });

      }
    };
  });
