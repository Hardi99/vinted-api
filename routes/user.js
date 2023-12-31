const express = require("express");
const router = express.Router();

const uid2 = require("uid2");
const sha256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

const User = require("../models/User");

router.post("/user/signup", async (req, res) => {
  try {
    const { username, email, newsletter, password } = req.body;
    const user = await User.findOne({ email: email }); // récupère un evenement, ou null !

    if (!username || !email || !password) {
        res.status(500).json({ message: "Missing parameters" });
    }

    else if (user) {
        res.status(409).json({ message: "Cet email est déjà pris" })
    } else {
            const salt = uid2(16);
            const token = uid2(16);
            // On récupère le password pour lui ajouter (en concaténant), le salt :
            const saltedPassword = password + salt;
            const hash = sha256(saltedPassword).toString(encBase64);

            const newUser = new User({
            email: email,
            account: {
              username: username
            },
            newsletter: newsletter,
            token: token,
            hash: hash,
            salt: salt
            });
            
            await newUser.save();
            const responseObject = {
              _id: newUser._id,
              token: newUser.token,
              account: {
                username: newUser.account.username,
              }
            };
            return res.status(201).json(responseObject);
        }

  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const foundUser = await User.findOne({ email: req.body.email }); // récupère un evenement, ou null !
    if (foundUser) {
      // vérifier le password
      const newHash = sha256(req.body.password + foundUser.salt).toString(encBase64);
      if (newHash === foundUser.hash) {
        const responseObject = {
          _id: foundUser._id,
          token: foundUser.token,
          account: {
            username: foundUser.account.username,
          },
        };
        return res.status(200).json(responseObject);
      } else {
        return res.status(400).json({ message: "password or email incorrect" });
      }
    } else {
      return res.status(400).json({ message: "email or password incorrect" });
    }
  } catch (error){
    return res.status(400).json({ message: error.message });
  }
})
// Fin du code

module.exports = router;