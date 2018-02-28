var express = require('express');
var router = express.Router();
var user_controller = require('../controllers/userController'); 

// GET users listing.
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/signup',user_controller.user_create_get);
router.post('/signup',user_controller.user_create_post);
router.get('/edit',user_controller.user_get);
router.post('/edit',user_controller.edit);
router.get('/logout',user_controller.logout);
router.post('/signin',user_controller.signin);
router.get('/signin', function(req, res, next) {
  res.render('login',{user_status : req.session.user || false } );
});
router.get('/forgetpassword', function(req, res, next) {
  res.render('forgetmail',{user_status : req.session.user || false } );
});
router.post('/forgetpassword',user_controller.forgetpassword);

router.get('/setpassword/:id', function(req, res, next) {
  res.render('setpassword',{user_status : req.session.user || false } );
});
router.post('/setpassword/:id',user_controller.resetpassword);

module.exports = router;
