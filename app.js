const express = require('express');
const app = express();
const bodyParser = require('body-parser');

var obj = {someAttribute: true};

var firebase = require('firebase');
const firebaseConfig = {
    apiKey: "AIzaSyBpwOpo1mJKRvLurGlwxK4nQd4rrj2FZuc",
    authDomain: "tracking-z22.firebaseapp.com",
    databaseURL: "https://tracking-z22.firebaseio.com",
    projectId: "tracking-z22",
    storageBucket: "tracking-z22.appspot.com",
    messagingSenderId: "1048191036878",
    appId: "1:1048191036878:web:1adc85c2c17234d944cf9f"
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