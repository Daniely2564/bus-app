const router = require('express').Router();

router.route('/')
    .get((req, res) => {
        res.render('index/main');
    });

module.exports = router;