//declarar variables para dependencias
var express = require("express"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    LocalStrategy = require("passport-local")
    currentUser = require("./model/User")
    app = express();

var User = require("./model/User");
var Job = require("./model/Job");
var currentJob = require("./model/Job") 
const bcrypt = require("bcryptjs")
var Job_Request = require("./model/Job_Request")

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


//funcion para verificar que el usuario este loggeado
function loggedIn(req, res, next) {
  if (loginstatus == true) {
    next();
  } 
  
  else {
    res.redirect('/login');
  }
}

///////// RUTAS ///////////

// renderizar pagina de inicio
app.get("/", function (req, res) {
    res.render("index", {loginstatus:loginstatus});
});
  
// renderizar pagina de registro
app.get("/registro", function (req, res) {
    res.render("registro", {loginstatus:loginstatus});
});
  
// renderizar pagina de registro
app.get("/apply-job/:_id", loggedIn, async function (req, res) {
    //el id es el del trabajo al que el usuario hizo click en job-list
    var id = req.params._id;
    //buscar trabajo por el id 
    currentJob = await Job.findOne({_id:id}).exec();
  
  res.render("apply-job", {
    loginstatus:loginstatus,
    job1:currentJob,
    name:currentUser.name,
    email:currentUser.email,
    qualifications:currentUser.qualifications
  });
});

 //////
// renderizar pagina de login
app.get("/login", function (req, res) {
    res.render("login");
});
 
//renderizar página de contacto
app.get("/contact", function (req, res) {
  res.render("contact", {loginstatus:loginstatus});
});

//renderizar pagina categorias
app.get("/category", function (req, res) {
  res.render("category", {loginstatus:loginstatus});
});

//renderizar pagina "sobre nosotros"
app.get("/about", function (req, res) {
  res.render("about", {loginstatus:loginstatus});
});

//renderizar pagina "sobre nosotros"
app.get("/profile", loggedIn, function (req, res) {
  res.render("profile", {loginstatus:loginstatus, user:currentUser});
});

//renderizar pagina de detalles de trabajo
app.get("/job-detail", function (req, res) {
res.render("job-detail", {loginstatus:loginstatus});
});


//renderizar pagina de publicar trabajo
app.get("/publishjob", loggedIn, (req, res) =>{
  res.render("publishjob", {loginstatus:loginstatus});
}); 

//renderizar pagina para aplicar a trabajo
app.post("/apply-job/:_id", loggedIn, async (req, res) =>{
  //el id es el del trabajo al que el usuario hizo click en job-list
  var id = req.params._id;
  //buscar trabajo por el id 
  currentJob = await Job.findOne({_id:id}).exec();


  //crear solicitud de trabajo
  var { description, portfolio } = req.body;
  const request = await Job_Request.create({
    name:currentUser.name,
    email:currentUser.email,
    qualifications:currentUser.qualifications,
    portfolio,
    description,
    job:currentJob,
    jobId:id
  })


  res.render("apply-job", 
  {loginstatus:loginstatus, 
    //mandar valores del trabajo seleccionado al front end
    job1:currentJob,
    //datos del usuario que este loggeado
    name:currentUser.name,
    email:currentUser.email,
    qualifications: currentUser.qualifications,
    request:request,
    loginstatus:loginstatus
  });  
}); 

//renderizar pagina para ver solicitudes de un trabajo

app.get("/requests/:_id", loggedIn, async (req, res) =>{
  id = req.params._id;
  currentJob = await Job.findOne({_id:id}).exec();
  var requests = await Job_Request.find().exec();

  res.render("requests",
  {
    requestList:requests,
    loginstatus:loginstatus,
    job:currentJob
  })

})


//renderizar pagina de error
app.get("/404", function (req, res) {
  res.render("404");
})
////////// RUTAS END ///////////

////////// REGISTRO/LOGIN/LOGOUT ///////////

// registrar usuario y agregar a la bd
app.post("/registro", async (req, res) => {
  const { username, password, email, name } = req.body;
  //encriptar contraseña y luego crear usuario
  bcrypt.hash(password, 10).then(async (hash) => {
    await User.create({
      username,
      password: hash,
      email,
      name,
      qualifications
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
  // revisar si ambos el usuario y la contraseña fueron ingresados
  if (!username || !password) {
    return res.status(400).json({
      message: "Falta usuario o contraseña",
    })
  }

    var user = await User.findOne({ username })
    if (!user) {
      res.status(400).json({
        message: "Sesión no iniciada",
        error: "Usuario incorrecto",
      })
    } else {
      // comparar la contraseña ingresada con la contraseña encriptada en la bd
      bcrypt.compare(password, user.password).then(function (result) {
        if(result==true)
        {
          loginstatus = true;
          currentUser = user;
          res.redirect("/");
        } 
        else
          res.status(400).json({ message: "Sesión no iniciada" })
      })
    }
  } catch (error) {
    res.status(400).json({
      message: "Error",
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
  //funcion que busca todos los trabajos y los guarda en modelinstances
  const modelInstances = await Job.find().exec();
  
    res.render('job-list',{
      //mandar valor de modelinstances al front end = todos los trabajos
      jobsList:modelInstances,
      loginstatus:loginstatus
      })
});

////////// PUBLICAR TRABAJOS ///////////

//inicializar servidor
var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log("Servidor encendido!");
});
