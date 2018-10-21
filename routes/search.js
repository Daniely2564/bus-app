const router = require('express').Router();
const request = require('ajax-request');
const cheerio = require('cheerio');
const http = require('http');

router.route('/bus')
    .post((req, res) => {
        switch (req.body.type) {
            case 'stop':
                stopNO(req, res, req.body.value)
                break;
            case 'no':
                busNo(req,res,req.body.value);
        }
    })
    ;

const stopNO = (req, res, value) => {
    request(`http://mybusnow.njtransit.com/bustime/wireless/html/eta.jsp?route=---&direction=---&displaydirection=---&stop=---&findstop=on&selectedRtpiFeeds=&id=${value}`, (err, data,body) => {
        const $ = cheerio.load(body);
        let val = ($.html().toString() + '').replace(/[\t\n]/gm, "");
        // let matches = val.match(/To \d+ [a-zA-z ]+/gm);
        let destination = val.match(/To [\da-zA-Z]+ [a-zA-Z ]+/gm)
        let times = val.match(/\d+&#xA0;MIN|DELAYED|1 MIN/gm);
        if (destination == null) {
            console.log(val);
            return res.render('index/main',{
                error:'Currently no bus is arriving soon',
                value,
                busStop:true,
            })
        } else {
            let comingBuses = [];
            console.log(val)
            for (let i = 0; i < destination.length; i++) {
                comingBuses.push({ dest: destination[i].replace('To','To.'), min: times[i].replace(/&#xA0;MIN| MIN/gm, '').includes('DELAYED')?'DELAYED':times[i].replace(/&#xA0;MIN| MIN/gm, '')+' mins' })
            }
            console.log(comingBuses)
            return res.render('index/main',{
                busStop:true,
                value,
                list:comingBuses
            })
        }
    })
}

const busNo = (req,res,value)=>{
  
        http.get('http://mybusnow.njtransit.com/bustime/wireless/html/selectdirection.jsp?route=1',(resp)=>{
            let data = '';

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
              data += chunk;
            });
          
            // The whole response has been received. Print out the result.
            resp.on('end', () => {
              console.log(data);
              req.flash('error',data)
              res.redirect('/')
            });
          
          }).on("error", (err) => {
            console.log("Error: " + err.message);
          });
}

module.exports = router;