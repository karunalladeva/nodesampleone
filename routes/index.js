var express = require('express');
var router = express.Router();
var passport= require('passport');

var user_controller = require('../controllers/userController'); 

// GET home page.
router.get('/', function(req, res) {
  // res.redirect('/catalog');
  res.render('login',{user_status : req.session.user || false });
});

router.get('/auth/callback/google', passport.authenticate('google', { failureRedirect: '/users/signin' }),
    function(req, res,next) {
      // console.log(req.session.passport.user);
       //id,displayName,image
      user_controller.googledata(req,res,next);
});

router.get('/auth/facebook/callback',passport.authenticate('facebook', { failureRedirect: '/users/signin' }),
	 function(req, res ,next) {
      // console.log(req.session.passport.user);
       //id,displayName,image
       user_controller.facebookdata(req,res,next);
});

module.exports = router;
