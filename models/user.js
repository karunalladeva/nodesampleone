var mongoose = require('mongoose');
var moment = require('moment'); // For date handling.

var Schema = mongoose.Schema;

var UserSchema = new Schema(
    {
    first_name: {type: String, required: true, max: 100},
    family_name: {type: String, max: 100},
    email: { type: String },
    password : { type: String },
    googleId : { type: String },
    facebookid: { type: String },
    }
  );

// Virtual for author "full" name.
UserSchema
.virtual('name')
.get(function () {
  return this.first_name;
});

// Virtual for this author instance URL.
UserSchema
.virtual('id')
.get(function () {
  return this._id
});


UserSchema
.virtual('Email')
.get(function () {
  return this.email;
});



// Export model.
module.exports = mongoose.model('User', UserSchema);
