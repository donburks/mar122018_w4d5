const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
//We set this in our app.js file, and we can access it here
//because process is in scope as a global variable
//Used 'db' because it's easier to type than process.knex
const db = process.knex;

router.get('/register', (req, res, next) => {
  if (req.loggedIn) {
    res.redirect('/');
  } else {
    res.render('register');
  }
});

router.get('/login', (req, res, next) => {
  if (req.loggedIn) {
    res.redirect('/');
  } else {
    res.render('login');
  }
});

router.get('/logout', (req, res, next) => {
  req.session = null;
  res.redirect('/');
});

router.post('/register', (req, res, next) => {
  //ES6 destructuring
  const {email, password} = req.body;

  const pw = bcrypt.hashSync(password, 10);
  db('users').insert({email, password: pw}).returning('id')
  .then(result => {
    if(result) {
      //.returning('id') doesn't work on sqlite3, but does on PG
      //sqlite3 returns an array with the id in it automatically
      let id = (process.env.NODE_ENV === "development") ? result[0] : result[0].id;
      req.session.user_id = id;
      res.redirect('/');
    } else {
     res.redirect('/users/register'); 
    }
  })
  .catch(err => pino.error("WTF REGISTER: ", err));
});

router.post('/login', (req, res, next) => {
  const {email, password} = req.body;

  db('users').select().where('email', email).limit(1)
  .then(users => {
    if (users.length) {
      let user = users[0]; 
      //Let bcrypt compare the passwords, don't try and hash it yourself
      if(bcrypt.compareSync(password, user.password)) {
        req.session.user_id = user.id;
        res.redirect('/');
      } else {
        res.redirect('/users/login');
      }
    } else {
      res.redirect('/users/login');  
    }
  })
  .catch(err => pino.error("WTF: ", err)); 
});

module.exports = router;
