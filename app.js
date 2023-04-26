//declarar variables para dependencias
var express = require("express"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = 
        require("passport-local-mongoose")
const User = require("./model/User");
var app = express();

//conectar a base de datos
mongoose.connect("mongodb+srv://karmashiota:gayouma420@cluster0.dsxcl.mongodb.net/?retryWrites=true&w=majority");
  
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require("express-session")({
    secret: "Rusty is a dog",
    resave: false,
    saveUninitialized: false
}));
  
//inicializar passport para autenticar usuarios y contras
app.use(passport.initialize());
app.use(passport.session());
  
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
  
//=====================
// RUTAS
//=====================
  
// renderizar pagina de inicio
app.get("/", function (req, res) {
    res.render("home");
});
  
// renderizar pagina de registro
app.get("/registro", function (req, res) {
    res.render("registro");
});
  
// registrar usuario y agregar a la bd
app.post("/register", async (req, res) => {
    const user = await User.create({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      name: req.body.name
    });
    res.render("login")
  });
  
// renderizar pagina de login
app.get("/login", function (req, res) {
    res.render("login");
});
  
// autenticar login
app.post("/login", async function(req, res){
    try {
        // validar si el usuario existe
        const user = await User.findOne({ username: req.body.username });
        if (user) {
          // validar si la contra hace match
          const result = req.body.password === user.password;
          // si es correcta regresar a home
          if (result) {
            res.render("home");
          } else {
            res.status(400).json({ error: "Contraseña incorrecta" });
          }
        } else {
          res.status(400).json({ error: "Usuario no existe" });
        }
      } catch (error) {
        res.status(400).json({ error });
      }
});
  
// cerrar sesion
app.get("/logout", function (req, res) {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
});
  
  
// marcar usuario con sesion iniciada
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
}

//inicializar servidor
var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log("Servidor encendido!");
});