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
var Job_Request = require("./model/Job_Request");

var loginstatus = false;
var currentUserIsAdmin =false;
var currentUserIsCompany =false;
var currentUserIsStudent =false;


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
function loggedIn (req, res, next) {
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


// renderizar pagina de login
app.get("/login", function (req, res) {
    res.render("login");
});
 
//renderizar página de contacto
app.get("/contact", function (req, res) {
  res.render("contact", {loginstatus:loginstatus});
});

//renderizar pagina "sobre nosotros"
app.get("/about", function (req, res) {
  res.render("about", {loginstatus:loginstatus});
});

//renderizar pagina "sobre nosotros"
app.get("/profile", loggedIn, function (req, res) {
  res.render("profile", {loginstatus:loginstatus, user:currentUser});
});



//renderizar pagina para aplicar a trabajo
app.post("/apply-job/:_id", isStudent, async (req, res) =>{
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
    job:currentJob.title,
    jobId:id,
    requestAccepted:"Pending"
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

//renderizar pagina de error
app.get("/404", function (req, res) {
  res.render("404");
})
////////// RUTAS END ///////////

////////// REGISTRO/LOGIN/LOGOUT ///////////

// registrar usuario y agregar a la bd
app.post("/registro", async (req, res) => {
  const { username, password, email, name, qualifications, role } = req.body;
  //encriptar contraseña y luego crear usuario
  bcrypt.hash(password, 10).then(async (hash) => {
    await User.create({
      username,
      password: hash,
      email,
      name,
      qualifications,
      role
    })
    });
  res.redirect("/login")  
});


// autenticar login
app.post("/login", async function(req, res){
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
          if(user.role=="admin"){
            currentUserIsAdmin = true;
          }
          else if(user.role=="company"){
            currentUserIsCompany = true;
          }
          else if(user.role=="student"){
            currentUserIsStudent = true;
          }
          res.redirect("/");
          console.log(currentUserIsAdmin)
          console.log(currentUserIsCompany)
          console.log(currentUserIsStudent)

        } 
        else
          res.status(400).json({ message: "Sesión no iniciada" })
      })
    }
  
    
  }
);
   
// cerrar sesion
app.get("/logout", function (req, res) {
  loginstatus = false;
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
});
  



////////// REGISTRO/LOGIN/LOGOUT END ///////////

////////// ACTIVIDADES DE ESTUDIANTES  ///////////
//confirmar si el usuario es estudiante
function isStudent (req,res,next){
  if(currentUser.role == "student"||currentUser.role == "admin"){
    currentUserIsStudent = true;
    next();
  }
  else{
    res.redirect('/no-permission');
  }
}

// renderizar pagina de aplicar para un trabajo en especifico
app.get("/apply-job/:_id", isStudent, async function (req, res) {
    //el id es el del trabajo al que el usuario hizo click en job-list
    var id = req.params._id;
    //buscar trabajo por el id 
    currentJob = await Job.findById({_id:id}).exec();
  
  res.render("apply-job", {
    loginstatus:loginstatus,
    job1:currentJob,
    name:currentUser.name,
    email:currentUser.email,
    qualifications:currentUser.qualifications
  });
});


////////// ACTIVIDADES DE EMPRESAS  ///////////


function isCompany (req,res,next){
  if(currentUser.role == "company"||currentUserIsAdmin){
    currentUserIsCompany = true;
    next();
  }
  else{
    res.redirect('/no-permission');
  }
}

//renderizar pagina de publicar trabajo
app.get("/publishjob", isCompany, (req, res) =>{
  res.render("publishjob", {loginstatus:loginstatus});
}); 
//mandar datos de trabajo a la bd
app.post("/publishjob", isCompany,async (req, res) => {
  const job = await Job.create({
    title: req.body.title,
    description: req.body.description,
    requirements: req.body.requirements,
    location: req.body.location,
    salary: req.body.salary,
    company: req.body.company,
    company_logo: req.body.company_logo,
    publish_date: req.body.publish_date,
    dead_line: req.body.dead_line,
    published_by: currentUser._id
  });

  res.redirect("/job-list");
}); 


app.get('/job-list', async (req, res) => {
  //funcion que busca todos los trabajos y los guarda en modelinstances
  const modelInstances = await Job.find().exec();
    res.render('job-list',{
      //mandar valor de modelinstances al front end = todos los trabajos
      jobsList:modelInstances,
      loginstatus:loginstatus,
      user:currentUser,
      isCompany:currentUserIsCompany,
      isStudent:currentUserIsStudent,
      isAdmin:currentUserIsAdmin
      })
});

app.post('/update-job/:_id',isCompany,async(req,res)=>{
  const id = req.params._id
  var updatingJob = await Job.findById(id).exec();

  const{title,description,requirements,location,salary,company_logo,publish_date,dead_line} = req.body;
  await Job.findOneAndUpdate({_id:id},
    {$set:{title:title,
      description:description,
      requirements:requirements,
      location:location,
      salary:salary,
      company_logo:company_logo,
      publish_date:publish_date,
      dead_line:dead_line }}
    )
    updatingJob = await Job.findById(id).exec();
    res.render('update-job',{
      loginstatus:loginstatus,
      currentUserIsAdmin:currentUserIsAdmin,
      currentUserIsCompany:currentUserIsCompany,
      currentUserIsStudent:currentUserIsStudent,
      job:updatingJob
    })
  
}); 

app.get('/update-job/:_id',isCompany,async(req,res)=>{
  const id = req.params._id
  const updatingJob = await Job.findById(id).exec();

  res.render('update-job',{loginstatus:loginstatus,
    currentUserIsAdmin:currentUserIsAdmin,
    currentUserIsCompany:currentUserIsCompany,
    currentUserIsStudent:currentUserIsStudent,
    job:updatingJob  
  })
});

app.get("/update-job", isAdmin,function (req, res,next) {
  
  res.render("update-job", {isAdmin:currentUserIsAdmin,loginstatus:loginstatus});
});


  // ver trabajos publicados por la empresa actual 
app.get('/job-list/:_id', isCompany, async (req, res) => {
  //funcion que busca todos los trabajos del usuario actual y los guarda en modelinstances
  const id = req.params._id
  const postedjobs = await Job.find({published_by:id}).exec();
  console.log(currentUserIsAdmin)
  console.log(currentUserIsCompany)
  console.log(currentUserIsStudent)

    res.render('job-list',{
      //mandar valor de modelinstances al front end = todos los trabajos
      jobsList:postedjobs,
      loginstatus:loginstatus,
      user:currentUser,
      isCompany:currentUserIsCompany,
      isStudent:currentUserIsStudent,
      isAdmin:currentUserIsAdmin
      })
});

//renderizar pagina para ver todas las solicitudes que ha publicado un usuario

app.get('/allrequests/:_id', isCompany,async (req, res) => {
  //funcion que busca todos los trabajos del usuario actual y los guarda en modelinstances
  const id = req.params._id
  const allRequests = await Job_Request.find({published_by:id}).exec();
  const postedjobs = await Job.find({published_by:id}).exec();
  const jobId = postedjobs._id

    res.render('requests',{
      //mandar valor de modelinstances al front end = todos los trabajos
      requestList:allRequests,
      loginstatus:loginstatus,
      job:postedjobs
      })
});

//renderizar pagina para ver solicitudes de un trabajo

app.get("/requests/:_id", isCompany, async (req, res) =>{
  id = req.params._id;
  currentJob = await Job.findOne({_id:id}).exec();
  var requests = await Job_Request.find({jobId:id}).exec();
  if(currentJob.published_by == currentUser._id){
    res.render("requests",
    {
      requestList:requests,
      loginstatus:loginstatus,
      job:currentJob
    })
  }
  else{
    res.redirect('/no-permission')
  }

})



////////// ACTIVIDADES DE ADMINISTRADOR /////////

//verificar si usuario es admin
function isAdmin (req,res,next){
  if(currentUser.role == "admin"){
    currentUserIsAdmin = true;
    next();
  }
  else{
    res.redirect('/no-permission')
  }
}

app.get("/no-permission", function (req, res) {
  res.render("no-permission", {loginstatus:loginstatus});
});


//ver lista de usuarios
app.get('/users', isAdmin,async (req, res) => {
  const userList = await User.find().exec();
    res.render('users',{
    //mandar valores al front end 
    loginstatus:loginstatus,
    userList:userList,
    currentUserIsAdmin:currentUserIsAdmin
    })
});

// borrar usuario
app.get('/delete-user/:_id', isAdmin, async (req, res) => {

    const id = req.body.params
    const deletingUser = await User.findOneAndRemove(id)
  
    res.render('delete-user',{
      //mandar valores al front end 
      isAdmin:currentUserIsAdmin,
      loginstatus:loginstatus,
      deletingUser:deletingUser
      })
});

app.get("/delete-user", isAdmin,function (req, res) {
  res.render("delete-user", {loginstatus:loginstatus});
});

app.post("/update-user/:_id",isAdmin, async(req,res)=>{
  const id = req.params._id
  var updatingUser = await User.findById(id).exec();

  const { username, password, name, role } = req.body;
  bcrypt.hash(password, 10).then(async (hash) => {
    await User.findOneAndUpdate({_id:id},
      {$set:{username:username,
      password: hash,
      name:name,
      role:role}}
    )
  })

  updatingUser = await User.findById(id).exec();
  

  res.render('update-user',{
    isAdmin:currentUserIsAdmin,
    loginstatus:loginstatus,
    user:updatingUser
  })
});

app.get('/update-user/:_id',isAdmin, async(req,res)=>{
  const id = req.params._id
  const updatingUser = await User.findById(id).exec();

  res.render('update-user',{
    isAdmin:currentUserIsAdmin,
    loginstatus:loginstatus,
    user:updatingUser
  })
});

app.get("/update-user", isAdmin,function (req, res,next) {
  
  res.render("update-user", {isAdmin:currentUserIsAdmin,loginstatus:loginstatus});
});

//inicializar servidor
var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log("Servidor encendido!");
});
