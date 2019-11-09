const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const env = require('node-env-file');
const compareJSON = require('json-structure-validator');
const short = require('shortid');
const _ = require('underscore')

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
const vechicle = firebase.database().ref('/vechicle');
const availabiliy = firebase.database().ref('/availabiliy');


var orderSchema = {
    "orderName" : ""
};

var trackingSchema = {
    "latitude"  : "",
    "longitude" : ""
};

var vehicleSchema = {
    "vehicleID"      : "",
    "vehicleNumber"  : ""
};

var availabilitySchema = {
    "type"          : "",
    "count"         : 0
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let status = {}

const responseCode = {}
responseCode.internalServerError = 500
responseCode.notFound = 400
responseCode.ok = 200

app.get('/healthcheck', function (req, res) {
 return res.send(200);
});



// Add or Update tracking data
app.put('/tracking/:id', function (req, res) {
    try {
        let id = req.params.id; 
        var compare = compareJSON(trackingSchema, req.body)
        if(compare == true) {

            let data = {}
            data.orderID = id 
            data.latitude = req.body.latitude 
            data.longitude = req.body.longitude
            tracking.child(id).update(data)

            status.data     = req.body
            status.status   = responseCode.ok
            return res.status(responseCode.ok).json(status);
        } else {
            throw new Error(compare);
        } 
    } catch (e) {
        status.message      = e.message
        status.status       = responseCode.internalServerError
        return res.status(responseCode.internalServerError).json(status);
    }
});

// Add order data
app.post('/order', function (req, res) {
    try {
        var compare = compareJSON(orderSchema, req.body)
        if(compare == true) {
            let id = short.generate()
            let data = {}
            data.orderID    = id
            data.orderName  = req.body.orderName
            order.child(id).set(data)

            status.data     = data
            status.status   = responseCode.ok
            return res.status(responseCode.ok).send(status);
        } else {
            throw new Error(compare);
        } 
    } catch (e) {
        status.message  = e.message
        status.status  = responseCode.internalServerError
        return res.status(responseCode.internalServerError).json(status);
    }
});


// Add vehicle data
app.post('/vehicle', function (req, res) {
    try {
        var compare = compareJSON(vehicleSchema, req.body)
        if(compare == true) {
            status.data     = req.body
            status.status   = responseCode.ok
            return res.status(responseCode.ok).send(status);
        } else {
            throw new Error(compare);
        } 
    } catch (e) {
        status.message  = e.message
        status.status  = responseCode.internalServerError
        return res.status(responseCode.internalServerError).json(status);
    }
});

// Update single vehicle availability data
app.put('/availability/:id', function (req, res) {
    try {
        let id = req.params.id; 
        var compare = compareJSON(availabilitySchema, req.body)
        if(compare == true) {
            
            let data = {}
            data.count = req.body.count
            availabiliy.child(id).update(data)


            status.data     = req.body
            status.status   = responseCode.ok
            return res.status(responseCode.ok).send(status);
        } else {
            throw new Error(compare);
        } 
    } catch (e) {
        status.message  = e.message
        status.status  = responseCode.internalServerError
        return res.status(responseCode.internalServerError).json(status);
    }
});

// Reset vehicle availability data
app.put('/availability/default/:count', function (req, res) {
    try {
        let count = req.params.count;
        availabiliy.once("value").then(snap => {
            _.each(snap.val(), function(data) {
                data.count = count
                availabiliy.child(data.ID).update(data)
            });
            status.status   = responseCode.ok
            return res.status(responseCode.ok).send(status);
        }).catch(error => {
            throw new Error(error);
        })             
    } catch (e) {
        status.message  = e.message
        status.status  = responseCode.internalServerError
        return res.status(responseCode.internalServerError).json(status);
    }
});




app.listen(process.env.PORT || 8080);
console.log('Tracking API run on port ' + process.env.PORT);