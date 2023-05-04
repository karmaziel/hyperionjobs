//declarar variables para dependencias
var express = require("express"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose")
    const path = require('path');
    var crypto = require('crypto');

const User = require("./model/User");
var Job = require("./model/Job");
const { render } = require("ejs");
var app = express();
const { update } = require("./js/auth");
const router = express.Router()
const bcrypt = require("bcryptjs")

var loginstatus = false;

//conectar a base de datos
mongoose.connect("mongodb+srv://karmashiota:gayouma420@cluster0.dsxcl.mongodb.net/?retryWrites=true&w=majority");
  
//motor de vistas
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
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
    res.render("index", {loginstatus:loginstatus});
});
  
// renderizar pagina de registro
app.get("/registro", function (req, res) {
    res.render("registro", {loginstatus:loginstatus});
});
  

// renderizar pagina de login
app.get("/login", function (req, res) {
    res.render("login");
});
 
//renderizar página de contacto
app.get("/contact", function (req, res) {
  res.render("contact", {loginstatus:loginstatus});
});

//renderizar lista de trabajos
/* app.get("/job-list", function (req, res) {
  res.render("job-list");
});
 */
//renderizar pagina categorias
app.get("/category", function (req, res) {
  res.render("category", {loginstatus:loginstatus});
});

//renderizar pagina "sobre nosotros"
app.get("/about", function (req, res) {
  res.render("about", {loginstatus:loginstatus});
});

//renderizar pagina de detalles de trabajo
app.get("/job-detail", function (req, res) {
res.render("job-detail", {loginstatus:loginstatus});
});

function loggedIn(req, res, next) {
  if (loginstatus == true) {
    next();
  } 
  
  else {
    res.redirect('/login');
  }
}

//renderizar pagina de publicar trabajo
app.get("/publishjob", loggedIn, (req, res) =>{
  res.render("publishjob");
}); 

//renderizar pagina de error
app.get("/404", function (req, res) {
  res.render("404");
});


////////// RUTAS END ///////////

////////// REGISTRO/LOGIN/LOGOUT ///////////

// registrar usuario y agregar a la bd
app.post("/registro", async (req, res) => {
  const { username, password, email, name } = req.body;
  bcrypt.hash(password, 10).then(async (hash) => {
    await User.create({
      username,
      password: hash,
      email,
      name
    })
      .then((user) =>
        res.status(200).json({
          message: "Usuario creado",
           user
        })
      )
      .catch((error) =>
        res.status(400).json({
          message: "Error: Usuario no creado",
          error: error.message
        })
      );
    });
  res.redirect("/login")  
});




// autenticar login
app.post("/login", async function(req, res){
  try {
  const { username, password } = req.body
  // Check if username and password is provided
  if (!username || !password) {
    return res.status(400).json({
      message: "Username or Password not present",
    })
  }

    const user = await User.findOne({ username })
    if (!user) {
      res.status(400).json({
        message: "Login not successful",
        error: "User not found",
      })
    } else {
      // comparing given password with hashed password
      bcrypt.compare(password, user.password).then(function (result) {
        if(result==true)
        {
          loginstatus = true;
          res.redirect("/");
        } 
        else
          res.status(400).json({ message: "Login not succesful" })
      })
    }
  } catch (error) {
    res.status(400).json({
      message: "An error occurred",
      error: error.message,
    })
  }
});
   
// cerrar sesion
app.get("/logout", function (req, res) {
  loginstatus = false;
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
});
  
  


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


app.get('/job-list', async (req, res) => {
  const modelInstances = await Job.find().exec();
  console.log(modelInstances)
/*   await Job.find({}).toArray(function(err,jobs){ 
  */
    res.render('job-list',{
      jobsList:modelInstances,
      loginstatus:loginstatus
      })
/*     });  */
});

////////// PUBLICAR TRABAJOS ///////////

//inicializar servidor
var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log("Servidor encendido!");
});
