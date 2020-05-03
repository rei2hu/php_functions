// straight from the site https://developers.google.com/apps-script/guides/menus
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu("Script Stuff")
      .addItem("Get Today's Disappointmet", "baro")
      .addToUi();
}

function baro() {
  SpreadsheetApp.getUi();
     baroShit();
}

/**
 * get void trader stuff
 * 
 */

function baroShit() {
  var response = UrlFetchApp.fetch("http://content.warframe.com/dynamic/worldState.php");
  var ws = JSON.parse(response.getContentText());
  var translator = JSON.parse(UrlFetchApp.fetch("https://raw.githubusercontent.com/Warframe-Community-Developers/warframe-worldstate-data/master/data/languages.json"));
  // only perform translations on VoidTraders[0]
  
  /*
  important!
  Return values:

  Every custom function must return a value to display, such that:

  If a custom function returns a value, the value displays in the cell the function was called from.
  
  If a custom function returns a two-dimensional array of values, the values overflow into adjacent 
  cells as long as those cells are empty. If this would cause the array to overwrite existing cell contents,
  the custom function will throw an error instead. For an example, see the section on optimizing custom functions.
  
  A custom function cannot affect cells other than those it returns a value to. In other words, a 
  custom function cannot edit arbitrary cells, only the cells it is called from and their adjacent cells.
  To edit arbitrary cells, use a custom menu to run a function instead.
  
  A custom function call must return within 30 seconds. If it does not, the cell will display an error: 
  Internal error executing the custom function.
  */
  
  // return nothing if there's no manifest this way it (shouldn't) update the things...
  // run the main function shit if two things are satisfied:
  // there is NO date field or any value in the current cell
  // manifest isnt null
  // unfortunately it seems to reload the function everytime the sheet is opened so
  // i have to figure out a way to store the raw values :thinking:
  // nevermind got it so its good
  // all i have to do is 
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("TEST SHEET, PLEASE IGNORE");
  
  if (ws.VoidTraders[0].Manifest != undefined) {
    // note that a 1-d array overflows downwards if returned
    // var item_array = [[]];
    // well because im writing to a specific row with the appendRow() method, i only need a 1d array
    var item_array = [];
    var unrecognized_items = 0;
    var inventory = ws.VoidTraders[0].Manifest;
    // things to do:
    // double check capitalization on actual ws
    // because i lower all keys for bot stuff
    // to simplify things/searching
    
    // get the date MM/DD/YYYY
    var date = new Date(ws.VoidTraders[0].Activation.sec * 1000);
    item_array.push((date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear());
    
    // get the planet hes comin on
    item_array.push(ws.VoidTraders[0].Node);
    
    // get the items and stuff
    for (var i = 0; i < inventory.length; i++) {
      if (translator[inventory[i].ItemType.toLowerCase()]) {
        // Logger.log(inventory[i].itemtype.value);
        item_array.push(translator[inventory[i].ItemType.toLowerCase()].value);
      } else {
        // Logger.log(inventory[i].itemtype);
        item_array.push(inventory[i].ItemType);
        unrecognized_items++;
      }
      // Logger.log(inventory[i].primeprice + " ducats");
      item_array.push(inventory[i].PrimePrice);
      // Logger.log(inventory[i].regularprice + " credits");
    }
    Logger.log(unrecognized_items + " items were unrecognized");
    // return item_array;
    // instead of having the function automatically set the cell values, ill have it force them...
    // range has to be same dimensions of array
    /*
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets()[0];
    var range2 = sheet.getRange("A2:AD2");
    */
    
    sheet.appendRow(item_array);
    sheet.appendRow([unrecognized_items + " items were unrecognized"]);
    //var top_left = sheet.getRange("A1");
    //var range = top_left.offset(row - 1, 0, 1, item_array[0].length);
    //top_left.setValue(Math.random());
    //range.setValues(item_array);
  } else {
    // not sure if you can access the logger from the sheet so I'll just append an error message
    sheet.appendRow(["Error: Void Trader does not seem to be active at this time"]);
  }
}
