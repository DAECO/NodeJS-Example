module.exports = function(){
  var conn = require('../../config/mysql/db')();
  var route = require('express').Router();
  route.get('/add', function(req,res){
    var sql = 'SELECT id,title FROM topic';
    conn.query(sql, function(err,topics,fields){
      if(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
      }
      res.render('topic/add', {topics:topics, user:req.user});
    });
  });

  route.post('/add', function(req,res){
    var title = req.body.title;
    var description = req.body.description;
    var author = req.body.author;
    var sql = 'INSERT INTO topic (title, description, author) VALUES(?,?,?)';
    conn.query(sql, [title, description, author], function(err,result,fields){
      if(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
      } else {
          res.redirect('/topic/'+result.insertId);
      }
    });
  });

  route.get(['/:id/edit'], function(req,res){
    var sql = 'SELECT id,title FROM topic';
    conn.query(sql, function(err,topics,fields){
      var id = req.params.id;
      if(id){
          var sql = 'SELECT * FROM topic WHERE id=?';
          conn.query(sql, [id], function(err, topic, fields){
            if(err){
              console.lof(err);
              res.status(500).send('Internal Server Error');
            } else {
                res.render('topic/edit', {topics:topics, topic:topic[0], user:req.user});
            }
          });
      } else {
        console.lof('There is no id.');
        res.status(500).send('Internal Server Error');
      }
    });
  });

  route.post(['/:id/edit'], function(req,res){
    var title = req.body.title;
    var description = req.body.description;
    var author = req.body.author;
    var id = req.params.id;
    var sql = 'UPDATE topic SET title=?, description=?, author=? WHERE id=?'
    conn.query(sql, [title, description, author, id], function(err,result,fields){
      if(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
      } else {
          res.redirect('/topic/'+id);
      }
    });
  });

  route.get('/:id/delete', function(req,res){
    var sql = 'SELECT id,title FROM topic';
    conn.query(sql, function(err,topics,fields){
      var sql = 'SELECT * FROM topic WHERE id=?'
      var id = req.params.id;
      conn.query(sql, [id], function(err, topic, fields){
        if(err){
          console.log(err);
          res.status(500).send('Internal Server Error');
        } else {
            if(topic.length == 0){
              console.log('There is no record.');
            } else {
              res.render('topic/delete', {topics:topics, topic:topic[0], user:req.user});
            }
        }
      });
    });
  });

  route.post('/:id/delete', function(req,res){
    var id = req.params.id;
    var sql = 'DELETE FROM topic WHERE id=?'
    conn.query(sql, [id], function(err, result){
      //res.send(result);
      res.redirect('/topic/');
    });
  });

  route.get(['/', '/:id'], function(req,res){
    var sql = 'SELECT id,title FROM topic';
    conn.query(sql, function(err,topics,fields){
      var id = req.params.id;
      if(id){
          var sql = 'SELECT * FROM topic WHERE id=?';
          conn.query(sql, [id], function(err, topic, fields){
            if(err){
              console.log(err);
              res.status(500).send('Internal Server Error');
            } else {
                res.render('topic/view', {topics:topics, topic:topic[0], user:req.user});
            }
          });
      } else {
          res.render('topic/view', {topics:topics, user:req.user});
      }
    });
  });

  route.post('/', function(req,res){
    var title = req.body.title;
    var description = req.body.description;
    fs.writeFile('data/'+title, description, function(err){
      if(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
      }
      res.redirect('/topic/'+title);
    });
  });
  return route;
}
