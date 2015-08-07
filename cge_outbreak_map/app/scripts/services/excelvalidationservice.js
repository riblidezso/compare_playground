'use strict';

angular.module('mapVisualizationApp')
  .service('ExcelvalidationService', function ExcelvalidationService() {


     // AngularJS will instantiate a singleton by calling 'new' on this function

       // Check if the row in the excel file is empty
       this.emptyRow = function (isolate) {

          var isolateTemplate = [
             'sample_name',
             'group_name',
             'file_names',
             'sequencing_platform',
             'sequencing_type',
             'pre_assembled',
             'sample_type',
             'organism',
             'strain',
             'subtype',
             'country',
             'region',
             'city',
             'zip_code',
             'longitude',
             'latitude',
             'location_note',
             'isolation_source',
             'source_note',
             'pathogenic',
             'pathogenicity_note',
             'collection_date',
             'collected_by',
             'usage_restrictions',
             'usage_delay',
             'email_address',
             'notes'
          ];
          var emptyRow = 0;
          isolateTemplate.forEach(function(d){
             if (d !== 'upload_dir'){
               if (( d !== 'usage_delay' && isolate[d] !== undefined && isolate[d].trim() === '') || isolate[d] === 0){
                  emptyRow+=1;
               }
             }
          });
          return (isolateTemplate.length === emptyRow);

       };

       this.isolate = function (isolate, line, checkFiles, fileNames) {

         var sampleType = ['metagenomic', 'isolate'];
         var sequencingPlatform = ['LS454', 'Illumina', 'Ion Torrent', 'ABI SOLiD', 'unknown'];
         var sequencingType = ['single', 'paired', 'mate-paired', 'unknown'];
         var preAssembled = ['yes', 'no'];
         var isolationSource = ['human', 'water', 'food', 'animal', 'other', 'laboratory'];
         var pathogenic = ['yes', 'no', 'unknown'];
         var collectionDateFormatA = d3.time.format('%Y-%m-%d');
         var collectionDateFormatB = d3.time.format('%Y-%m');
         var collectionDateFormatC = d3.time.format('%Y');
         var usageRestrictions = ['delete', 'public'];

         var str = '';
         var errorMessages = [];
         var errors = 0;
         var warnings = 0;
         var spatioTempErrors = false;
         var coordinatesMissing = false;
         var countryMissing = false;

         if (checkFiles && isolate.file_names === ''){
            str =  '[Line ' + line.toString() + '] ' + 'Isolate files missing';
            errorMessages.push(str);
            warnings+=1;
         }

         // Only if using Uploader
         if (checkFiles){
           var isolateFiles = isolate.file_names.split(' ');
           var tempFileNames = angular.copy(fileNames);
           var noEmptyFiles = true;
           isolateFiles.forEach(function(fileName){
             if (tempFileNames.indexOf(fileName) !== -1){
               if (fileName !== ''){
                 str = '[Line ' + line.toString() + '] ' + 'File ('+ fileName +') already included';
                 errorMessages.push(str);
                 warnings+=1;
               }else{
                 if (noEmptyFiles){
                   str =  '[Line ' + line.toString() + '] ' + 'White spaces in file_names field';
                   errorMessages.push(str);
                   warnings+=1;
                   noEmptyFiles = false; // Check that we get in onle once
                 }
               }
             }else{
               tempFileNames.push(fileName);
             }
           });
         }

          if (sequencingPlatform.indexOf(isolate.sequencing_platform) === -1){
             if (isolate.sequencing_platform.trim() !== ''){
               str = '[Line ' + line.toString() + '] ' + 'Sequencing Platform "'+ isolate.sequencing_platform +'" is not a valid option';
             }else{
               str = '[Line ' + line.toString() + '] ' + 'Sequencing Platform missing';
             }
             errorMessages.push(str);
             warnings+=1;
          }

          if (sequencingType.indexOf(isolate.sequencing_type) === -1){
             if (isolate.sequencing_type.trim() !== ''){
               str = '[Line ' + line.toString() + '] ' + 'Sequencing Type "'+ isolate.sequencing_type +'" is not a valid option';
             }else{
               str = '[Line ' + line.toString() + '] ' + 'Sequencing Type missing';
             }
             errorMessages.push(str);
             warnings+=1;
          }

          if (preAssembled.indexOf(isolate.pre_assembled) === -1){
             if (isolate.pre_assembled.trim() !== ''){
               str = '[Line ' + line.toString() + '] ' + 'Pre Assembled "'+ isolate.pre_assembled +'" is not a valid option';
             }else{
               str = '[Line ' + line.toString() + '] ' + 'Pre Assembled missing';
             }
             errorMessages.push(str);
             warnings+=1;
          }

         if (sampleType.indexOf(isolate.sample_type) === -1){
            if (isolate.sample_type.trim() !== ''){
              str = '[Line ' + line.toString() + '] ' + 'Sample type "'+ isolate.sample_type +'" is not a valid option';
            }else{
              str = '[Line ' + line.toString() + '] ' + 'Sample type missing';
            }
            errorMessages.push(str);
            warnings+=1;
         }

           if (isolate.organism.trim() === ''){
             str = '[Line ' + line.toString() + '] ' + 'Organism missing';
             errorMessages.push(str);
             warnings+=1;
           }

           if (isolate.country.trim() === ''){
              str = '[Line ' + line.toString() + '] ' + 'Country not present';
              errorMessages.push(str);
              warnings+=1;
              countryMissing = true;
           }

           if (isolate.longitude.trim() === '' || isolate.latitude.trim() === ''){
              coordinatesMissing = true;
           }

           if (countryMissing || coordinatesMissing){
             spatioTempErrors = true;
             console.log(isolate.sample_name);
           }

           if (isolationSource.indexOf(isolate.isolation_source) === -1){
              if (isolate.isolation_source.trim() !== ''){
                str = '[Line ' + line.toString() + '] ' + 'Isolation Source "'+ isolate.isolation_source +'" is not a valid option';
              }else{
                str = '[Line ' + line.toString() + '] ' + 'Isolation Source missing';
              }
              errorMessages.push(str);
              warnings+=1;
           }

           if (pathogenic.indexOf(isolate.pathogenic) === -1){
              if (isolate.pathogenic.trim() !== ''){
                str = '[Line ' + line.toString() + '] ' + 'Pathogenic "'+ isolate.pathogenic +'" is not a valid option';
              }else{
                str = '[Line ' + line.toString() + '] ' + 'Pathogenic missing';
              }
              errorMessages.push(str);
              warnings+=1;
           }

          var auxDateA = collectionDateFormatA.parse(isolate.collection_date);
          var auxDateB = collectionDateFormatB.parse(isolate.collection_date);
          var auxDateC = collectionDateFormatC.parse(isolate.collection_date);
          if (auxDateA === null && auxDateB === null && auxDateC === null){
             str = '[Line ' + line.toString() + '] ' + 'Invalid format for collection date';
             errorMessages.push(str);
             warnings+=1;

             spatioTempErrors = true;

          }else{
            if (auxDateA !== null){
              isolate.collection_date = auxDateA; //Update Date in proper format
            }
            if (auxDateB !== null){
              isolate.collection_date = auxDateB; //Update Date in proper format
            }
            if (auxDateC !== null){
              isolate.collection_date = auxDateC; //Update Date in proper format
            }
         }

          if (usageRestrictions.indexOf(isolate.usage_restrictions) === -1){
             if (isolate.usage_restrictions.trim() !== ''){
               str = '[Line ' + line.toString() + '] ' + 'Usage restrictions "'+ isolate.usage_restrictions +'" is not a valid option';
             }else{
               str = '[Line ' + line.toString() + '] ' + 'Usage restrictions missing';
             }
             errorMessages.push(str);
             warnings+=1;
          }

          if (warnings === 0){
             return {
                message: '',
                errors: errors
             };
          }else{
             return {
                message: errorMessages ,
                errors : errors,
                warnings : warnings,
                spatioTempErrors: spatioTempErrors
             };
          }
       };

   });
