if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config()
}
const express = require("express");
const mongoose = require("mongoose");
const Article = require("./models/article");
const articleRouter = require("./routes/article");
const methodOverride = require("method-override");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const app = express();
const adminuser = process.env.ADMIN
const password = process.env.PASSWORD
const URI= "mongodb+srv://blogkj:blogkj@cluster0.yu98h.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
app.use(
  session({
    //secret: process.env.SECRET,
    secret:'Heyitsme',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// mongoose.connect('mongodb://localhost/test', {
//   useUnifiedTopology: true,
//   useNewUrlParser: true,
// });


mongoose.connect(URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  
}).catch()
{
  console.log("db connected...")
};


mongoose.set("useCreateIndex", true);

app.set("view engine", "ejs");
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(express.static("public"));
app.use(methodOverride("_method"));

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(User.createStrategy());

app.get("/", async (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.post("/register", (req, res) => {
  User.register(
    { username: req.body.username },
    req.body.password,
    (err, user) => {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/");
        });
      }
    }
  );
});
app.post("/login", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, (err) => {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, () => {
        if(user.username==adminuser){
          res.redirect("/articles/admin");
        }
        else{
          res.redirect("/");
        }
      });
    }
  });
});
app.use("/articles", articleRouter);

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, () => {
  console.log("Server is Running on port 3000");
});
