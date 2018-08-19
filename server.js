let express = require('express');
let app = express();

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules'));

console.log("server running...");
app.listen(8000);