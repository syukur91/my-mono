const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const env = require('node-env-file');
const compareJSON = require('JSON-structure-validator');
env('.env');

const firebase = require('firebase');
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

const tracking = firebase.database().ref('/tracking');
const order = firebase.database().ref('/order');

var orderSchema = {
    "orderID"   : "",
    "orderName" : ""
};

var trackingSchema = {
    "orderID"   : "",
    "latitude"  : "",
    "longitude" : ""
};

var vehicleSchema = {
    "vehicleID"      : "",
    "vehicleNumber"  : ""
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', function (req, res) {
 return res.send('Hello world');
});


// Add tracking data
app.post('/tracking', function (req, res) {
    try {
        JSON.parse(req.body);
        if(compareJSON(trackingSchema, req.body)) {
            // tracking.push(locationData);
            return res.send(req.body);
        } else {
            throw new Error("Format data is wrong");
        } 
    } catch (e) {
        return res.send(e);
    }
});

// Add order data
app.post('/order', function (req, res) {
    try {
        JSON.parse(req.body);
        order.push(locationData);
        return res.send(req.body);
    } catch (e) {
        return res.send("not a JSON");
    }
});


// Add fleet data
app.post('/fleet', function (req, res) {
    try {
        JSON.parse(req.body);
        return res.send(req.body);
    } catch (e) {
        return res.send("not a JSON");
    }
});

app.listen(process.env.PORT || 8080);
console.log('Tracking API run on port ' + process.env.PORT);