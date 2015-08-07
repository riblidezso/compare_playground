'use strict';

angular.module('mapVisualizationApp')
  .service('ExcelParserService', function ExcelParserService($q,
     ExcelvalidationService, GeoLocationService, LocationGroupingService) {
     // AngularJS will instantiate a singleton by calling 'new' on this function

     this.parseFile = function(file, checkFiles) {
        console.log('Parsing file...');
        // Task that will finish in the future
        var deferred = $q.defer();
        var promise = deferred.promise;

        var reader = new FileReader();
        var metadata = {};
        var fileNames = [];
        var locations = {};
        var fileNames = [];
        var excelErrors = {
           messages: [],
           nErrors: 0
        };
        var locationPromises = [];

        // We catch the load function of the reader and parse the excel file
        reader.onload = function(event) {
            var zip = new JSZip();
            var t = zip.load(event.target.result, {
               base64: false
            });
            var xlsx = XLSX.parseZip(t);
            var sheetNameList = xlsx.SheetNames;
            var json = {};
            // Parse excel to get file names
            sheetNameList.forEach(function(sheetName) {
               if (sheetName === 'Metadata') {
                  var sheet = xlsx.Sheets[sheetName];
                  var rObjArr = XLSX.utils.sheet_to_row_object_array(sheet);
                  if (rObjArr.length > 0) {
                    json[sheetName] = rObjArr;
                    var isolateLine = 1;
                    rObjArr.forEach(function(row, i) {
                      // All fields (to avoid losing metadata with no content in
                      // the excel sheet)
                      var isolate = {
                        'sample_name': '',
                        'group_name': '',
                        'file_names': '',
                        'sequencing_platform': '',
                        'sequencing_type': '',
                        'pre_assembled': '',
                        'sample_type': '',
                        'organism': '',
                        'strain': '',
                        'subtype': '',
                        'country': '',
                        'region': '',
                        'city': '',
                        'zip_code': '',
                        'longitude': '',
                        'latitude': '',
                        'location_note': '',
                        'isolation_source': '',
                        'source_note': '',
                        'pathogenic': '',
                        'pathogenicity_note': '',
                        'collection_date': '',
                        'collected_by': '',
                        'usage_restrictions': '',
                        'usage_delay': 0,
                        'email_address': '',
                        'notes': ''
                      };
                      angular.extend(isolate, row);

                     if (!ExcelvalidationService.emptyRow(isolate)) {
                       isolate.upload_dir = i+1;
                       isolate.id = i;

                        // Validates if mandatory fields are present
                        var answer = ExcelvalidationService.isolate(
                          isolate, i+2,
                          checkFiles,
                          fileNames
                        );

                        if (answer.errors > 0) {
                          if (excelErrors.nErrors !== 0){
                            excelErrors.messages = excelErrors.messages.concat(answer.message);
                          }else{
                            excelErrors.messages = answer.message;
                          }
                          excelErrors.nErrors += answer.nErrors;
                        }

                        if (!answer.spatioTempErrors){
                          LocationGroupingService.newIsolate(isolate);
                          // metadata[isolateLine] = isolate;
                          // fileNames.push(isolateLine);
                          // isolateLine+=1;
                        }

                      }else{
                        console.log('Row empty' ,row);
                      }
                    });
                  }
                }
             });

         if (fileNames.length === 0 && excelErrors.warnings === 0){
           excelErrors.nErrors += 1;
           excelErrors.messages.push('The excel template is empty');
         }

         LocationGroupingService.createMap(excelErrors).then(function(answer){
           console.log('deffering locations...');
           deferred.resolve(answer);
         });
      };


      reader.readAsBinaryString(file);

      return promise;

   };

  });
