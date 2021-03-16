var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var PlayerSchema = new Schema({
    pName:{
        type:String,
        required:true
    },
    HighScore:{
        type:Number,
        required:true
    },
    KDA:{
        type:Number,
        required:true
    },
    WL:{
        type:Number,
        required:true
    },
    Wins:{
        type:Number,
        required:true
    }
})

mongoose.model('player', PlayerSchema)