var express = require('express')
var mongoose = require('mongoose')
var app = express()
var path = require('path')
var bodyparser = require('body-parser')
var serv = require('http').Server(app)
var io = require('socket.io')(serv, {})
var debug = true




app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))
app.use(express.json())

/*  mongoose.createConnection('mongodb://localhost:27017/Players', {
     useNewUrlParser: true
 }).then(function () {
     console.log("Connected to admin data base")
 }) */

//mongoose.connection.close()

mongoose.connect('mongodb://localhost:27017/serverPlayers', {
    useNewUrlParser: true
}).then(function () {
    console.log("Connected to player data base")
})


require('./models/player')
var Player = mongoose.model('player')
require('./models/admin')
var PlayerData = mongoose.model('admin')






app.get('/getPlayer', function (req, res) {
    try {
        Player.find({}).then(function (player) {
            res.json({ player })
        })
    }
    catch (e) {
        
    }
})

app.get('/getPlayerFor10', function (req, res) {
    try {
        Player.find({}).sort({Wins: "desc"}).exec().then(function (player) {
            res.json({ player })
        })
    }
    catch (e) {
        
    }
})

app.post('/deletePlayer', function (req, res) {
    console.log("Player Deleted", req.body._id)
    Player.findByIdAndDelete(req.body._id).exec().then(function () {
        res.redirect('index.html')
    })
})

app.post('/editPlayer', function (req, res) {

    Player.findByIdAndUpdate(  { _id: req.body._id },{ pName: req.body.pName }).exec()
    Player.findByIdAndUpdate(  { _id: req.body._id },{ HighScore: req.body.HighScore } ).exec()
    Player.findByIdAndUpdate(  { _id: req.body._id },{ WL: req.body.WL }).exec()
    Player.findByIdAndUpdate(  { _id: req.body._id },{ KDA: req.body.KDA }).exec()
    Player.findByIdAndUpdate(  { _id: req.body._id },{ Wins: req.body.Wins}).exec().then(function () {
        
        res.redirect('index.html')
    })
})

var isPasswordValid = function (data, cb) {
    PlayerData.findOne({ username: data.username }, function (err, username) {
        console.log(data.username)
        if (username != null) {
            cb(data.password == username.password)
        } else {
            console.log("falure to find admin")
            cb()
        }

    })



}

io.sockets.on('connection', function (socket) {
    console.log("Socket Connected")
    socket.on('signIn', function (data) {

        isPasswordValid(data, function (res) {
            if (res) {
                Player.onConnect(socket)
                socket.emit('connected', socket.id)
                mongoose.connection.close();
                mongoose.connect('mongodb://localhost:27017/serverPlayers', {
                    useNewUrlParser: true
                }).then(function () {
                    console.log("Connected to mongoDB Database")
                }).catch(function (err) {
                    console.log("error")
                })

                socket.emit('signInResponse', { success: true })
            } else {
                socket.emit('signInResponse', { success: false })
            }
        })
    })
})



app.use(express.static(__dirname + "/views"))

serv.listen(3000, function () {
    console.log("Listening on port 3000")
})
