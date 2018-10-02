const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true, 
    "minLength": 1,
    "maxLength": 15
  }
});

module.exports = mongoose.model('User', User);