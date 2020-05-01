
/**
 * 
 *____          _   ____              _               _ 
 |  _ \ ___  __| | / ___|  __ _ _   _(_)_ __ _ __ ___| |
 | |_) / _ \/ _` | \___ \ / _` | | | | | '__| '__/ _ \ |
 |  _ <  __/ (_| |  ___) | (_| | |_| | | |  | | |  __/ |
 |_| \_\___|\__,_| |____/ \__, |\__,_|_|_|  |_|  \___|_|
                             |_|
 * Owners : RCarroll & CForristal Copyright 2020.                          
 * All of the needed functions for device managment.
 * Base project will use the LOLIN Board to test.
 */
const functions = require('firebase-functions');
'use strict';
const {google} = require('googleapis');



const DeviceSettings = {
  name: "John Doe",
  age: 32,
  title: "Vice President of JavaScript"
};

// Used to hold all of the responce Data
var responceMessage = {
data : null,
error : {
    status : false,
    code : 0,
    description: ""
}
}

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

exports.addDevice = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});

exports.deleteDevice = functions.https.onRequest((request, response) => {
    response.send("Hello from Firebase!");
});

exports.listDevices = functions.https.onRequest((request, response) => {
    response.send("Hello from Firebase!");
});

exports.sendCommand = functions.https.onRequest((request, response) => {
    response.send("Hello from Firebase!");
});


/**
 * sendConfig allows a user to send data to the selected device
 * @param {!express:Request} request HTTP request context.
 * @param request
 * @param {!express:Response} response HTTP response context.
 */
exports.sendConfig = functions.https.onRequest((request, response) => {

    // Take the data from the request.
    const projectId = request.projectId;
    const cloudRegion = request.cloudRegion;
    const registryId = request.registryId;
    const deviceId = request.deviceId;
    const deviceConfig = request.deviceConfig;

    google.auth.getClient().then(client => {
    google.options({
        auth: client
    });

    // Create the Nessary project links 
    const parentName = `projects/${projectId}/locations/${cloudRegion}`;
    const registryName = `${parentName}/registries/${registryId}`;
    // Turn the String JSON to base64
    const binaryData = Buffer.from(JSON.stringify(deviceConfig)).toString('base64');
    // Create the request
    const request = {
        name: `${registryName}/devices/${deviceId}`,
        versionToUpdate: 0,
        binaryData: binaryData
    };

    google.cloudiot('v1').projects.locations.registries.devices.modifyCloudToDeviceConfig(request).then(result => {
        console.log(result);
        responceMessage.data = "Done";
        response.status(200).send(responceMessage);
    }).catch(error => {
        responceMessage.data = error;
        responceMessage.error.status = true;
        responceMessage.error.code = 1;
        responceMessage.error.description = `Failed to send the config to the device ${deviceId}` ;
        // 409  Indicates that the request could not be processed because of conflict in the current state of the resource, such as an edit conflict between multiple simultaneous updates.
        response.status(409).send(responceMessage);
    });

});
});

exports.getState = functions.https.onRequest((request, response) => {
    response.send("Hello from Firebase!");
});

exports.getConfig = functions.https.onRequest((request, response) => {
    response.send("Hello from Firebase!");
});
