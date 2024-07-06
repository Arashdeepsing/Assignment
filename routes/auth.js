// routes/auth.js
import express from 'express';
import passport from 'passport';
import GoogleStrategy from 'passport-google-oidc';
import User from '../db.js'; // Import User model

const router = express.Router();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
}, (issuer, profile, done) => {

    User.findOne({
        googleId: profile.id
    }, (err, user) => {
        if (err) {
            return done(err);
        }
        if (!user) {
            const newUser = new User({
                googleId: profile.id,
                name: profile.displayName,
            });
            newUser.save((err) => {
                if (err) console.log(err);
                return done(null, newUser);
            });
        } else {
            return done(null, user);
        }
    });
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

router.get('/google',
    passport.authenticate('google', {
        scope: ['openid', 'profile']
    }));

router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/login'
    }),
    (req, res) => {
        res.redirect('/');
    });

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

export default router;