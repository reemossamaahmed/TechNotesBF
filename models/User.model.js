const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: { type: String, required: true},
    password: { type: String, required: true },
    email: { type: String, required: true, unique : true},
    image: { type: String, default: 'default.png'},
    isActive:{
        type:Boolean,
        default:false
    },
    isVerify:{
        type:Boolean,
        default:false
    },
    isAdmin:{
        type:Boolean,
        default:true
    },
    token:{
        type:String,
        default:''
    },
})



const UserModel = mongoose.model('User', userSchema)

module.exports = UserModel
