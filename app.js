const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
//Better logging
const pino = require('pino')();
//Better security
const helmet = require('helmet');
//Better cookies
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const sassMiddleware = require('node-sass-middleware');
//Checks to see if NODE_ENV is set, and if not, defaults to development
const env = process.env.NODE_ENV || 'development';
const knexConfig = require("./knexfile");
//This way, all modules have access to knex
process.knex = require("knex")(knexConfig[env]);

const index = require('./routes/index');
const users = require('./routes/users');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(cookieSession({
  keys: ['fluffybunny', 'rutabaga', 'bananabread']
}));

//This is our own custom middleware
//After session is configured, but BEFORE routes:
//Check to see if there is a user_id in req.session
//If there is, set req.loggedIn and look up the user from the db
//Save user in a key on the request object, making it available
//to routes later on
app.use((req, res, next) => {
  req.loggedIn = Boolean(req.session.user_id);
  if (req.loggedIn) {
    process.knex('users').select().where('id', req.session.user_id)
    .then(user => {
      req.user = user[0];
      next();
    })
    .catch(err => {
      pino.error("USER WTF: ", err);
      next();
    });
  }
});
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: false, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
