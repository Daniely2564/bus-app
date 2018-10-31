const router = require('express').Router();
const busCon = require('../controller/bus');

router.route('/bus')
    .get((req, res) => {
        switch (req.query.type) {
            case 'stop':
                busCon.stopNO(req, res, req.query.value)
                break;
            case 'no':
                busCon.busNo(req, res, req.query.value);
                break;
            case 'destination':
                busCon.dest(req, res, req.query.value);
                break;
        }
    });


module.exports = router;