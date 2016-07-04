const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

var server = http.createServer(function(req, res){
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
});
server.listen(port, hostname, function(){
  //console.log(`http://${hostname}:${port}/`);
  console.log(`Server running at http://${hostname}:${port}/`);
});

//var server = http.createServer();