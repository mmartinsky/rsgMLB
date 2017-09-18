var Twitter = require('twitter');
var Xlsx = require('xlsx');

exports.handler = function (event, context) {
    // get random player from spreadsheet
    var player = getPlayer();
    // create text for tweet
    var textForTweet = createTextForTweet(player);
    console.log(textForTweet);
    // tweet it 

    // set player to used
};

function createTextForTweet(player) {
    var result = "Remember " + player.Name + "?\n";
    result += player.Start + " - " + player.End + "\n";
    result += "AVG: " + player.AVG.substring(1) + ", HR: " + player.HR + ", RBI: " + player.RBI + ", WAR: " + player.WAR + "\n";
    result += 'http://www.fangraphs.com/statss.aspx?playerid=' + player.playerid;
    result += "\n#rsgMLB";
    console.log(result.length);
    return result;
}

function getPlayer() {
    var wb = Xlsx.readFile('RememberSomeGuys.csv');
    var jsObj = Xlsx.utils.sheet_to_json(wb.Sheets['Sheet1']);
    var index = -1;
    var ctr = 0;
    while (index === -1 && ctr < jsObj.length) {
        index = parseInt(Math.random() * jsObj.length);
        if (jsObj[index].Used !== 'N' || jsObj[index].Start === undefined) {
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