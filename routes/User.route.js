const express = require('express');
const router = express()

const session = require('express-session');


const bodyParser = require('body-parser')
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


router.set('view engine' ,'ejs');
router.set('views' ,'./views/user');



const auth = require('../middleware/auth')


const UserController =  require('../controllers/User.controller');
const upload = require('../middleware/upload');
const config = require('../config/config');


router.use(express.static('public'))

router.use(session({secret : config.SESSION_SECRET}));

router.get('/register', auth.isLogout, UserController.loadregister);

router.post('/register', upload.single('image'),UserController.register);

router.get('/verify',UserController.verifyMail);

router.get('/login', auth.isLogout, UserController.loadlogin);

router.post('/login',UserController.login);

router.get('/home', auth.isLogin, UserController.loadhome);

router.get('/logout', auth.isLogin, UserController.logout);

router.get('/forget-password', auth.isLogout, UserController.loadforgetpassword);

router.post('/forget-password', UserController.forgetpassword);

router.get('/reset-password', auth.isLogout, UserController.loadresetpassword);

router.post('/reset-password', UserController.resetpassword);

router.get('/verification', UserController.loadverification);

router.post('/verification', UserController.verification);

router.get('/edit', auth.isLogin, UserController.loadedit);

router.post('/edit', upload.single('image') ,UserController.edit);


router.get('/create-note',auth.isLogin,UserController.loadcreatenote);

router.post('/create-note',UserController.createNote);


router.get('/:id',auth.isLogin, UserController.showNoteById );

router.post('/edit-note', UserController.updateNote);



router.get('/note/:id',auth.isLogin, UserController.deleteNote);



router.get('/show/notes',auth.isLogin,UserController.showNotes);



router.all('*',(req,res)=>{
    res.render('404',{message : 'OPS, This URL is not exist!!'});
});

module.exports = router;