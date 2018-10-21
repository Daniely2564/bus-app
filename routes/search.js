const router = require('express').Router();
const request = require('request');
const cheerio = require('cheerio');

router.route('/bus')
    .post((req, res) => {
        switch (req.body.type) {
            case 'stop':
                return stopNO(req, res, req.body.value)

        }
    })
    ;

const stopNO = (req, res, value) => {
    request(`http://mybusnow.njtransit.com/bustime/wireless/html/eta.jsp?route=---&direction=---&displaydirection=---&stop=---&findstop=on&selectedRtpiFeeds=&id=${value}`, (err, data) => {
        const $ = cheerio.load(data.body);
        let val = ($.html().toString() + '').replace(/[\t\n]/gm, "");
        // let matches = val.match(/To \d+ [a-zA-z ]+/gm);
        let destination = val.match(/To \d+ [a-zA-Z ]+/gm)
        let times = val.match(/\d+&#xA0;MIN/gm);
        if (destination == null) {
            req.flash()
            res.redirect('/');
        } else {
            let comingBuses = [];
            for (let i = 0; i < destination.length; i++) {
                comingBuses.push({ dest: destination[i], min: times[i].replace(/&#xA0;MIN/gm, '') })
            }
            console.log(comingBuses)
        }
    })
}

module.exports = router;