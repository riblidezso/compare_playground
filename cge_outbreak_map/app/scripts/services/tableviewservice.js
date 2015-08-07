'use strict';

angular.module('mapVisualizationApp')
  .service('TableViewService', function TableViewService() {
  // AngularJS will instantiate a singleton by calling "new" on this function

   this.gridLayout = function () {
     return {
        data: 'isolates' ,
        columnDefs: 'columDefs',
        //selectWithCheckboxOnly: true,
        //showSelectionCheckbox: true,
        ennableRowSelection: false,
        //enableCellEdit: true,
        excludeProperties: [],
        multiSelect: false,
        //enableColumnResize: true,
        filterOptions:{
          filterText: '',
          useExternalFilter: false
        }
      };
   };

   this.setUpColumns = function (isolate) {

    var columnDefs = [
      {
         field:'properties.data.colorGroup',
         displayName:'',
         width: '6%',
         headerCellTemplate: '<div class="ngHeaderSortColumn {{col.headerClass}}" ng-style="{cursor: col.cursor}" ng-class="{ ngSorted: !noSortVisible }">'+
                               '<div  ng-class="\'colt\' + col.index" class="ngHeaderText">{{col.displayName}}'+
                                '<input ng-model="isAllSelected" class="checkbox" type="checkbox" ng-click="globalSelection(!isAllSelected);">'+
                                //'{{isAllSelected}}'+
                               '</div>'+
                              //  '<div class="ngSortButtonDown" ng-show="col.showSortButtonDown()"></div>'+
                              //  '<div class="ngSortButtonUp" ng-show="col.showSortButtonUp()"></div>'+
                              //  '<div class="ngSortPriority">{{col.sortPriority}}</div>'+
                             '</div>'+
                             //'<div ng-show="col.resizable" class="ngHeaderGrip" ng-click="col.gripClick($event)" ng-mousedown="col.gripOnMouseDown($event)"></div>',
                             '<div ng-show="col.resizable" class="ngHeaderGrip"></div>',
        cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()">'+
          '<span ng-cell-text">'+
            '<input ng-checked="isAllSelected || row.entity.properties.data.selected" style="vertical-align: middle; display:inline;" class="checkbox" type="checkbox" ng-click=toColorGroup(row)>'+
            '<span ng-show="row.getProperty(col.field)!==0"'+
              ' ng-attr-style="background-color:{{row.getProperty(col.field)}};'+
              ' color:{{row.getProperty(col.field)}}" class="badge">'+
              '0'+
            '</span>'+
            //'{{row.getProperty("properties.data.selected")}}'+
            //'{{row.getProperty("properties.data.id")}}'+
            //'{{isAllSelected}}' +
          '</span>'+
        '</div>',
      },
      // {
      //    field:'properties.data.colorGroup',
      //    displayName:'Color',
      //    width: '6%',
      //    cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()">'+
      //      '<span ng-cell-text">'+
      //        '<span style="background-color:{{row.getProperty(col.field)}}; color:{{row.getProperty(col.field)}}" class="badge">X</span>'+
      //      '</span>'+
      //    '</div>'
      // },
      {
         field:'properties.data.printDate',
         displayName:'Date',
         width: '10%',
      },
      {
         field:'properties.data.sample_name',
         displayName:'Sample Name',
         width: '10%',
      },
      {
         field:'properties.data.sample_type',
         displayName:'Sample Type',
         width: '10%',

      },
      {
         field:'properties.data.country',
         displayName:'Country',
         width: '10%',
        //  minWidth: 103
      },
      {
         field:'properties.data.isolation_source',
         displayName:'Isolation Source',
         width: '10%',
        //  minWidth: 103
      },
      {
         field:'properties.data.organism',
         displayName:'Organism',
         width: '10%',
         cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()">'+
         '<span ng-cell-text tooltip-placement="right" tooltip-append-to-body="true" '+
         'tooltip="{{row.getProperty(col.field)}}" tooltip-placement="right">'+
         '{{row.getProperty(col.field)}}</span></div>'
        //  minWidth: 103
      },
      {
         field:'properties.data.pathogenic',
         displayName:'Pathogenic',
         width: '10%',
        //  minWidth: 103
      },
      {
         field:'properties.data.longitude',
         displayName:'Longitude',
         width: '10%',
        //  minWidth: 103
      },
      {
         field:'properties.data.latitude',
         displayName:'Latitude',
         width: '10%',
        //  minWidth: 103
      },
      {
         field:'properties.data.sequencing_platform',
         displayName:'Sequencing platform',
         width: '10%',
         cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()">'+
         '<span ng-cell-text tooltip-placement="right" tooltip-append-to-body="true" '+
         'tooltip="{{row.getProperty(col.field)}}" tooltip-placement="right">'+
         '{{row.getProperty(col.field)}}</span></div>'
      },

      {
         field:'properties.data.city',
         displayName:'City',
         width: '10%',
      },
      {
         field:'properties.data.zip_code',
         displayName:'Zip Code',
         width: '10%',
        //  minWidth: 103
      },
      {
         field:'properties.data.region',
         displayName:'Region',
         width: '10%',
        //  minWidth: 103
      },
      {
         field:'properties.data.sub_type',
         displayName:'Subtype',
         width: '10%',
         cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()">'+
         '<span ng-cell-text tooltip-placement="right" tooltip-append-to-body="true" '+
         'tooltip="{{row.getProperty(col.field)}}" tooltip-placement="right">'+
         '{{row.getProperty(col.field)}}</span></div>'
        //  minWidth: 103
      },

      {
         field:'properties.data.strain',
         displayName:'Strain',
         cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()">'+
         '<span ng-cell-text tooltip-placement="right" tooltip-append-to-body="true" '+
         'tooltip="{{row.getProperty(col.field)}}" tooltip-placement="right">'+
         '{{row.getProperty(col.field)}}</span></div>',
         width: '10%',
        //  minWidth: 103
      },
      {
         field:'properties.data.source_note',
         displayName:'Source Note',
          width: '10%',
          cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()">'+
          '<span ng-cell-text tooltip-placement="right" tooltip-append-to-body="true" '+
          'tooltip="{{row.getProperty(col.field)}}" tooltip-placement="right">'+
          '{{row.getProperty(col.field)}}</span></div>'
          // minWidth: 103
      },
      {
         field:'properties.data.collected_by',
         displayName:'Collected By',
         width: '10%',
         cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()">'+
         '<span ng-cell-text tooltip-placement="right" tooltip-append-to-body="true" '+
         'tooltip="{{row.getProperty(col.field)}}" tooltip-placement="right">'+
         '{{row.getProperty(col.field)}}</span></div>'
        //  minWidth: 103
      },
      {
         field:'properties.data.location_note',
         displayName:'Location Note',
         cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()">'+
         '<span ng-cell-text tooltip-placement="right" tooltip-append-to-body="true" '+
         'tooltip="{{row.getProperty(col.field)}}" tooltip-placement="right">'+
         '{{row.getProperty(col.field)}}</span></div>',
         width: '10%',
        //  minWidth: 103
      },
      {
         field:'properties.data.pathigenity_note',
         displayName:'Pathogenity Note',
         width: '10%',
         cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()">'+
         '<span ng-cell-text tooltip-placement="right" tooltip-append-to-body="true" '+
         'tooltip="{{row.getProperty(col.field)}}" tooltip-placement="right">'+
         '{{row.getProperty(col.field)}}</span></div>'
      },
      // {
      //    field:'properties.data.notes',
      //    displayName:'Notes',
      //    //cellTemplate: isolate.properties.data.notes,
      //     width: '10%',
      //     // minWidth: 103
      // },
      {
         field:'properties.data.usage_restrictions',
         displayName:'Usage Restrictions',
          width: '10%',
          // minWidth: 103
      },
      {
         field:'properties.data.usage_delay',
         displayName:'Usage Delay',
          width: '10%',
          // minWidth: 103
      },
      {
         field:'properties.data.email_address',
         displayName:'Email',
          width: '10%',
          cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()">'+
          '<span ng-cell-text tooltip-placement="right" tooltip-append-to-body="true" '+
          'tooltip="{{row.getProperty(col.field)}}" tooltip-placement="right">'+
          '{{row.getProperty(col.field)}}</span></div>'
          // minWidth: 103
      },

    ];

    // var columnDefs = [];
    //   for(var k in isolate.properties.data) {
    //       if (k == "Accession"){
    //         //  var field = {field:'properties.data.Accession', displayName:'Accession',
    //         //               cellTemplate:
    //         //                 '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>'
    //         //                 +'<a href="http://www.ncbi.nlm.nih.gov/protein/'+
    //         //               '{{row.getProperty(col.field)}}">{{row.getProperty(col.field)}}</a></span></div>',
    //         //                width: "auto" , minWidth: 100};
    //
    //       }else{
    //          if (k !== '__rowNum__' && k !== 'notes'){
    //             var field = {field: 'properties.data.' + k, displayName: k,  width: "auto", minWidth: 103};
    //          }else{
    //            console.log(k);
    //            if (k === 'notes'){
    //              console.log(isolate.properties.data.notes);
    //              var field = {
    //                field:'properties.data.notes',
    //                displayName: 'notes',
    //                cellTemplate: isolate.properties.data.notes,
    //                width: 'auto',
    //                minWidth: 103
    //              }
    //            }
    //          }
    //       }
    //       columnDefs.push(field);
    //   }
    //
    //
      return columnDefs;
    };

});
