const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', function (req, res) {
 return res.send('Hello world');
});


app.post('/', function (req, res) {
    return res.send(req.body);
});

app.listen(process.env.PORT || 8080);