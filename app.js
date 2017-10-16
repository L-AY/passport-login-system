const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');

// server port
const port = 3000;

// routing files
const index = require('./routes/index');

// initialize app
const app = express();

// setup templating (views) engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// express-session (required for messages)
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));

// init passport (passport middleware)
app.use(passport.initialize());
app.use(passport.session());

// express-messages
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// express-validator
app.use(expressValidator({
  errorFormatter: (param, msg, value) => {
    var namespace = param.split('.'),
    root = namespace.shift(),
    formParam = root;

    while(namespace.length) {
    formParam += '[' + namespace.shift() + ']';
    }

    return {
      param: formParam,
      msg:  msg,
      value: value
    };
  }
}));

// app routes setup
app.use('/', index);

// start server upon port number
app.listen(port, () => {
  console.log('Server started on port' +port);
});
