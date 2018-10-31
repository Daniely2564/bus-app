const cheerio = require('cheerio');
const http = require('http');
const request = require('request');
const fs = require('fs');
const async = require('async');
const path = require('path');

exports.dest = (req, res, value) => {
    http.get('http://mybusnow.njtransit.com/bustime/wireless/html/home.jsp', (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });
        resp.on('end', () => {
            fs.readFile(path.dirname(process.mainModule.filename) + '/destinations.txt', 'utf-8', (err, data) => {
                if (err) return console.log(err);
                let arr = data.split(',');
                arr = arr.filter((item) => {
                    return item.substring(item.lastIndexOf('=') + 1, item.lastIndexOf('"')).replace(/[.\+\- %289]|%2F/, '').toLowerCase().includes(value.replace(' ', '').toLowerCase());
                });
                let dest = arr.map((item) => {
                    return item.substring(item.indexOf('=') + 1, item.indexOf('&amp')) + ' ' + item.substring(item.lastIndexOf('=') + 1, item.lastIndexOf('"')).replace(/[.\+\- %289]|%2F/gmi, ' ');
                });
                let obj = [];
                for (let i = 0; i < arr.length; i++) {
                    obj.push({
                        attr: arr[i].substring(1, arr[i].length - 1),
                        text: dest[i]
                    });
                }
                res.render('index/main', {
                    busOptions: obj,
                    busDest: true,
                    value,
                })
            })
        })
    })
}

exports.busNo = (req, res, value) => {
    http.get(`http://mybusnow.njtransit.com/bustime/wireless/html/selectdirection.jsp?route=${value}`, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            const $ = cheerio.load(data);
            if ($('ul li a').get().length == 0) {
                res.render('index/main', {
                    busNo: true,
                    value,
                    error: `Bus ${value} does not exists`
                });
            } else {
                let parents = $('ul li a').get();
                let list = [];
                parents.forEach((parent) => {
                    list.push({
                        attr: parent.attribs.href,
                        text: parent.children[0].data.replace(/[\t\n]/gm, '')
                    });
                });
                res.render('index/main', {
                    value,
                    busNo: true,
                    busOptions: list,
                })
            }
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}

exports.stopNO = (req, res, value) => {
    http.get(`http://mybusnow.njtransit.com/bustime/wireless/html/eta.jsp?route=---&direction=---&displaydirection=---&stop=---&findstop=on&selectedRtpiFeeds=&id=${value}`, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            const $ = cheerio.load(data);
            let val = ($.html().toString() + '').replace(/[\t\n]/gm, "");
            // let matches = val.match(/To \d+ [a-zA-z ]+/gm);
            let destination = val.match(/To [\da-zA-Z]+ [a-zA-Z ]+/gm)
            let times = val.match(/\d+&#xA0;MIN|DELAYED|1 MIN/gm);
            if (destination == null) {
                if (val.includes('Selected Stop: ')) {
                    let stop = val.match(/Selected Stop: [\w\+ ]+/gm)[0].replace('Selected Stop: ', '');
                    return res.render('index/main', {
                        error: `Stop : ${stop} has No bus arriving soon`,
                        value,
                        busStop: true,

                    })
                } else {
                    return res.render('index/main', {
                        error: `No Such Stop exists`,
                        value,
                        busStop: true,

                    })
                }
            } else {
                let comingBuses = [];
                console.log(val)
                for (let i = 0; i < destination.length; i++) {
                    comingBuses.push({
                        dest: destination[i].replace('To', 'To.'),
                        min: times[i].replace(/&#xA0;MIN| MIN/gm, '').includes('DELAYED') ? 'DELAYED' : times[i].replace(/&#xA0;MIN| MIN/gm, '') + ' mins'
                    })
                }
                console.log(comingBuses)
                return res.render('index/main', {
                    busStop: true,
                    value,
                    list: comingBuses
                })
            }
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}

function extract() {
    function httpReq(match, callback) {
        request(`http://mybusnow.njtransit.com/bustime/wireless/html/${match}`, (err, uselss, body) => {
            let html = cheerio.load(body).html().toString().match(/"selectstop.jsp\?route=\d+&amp;direction=[\w+\/. \-%()]+"/gm);
            callback(err, html);
        });
    }
    // request 4.
    async.map(matches, httpReq, (err, dests) => {
        let arr = [];
        dests.forEach((dest) => {
            arr.push(dest[0]);
            arr.push(dest[1]);
        });
        console.log(arr);
        fs.writeFile('destinations.json', arr, (err) => {
            if (err) return console.log(err);
        })
    });
}