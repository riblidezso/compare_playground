'use strict';

angular.module('mapVisualizationApp')
.service('CrossfilterService', function CrossfilterService() {
   // AngularJS will instantiate a singleton by calling 'new' on this function
   this.create = function (isolates, source) {

      console.log('Creating Crossfilter');

      var ndx = crossfilter(isolates);
      console.log(isolates);
      // Dimensions and groups
        // ID
      var id = ndx.dimension(function (d) {
          return d.id;
      });
        // Locations
      var locations = ndx.dimension(function (d) {
          return d.geometry.coordinates[0]+'#'+d.geometry.coordinates[1];
      });
        // Countries
      var countries = ndx.dimension(function (d) {
          return d.properties.data.country;
      });
      var countriesGroup = countries.group();
        // isolation_source
      var sources = ndx.dimension(function (d) {
          return  d.properties.data.isolation_source;
      });
        // Genus
      var sampleType = ndx.dimension(function (d) {
          return d.properties.data.sample_type;
      });
        //Organism
      var organism = ndx.dimension(function (d) {
          return  d.properties.data.organism;
      });
        // Subtype
      var subtype = ndx.dimension(function (d) {
        if (source === 'dengue' || source === 'excel'){
          d.properties.data.sub_type = '';
        }
        return d.properties.data.sub_type;
      });
        //  Pathogenic
      var pathogenic = ndx.dimension(function (d) {
         var patho = d.properties.data.pathogenic;
        if (patho === 'Yes'){
          return 'Pathogenic';
       }else if (patho === 'No'){
          return 'Non Pathogenic';
        }else{
          return 'Unknown';
        }
      });
        //  Time
      var formatWeek = d3.time.format('%w'),
          formatMonth = d3.time.format('%m');

      var dateDimension = ndx.dimension(function (d) {
          return d.properties.data.collection_date;
      });
      var dateDimensionGroup = dateDimension.group();
        // Year bounds
      var max_year = d3.max(isolates,function(d){
          return d.properties.data.collection_date;
      });
      var min_year = d3.min(isolates,function(d){
          return d.properties.data.collection_date;
      });
        // Pathogenity over time
      var dateGroupPatho = dateDimensionGroup
              .reduceSum(function(d) { return (d.properties.data.pathogenic === 'Yes'); });
      var dateGroupNonPatho = dateDimensionGroup
              .reduceSum(function(d) { return (d.properties.data.pathogenic === 'No'); });
      var dateGroupUnk = dateDimensionGroup
              .reduceSum(function(d) { return (d.properties.data.pathogenic === 'Unknown'); });

        // Time Line

      // Counts by day of the week
      var byDays = ndx.dimension(function (d) {
          //if (typeof(d.properties.data.collection_date) === 'string'){
            return formatWeek(d.properties.data.collection_date);
          // }else{
          //   return d.properties.data.collection_date;
          // }
      });
      var byDaysGroup = byDays.group();

      // Counts by month of the year
      var byMonths = ndx.dimension(function (d) {
        //if (typeof(d.properties.data.collection_date) === 'string'){
          return formatMonth((d.properties.data.collection_date))-1;
        // }else{
        //   return d.properties.data.collection_date;
        // }
      });
      var byMonthsGroup = byMonths.group(Math.floor);

      return {
         id : [id, id.group()],
         locations : [locations, locations.group()],
         countries : [countries, countriesGroup],
         sources : [sources, sources.group()],
         sampleType : [sampleType, sampleType.group()],
         organism : [organism, organism.group()],
         subtype : [subtype, subtype.group()],
         pathogenic : [pathogenic, pathogenic.group()],
         pathogenity : [
            min_year,
            max_year,
            dateDimension,
            dateGroupPatho,
            dateGroupNonPatho,
            dateGroupUnk
         ],
         timeline : [
            min_year, max_year, dateDimension, dateDimensionGroup,
            byDays, byDaysGroup,
            byMonths, byMonthsGroup
         ]
      };



   };

});
