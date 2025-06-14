const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();

app.use(express.static(__dirname + '/static'))

router.get('/', (req,res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.use('/', router);
app.listen(process.env.port || 3000);
console.log('Web Server is listening at port '+ (process.env.port || 3000));