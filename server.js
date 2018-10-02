const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track' )

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

const User = require('./models/user');
const Exercise = require('./models/exercise');


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// add new user
app.post('/api/exercise/new-user/', (req, res) => {
  const username = req.body.username;

  const newUser = new User({username});

  newUser.save((err, data) => {
    if (err) res.send('Error saving user');
    else res.json(data);
  });
  
});


// new exercise
app.post('/api/exercise/add', (req, res) => {
  const username = req.body.username;
  const description = req.body.description;
  let duration = req.body.duration;
  let date = req.body.date;
  let userId;

  User.findOne({ username }, (err, user) => {
    if (!user) {
      res.send(username + ' Username not found');
    } else {
      userId = user.id;
      duration = Number(duration);
      
      if (date === '') date = new Date();
      else date = Date.parse(date);

      const newExercise = new Exercise({
        username,
        description,
        duration,
        date
      });

      newExercise.save((err, data) => {
        if (err) res.send('Error saving');
        else res.json(data);
      });
    }
  });
  
});


// retrieve data
app.get('/api/exercise/:log', (req, res) => {
  var username = Object.keys(req.query)[0];
  var from = req.query.from;
  var to = req.query.to;
  var limit = req.query.limit;
  const query = {};
  
  User.findOne({ username }, (err, user) => {
    if (!user) {
      res.send(username + 'Username not found');
    } else {
      query.username = username;

      if (from !== undefined) {
        from = new Date(from);
        query.date = { $gt: from };
      }

      if (to !== undefined) {
        to = new Date(to);
        to.setDate(to.getDate() + 1);
        query.date = { $lt: to};
      }

      if (limit !== undefined) limit = Number(limit);

      Exercise.find(query)
              .select('userId description date duration ')
              .limit(limit)
              .exec((errExercise, exercises) => {
                if (err) {
                  res.send(err);
                } else if (!user) {
                  res.send('User not found');
                } else {
                  // res.send(JSON.stringify(query));
                  res.json(exercises);
                }
              });
    }
  });
  
  
});


// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
