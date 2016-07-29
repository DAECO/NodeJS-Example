var app = require('./config/mysql/express')();
var passport = require('./config/mysql/passport')(app);
var auth = require('./routes/mysql/auth')(passport);
app.use(['/auth','/'], auth);

var topic = require('./routes/mysql/topic')();
app.use('/topic', topic);

app.listen(3003, function(){
  console.log('Connected, 3003 port!');
});
