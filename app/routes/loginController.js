// DEPENDENCIES
//----------------------------------------------------------------------------
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const router = express.Router();
const models = require('../models');
const User = models.user;


// CONFIGURE LOCAL STRATEGIES FOR PASSWORD AUTHENTICATION
// --------------------------------------------------------------------------
// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `done` with a user object, which
// will be set at `req.user` in route handlers after authentication.

passport.use(new LocalStrategy(
function(username, password, done) {
     User.findOne({where: {username: username} })
        .then(user => {
            
            if (user === null) {
                // console.log('Incorrect username')
               return done(null, false, { message: 'Incorrect username.' });
            }

            user.comparePassword(password, function (err,isMatch) {
                if (err) { return done(err); }
                if(!isMatch){
                    // console.log('incorrect password')
                    return done(null, false, { message: 'Incorrect password.' });
                } else {
                    // console.log('logged in!')
                    return done(null, user);
                }
            });
            
        })
        .catch((err) => {
            if (err) {
                // console.log(err);
                return done(err); 
            }
       });
    }

));

// SESSION PERSISTENCE
// --------------------------------------------------------------------------
// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.

passport.serializeUser(function(user, done) {
    console.log(user)
    console.log('serializing')
    return done(null, user.id);
});

  
passport.deserializeUser(function(id, done) {
    // console.log('deserializing')
    User.findById(id).then( function(user){
        if(!user){
            done(null)
        }else{
            done(null, user);
        }
    });
});

  


// SETTING ROUTERS
// --------------------------------------------------------------------------

router.get('/', function (req, res, next) {
    console.log('user page',req.user)
    if (req.user) {
        db.User.find({
            where: {id: req.user.id},
        }).then(user => {
            res.render('userHomePageAndCellar',{username:username});
        })
   } else {
        res.redirect('/');
   }
});

router.post('/new', (req,res) => {
    var newUser = {
        username: req.body.username,
        password: req.body.password
    }

    models.User.create(newUser).then(() => {
        res.redirect('/search');
    })
}); 

router.get('/login', function (req, res) {
    res.render('wineBasicSearch');
});

router.get('/new'), function(req, res){
    res.render('signUp')
}

router.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) { return res.redirect('/'); }
        
        req.logIn(user, function(err) {
            // console.log('is auth: ',req.isAuthenticated())
            if (err) { return next(err); }
            // console.log('login in')
            res.json(user)
        });
    })(req, res, next);
});

router.post('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});


module.exports = router;