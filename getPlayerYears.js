var Xlsx = require('xlsx');
var cheerio = require('cheerio');
var axios = require('axios');

function populatePlayerYears() {
    this.wb = Xlsx.readFile('RememberSomeGuys.csv');
    this.sheet = this.wb.Sheets['Sheet1'];
    this.jsObj = Xlsx.utils.sheet_to_json(this.sheet);
    for (var i = 0; i < this.jsObj.length; i++) {
        setTimeout(i => {
            var player = this.jsObj[i];
            if (player.Start == null || player.Start == undefined) {
                var url = 'http://www.fangraphs.com/statss.aspx?playerid=' + player.playerid;
                var htmlPromise = axios.get(url, {
                    data: {
                        rowIndex: i,
                        playerName: player.Name
                    }
                });
                htmlPromise.then(resp => {
                    var rowIndex = JSON.parse(resp.config.data).rowIndex;
                    var $ = cheerio.load(resp.data);
                    var relData = $('#SeasonStats1_dgSeason1_ctl00').find('tr');
                    var startYr = relData[1].firstChild.next.firstChild.firstChild.data;
                    var endYr = relData[relData.length - 3].firstChild.next.firstChild.firstChild.data;
                    this.sheet['B' + (parseInt(rowIndex) + 2)] = {
                        t: 'n',
                        v: startYr
                    };
                    this.sheet['C' + (parseInt(rowIndex) + 2)] = {
                        t: 'n',
                        v: endYr
                    };
                    //console.log("Success: " + JSON.parse(resp.config.data).playerName);
                }).catch(() => {
                    //console.log("Failed: " + JSON.parse(err.config.data).playerName);
                });
            }
        }, 10000, i);
    }
    Xlsx.writeFile(this.wb, 'RememberSomeGuys.csv');
}

populatePlayerYears();