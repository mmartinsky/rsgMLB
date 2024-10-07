var Twitter = require('twit');
var i2b = require("imageurl-base64");
var aws = require('aws-sdk');
var csv = require('csvtojson');
var json2csv = require('json2csv');

var jsObj;
var index;
var awsRequestId = null;
var contextG;
exports.handler = function (event, context) {
    // download CSV file from S3
    console.log("At start, ARI = " + awsRequestId);
    contextG = context;
    eventG = event;
    if (event !== null && event !== undefined && awsRequestId === event.id) {
        console.log("same event");
        return;
    } else if (event !== null && event !== undefined && awsRequestId === null) {
        awsRequestId = event.id;
        console.log("awsRequestId getting set to: " + awsRequestId);
    }
    var fileProm = downloadFile();
    fileProm.then(function (data) {
        console.log("file downloaded");
        // get player from file
        var playerPromise = getPlayer(data.Body.toString('utf-8'));
        playerPromise.then(function (data) {
            console.log("Player found.");
            console.log(data);
            var player = data;
            var textForTweet = createTextForTweet(player);
            console.log(textForTweet);
            getPictureAndPostTweet(player, textForTweet);
        }).catch(function(err){
            console.log("Error getting player from spreadsheet");
        });
    }).catch(function (err) {
        console.log("error");
        console.log(err);
        if (contextG !== undefined && contextG !== null)
            contextG.fail('getting S3 file');
    });
};

function getPictureAndPostTweet(player, textForTweet) {
    var client = new Twitter({
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token: process.env.TWITTER_ACCESS_TOKEN_KEY,
        access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET

    });
    // fetches image from URL and converts to base64 for upload
    i2b(player.Picture, function (err, data) {
        if (err) {
            console.error("error converting image to base64");
            console.error(err);
            if (contextG !== undefined && contextG !== null)
                contextG.fail('Failed at converting image');
        } else {
            // upload image
            client.post('media/upload', {
                media_data: data.base64
            }, function (err, data) {
                if (err) {
                    console.error("Error uploading media.");
                    console.error(err);
                    if (contextG !== undefined && contextG !== null)
                        contextG.fail('Failed at uploading picture');
                } else {
                    var mediaIdStr = data.media_id_string
                    var altText = "RSG: " + player.Name + ", " + Date();
                    var meta_params = {
                        media_id: mediaIdStr,
                        alt_text: {
                            text: altText
                        }
                    }
                    // create metadata on image for adding to tweet
                    client.post('media/metadata/create', meta_params, function (err) {
                        if (err) {
                            console.error("error creating media metadata");
                            console.error(err);
                            if (contextG !== undefined && contextG !== null)
                                contextG.fail('adding metadata');
                        } else {
                            // now we can reference the media and post a tweet (media will attach to the tweet)
                            var params = {
                                status: textForTweet,
                                media_ids: [mediaIdStr]
                            }
                            // post tweet
                            client.post('statuses/update', params, function (err) {
                                if (err) {
                                    console.log("Error posting Tweet");
                                    console.log(err);
                                    if (contextG !== undefined && contextG !== null)
                                        contextG.fail('post tweet');
                                } else {
                                    // tweet successful - update spreadsheet
                                    console.log("Tweet Success");
                                    jsObj[index].Used = 'Y';
                                    var jsonStringCsv = json2csv({
                                        data: jsObj,
                                        quotes: ''
                                    });
                                    //console.log(jsonStringCsv);
                                    var params = {
                                        Body: jsonStringCsv,
                                        Bucket: "rsg-mlb",
                                        Key: "RememberSomeGuys.csv",
                                        ContentType: "text/csv"
                                    };
                                    // put spreadsheet back on S3
                                    var client = new aws.S3({
                                        accessKeyId: process.env.AWS_KEY,
                                        secretAccessKey: process.env.AWS_SECRET
                                    });
                                    client.putObject(params, function (err, data) {
                                        if (err) {
                                            console.log(err, err.stack);
                                            if (contextG !== undefined && contextG !== null)
                                                contextG.fail('Failed on putObject back to S3');
                                        } else {
                                            console.log(data);
                                            if (contextG !== undefined && contextG !== null) {
                                                contextG.succeed();
                                            }
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

//exports.handler(null, null);