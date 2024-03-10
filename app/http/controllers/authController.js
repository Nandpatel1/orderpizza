const flash = require("express-flash");
const User = require("../../models/user");
const bcrypt = require('bcrypt');
const passport = require("passport");

const authController = () => {
    const _getRedirectUrl = (req) => {
        return req.user.role === 'admin' ? '/admin/orders' : '/customer/orders';
    }
    return {
        login(req, res) {
            res.render('auth/login');
        },
        postLogin(req, res, next) {
            const { email, password } = req.body;

            if (!email || !password) {
                req.flash('error', 'All fields are required');
                req.flash('email', email);
                return res.redirect('/login');
            }
            passport.authenticate('local', (err, user, info) => {
                if (err) {
                    req.flash('error', info.message);
                    return next(err);
                }
                if (!user) {
                    req.flash('error', info.message);
                    return res.redirect('/login');
                }
                req.logIn(user, (err) => {
                    if (err) {
                        req.flash('error', info.message);;
                        return next(err);
                    }
                    return res.redirect(_getRedirectUrl(req));
                });
            })(req, res, next);
        },
        register(req, res) {
            res.render('auth/register');
        },
        async postRegister(req, res) {
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                req.flash('error', 'All fields are required');
                req.flash('name', name);
                req.flash('email', email);
                return res.redirect('/register');
            }

            // Check if email exists
            try {
                const result = await User.exists({ email: email });
                if (result) {
                    req.flash('error', 'Email already taken');
                    req.flash('name', name);
                    req.flash('email', email);
                    return res.redirect('/register');
                }
            } catch (err) {
                return res.status(500).send('Internal Server Error');
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            // Create a user
            const user = new User({
                name,
                email,
                password: hashedPassword
            })
            try {
                const result = await user.save();
                // Login
                return res.redirect('/');
            }
            catch (e) {
                req.flash('error', 'Something went wrong');
                return res.redirect('/register');
            }

        },
        logout(req, res) {
            req.logout();
            return res.redirect('/login');
        }
    }
}

module.exports = authController;