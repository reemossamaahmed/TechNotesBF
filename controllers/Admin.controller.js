const UserModel = require('../models/User.model');
const NoteModel = require('../models/Note.model');

const bcrybt = require('bcrypt');


const randomstring = require('randomstring');


const nodemailer = require('nodemailer');
const { render } = require('../routes/User.route');

const securePassword = async (password) => {
    try {
        const hashedPassword = await bcrybt.hash(password, 10);
        return hashedPassword;
    }
    catch (error) {
        console.log(error.message);
    }
}


const sendverifyMail = async (name, email, password, user_id) => {
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
            subject: 'Admin add you and Verify your mail',
            html: `<p>Hii ${name},please click here to <a href="http://localhost:3000/user/verify?id=${user_id}">verify</a> your mail.</p><p>your email is : ${email}</p><p>$ your password is : ${password}</p>`
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
            html: `<p>Hii ${name},please click here to <a href="http://localhost:3000/admin/reset-password?token=${token}">Forget</a> your password.</p>`
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
                if (userData.isAdmin === false) {
                    res.render('login', { message: 'You are not admin!!!' });
                }
                else {
                    req.session.user_id = userData._id;
                    res.redirect('/admin/dashboard');
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
        res.render('home', { admin: userdata });
    }
    catch (error) {
        console.log(error.message);
    }
}

const logout = async (req, res) => {
    try {
        req.session.destroy();
        res.redirect('/admin/login')
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
            if (user.isAdmin === false) {
                res.render('forget-password', { message: 'You are not admin!!!' });
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
        res.redirect('/admin/login');
    }
    catch (error) {
        console.log(error.message);
    }
}

const adminDashboard = async (req, res) => {
    try {
        const users = await UserModel.find({ isAdmin: false })
        const userdata = await UserModel.findById({ _id: req.session.user_id });
        res.render('dashboard', { users: users, user: userdata })
    }
    catch (error) {
        console.log(error.message);
    }
}



const showUsers = async (req, res) => {
    try {
        const users = await UserModel.find({});
        if (!users) {
            return res.status(404).json({
                message: `This user is not exists`
            })
        }

        res.render('show-users', { users: users })
    }
    catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}



const loadAddUser = (req, res) => {
    try {
        res.render('add-new-user');
    }
    catch (error) {
        console.log(error.message);
    }
}


const addUser = async (req, res) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const image = req.file.filename;
        const password = randomstring.generate(8);

        const spassword = await securePassword(password);

        const user = new UserModel({
            name: name,
            email: email,
            password: spassword,
            image: image,
            isAdmin: false
        })


        const newUser = await user.save();
        if (newUser) {
            sendverifyMail(name, email, password, newUser._id);
            res.redirect('/admin/dashboard');
        }
        else {
            res.render('add-new-user', { message: 'your registeration has benn failed!!!' });
        }
    }
    catch (error) {
        console.log(error.message)
    }
}


const loadeditUser = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await UserModel.findById({ _id: id });
        if (user) {
            res.render('edit-user', { user: user });
        }
        else {
            res.redirect('/admin/dashboard')
        }
    }
    catch (error) {
        console.log(error.message);
    }
}




const editUser = async (req, res) => {
    try {
        const id = req.body.id;
        const user = await UserModel.findByIdAndUpdate({ _id: id }, { $set: { name: req.body.name, email: req.body.email, isVerify: req.body.verify } });

        res.redirect('/admin/dashboard')
    }
    catch (error) {
        console.log(error.message);
    }
}


const deleteUser = async (req, res) => {
    try
    {

    const id = req.params.id;
    const users = await UserModel.find({});

    const note = await NoteModel.findOne({ userinfo: id }).lean().exec()
    if (note) {
        console.log('User has assigned notes')
        return res.render('show-users',{message:'User has assigned notes',users:users})
    }

    const user = await UserModel.findById(id).exec()

    if (!user) {
        return console.log('User not found')
    }

    const result = await user.deleteOne()
    res.redirect('/admin/show/users')
}
catch(error)
{
    console.log(error.message)
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
            res.redirect('/admin/show/notes');
        }
        else {
            console.log('fail')
        }

    }
    catch (error) {
        console.log(error.message)
    }
}


const deleteNote = async (req, res) => {
    try {
        const id = req.params.id;
        const note = await NoteModel.findByIdAndRemove({ _id: id });

        res.redirect('/admin/show/notes')
    }
    catch (error) {
        console.log(error.message);
    }


}




const showNotes = async (req, res) => {
    try {
        const notes = await NoteModel.find({}).populate('userinfo');
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
            res.redirect('/admin/show/notes')
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

        res.redirect('/admin/show/notes')
    }
    catch (error) {
        console.log(error.message);
    }
}



module.exports = {
    loadlogin,
    login,
    loadhome,
    logout,
    loadforgetpassword,
    forgetpassword,
    loadresetpassword,
    resetpassword,
    adminDashboard,
    showUsers,
    loadAddUser,
    addUser,
    loadeditUser,
    editUser,
    deleteUser,
    loadcreatenote,
    createNote,
    showNotes,
    showNoteById,
    updateNote,
    deleteNote
}