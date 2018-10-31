const cheerio = require('cheerio');
const http = require('http');

exports.dest = (req,res,value)=>{
    http.get('http://mybusnow.njtransit.com/bustime/wireless/html/home.jsp',(resp)=>{
        let data = '';
        resp.on('data',(chunk)=>{
            data+=chunk;
        });
        resp.on('end',()=>{
            const $ = cheerio.load(data);
            let matches = $.html().toString().match(/"\d+ [\w .-]+"/gm);
            let fm = matches.map((item)=>{
                return item.replace(/"/gm,'').replace(/ - /gm,' <-> ');
            });
            console.log(fm);
        })
    })
}

exports.busNo = (req,res,value)=>{
    http.get(`http://mybusnow.njtransit.com/bustime/wireless/html/selectdirection.jsp?route=${value}`,(resp)=>{
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
          data += chunk;
        });
      
        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            const $ = cheerio.load(data);
            if($('ul li a').get().length == 0){
                res.render('index/main',{
                    busNo:true,
                    value,
                    error:`Bus ${value} does not exists`
                });
            }else{
                let parents = $('ul li a').get();
                let list = [];
                parents.forEach((parent)=>{
                    list.push({attr:parent.attribs.href,text:parent.children[0].data.replace(/[\t\n]/gm,'')});
                });
                res.render('index/main',{
                    value,
                    busNo:true,
                    busOptions:list,
                })
            }
        });
      
      }).on("error", (err) => {
        console.log("Error: " + err.message);
      });     
}

exports.stopNO = (req, res, value) => {
    http.get(`http://mybusnow.njtransit.com/bustime/wireless/html/eta.jsp?route=---&direction=---&displaydirection=---&stop=---&findstop=on&selectedRtpiFeeds=&id=${value}`,(resp)=>{
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
                if(val.includes('Selected Stop: ')){
                    let stop = val.match(/Selected Stop: [\w\+ ]+/gm)[0].replace('Selected Stop: ','');
                    return res.render('index/main',{
                        error:`Stop : ${stop} has No bus arriving soon`,
                        value,
                        busStop:true,
                        
                    })
                }else{
                    return res.render('index/main',{
                        error:`No Such Stop exists`,
                        value,
                        busStop:true,
                        
                    })
                }
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
        });
      
      }).on("error", (err) => {
        console.log("Error: " + err.message);
      });
}
