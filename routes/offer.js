const express = require("express");
const router = express.Router();

const isAuthenticated = require("../middleware/isAuthenticated"); // import du middleware isAuthenticated

const fileUpload = require("express-fileupload"); // express-fileupload est NECESSAIRE pour récupérer des form-data

const Offer = require("../models/Offer"); // On télécharge le modèle Offer qui sert à

const cloudinary = require("cloudinary").v2; // import de cloudinary
          
cloudinary.config({ 
  cloud_name: 'drih99gy7', 
  api_key: '692482426976516', 
  api_secret: 'wbHEZGLNXao1KC1hYDe2K6bQc_w' 
});

const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

router.post("/offers", isAuthenticated, fileUpload(), async (req, res) => { // Les middleware perso ne s'appelle pas directement (pas de parenthèses après leur nom)
  try {
    const { title, description, price, condition, size, color, city, brand } = req.body;
    const newOffer = new Offer({
      product_name: title,
      product_description: description,
      product_price: price,
      product_details: [
        {
          MARQUE: brand,
        },
        {
          TAILLE: size,
        },
        {
          ETAT: condition,
        },
        {
          COULEUR: color,
        },
        {
          EMPLACEMENT: city,
        },
      ]
    })
    newOffer.owner = req.user // On crée la clé owner à notre newOffer

    const convertedFile = convertToBase64(req.files.picture);

    const uploadResponse = await cloudinary.uploader.upload(convertedFile);
    newOffer.product_image = uploadResponse // A présent on crée la clé product_image à notre newArray

    // console.log(cloudinaryResponse.secure_url);
    await newOffer.save(); // sauvegarde l'offre dans la collection
    return res.status(201).json(newOffer);

  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.get("/offers", isAuthenticated, async (req,res) => {
  try {
    // On définit une limite de 5 pages :
    const limit = 5;
    // par défaut on renvoie la première page
    let page = 1;

    if (req.query.page) {
      page = req.query.page
    }
    // indice :

    const filters = {};
    if (req.query.title) {
      filters.product_name = new RegExp(req.query.title, "i");
    }

    if (req.query.priceMin) {
      filters.product_price = {$gte : req.query.priceMin};
    }

    if (req.query.priceMax) {
      // si la clé product_price a été crée, il faut éviter de ré-assigner une valeur à celle-ci car cela effacera l'ancienne valeur
      if (filters.product_price) {
        // si la clé prodict_price existe, on luis assigne une clé $lte égale au req.query.priceMax
        filters.product_price.$lte = req.query.priceMax
      } else {
        // sinon, il faut la créeret lui assigne un objet
        filters.product_price = { $lte: req.query.priceMax }
      }
    }

    const sortObject = {};

    if (req.query.sort === "price-asc") {
      sortObject.product_pricce = asc;
    } else if (req.query.sort ===  "price-desc") {
      sortObject.product_price = "desc";
    }

/*     { product_name: new RegExp(req.query.title, "i") }
    
    { product_price: {$gte : req.query.priceMin} }
    
    { product_price: {$lte : req.query.priceMax} } */
    
    const offers = await Offer.find(filters)
      .sort(sortObject)
      .limit(limit)
      .skip((page - 1) * limit)
      .select("product_name product_price -_id");

    // chercher par nom
/*     const offers = await Offer.find({
      product_name: new RegExp("Jean", "i"),
    }).select("product_name product_price -_id"); */

    // chercher avec une fourchette de prix
/*     const offers = await Offer.find({
      product_price: { $gte: 40 },
    }).select("product_name product_price -_id"); */
    return res.status(200).json(offers);

  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.get("/offers/:_id", isAuthenticated, async (req,res) => {
  try {
    const offers = await Offer.findById(req.params._id).select("product_name product_price -_id");

      console.log(offers);
      return res.status(200).json(offers);

  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;