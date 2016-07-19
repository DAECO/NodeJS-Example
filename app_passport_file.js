var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var bodyParser = require('body-parser');
var bkfd2Password = require("pbkdf2-password");
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;

var hasher = bkfd2Password();
var app = express();

var users = [
  {
    username:'egoing',
    password:'M9jRq5StfoKhAOnjlXfT+rqz1EhJyUSS/nzfpe4LSLLaqfSiEKNYQp/JP+vZ3BN9N9oGgRIJvjbQk0STRW3w6i+tXVmdLJdqs3abIa7TLulAFYfI97SWzwcUP1LBV1STUPq6A5eIS/XRE1Q3DQieLWt3FqXNuQe0HgXqlWTeOH4=',
    salt:'wxcOZO7ez5o2YzgHa1bojyykbigu2o30/OoXwUO82fiGwcgEeqVqTWZw+jFSbm126bZqtPjIOTArnKlV59rcVw==',
    displayName:'Egoing'
  }
];

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'sfer23400adlsdf@#$!ssdf209887',
  resave: false,  // 사용할 때마다 새로 발급 할 것인지
  saveUninitialized: true,  // session id를 실제 사용 전까지 발급하지 말아라
  //cookie: { secure: true }
  store:new FileStore()
}));
app.use(passport.initialize());
app.use(passport.session());  // app.use(session(){}) 뒤에 선언해야함.

app.get('/count', function(req,res){
  if(req.session.count){
    req.session.count++;
  } else {
    req.session.count = 1;
  }
  res.send('count : '+req.session.count);
});

app.get('/auth/logout', function(req,res){
  req.logout();
  req.session.save(function(){
    res.redirect('/welcome');
  });
});

app.get('/welcome', function(req,res){
  if(req.user && req.user.displayName){
    res.send(`
      <h1>Hello, ${req.user.displayName}</h1>
      <a href="/auth/logout">Logout</a>
    `);
  } else {
    res.send(`
      <h1>Welcome</h1>
      <ul>
        <li><a href="/auth/login">Login</a></li>
        <li><a href="/auth/register">Register</a></li>
      </ul>
    `);
  }
});

app.post('/auth/register', function(req,res){
  hasher({password:req.body.password}, function(err, pass, salt, hash){
    var user = {
      username:req.body.username,
      password:hash,
      salt:salt,
      displayName:req.body.displayName
    };
    users.push(user);
    req.login(user, function(err){
      if(err) { return next(err); }
      req.session.save(function(){
          res.redirect('/welcome');
      });
    });
  });
});

app.get('/auth/register', function(req,res){
  var output = `
  <h1>Register</h1>
  <form action="/auth/register" method="post">
    <p>
      <input type="text" name="username"
      placeholder="username">
    </p>
    <p>
      <input type="password" name="password"
      placeholder="password">
    </p>
    <p>
      <input type="text" name="displayName" placeholder="displayName">
    </p>
    <p>
      <input type="submit">
    </p>
  </form>
  `;
  res.send(output);
});

passport.serializeUser(function(user, done) {
  console.log('serializeUser : ', user);
  done(null, user.username);
});

passport.deserializeUser(function(id, done) {
  console.log('deserializeUser : ', id);
  for(var i=0; i<users.length; i++){
    var user = users[i];
    if(user.username == id){
      return done(null, user);
    }
  }
});

passport.use(new LocalStrategy(
  function(username, password, done){
    var uname = username;
    var pwd = password;
    for(var i=0; i<users.length; i++){
      var user = users[i];
      if(uname == user.username){
        return hasher({password:pwd, salt:user.salt}, function(err,pass,salt,hash){
          if(hash == user.password){
            console.log('LocalStrategy : ', user);
            done(null, user);
          } else {
            done(null, false);
          }
        });
      }
    }
    done(null, false);
  }
));

app.post(
  '/auth/login',
  passport.authenticate(
    'local',  // local 전략
    {
      successRedirect: '/welcome',
      failureRedirect: '/auth/login',
      failureFlash: false   // 사용자에게 인증에 실패 했다는 것을 메세지로 알려줌.
    }
  )
);
// app.post('/auth/login', function(req,res){
//   var uname = req.body.username;
//   var pwd = req.body.password;
//   for(var i=0; i<users.length; i++){
//     var user = users[i];
//     if(uname == user.username){
//       return hasher({password:pwd, salt:user.salt}, function(err,pass,salt,hash){
//         if(hash == user.password){
//           req.session.displayName = user.displayName;
//           req.session.save(function(){
//             res.redirect('/welcome');  // redirect() 만으로는 반목문이 종료되지 않음.
//           });
//         } else {
//           res.send('Who are you? <a href="/auth/login">login</a>');
//         }
//       });
//     }
//   }
//   res.send('Who are you? <a href="/auth/login">login</a>');
// });

app.get('/auth/login', function(req,res){
  var output = `
  <h1>Login</h1>
  <form action="/auth/login" method="post">
    <p>
      <input type="text" name="username"
      placeholder="username">
    </p>
    <p>
      <input type="password" name="password"
      placeholder="password">
    </p>
    <p>
      <input type="submit">
    </p>
  </form>
  `
  res.send(output);
});

app.listen(3003, function(){
  console.log('Connected 3003 port!')
});
