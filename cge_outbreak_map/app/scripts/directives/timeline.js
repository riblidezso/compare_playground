'use strict';

angular.module('mapVisualizationApp')
  .directive('timeLine', function () {
    return {
      templateUrl: 'templates/timeLineChartTemplate.html',
      restrict: 'EA',
      transclude: true,
      scope: { id:'@id', name:'@name', data:'=data' },
      //scope: true,
      link: function postLink(scope, element, attrs) {
        scope.$watch('data', function (newVal, oldVal) {
          if (newVal !== oldVal){

            // Structure and data in newVal
            // newVal= [
            //  min_year, max_year,
            //  dateDimension, dateDimensionGroup,
            //  byDays, byDaysGroup,
            //  byMonths, byMonthsGroup
            // ];

            var daysNames = d3.map({
               0:'mo', 1:'tu', 2:'we', 3:'thu',4:'fri', 5:'sat', 6:'sun'
            });
            var monthNames = d3.map({
               0:'ja', 1:'fe', 2:'mar', 3:'ap',4:'ma', 5:'jun',
               6:'jul', 7:'au', 8:'se', 9:'oc', 10:'no', 11:'de'
            });

            var timeLine = dc.barChart('#time-line-all');
            var timeLineDay = dc.barChart('#time-line-day');
            var timeLineMonth = dc.barChart('#time-line-month');

            ///var dayBrush = timeLineDay.brush();
            //var monthhBrush = timeLineMonth.brush();
            //var generalBrush = timeLine.brush();
            console.log(newVal[0], newVal[1]);
            // TIMELINE (General)
            timeLine.width(550)
                .height(50)
                .margins({top: 0, right: 10, bottom: 20, left: 10})
                .dimension(newVal[2])
                .group(newVal[2].group())
                .gap(10)
                // Some months added to the date
                .x(d3.time.scale().domain([newVal[0], newVal[1].setMonth(4)]))
                //.round(d3.time.day.round)
                //.xUnits(d3.time.days)
                .on('filtered', function(chart, filter){
                  //Filter the points in the map with the filter
                  //if(chart.filter()) {
                      scope.$emit('updateIsolates');
                  //}
                })
                ;

            // generalBrush.on('brushend', function(){
            //    // We update the vizs when the brush stops,
            //    // due to performance reasons
            //   scope.$emit('updateIsolates');
            // });

            //  ------> TIMELINE DAY
            timeLineDay.width(140)
                .height(50)
                .margins({top: 0, right: 10, bottom: 20, left: 10})
                .dimension(newVal[4])
                .group(newVal[4].group())
                .gap(10)
                .x(d3.scale.linear().domain([0, 7]))
                .on('filtered', function(chart, filter){
                  //Filter location dimension to avoid problems
                  // scope.$parent.locations[0].filterAll();
                  // //$('#reset_clusters').css({'display' : 'none'});
                  // scope.$parent.feature.each(function (d){
                  //   d.properties.data.selected = false;
                  //   // Change color of selected cluster to Red
                  //   d3.select(this).classed('circlePathSelected',false);
                  // });
                  // Filter the points in the map with the filter
                  //if(chart.filter()) {
                    scope.$emit('updateIsolates');
                  //}
                })
                .xAxis().tickFormat(function(d, i){
                  return daysNames.get(i);
                });

            // dayBrush.on('brushend', function(){
            //   scope.$emit('updateIsolates');
            // });

            //  ------> TIMELINE Month
            timeLineMonth.width(225)
                .height(50)
                .margins({top: 0, right: 10, bottom: 20, left: 10})
                .dimension(newVal[6])
                .group(newVal[6].group())
                .gap(10)
                .x(d3.scale.linear().domain([0, 12]))
                .on('filtered', function(chart, filter){
                  //Filter the points in the map with the filter
                  //if(chart.filter()) {
                      scope.$emit('updateIsolates');
                  //}
                })
                .xAxis().tickFormat(function(d, i){
                  return monthNames.get(i);
                });

            // monthhBrush.on('brushend', function(){
            //    // We update the vizs when the brush stops,
            //    // due to performance reasons
            //    scope.$emit('updateIsolates');
            // });

            timeLine.render();
            timeLineDay.render();
            timeLineMonth.render();

            // Hide the y axis in
            d3.select('#time-line-chart').selectAll('g.y').style('display','none');

            // Listener function to event: 'reset timeline dimension'
            scope.resetDimension = function(dimension){
              dimension.filterAll();
              dc.redrawAll();
            //   scope.$parent.filter.data = [];
            //   scope.$parent.filter.type = scope.id.split('-')[0];
              scope.$emit('updateIsolates');
           };

            scope.$on('clusterSelected', function () {
              timeLine.redraw();
              timeLineDay.redraw();
              timeLineMonth.redraw();
            });

          }
        });
      }
    };
  });
