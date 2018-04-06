const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  if (req.loggedIn) {
    res.render('user_index', {title: "Welcome to Cucumber!", user: req.user});
  } else {
    res.render('index', { title: 'Cucumber' });
  }
});

module.exports = router;
