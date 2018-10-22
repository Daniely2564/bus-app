const express = require('express');
const app = express();
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const cors = require('cors');

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser());
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(express.static(__dirname + '/public'));
app.engine('hbs', hbs({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
}));
app.use(flash());
app.use(function (req, res, next) {
    res.locals.message = req.flash('message');
    res.locals.error = req.flash('error');
    next();
});

app.set('view engine', 'hbs');

app.use('/', require('./routes/index'));
app.use('/search', require('./routes/search'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
})
