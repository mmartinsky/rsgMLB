var Twitter = require('twit');
var Xlsx = require('xlsx');
var i2b = require("imageurl-base64");

exports.handler = function () {
    // get random player from spreadsheet
    var player = getPlayer();
    // create text for tweet
    var textForTweet = createTextForTweet(player);
    console.log(textForTweet);
    // tweet it 
    var client = new Twitter({
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token: process.env.TWITTER_ACCESS_TOKEN_KEY,
        access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET

    });
    i2b("http://mlb.mlb.com/assets/images/1/0/6/102773106/Angelsjerz_iksbc8u6.jpg", function (err, data) {
        if (err) {
            console.error("error converting image to base64");
            console.error(err);
        } else {
            client.post('media/upload', {
                media_data: data.base64
            }, function (err, data) {
                if (err) {
                    console.error("Error uploading media.");
                    console.error(err);
                } else {
                    var mediaIdStr = data.media_id_string
                    var altText = "RSG: " + player.Name + ", " + Date();
                    var meta_params = {
                        media_id: mediaIdStr,
                        alt_text: {
                            text: altText
                        }
                    }

                    client.post('media/metadata/create', meta_params, function (err) {
                        if (err) {
                            console.error("error creating media metadata");
                            console.error(err);
                        } else {
                            // now we can reference the media and post a tweet (media will attach to the tweet)
                            var params = {
                                status: textForTweet,
                                media_ids: [mediaIdStr]
                            }

                            client.post('statuses/update', params, function () {
                                console.error("Success");
                            })
                        }
                    });
                }
            });
        }
    });
};

function createTextForTweet(player) {
    var result = "Remember " + player.Name + "?\n";
    result += player.Start + " - " + player.End + ". " + "AVG: " + player.AVG.substring(1) + ", HR: " + player.HR + ", RBI: " + player.RBI + ", WAR: " + player.WAR + "\n";
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