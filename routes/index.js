var express = require('express');
var router = express.Router();

// GET home page.
router.get('/', function(req, res) {
  // res.redirect('/catalog');
  res.render('login',{user_status : req.session.user || false });
});

module.exports = router;
