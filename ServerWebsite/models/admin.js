var mongoose = require('mongoose')
var Schema = mongoose.Schema

var adminSchema = new Schema({
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})

mongoose.model('admin', adminSchema, 'admin')