const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;
const ejs = require('ejs');
const expressLayout = require('express-ejs-layouts');

app.get('/', (req, res) => {
    res.render('home');
});

app.use(expressLayout);
app.set('views', path.join(__dirname, '/resources/views'));
app.set('view engine', 'ejs');

app.listen(PORT, () => {
    console.log('Server running on port 3000');
});