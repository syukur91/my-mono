const express = require('express');
const app = express();
const bodyParser = require('body-parser');
var env = require('node-env-file');
env('.env');

var obj = {someAttribute: true};



var firebase = require('firebase');
const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain:  process.env.AUTH_DOMAIN,
    databaseURL: process.env.DB_URL,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID
};

firebase.initializeApp(firebaseConfig);

var location = firebase.database().ref('/location');
var order = firebase.database().ref('/order');

var locationData = {
    orderID     : "12313ADASD",
    latitude    : "913123",
    longitude   : "54521",
};


var orderData = {
    orderID     : "12313ADASD",
    orderName   : "test",
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', function (req, res) {
 return res.send('Hello world');
});

app.post('/location', function (req, res) {
    location.push(locationData);
    return res.send(locationData);
});

app.post('/order', function (req, res) {
    order.push(orderData);
    return res.send(orderData);
});

app.listen(process.env.PORT || 8080);
console.log('Loocads API run on port ' + process.env.PORT);