const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
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
  const {email, password} = req.body;

  const pw = bcrypt.hashSync(password, 10);
  db('users').insert({email, password: pw}).returning('id')
  .then(result => {
    if(result) {
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
