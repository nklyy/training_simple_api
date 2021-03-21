const { Schema, model } = require('mongoose');

const setUserModel = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 15,
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
  },
  userId: {
    type: String,
    unique: true,
    required: true,
  },
  isEmail: {
    type: Boolean,
    default: false,
  },
});

setUserModel.virtual('id').set(function (v) {
  this.isEmail = (/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/).test(v);
  this.userId = v;
});

const userModel = model('user', setUserModel);

module.exports = userModel;

userModel.createIndexes();
