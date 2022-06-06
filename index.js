const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const usersList = [];
const exercisesAll = [];

app.post('/api/users', (req, res) => {
  const username = req.body.username;
  const id = Math.random().toString(36).substring(2,12);
  const user = {
    username: username,
    _id: id
  };
  usersList.push(user);
  res.json(user);
})

app.get('/api/users', (req,res) => {
  res.json(usersList);
})

app.post('/api/users/:_id/exercises', (req, res) => {
  let exDate = '';
  if (req.body.date) {
    exDate = new Date(req.body.date);
  } else {
    exDate = new Date(Date.now());
  }
  let user = usersList.find(u => { return u._id == req.params._id });
  const exercise = {
    description: req.body.description,
    duration: parseInt(req.body.duration),
    date: exDate.toDateString(),
    _id: req.params._id
  };
  exercisesAll.push(exercise);
  res.json({
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date,
    _id: req.params._id
  });
})

app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id;
  const user = usersList.find( u => {
    return u._id === userId
  })
  let log = exercisesAll.filter( obj => {
    if (obj._id === userId) {
      return obj;
    }
  })

  if (req.query.from || req.query.to) {
    const from = new Date(req.query.from) || new Date(0);
    const to = new Date(req.query.to) || new Date(Date.now());
    log = log.filter( i => {
      const exerDate = new Date(i.date);
      if (exerDate > from && exerDate < to) {
        return i;
      }
    })
  }

  if (req.query.limit) {
    const limit = parseInt(req.query.limit) || log.length;
    log = log.slice(0, limit);
  }

  res.json({
    _id: user._id,
    username: user.username,
    count: log.length,
    log: log
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
