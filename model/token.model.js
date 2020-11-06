const { Schema, model, Types } = require('mongoose');

const setTokenModel = new Schema({
  userId: {
    type: Types.ObjectId,
    ref: 'user',
    required: true,
  },
  token: {
    type: String,
    unique: true,
    require: true,
  },
  create: {
    type: Date,
    default: () => Date.now(),
  },
});

setTokenModel.index({ create: 1 }, { expires: 600 });

const tokenModel = model('token', setTokenModel);

module.exports = tokenModel;

tokenModel.createIndexes();
