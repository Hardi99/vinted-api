// import du model User (si le middleware l'utilise)

// Les middlewares prennent 3 paramètres : req, res, next
const isAuthenticated = (req, res, next) => {
    // console.log(req.headers.authorization);
    // const receivedToken = req.headers.authorization.replace("Bearer ", "");
    // console.log(receivedToken);
  
    // User.findOne({token: receivedToken})
    console.log("On est dans le middleware ! 😳");
    next();
  };
  
  module.exports = isAuthenticated;
  