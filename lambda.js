var Twitter = require('twit');
var i2b = require("imageurl-base64");
var aws = require('aws-sdk');
var csv = require('csvtojson')


var jsObj;
var index;

exports.handler = function () {
    var fileProm = downloadFile();
    fileProm.then(function (data) {
        var playerPromise = getPlayer(data.Body.toString('utf-8'));
        playerPromise.then(function (data) {
            console.log(data);
            var player = data;
            var textForTweet = createTextForTweet(player);
            console.log(textForTweet);
            getPictureAndPostTweet(player, textForTweet);
        });
    }).catch(function (err) {
        console.log("error");
        console.log(err);
    });
};

function getPictureAndPostTweet(player, textForTweet) {
    var client = new Twitter({
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token: process.env.TWITTER_ACCESS_TOKEN_KEY,
        access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET

    });
    i2b(player.Picture, function (err, data) {
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

                            client.post('statuses/update', params, function (err) {
                                if (err) {
                                    console.log("Error posting Tweet");
                                    console.log(err);
                                } else {
                                    console.log("Tweet Success");
                                    jsObj[index].Used = 'Y';
                                    var jsonStringCsv = JSON.stringify(jsObj);
                                    var params = {
                                        Body: jsonStringCsv,
                                        Bucket: "rsg-mlb",
                                        Key: "RememberSomeGuys.csv",
                                        ContentType: "text/csv"
                                    };
                                    var client = new aws.S3({
                                        accessKeyId: process.env.AWS_KEY,
                                        secretAccessKey: process.env.AWS_SECRET
                                    });
                                    client.putObject(params, function (err, data) {
                                        if (err) {
                                            console.log(err, err.stack);
                                        } else {
                                            console.log(data);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}

function createTextForTweet(player) {
    var result = "Remember " + player.Name + "?\n";
    result += player.Start + " - " + player.End + ". " + "AVG: " + player.AVG.substring(1) + ", HR: " + player.HR + ", RBI: " + player.RBI + ", WAR: " + player.WAR + "\n";
    result += 'http://www.fangraphs.com/statss.aspx?playerid=' + player.playerid;
    result += "\n#rsgMLB #MLB #baseball";
    console.log(result.length);
    return result;
}

function getPlayer(body) {
    var p = new Promise(function (resolve, reject) {
        csv()
            .fromString(body)
            .on('end_parsed', function (jsonArrObj) {
                jsObj = jsonArrObj;
                resolve("Success");
            });
    });
    return p.then(function (data) {
        index = -1;
        var ctr = 0;
        while (index === -1 && ctr < jsObj.length * 2) {
            index = parseInt(Math.random() * jsObj.length);
            if (jsObj[index].Used !== 'N' || jsObj[index].Start === "" || jsObj[index].Picture === "") {
                index = -1;
            }
            ctr++;
        }
        if (index === -1) {
            throw new Error("No unused players remaining. Please add more guys to remember and congratulations on a successful bot");
        } else {
            return jsObj[index];
        }
    });
}

function downloadFile() {
    var client = new aws.S3({
        accessKeyId: process.env.AWS_KEY,
        secretAccessKey: process.env.AWS_SECRET
    });
    return client.getObject({
        Bucket: 'rsg-mlb',
        Key: 'RememberSomeGuys.csv'
    }).promise();
}

exports.handler(null, null);