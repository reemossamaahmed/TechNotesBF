const express = require('express');
const router = express();


const AdminController =  require('../controllers/Admin.controller');
const upload = require('../middleware/upload');

const session = require('express-session');
const config = require('../config/config');

router.use(express.static('public'))

router.use(session({secret:config.SESSION_SECRET}))

const bodyParser = require('body-parser')
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

const auth = require('../middleware/adminAuth')

router.set('view engine' ,'ejs');
router.set('views' ,'./views/admin');




router.get('/login',auth.isLogout,AdminController.loadlogin);
router.post('/login',AdminController.login);

router.get('/home',auth.isLogin,AdminController.loadhome);

router.get('/logout', auth.isLogin,AdminController.logout);

router.get('/forget-password', auth.isLogout, AdminController.loadforgetpassword);
router.post('/forget-password', AdminController.forgetpassword);

router.get('/reset-password', auth.isLogout, AdminController.loadresetpassword);

router.post('/reset-password', AdminController.resetpassword);

router.get('/dashboard',auth.isLogin,AdminController.adminDashboard);


router.get('/show/users',auth.isLogin,AdminController.showUsers);
router.get('/addNewUser',auth.isLogin,AdminController.loadAddUser);
router.post('/addNewUser',upload.single('image') ,AdminController.addUser);


router.get('/edit-user/:id',auth.isLogin,AdminController.loadeditUser);
router.post('/edit-user',upload.single('image') ,AdminController.editUser);

router.get('/delete-user/:id',auth.isLogin,AdminController.deleteUser);


router.get('/create-note',auth.isLogin,AdminController.loadcreatenote);

router.post('/create-note',AdminController.createNote);



router.get('/show/notes',auth.isLogin,AdminController.showNotes);

router.get('/:id',auth.isLogin, AdminController.showNoteById );

router.post('/edit-note', AdminController.updateNote);



router.get('/note/:id',auth.isLogin, AdminController.deleteNote);






router.all('*',(req,res)=>{
    res.render('404',{message : 'OPS, This URL is not exist!!'});
});



module.exports = router;