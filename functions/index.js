/**
 * 
 *____          _   ____              _               _ 
 |  _ \ ___  __| | / ___|  __ _ _   _(_)_ __ _ __ ___| |
 | |_) / _ \/ _` | \___ \ / _` | | | | | '__| '__/ _ \ |
 |  _ <  __/ (_| |  ___) | (_| | |_| | | |  | | |  __/ |
 |_| \_\___|\__,_| |____/ \__, |\__,_|_|_|  |_|  \___|_|
                             |_|
 * Owners : RCarroll & CForristal Copyright 2020.                          
 * Covers all of the device interactions see the device interaction doc for more details.
 */


// Used to allow the use of the debug agent.
const debug = require('@google-cloud/debug-agent').start({
    allowExpressions:true,
    serviceContext:{
        service: 'redSquirrel',
        version: '1.0.0'
    }
});
// Use Firebase functions.
const functions = require('firebase-functions');
// The debug and if ready.
debug.isReady().then(() => {
    debugInitialized = true
    console.log("Debugger is initialize")
});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.addNumbers = functions.https.onRequest((request, response) => {
    var a = 10;
    var b = 20;
    var c = a + b;
 response.send("Hello from Firebase!");
});

//################################## Device Update, Create, Delete and Reading ###########################################

exports.addNumbers = functions.https.onRequest((request, response) => {
    var a = 10;
    var b = 20;
    var c = a + b;
 response.send("Hello from Firebase!");
});
