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
const passport = require('passport');
const Emitter = require('events');

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

// Event emitter
const eventEmitter = new Emitter();
app.set('eventEmitter', eventEmitter);

// Session config
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}))

// Passport config
const passportInit = require('./app/config/passport');
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// Assests
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Global middleware
app.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.user = req.user;
    next();
})

// set template engine
app.use(expressLayout);
app.set('views', path.join(__dirname, '/resources/views'));
app.set('view engine', 'ejs');

initRoute(app);

const server = app.listen(PORT, () => {
    console.log('Server running on port 3000');
});

// Socket
// const io = require('socket.io')(server);
// io.on('connection', (socket) => { 
//     // Join
//     console.log(socket.id);
// })

const { Server } = require('socket.io');

const io = new Server(server);
io.on('connection', (socket) => {
    socket.on('join', (roomName) => {
        socket.join(roomName); // roomName = orderID of selected order
    })
});

eventEmitter.on('orderUpdated', (data) => {
    io.to(`order_${data.id}`).emit('syncOrderUpdated', data);
})

eventEmitter.on('orderPlaced', (data) => {
    io.to('adminRoom').emit('syncOrderPlaced', data);
})