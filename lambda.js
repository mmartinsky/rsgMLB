var Twitter = require('twitter');
var Xlsx = require('xlsx');

exports.handler = function (event, context) {
    var player = getPlayer();
    console.log(player);
    // get random player from spreadsheet
    // create text for tweet
    // tweet it 
    // set player to used
};

function getPlayer() {
    var wb = Xlsx.readFile('RememberSomeGuys.csv');
    var jsObj = Xlsx.utils.sheet_to_json(wb.Sheets['Sheet1']);
    var index = -1;
    var ctr = 0;
    while (index === -1 && ctr < jsObj.length) {
        index = parseInt(Math.random() * jsObj.length);
        if (jsObj[index].Used !== 'N') {
            index = -1;
        }
        ctr++;
    }
    if (index === -1) {
        throw new Error("No unused players remaining. Please add more guys to remember and congratulations on a successful bot");
    } else {
        return jsObj[index];
    }
}

exports.handler(null, null);