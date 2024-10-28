const {Role, User} = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const createAdmin = async () =>{
    try {
        let adminRole = await Role.findOne({where: {rolename:'Admin'}});
        if (!adminRole) {
            adminRole = await Role.create({rolename:'Admin', roledesc:'Administrateur du systeme'});
            console.log("Role Admin créé avec succès");
        }else{
            console.log("Role Admin déja existant");
        }
        let admin = await User.findOne({ where: {email:process.env.ADMIN_EMAIL } });
        if (!admin) {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt);
            admin = await User.create({
                name:process.env.ADMIN_NAME,
                email:process.env.ADMIN_EMAIL,
                password:hash,
                tel:process.env.ADMIN_TEL,
                image:process.env.ADMIN_IMAGE,
                role_id:adminRole.id
            });
            console.log("Admin créé avec succès!");
        }else{
            console.log('Admin existe déja!');
        }
    } catch (e){
        console.log('Erreur lors de la vérification/creation de l\'admin:', e.message || e);
    }
}

const signup = async (req, res) => {
  const { name, email, password, tel, image, role_id } = req.body;
  try {
    let userRole = await Role.findOne({where: {rolename:'User'}});
    if (!userRole) {
        userRole = await Role.create({rolename:'User', roledesc:'User access only'});
        console.log("Role User créé avec succès");
    }else{
        console.log("Role User déja existant");
    }
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ message: 'Cet e-mail est déjà utilisé.' });
    }
    user = await User.create({
      name,
      email,
      password, 
      tel,
      image,
      role_id
    });
    res.status(201).json({ message: 'Utilisateur créé avec succès.' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'inscription de l\'utilisateur.' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Identifiants incorrects.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Identifiants incorrects.' });
    }
    // Créer un token JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.status(200).json({ token, message: 'Connexion réussie.' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la connexion de l\'utilisateur.' });
  }
};

const logout = async () =>{

}

const resetPassword = async (req, res) => {
    const { email, pin, newPassword } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        if (user.resetPin !== pin || user.pinExpiry < Date.now()) {
            return res.status(400).send({ message: "Invalid or expired PIN" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Mettre à jour le mot de passe et supprimer le PIN
        user.password = hashedPassword;
        user.resetPin = null;
        user.pinExpiry = null;
        await user.save();

        return res.status(200).send({ message: "Password reset successful" });
    } catch (error) {
        res.status(500).send({
            message: "Internal server error",
            error: error.message
        });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).send({ message: "User with this email not found" });
        }
        // Générer un code PIN à 6 chiffres
        const pinCode = Math.floor(100000 + Math.random() * 900000).toString();

        user.resetPin = pinCode;
        user.pinExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
        await user.save();

        return res.status(200).send({
            message: "PIN generated successfully. Test with Postman.",
            pin: pinCode
        });
    } catch (error) {
        res.status(500).send({
            message: "Internal server error",
            error: error.message
        });
    }
};

const changePassword = async (req, res) => {
    const userId = req.user.id;
    const old_password = req.body.old_password;
    const new_password = req.body.new_password;

    if (typeof old_password !== 'string' || typeof new_password !== 'string') {
        return res.status(400).send({
            message: 'Passwords must be strings'
        });
    }
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).send({ message: "User not found in the server" });
        }
        const isMatch = await bcrypt.compare(old_password, user.password); // comparaison
        if (!isMatch) {
            return res.status(400).send({ message: "Old password is incorrect!" });
        }
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(new_password, salt);

        user.password = hash; // mettre à jour le mdp
        await user.save();
        res.status(200).send({ message: "Password changed successfully!" });
    } catch (error) {
        res.status(500).send({
            message: 'Server internal error',
            error: error.message
        });
    }
};

module.exports = {
    createAdmin,
    logout,
    login,
    forgotPassword,
    resetPassword,
    signup,
    changePassword
}
