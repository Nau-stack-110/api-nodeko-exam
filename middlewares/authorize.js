const jwt = require('jsonwebtoken');
const checkToken = async (req, res, next) =>{
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).send({message :"Accès refusé, Pas de token."});
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        res.status(400).send({
            message :"Token invalide"
        });
    }
}

const isAdmin = async () =>{

}

const isUser = async () =>{

}


exports.module = {
    checkToken:checkToken,
    isAdmin:isAdmin,
    isUser:isUser
}