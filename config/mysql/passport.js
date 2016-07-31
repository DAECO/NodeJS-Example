module.exports = function(app){
  var conn = require('./db')();
  var bkfd2Password = require("pbkdf2-password");
  var passport = require('passport')
  var LocalStrategy = require('passport-local').Strategy;
  var FacebookStrategy = require('passport-facebook').Strategy;
  var KakaoStrategy = require('passport-kakao').Strategy;
  var hasher = bkfd2Password();

  app.use(passport.initialize());
  app.use(passport.session());  // app.use(session(){}) 뒤에 선언해야함.

  passport.serializeUser(function(user, done) {
    console.log('serializeUser : ', user);
    done(null, user.authId);
  });

  passport.deserializeUser(function(id, done) {
    console.log('deserializeUser : ', id);
    var sql = 'SELECT * FROM users WHERE authId=?';
    conn.query(sql, [id], function(err, results){
      if(err){
        done('There is no user.');
      } else {
        done(null, results[0]);
      }
    });
  });

  passport.use(new LocalStrategy(
    function(username, password, done){
      var uname = username;
      var pwd = password;
      var sql = 'SELECT * FROM users WHERE authId=?';
      conn.query(sql, ['local:'+uname], function(err, results){
        if(err){
          console.log(err);
          return done('There is no user.');
        }
        var user = results[0];
        return hasher({password:pwd, salt:user.salt}, function(err,pass,salt,hash){
          if(hash == user.password){
            console.log('LocalStrategy : ', user);
            done(null, user);
          } else {
            done(null, false);
          }
        });
      });
    }
  ));

  passport.use(new FacebookStrategy({
      clientID: '889821817791096',
      clientSecret: '73c16ef349bf659de1b6ebc4754222f8',
      callbackURL: "/auth/facebook/callback",
      profileFields:['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified', 'displayName'] // profile 정보 명시적 추가
    },
    function(accessToken, refreshToken, profile, done) {
      console.log(profile);
      var authId = 'facebook:'+profile.id;
      var sql = 'SELECT * FROM users WHERE authId=?';
      conn.query(sql, [authId], function(err, results){
        if(results.length > 0){
          done(null, results[0]);
        } else {
          var newuser = {
            'authId':authId,
            'displayName':profile.displayName,
            'email':profile.emails[0].value
          };
          var sql = 'INSERT INTO users SET ?';
          conn.query(sql, newuser, function(err, results){
            if(err){
              console.log(err);
              done('Error');
            } else {
              done(null, newuser);
            }
          });
        }
      });
    }
  ));

  passport.use(new KakaoStrategy({
      clientID : 'a5c45aec504b796b4f4363dbabc8878d',
      callbackURL : '/oauth'
    },
    function(accessToken, refreshToken, profile, done){
      console.log('kakao profile: ',profile.id);
      var authId = 'kakao:'+profile.id;
      var sql = 'SELECT * FROM users WHERE authId=?';
      conn.query(sql, [authId], function(err, results){
        if(results.length > 0){
          done(null, results[0]);
        } else {
          var newuser = {
            'authId':authId,
            'displayName':profile._json.properties.nickname,
            'email':'abc@naver.com',
          };
          var sql = 'INSERT INTO users SET ?';
          conn.query(sql, newuser, function(err, results){
            if(err){
              console.log(err);
              done('Error');
            } else {
              var img = profile._json.properties.img;
              newuser.push(img);
              done(null, newuser);
            }
          });
        }
      });
    }
  ));

  return passport;
}
