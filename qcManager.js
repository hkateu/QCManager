function copyFlags(today) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var rawFileId = ss.getSheetByName('RawFile').getRange("B2").getValue().toString();
  var ui = SpreadsheetApp.getUi();

  if(rawFileId == ""){
    ui.alert("Missing Sheet ID");
  }else{
    var rawFileInDrive = DriveApp.getFileById(rawFileId);
    var rawFileFolder = DriveApp.getFolderById('folderId');
    rawFileInDrive.moveTo(rawFileFolder);
    var rawFile = SpreadsheetApp.openById(rawFileId)
    rawFile.rename('ug_cbb_' + Date());

    var ss = SpreadsheetApp.getActiveSpreadsheet();  
    var teamIds = ss.getSheetByName('Flags');
    var ids = teamIds.getRange(2,1,teamIds.getLastRow()-1, teamIds.getLastColumn()).getValues();
    var stringIds = new Map(ids.map(arr => [arr[0].toString(), arr[1].toString()]));

    if(today !== 0){ 
      stringIds.forEach((v,k) => {
        var sheet = rawFile.getSheetByName(k);
        
        if(sheet){
          var flagRows = sheet.getLastRow()-1
          var teamFlagsRange1 = sheet.getRange(2,2,flagRows, 4).getValues();
          var teamFlagsRange2 = sheet.getRange(2,7,flagRows, 2).getValues();
          var teamFlagsRange = teamFlagsRange1.map((k,i) => k.concat(teamFlagsRange2[i]));

          var teamFile = SpreadsheetApp.openById(stringIds.get(k));

          // var today = new Date().getDay();
          // var yest = today - 1

          
            var teamSheet = teamFile.getSheetByName('Day'+today);
            
            var rows = teamSheet.getLastRow();
            // Logger.log(rows);
            if(rows == 3){
              var teamRange = teamSheet.getRange(4,1, flagRows, 6);
              teamRange.setValues(teamFlagsRange);
            }else if(rows > 3){
              // Logger.log('Has Flags aready');
              var teamRange = teamSheet.getRange(4,1, rows-3, 6);
              var teamFlagValues = teamRange.getValues();
                var tFlags = teamFlagsRange.map(x => x.join().trim());
                var oFlags = teamFlagValues.map(x => x.join().trim());
                
                for(let i = 0; i < tFlags.length; i++){
                  Logger.log(oFlags.includes(tFlags[i]))
                  if(!oFlags.includes(tFlags[i])){
                    teamSheet.appendRow(teamFlagsRange[i]);
                  }
                }
            }
      

        }
      });

      ui.alert("Finished Copying Flags");
      //ui.alert("Finished Copying Flags to: " + teamFile.getName() + ", Sheet: Day" + today);
    }else{
      ui.alert("Yesterday was Sunday.");
    }
    ss.getSheetByName('RawFile').getRange("B2").clear();
  }
}

function addTodaysFlags(){
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt("Do you want to add/update todays flags?", ui.ButtonSet.YES_NO);
  if (response.getSelectedButton() == ui.Button.YES) {
    var today = new Date().getDay();
    copyFlags(today)
  }
}

function addYesterdaysFlags(){
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt("Do you want to add/update yesterdays flags?", ui.ButtonSet.YES_NO);
  if (response.getSelectedButton() == ui.Button.YES) {
    var today = new Date().getDay();
    var yest = today - 1
    copyFlags(yest)
  }
}

function onOpen(e){
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('QC Enveritas')
  .addItem('Add/Update Todays Flags', 'addTodaysFlags')
  .addItem('Update Yesterdays Flags', 'addYesterdaysFlags')
  .addToUi()
}
