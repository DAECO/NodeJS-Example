var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var bodyParser = require('body-parser');
var bkfd2Password = require("pbkdf2-password");
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

app.get('/count', function(req,res){
  if(req.session.count){
    req.session.count++;
  } else {
    req.session.count = 1;
  }
  res.send('count : '+req.session.count);
});

app.get('/auth/logout', function(req,res){
  delete req.session.displayName;
  res.redirect('/welcome');
});

app.get('/welcome', function(req,res){
  if(req.session.displayName){
    res.send(`
      <h1>Hello, ${req.session.displayName}</h1>
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
    console.log(users);
    req.session.displayName = req.body.displayName;
    req.session.save(function(){
        res.redirect('/welcome');
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

app.post('/auth/login', function(req,res){
  var uname = req.body.username;
  var pwd = req.body.password;
  for(var i=0; i<users.length; i++){
    var user = users[i];
    if(uname == user.username){
      return hasher({password:pwd, salt:user.salt}, function(err,pass,salt,hash){
        if(hash == user.password){
          req.session.displayName = user.displayName;
          req.session.save(function(){
            res.redirect('/welcome');  // redirect() 만으로는 반목문이 종료되지 않음.
          });
        } else {
          res.send('Who are you? <a href="/auth/login">login</a>');
        }
      });
    }
  }
  res.send('Who are you? <a href="/auth/login">login</a>');
});
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
