const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const env = require('node-env-file');
const compareJSON = require('json-structure-validator');
const short = require('shortid');
const _ = require('underscore')
const async = require('async');

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
const availability = firebase.database().ref('/availability');

var orderSchema = {
    "orderName"     : "",
    "availabilityID": ""
};

var trackingSchema = {
    "latitude"  : "",
    "longitude" : ""
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
responseCode.notFound = 404
responseCode.ok = 200

app.get('/healthcheck', function (req, res) {
 return res.send(200);
});

// Name: Add or Update tracking data
// Desc: Menambahkan atau mengupdate data lokasi terkini dari device yang disimpan di database 
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

// Name: Add order data
// Desc: Menambahkan data order ketika user membuat order dan mengurangi count dari availability sebanyak 1, setiap order dibuat
app.post('/order', function (req, res) {
    try {
        var compare = compareJSON(orderSchema, req.body)
        if(compare == true) {
            let id = short.generate()
            let data = {}
            let availabilityID = req.body.availabilityID

            data.orderID         = id
            data.orderName       = req.body.orderName
            data.availabilityID  = req.body.availabilityID

            async.waterfall([
                function(callback) {
                    
                    availability.child(availabilityID).once("value").then(snap => {
                        data.count = parseInt(snap.val().count)
                        callback(null,snap.val())
                    }).catch(error => {
                        callback(error,null)
                    })  
 
                },
                function(arg1, callback){
                    order.child(id).set(data).then(() => {
                        callback(null,data)
                    }).catch(error => {
                        callback(error,null) 
                    })
                },
                function (arg1,callback){ 

                    availabilityData = {}
                    availabilityData.count = (data.count-1)
                        
                    availability.child(data.availabilityID ).update(availabilityData).then(() => {
                        callback(null,data)
                    }).catch(error => {
                        callback(error,null)
                    })

                }
            ], function(err, results) {

                if (err) {
                    status.status   = responseCode.internalServerError
                    return res.status(responseCode.internalServerError).send(status);
                }

                status.data     = results
                status.status   = responseCode.ok
                return res.status(responseCode.ok).send(status);
               
            });

        } else {
            throw new Error(compare);
        } 
    } catch (e) {
        status.message  = e.message
        status.status  = responseCode.internalServerError
        return res.status(responseCode.internalServerError).json(status);
    }
});

// Name: Get order list
// Desc: Mendapatkan list data dari tabel order
app.get('/order', function (req, res) {
    try {
        order.once("value").then(snap => {   
            status.status   = responseCode.ok
            status.data     = []
            _.each(snap.val(), function(data) {
                status.data.push(data)
            });
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


// Name: Add availability data
// Desc: Menambahkan data availability, berupa tipe dan jumlah availability nya
app.post('/availability', function (req, res) {
    try {
        var compare = compareJSON(availabilitySchema, req.body)
        if(compare == true) {
            let id = short.generate()
            req.body.availabilityID = id
           
            availability.child(id).set(req.body).then(() => {
                status.data     = req.body
                status.status   = responseCode.ok
                return res.status(responseCode.ok).send(status);
            }).catch(error => {
                throw new Error(error);
            })
           
        } else {
            throw new Error(compare);
        } 
    } catch (e) {
        status.message  = e.message
        status.status  = responseCode.internalServerError
        return res.status(responseCode.internalServerError).json(status);
    }
});

// Name: Update single availability data
// Desc: Update count dari setiap tipe availability
app.put('/availability/:id', function (req, res) {
    try {
        let id = req.params.id; 
        var compare = compareJSON(availabilitySchema, req.body)
        if(compare == true) {
            let data = {}
            data.count = req.body.count
            availability.child(id).update(data)
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

// Name: Reset availability data
// Desc: Reset setiap jumlah count dari setiap tipe availability ke jumlah yang diinginkan
app.put('/availability/default/:count', function (req, res) {
    try {
        let count = req.params.count;
        availability.once("value").then(snap => {
            _.each(snap.val(), function(data) {
                data.count = count
                availability.child(data.availabilityID).update(data)
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

// Name: Get availability list
// Desc: Mendapatkan list data dari tabel availability
app.get('/availability', function (req, res) {
    try {
        availability.once("value").then(snap => {   
            status.status   = responseCode.ok
            status.data     = []
            _.each(snap.val(), function(data) {
                status.data.push(data)
            });
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