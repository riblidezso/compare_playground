'use strict';

angular.module('mapVisualizationApp')
  .directive('barChart', function () {
    return {
      restrict: 'E',
      transclude: true,
      scope: { id:'@id', data:'=data' },
      //scope: true,
      link: function postLink(scope, element, attrs) {
        var barChart = dc.rowChart(element[0]);
        scope.$watch('data', function (newVal, oldVal) {
          if (newVal !== oldVal){
            // var countriesK = [],
            // countriesV = [];
            // newVal[1].top(10).forEach(function(country){
            //   countriesK.push(country.key);
            //   countriesV.push(country.value);
            // });
            // console.log(countriesK, countriesV);

            // Highjacking of gropung function to get only top 5
            var remove_rows = function (group) {
                return {
                    all:function () {
                        var top5Groups = group.top(5);
                        return group.all().filter(function(d) {
                            return top5Groups.indexOf(d) !== -1;
                        });
                    },
                    top: function(k){
                      group.top(k).sort(function(a, b){
                          if (a.value > b.value) {
                            return -1;
                          }
                          if (a.value < b.value) {
                            return 1;
                          }
                          // a must be equal to b
                          return 0;
                      });
                    }
                };
            };

            barChart
              .width(160)
              .height(160)
              .margins({
                top: 10,
                right: 10,
                bottom: 20,
                left: 10
              })
              .dimension(newVal[0])
              .group(remove_rows(newVal[0].group()))
              .label(function(d) {
                return d.key;
              })
                .title(function(d) {
                  return d.value;
                })
                .elasticX(true)
              .colors(d3.scale.category10())
              .ordering(function(d){ return -d.value; })
              .on('filtered', function(chart, filter){
                // Filter the points in the map with the filter
                if(chart.filters()) {
                  scope.$emit('updateIsolates');
                }
              })
              .xAxis().ticks(4).tickFormat(d3.format('d'));

            // barChart.data(function(group) {
            //     return newVal[0].group().top(5);
            // });

            // Render chart
            barChart.render();
          }
        });

        scope.$on('clusterSelected', function (event) {
          barChart.redraw();
        });
      }
    };
  });
