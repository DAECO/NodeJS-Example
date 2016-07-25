module.exports = function(){
  var express = require('express');
  var session = require('express-session');
  var MySQLStore = require('express-mysql-session')(session);
  var bodyParser = require('body-parser');

  var options = {
  	host: 'localhost',
  	port: 3306,
  	user: 'root',
  	password: '000005',
  	database: 'o2'
  };

  var app = express();

  app.locals.pretty = true;
  app.set('views', './views/mysql');
  app.set('view engine', 'jade');
  
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(session({
    secret: 'sfer23400adlsdf@#$!ssdf209887',
    resave: false,  // 사용할 때마다 새로 발급 할 것인지
    saveUninitialized: true,  // session id를 실제 사용 전까지 발급하지 말아라
    store: new MySQLStore(options)
  }));
  return app;
};
