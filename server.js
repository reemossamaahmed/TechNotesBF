const mongoose =  require('mongoose');
const express = require('express');
const UserRouter = require('./routes/User.route');

const AdminRouter = require('./routes/Admin.route');

const bodyParser = require('body-parser');
mongoose.connect('mongodb://127.0.0.1:27017/userMSS').then(()=>{console.log(`Connected to DB Successfully `)}).catch((error)=>{console.log(error.message)});

const app = express();
// app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
const port = 3000 || process.env.PORT;


app.use(express.static('public'));

app.use('/user',UserRouter);
app.use('/Admin',AdminRouter);




app.listen(port, ()=>{
    console.log(`Server running on ${port}`);
})