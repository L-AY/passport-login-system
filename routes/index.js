const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

let User = require('../models/users')

// home
router.get('/', ensureAuthenticated, (req, res, next) => {
  res.render('index');
});

// login form
router.get('/login', (req, res, next) => {
  res.render('login');
});

// registration form
router.get('/register', (req, res, next) => {
  res.render('register');
});

// logout
router.get('/logout', (req, res, next) => {
  req.logout();
  req.flash('success_msg', 'You have been logged out');
  res.redirect('/login');
});

// registration form
router.post('/register', (req, res, next) => {
  // get fields from form
  const name = req.body.name;
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const password2 = req.body.password2;

  // using the express-validator to ensure user form elements entry is valid
  req.checkBody('name', 'Name field is required').notEmpty();
  req.checkBody('email', 'Email field is required').notEmpty();
  req.checkBody('email', 'Email must be a valid email address').isEmail();
  req.checkBody('username', 'Username field is required').notEmpty();
  req.checkBody('password', 'Password field is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

  let errors = req.validationErrors();
  if(errors){
    res.render('register', {
      errors: errors
    });
  } else {
    const newUser = new User({
      name: name,
      username: username,
      email: email,
      password: password
    });

    User.registerUser(newUser, (err, user) => {
      if (err) throw err;
      req.flash('success_msg', 'You are registered and can log in.');
      res.redirect('/login');
    });
  }
});

// LocalStrategy
passport.use(new LocalStrategy((username, password, done) => {
  User.getUserByUsername(username, (err, user) => {
    if(err) throw err;
    if(!user){
      return done(null, false, {message: 'No user found'});
    }
    User.comparePassword(password, user.password, (err, isMatch) => {
    if(err) throw err;
      if(isMatch){
        return done(null, user);
      } else {
        return done(null, false, {message: 'Incorrect password'});
      }
    });
  });
}));

// serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) =>{
  User.getUserById(id, (err, user) => {
    done(err, user);
  });
});

// login post route
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
});

// access control
function ensureAuthenticated(req, res, next){
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash('error_msg', 'Access denied - please login or register');
    res.redirect('/login');
  }
}

module.exports = router;
