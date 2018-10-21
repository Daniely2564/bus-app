const express = require('express');
const app = express();
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(__dirname + '/public'));
app.engine('hbs', hbs({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
}));
app.set('view engine', 'hbs');

app.use('/', require('./routes/index'));
app.use('/search', require('./routes/search'));

app.listen(3000, () => {
    console.log('server running on port 3000');
})
