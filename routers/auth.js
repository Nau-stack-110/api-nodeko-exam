const express = require("express");
const router = express.Router();
const authcontroller = require('../controllers/auth.controller');

router.post('/login', authcontroller.login);
router.post('/signup', authcontroller.signup);
router.post('/logout', authcontroller.logout);

router.post('/password/forgot', authcontroller.forgotPassword);
router.post('/password/reset', authcontroller.resetPassword);


module.exports = router;

