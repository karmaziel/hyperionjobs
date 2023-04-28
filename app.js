//declarar variables para dependencias
var express = require("express"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose")
    const path = require('path');
const User = require("./model/User");
var Job = require("./model/Job");
const { render } = require("ejs");
var app = express();

//conectar a base de datos
mongoose.connect("mongodb+srv://karmashiota:gayouma420@cluster0.dsxcl.mongodb.net/?retryWrites=true&w=majority");
  
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb+srv://karmashiota:gayouma420@cluster0.dsxcl.mongodb.net/?retryWrites=true&w=majority';
/* const client = new MongoClient(url);
 *//* client.connect(function(err) {
  console.log("Connected successfully to server");
  const db = client.db("test");  
  const collection = db.collection('jobs');
collection.find({}).toArray(function(err, jobs) {
  console.log(jobs);
});
}); */

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("test");
  dbo.collection("jobs").find({}).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    db.close();
  });
});

//motor de vistas
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', "./views");

app.use('/css',express.static(__dirname +'/css'));
app.use('/img',express.static(__dirname +'/img'));
app.use('/lib',express.static(__dirname +'/lib'));
app.use('/scss',express.static(__dirname +'/scss'));
app.use('/js',express.static(__dirname +'/js'));

app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(bodyParser.json());

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
  
////////// RUTAS ///////////

// renderizar pagina de inicio
app.get("/", function (req, res) {
    res.render("index");
});
  
// renderizar pagina de registro
app.get("/registro", function (req, res) {
    res.render("registro");
});
  

// renderizar pagina de login
app.get("/login", function (req, res) {
    res.render("login");
});
 
//renderizar página de contacto
app.get("/contact", function (req, res) {
  res.render("contact");
});

//renderizar lista de trabajos
app.get("/job-list", function (req, res) {
  res.render("job-list");
});

//renderizar pagina categorias
app.get("/category", function (req, res) {
  res.render("category");
});

//renderizar pagina "sobre nosotros"
app.get("/about", function (req, res) {
  res.render("about");
});

//renderizar pagina de detalles de trabajo
app.get("/job-detail", function (req, res) {
res.render("job-detail");
});

//renderizar pagina de publicar trabajo
app.get("/publishjob", function (req, res) {
res.render("publishjob");
});
////////// RUTAS END ///////////

////////// REGISTRO/LOGIN/LOGOUT ///////////

// registrar usuario y agregar a la bd
app.post("/registro", async (req, res) => {
  const user = await User.create({
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
    name: req.body.name
  });
  res.render("login")
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
            res.render("index");
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


////////// REGISTRO/LOGIN/LOGOUT END ///////////


////////// PUBLICAR TRABAJOS  ///////////

app.post("/publishjob", async (req, res) => {
  const job = await Job.create({
    title: req.body.title,
    description: req.body.description,
    requirements: req.body.requirements,
    location: req.body.location,
    salary: req.body.salary,
    company: req.body.company,
    company_logo: req.body.company_logo,
    publish_date: req.body.publish_date,
    dead_line: req.body.dead_line
  });

  res.redirect("/job-list");
}); 


app.get('/job-list', (req, res) => {
  Job.find({},function(err,jobs){
    res.render('job-list',{
      jobsList:jobs
    })
  })
})

////////// PUBLICAR TRABAJOS ///////////

//inicializar servidor
var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log("Servidor encendido!");
});
