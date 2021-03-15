var io = require("socket.io")(process.env.PORT || 3000)
var shortid = require('shortid')

//data server
var express = require('express')
var app = express()
var mongoose = require('mongoose')

require('./db')

var User = mongoose.model('User',{
    playername:{
        type:String
    },
    score:{
        type:Number
    }
})

app.use(express.urlencoded({extended:true}))
app.use(express.json())

app.get('/download/id',function(req,res){
    User.find({id:playername}).then(function(user){
        res.json({user})
    })
})

//post route to save sate from unity
app.post('/upload', function(req,res){
    console.log("Posting data")
    var newUser = new User({
        playername:req.body.playername,
        score:req.body.score
    })

    newUser.save(function(err,result){
        if(err){
            console.log(err)
        }else{
            console.log(result)
        }
    })
})


app.listen(5000, function(){
    console.log("App running on port 5000")
})



console.log('server is running')


var players = []


io.on('connection', function(socket){
    console.log('client connected')
    //socket.broadcast.emit('spawn')
    var clientId = shortid.generate()

    players.push(clientId)

    // //spawn new players for existing players
     socket.broadcast.emit('spawn', {id:clientId})

    // //request all existing player positions
    socket.broadcast.emit('requestPosition')

    // players.forEach(function(playerId){
    //     if(playerId == clientId){
    //         return
    //     }
    //     socket.emit('spawn')
    //     console.log("sending spawn to new player", players[i])
    // })
        
    players.forEach(function(client){
        if(client == clientId){
            return
        }
        socket.emit('spawn', {id:client})
        //console.log("sending spawn to new player", players[i])
    })


    socket.on('hello', function(data){
        console.log("Hello from the connected client")
    })

    socket.on('move', function(data){
        data.id = clientId;
        console.log("Getting possitions from client")
        console.log(data);
        socket.broadcast.emit('move', data)
    })

    // socket.on('updatePosition', function(data){
    //     data.id = clientId
        
    //     socket.broadcast.emit('updatePosition', data)
    // })

    socket.on('disconnect', function(){
        console.log("player has disconnected")
        players.splice(players.lastIndexOf(clientId),1)
        socket.broadcast.emit('disconnected', {id:clientId})
    })
})