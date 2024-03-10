const User = require('../models/user');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;

const init = (passport) => {
    passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
        // Login
        // Check if user exists
        const user = await User.findOne({ email: email })
        if (!user) {
            return done(null, false, { message: 'No user with this email' });
        }
        try {
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                return done(null, user, { message: 'Logged in successfully' });
            }
            return done(null, false, { message: 'Wrong username or password' });
        }
        catch (err) {
            return done(null, false, { message: 'Something went wrong' });
        }
    }));
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        }
        catch (err) {
            done(err, false);
        }
    });
}

module.exports = init;