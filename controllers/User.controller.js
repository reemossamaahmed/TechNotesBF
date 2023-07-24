const UserModel = require('../models/User.model');
const bcrybt = require('bcrypt');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const NoteModel = require('../models/Note.model');


const securePassword = async (password) => {
    try {
        const hashedPassword = await bcrybt.hash(password, 10);
        return hashedPassword;
    }
    catch (error) {
        console.log(error.message);
    }
}

const sendverifyMail = async (name, email, user_id) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: 'reemhelmy28@gmail.com',
                pass: '*****************'
            }
        });

        const mailOptions = {
            from: 'reemTest97@gmail.com',
            to: email,
            subject: 'For Verificatiom mail',
            html: `<p>Hii ${name},please click here to <a href="http://localhost:3000/user/verify?id=${user_id}">verify</a> your mail.</p>`
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error.message);
            }
            else {
                console.log(`Email has been sent, ${info.response} `);
            }
        });
    }
    catch (error) {
        console.log(error.message);
    }
}

const sendResetMail = async (name, email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: 'reemhelmy28@gmail.com',
                pass: 'yugeorintujxvhao'
            }
        });

        const mailOptions = {
            from: 'reemTest97@gmail.com',
            to: email,
            subject: 'For Reset Password',
            html: `<p>Hii ${name},please click here to <a href="http://localhost:3000/user/reset-password?token=${token}">Forget</a> your password.</p>`
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error.message);
            }
            else {
                console.log(`Email has been sent, ${info.response} `);
            }
        });
    }
    catch (error) {
        console.log(error.message);
    }
}


const loadregister = (req, res) => {
    try {
        res.render('register');
    }
    catch (error) {
        console.log(error.message);
    }
}


const register = async (req, res) => {
    try {
        const { name, email, password, image, isActive, isVerify } = req.body;

        const user = new UserModel({
            name: name,
            email: email,
            password: await securePassword(password),
            image: image,
            isActive: isActive,
            isVerify: isVerify
        })


        if (req.file) {
            user.image = req.file.filename
        }

        const newUser = await user.save();
        if (newUser) {
            sendverifyMail(req.body.name, req.body.email, newUser._id);
            res.render('register', { message: 'your registeration has been Successfully, please verify your account' });
        }
        else {
            res.render('register', { message: 'your registeration has benn failed!!!' });
        }
    }
    catch (error) {
        console.log(error.message)
    }
}


const verifyMail = async (req, res) => {
    try {
        const updatedInfo = await UserModel.updateOne({ _id: req.query.id }, { $set: { isVerify: true } });
        res.render('email-verified')
        console.log(updatedInfo)
    }
    catch (error) {
        console.log(error.message);
    }
}


const loadlogin = (req, res) => {
    try {
        res.render('login');
    }
    catch (error) {
        console.log(error.message);
    }
}

const login = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await UserModel.findOne({ email: email });

        if (userData) {
            const verifyPassword = await bcrybt.compare(password, userData.password);

            if (verifyPassword) {
                if (userData.isVerify === false) {
                    res.render('login', { message: 'Please verify Your Email!!' });
                }
                else {
                    req.session.user_id = userData._id;
                    res.redirect('/user/home');
                }
            }
            else {
                res.render('login', { message: 'Incorrect Email or Password!!' });
            }
        }
        else {
            res.render('login', { message: 'Incorrect Email or Password!!' });
        }
    }
    catch (error) {
        console.log(error.message);
    }
}

const loadhome = async (req, res) => {
    try {
        const userdata = await UserModel.findById({ _id: req.session.user_id });
        const munNotes = await NoteModel.find({userinfo:req.session.user_id}).count();
        
        res.render('home', { user: userdata, munNotes:munNotes });
    }
    catch (error) {
        console.log(error.message);
    }
}

const logout = async (req, res) => {
    try {
        req.session.destroy();
        res.redirect('/user/login')
    }
    catch (error) {
        console.log(error.message);
    }
}

const loadforgetpassword = (req, res) => {
    try {
        res.render('forget-password');
    }
    catch (error) {
        console.log(error.message);
    }
}

const forgetpassword = async (req, res) => {
    try {
        const user = await UserModel.findOne({ email: req.body.email });

        if (user) {
            if (user.isVerify === false) {
                res.render('forget-password', { message: 'Please verify Your Email!!' });
            }
            else {
                const randomString = randomstring.generate();
                const UpdatedUser = await UserModel.updateOne({ email: req.body.email }, { $set: { token: randomString } });
                sendResetMail(user.name, user.email, randomString);
                res.render('forget-password', { message: 'Please check your mail to Reset your password' });
            }
        }
        else {
            res.render('forget-password', { message: 'This Email is not correct!!!' });
        }
    }
    catch (error) {
        console.log(error.message);
    }
}

const loadresetpassword = async (req, res) => {
    try {
        const token = req.query.token;
        const user = await UserModel.findOne({ token: token });
        if (user) {
            res.render('reset-password', { user_id: user._id });
        }
        else {
            res.render('404', { message: 'Invalid Token!!!' });
        }
    }
    catch (error) {
        console.log(error.message);
    }
}

const resetpassword = async (req, res) => {
    try {
        const { user_id, password } = req.body;
        const hashedPassword = await securePassword(password);
        const UpdatedUserPassword = await UserModel.findByIdAndUpdate({ _id: user_id }, { $set: { password: hashedPassword, token: '' } });
        res.redirect('/user/login');
    }
    catch (error) {
        console.log(error.message);
    }
}

const loadverification = async (req, res) => {
    try {
        res.render('verification');
    }
    catch (error) {
        console.log(error.message);
    }
}



const verification = async (req, res) => {
    try {
        const email = req.body.email;
        const userdata = await UserModel.findOne({ email: email });
        console.log(userdata)
        if (userdata) {
            sendverifyMail(userdata.name, userdata.email, userdata._id)
            res.render('verification', { message: 'reset verification mail sent your mail id, please check.' });
        }
        else {
            res.render('verification', { message: 'This email is not Exist!!' });
        }
    }
    catch (error) {
        console.log(error.message);
    }
}



const loadedit = async (req, res) => {
    try {
        const id = req.query.id;
        const userdata = await UserModel.findById({ _id: id });
        if (userdata) {
            res.render('edit', { user: userdata });
        }
        else {
            res.redirect('/user/home')
        }
    }
    catch (error) {
        console.log(error.message);
    }
}


const edit = async (req, res) => {
    try {
        if (req.file) {
            const userdata = await UserModel.findByIdAndUpdate({ _id:req.body.user_id },{$set:{name:req.body.name, email:req.body.email, image:req.file.filename}})
        }
        else {
            const userdata = await UserModel.findByIdAndUpdate({ _id:req.body.user_id },{$set:{name:req.body.name, email:req.body.email}})
        }
        res.redirect('/user/home');
    }
    catch (error) {
        console.log(error.message);
    }
}


const loadcreatenote = async (req, res) => {
    try {
        const userdata = await UserModel.findById({ _id: req.session.user_id });

        const user_id = userdata?._id

        res.render('create-note', { user_id: user_id });
    }
    catch (error) {
        console.log(error.message);
    }
}

const createNote = async (req, res) => {
    try {
        const Note = new NoteModel({
            title: req.body.title,
            body: req.body.body,
            userinfo: req.body.user_id
        });
        const noteSave = await Note.save();
        if (noteSave) {
            console.log('success')
            res.redirect('/user/show/notes');
        }
        else {
            console.log('fail')
        }

    }
    catch (error) {
        console.log(error.message)
    }
}




const showNotes = async (req, res) => {
    try {
        const notes = await NoteModel.find({userinfo:req.session.user_id}).populate('userinfo');
        console.log(notes)
        if (!notes) {
            return res.status(404).json({
                message: `This note is not exists`
            })
        }

        res.render('show-notes', { notes: notes })
    }
    catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}




const showNoteById = async (req, res) => {
    try {
        const id = req.params.id;
        const note = await NoteModel.findById({ _id: id });
        if (note) {
            console.log(note)
            res.render('edit-note', { note: note });
        }
        else {
            res.redirect('/user/show/notes')
        }
    }
    catch (error) {
        console.log(error.message);
    }
}


const updateNote = async (req, res) => {
    try {
        const id = req.body.id;
        const note = await NoteModel.findByIdAndUpdate({ _id: id }, { $set: { title: req.body.title, body: req.body.body, completed: req.body.completed } });
        // console.log(req.body)

        res.redirect('/user/show/notes')
    }
    catch (error) {
        console.log(error.message);
    }
}



const deleteNote = async (req, res) => {
    try {
        const id = req.params.id;
        const note = await NoteModel.findByIdAndRemove({ _id: id });

        res.redirect('/user/show/notes')
    }
    catch (error) {
        console.log(error.message);
    }


}


module.exports = {
    register,
    verifyMail,
    loadregister,
    loadlogin,
    login,
    loadhome,
    logout,
    loadforgetpassword,
    forgetpassword,
    loadresetpassword,
    resetpassword,
    loadverification,
    verification,
    loadedit,
    edit,
    showNotes,
    loadcreatenote,
    createNote,
    showNoteById,
    updateNote,
    deleteNote
}
