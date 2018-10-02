const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Exercise = new Schema({
  username: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  duration: { 
    type: Number, 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
});

module.exports = mongoose.model('Exercise', Exercise);