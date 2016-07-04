var express = require('express');
var app = express();

app.use(express.static('public'));

app.get('/',function(req,res){
    res.send('Hello Home Page~');
});

app.get('/login',function(req,res){
    res.send('<h1>login please</h1>');
});

app.get('/route',function(req,res){
    res.send('Hello Router, <image src="/client.png"/>');
});

app.listen(3000,function(){
    console.log('Connected 3000 port!')
});