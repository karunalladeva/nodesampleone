var User = require('../models/user')
var async = require('async')
var nodemailer = require('nodemailer');


// Display User create form on GET.
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

exports.user_create_get = function (req, res, next) {
    res.render('signup', { title: 'Create User' ,user_status : req.session.user || false });
};

// Handle Author create on POST.
exports.user_create_post = [

    // Validate fields.
    body('first_name').isLength({ min: 1 }).trim().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('family_name').isLength({ min: 1 }).trim().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('email').isEmail().trim().withMessage('Invalid Email.'),
    body('password').isLength({ min: 8 }).trim().withMessage('Password length must be 8+.')
        .isAlphanumeric().withMessage('Password has non-alphanumeric characters.'),

    // Sanitize fields.
    sanitizeBody('first_name').trim().escape(),
    sanitizeBody('family_name').trim().escape(),
    sanitizeBody('email').trim().escape(),
    sanitizeBody('password').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('signup', { title: 'Create User', author: req.body, errors: errors.array(),user_status : req.session.user || false  });
            return;
        }
        else {            // Data from form is valid.
            

            // Create an Author object with escaped and trimmed data.
            var users = new User(
                {
                    first_name: req.body.first_name,
                    family_name: req.body.family_name,
                    email: req.body.email,
                    password: req.body.password
                });
            
            async.parallel({
                
                user: function (callback) {
                    User.find({ 'email': req.body.email})
                        .exec(callback)
                },
            }, function (err, results) {
                if (err) { return (err); }  
                console.log(results.user);     
                if(results.user != ""){
                    res.render('signup', { title: 'Create User', author: req.body, errors: ["Email already exits"],user_status : req.session.user || false  });
                    return;
                }else{
                    users.save(function (err) {
                        if (err) { return next(err); }
                        // Successful - redirect to new author record.
                        req.session.user =users.name;
                        req.session.email =users.Email;
                        res.redirect('/catalog');
                    });           
                }
            });
  
            
        }
    }
];

exports.user_get = function (req, res, next) {

    async.parallel({
                    
        user: function (callback) {
            User.find({ 'email': req.session.email })
                .exec(callback)
                },
            }, function (err, results) {
            if (err) { return (err); }       
            if(0 < results.user.length){
                res.render('edit_user', { title: 'Edit User', author: results.user[0], errors: "" ,user_status : req.session.user || false  });
                return;
            }else
            {          
                res.render('signup', { title: 'Create User', author: req.body, errors: ["Email already exits"],user_status : req.session.user || false  });
            }
    });
};

exports.edit = [

    // Validate fields.
    body('first_name').isLength({ min: 1 }).trim().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('family_name').isLength({ min: 1 }).trim().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('email').isEmail().trim().withMessage('Invalid Email.'),
    body('password').isLength({ min: 8 }).trim().withMessage('Password length must be 8+.')
        .isAlphanumeric().withMessage('Password has non-alphanumeric characters.'),

    // Sanitize fields.
    sanitizeBody('first_name').trim().escape(),
    sanitizeBody('family_name').trim().escape(),
    sanitizeBody('email').trim().escape(),
    sanitizeBody('password').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('signup', { title: 'Create User', author: req.body, errors: errors.array(),user_status : req.session.user || false  });
            return;
        }
        else {            // Data from form is valid.
            

            // Create an Author object with escaped and trimmed data.
            var users = new User(
                {
                    first_name: req.body.first_name,
                    family_name: req.body.family_name,
                    email: req.body.email,
                    password: req.body.password,
                    _id: req.body.id
                });
            
            async.parallel({
                
                user: function (callback) {
                    User.find({ 'email': req.body.email})
                        .exec(callback)
                },
            }, function (err, results) {

                if(req.body.email == req.session.email || results.user == ""){
                User.findByIdAndUpdate(req.body.id, users, {}, function (err, theuser) {
                    if (err) { return next(err); }
                    // Successful - redirect to genre detail page.
                    req.session.user =users.name;
                    req.session.email =users.Email;
                    res.redirect('/users/edit');
                });
               }else{
                res.redirect('/users/edit');
               }
            });
  
            
        }
    }
];


exports.signin = function (req, res, next) {

    async.parallel({
                    
        user: function (callback) {
            User.find({ 'email': req.body.email ,"password" : req.body.password})
                .exec(callback)
                },
            }, function (err, results) {
            if (err) { return (err); }       
            if(0 < results.user.length){
                req.session.user =results.user[0].name;
                req.session.email =results.user[0].email;
                res.redirect('/catalog')
                return;
            }else
            {          
                res.render('login',{title: 'Signin',user_status : req.session.user || false } );
            }
    });
};

exports.forgetpassword = function (req, res, next) {
    
    async.parallel({                    
    user: function (callback) {
        User.find({ 'email': req.body.email})
            .exec(callback)
            },
        }, function (err, results) {
        if (err) { return (err); }       
        if(0 < results.user.length){
            transporter.sendMail({
              from: 'deva@cogzidel.com',
              to: req.body.email,
              subject: 'Sending Email using Node.js',
              html: '<h1>Welcome</h1><p>Click to generate new password '+req.protocol + '://' + req.get('host') + '/users/setpassword/'+results.user[0]._id+'</p>'
              }, function(error, info){
              if (error) {
                console.log(error);
              } else {
                
                User.findOneAndUpdate({'email':req.body.email}, {$set:{password:"reset"}}, {}, function (err, theuser) {
                    if (err) { return next(err); }
                    // Successful - redirect to genre detail page.
                    res.render('login',{title: 'Signin',user_status : req.session.user || false } );
                });
                // res.render('login',{user_status : req.session.user || false } );
              }
            }); 
        }else
        {          
            res.render('login',{title: 'Signin',user_status : req.session.user || false } );
        }
    });
    
};

exports.resetpassword = [ 
body('password').isLength({ min: 8 }).trim().withMessage('Invalid Email.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
body('repassword').isLength({ min: 8 }).trim().withMessage('Password length must be 8+.')
        .isAlphanumeric().withMessage('Password has non-alphanumeric characters.'),        

sanitizeBody('password').trim().escape(),
sanitizeBody('password').trim().escape(),
(req, res, next) => {
   const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('setpassword',{errors: errors.array(), user_status : req.session.user || false } );
            return;
        }else{
    async.parallel({                    
    user: function (callback) {
        User.findById(req.params.id)
            .exec(callback)
            },
        }, function (err, results) {
        if (err) { return (err); }     
        if(req.body.password == req.body.repassword && results.user != "" && results.user != null && results.user.password=="reset"  ){
                
                User.findByIdAndUpdate(req.params.id, {$set:{password:req.body.password}}, {}, function (err, theuser) {
                    if (err) { return next(err); }
                    // Successful - redirect to genre detail page.
                    res.render('login',{title: 'Signin',user_status : req.session.user || false ,sucess_msg: req.flash('Updated Successful')} );
                });
               }else{
                
                res.render('setpassword',{user_status : req.session.user || false,err_msg: req.flash('Password Not equal') } );
       }
    });
    
}
}];


transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'deva@cogzidel.com',
    pass: 'Kd551355122!'
  }
});

exports.googledata = (req, res,next)=>{
 console.log(req.session.passport.user);
    async.parallel({
                    
        user: function (callback) {
            User.find({ 'email': req.session.passport.user.email})
                .exec(callback)
                },
            }, function (err, results) {
            if (err) { return (err); }       
            if(0 < results.user.length){
                req.session.user =results.user[0].name;
                req.session.email =results.user[0].email;
                res.redirect('/catalog')
                return;
            }else
            {          
                   var users = new User(
                {
                    first_name: req.session.passport.user.first_name,
                    family_name: req.session.passport.user.family_name,
                    email: req.session.passport.user.email,
                    password: req.session.passport.user.googleid,
                    googleid:req.session.passport.user.googleid
                });
                    users.save(function (err) {
                        if (err) { return next(err); }
                        // Successful - redirect to new author record.
                        req.session.user =users.name;
                        req.session.email =users.Email;
                        res.redirect('/catalog');
                    }); 
                // res.render('login',{title: 'Signin',user_status : req.session.user || false } );
            }
    });
}

exports.facebookdata = (req, res,next)=>{
 console.log(req.session.passport.user);
    async.parallel({
                    
        user: function (callback) {
            User.find({ 'email': req.session.passport.user.id+'@mail.com'})
                .exec(callback)
                },
            }, function (err, results) {
            if (err) { return (err); }       
            if(0 < results.user.length){
                req.session.user =results.user[0].name;
                req.session.email =results.user[0].email;
                res.redirect('/catalog')
                return;
            }else
            {          
                   var users = new User(
                {
                    first_name: req.session.passport.user.displayName,
                    family_name: req.session.passport.user.name.familyName || "",
                    email: req.session.passport.user.id+'@mail.com',
                    password: req.session.passport.user.id,
                    facebookid:req.session.passport.user.id,
                    googleid: ""
                });
                    users.save(function (err) {
                        if (err) { return next(err); }
                        // Successful - redirect to new author record.
                        req.session.user =users.name;
                        req.session.email =users.Email;
                        res.redirect('/catalog');
                    }); 
                // res.render('login',{title: 'Signin',user_status : req.session.user || false } );
            }
    });
}

exports.logout = function (req, res, next) { 
req.session.destroy();
res.redirect('/');
}

