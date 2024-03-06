require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;
const ejs = require('ejs');
const expressLayout = require('express-ejs-layouts');
const initRoute = require('./routes/web');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('express-flash');
const MongoDbStore = require('connect-mongo');

// Database connection
const url = 'mongodb://localhost/pizza';
mongoose.connect(url);
const connection = mongoose.connection;
connection.once('open', () => {
    console.log('Database connected...');
});
connection.on('error', (err) => {
    console.error('Connection failed:', err);
});

// Session store
let mongoStore = MongoDbStore.create({
    mongoUrl: url,
    collection: 'sessions'
})

// Session config
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}))

app.use(flash());

// Assests
app.use(express.static('public'));
app.use(express.json());

// Global middleware
app.use((req, res, next) => { 
    res.locals.session = req.session;
    next();
})

// set template engine
app.use(expressLayout);
app.set('views', path.join(__dirname, '/resources/views'));
app.set('view engine', 'ejs');

initRoute(app);

app.listen(PORT, () => {
    console.log('Server running on port 3000');
});