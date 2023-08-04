const express = require("express"); // import du package express
const cors = require("cors");
const mongoose = require("mongoose");

// La ligne suivante ne doit être utilisée qu'une seule fois et au tout début du projet. De préférence dans index.js
require('dotenv').config(); // Permet d'activer les variables d'environnement qui se trouvent dans le fichier `.env`

const app = express(); // création du serveur
app.use(cors());

app.use(express.json());
mongoose.connect(process.env.MONGODB_URI);

app.get("/", (req, res) => {
  // route en GET dont le chemion est /
  try {
    return res
      .status(200)
      .json({ message: "Bienvenue sur le serveur Vinted" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

const userRoutes = require("./routes/user");
const offerRoutes = require("./routes/offer")
app.use(userRoutes, offerRoutes);

app.all("*", (req, res) => {
  // Route not found
  return res.status(404).json({ message: "Cette route n'existe pas" });
});

app.listen(process.env.PORT, () => {
  // Mon serveur va écouter le port 3000
  console.log("Server has started"); // Quand je vais lancer ce serveur, la callback va être appelée
});