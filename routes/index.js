const router = require('express').Router();
const http = require('http');
const cheerio = require('cheerio');

router.route('/')
    .get((req, res) => {
        res.render('index/main');
    });

router.route('/dest')
    .post((req,res)=>{
        http.get(`http://mybusnow.njtransit.com/bustime/wireless/html/${req.body.link}`,(resp)=>{
            let data = '';
    
            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
              data += chunk;
            });
          
            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                const $ = cheerio.load(data);
                let parents = $('ul li a').get();
                let items = [];
                parents.forEach((parent)=>{
                    items.push({attr : parent.attribs.href.match(/\d{5}/)[0], text:parent.children[0].data })
                });
                res.render('index/main',{
                    busItems:items,
                })
            });
          
          }).on("error", (err) => {
            console.log("Error: " + err.message);
          });  
    })

module.exports = router;