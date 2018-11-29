const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track' )

const User = require('./User');

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


// Not found middleware
app.use((req, res, next) => {
  //return next({status: 404, message: 'not found'})
  return next();
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



//================================================================================
app.get('/api/exercise/users', (req, res) => {
  User.find({}, (err, users) => {
    if (err) {
      return res.status(500).send({ message: err.message });
    }
    
    return res.send(users);
  });
});

app.post('/api/exercise/new-user', (req, res) => {
  const user = new User({
    username: req.body.username
  });
  
  user.save((err, doc) => {
    if (err) {
      return res.status(500).send({ message: err.message });
    }
    
    return res.send(doc);
  });
});

app.post('/api/exercise/add', (req, res) => {
  const exercise = {
    description: req.body.description,
    duration: req.body.duration,
    date: req.body.date ? req.body.date : new Date()
  }
  
  User.findByIdAndUpdate(req.body.userId, { 
    "$push": { "exercise": exercise } 
  }, { new: true }, (err, doc) => {
    console.log(doc)
    if (err) {
      return res.status(500).send({message: err.message});
    }
  
    res.send(doc);
  });
});

app.get('/api/exercise/log', (req, res) => {

  User.findById(req.query.userId, (err, doc) => {
    if (err) {
      return res.status(500).send({message: err.message});
    }
    
    res.send(doc);
  });
  

});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
