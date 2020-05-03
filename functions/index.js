
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

// Added to debug functions in Stackdriver Debug.
const debug = require('@google-cloud/debug-agent').start({
    allowExpressions: true,
    serviceContext: {
        service: 'device-functions',
        version: 'V1.1.0'
    }
});

// Lets the user know its ready to debug,
debug.isReady().then(() => {
    debugInitialized = true;  
    console.log("Debugger is initialize");
});

const functions = require('firebase-functions');
'use strict';
const {google} = require('googleapis');

const iot = require('@google-cloud/iot');



const DeviceSettings = {
  name: "John Doe",
  age: 32,
  title: "Vice President of JavaScript"
};


// 
/**
 * responceMessage Used to hold all of the responce Data
 * @param {!express:Request} responceMessage HTTP request context.
 * @param responceMessage.data - This is the json object for the data will change per function.
 * @param responceMessage.error - This is the error object contains the feilds to check the resoonce.
 * @param responceMessage.status - This is status True = Error False = No Error.
 * @param responceMessage.code - This is code assigned to the Error.
 * @param responceMessage.description - This is description of the Error.
 */
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

exports.sendCommand = functions.https.onCall((data, context) => {
    console.log(data.name);
    return {
        message: `FAILED! Email sent to the user at email address` + data.to,
        status: false
      }
});


/**
 * sendConfig allows a user to send data to the selected device
 * @param {!express:Request} data on Call data.
 * @param data.projectId - This is teh project ID gotten from the home page of the project.
 * @param data.cloudRegion - This is the region the project device is in gotten from the device reg.
 * @param data.registryId - This is the device reg id.
 * @param data.deviceId - This is the device id found in the required Reg.
 * @param data.deviceConfig - This is the deviceconfig and is generally a JSON object.
 * @param {!express:Response} return HTTP response context.
 * @param return.responceMessage - This is the deviceconfig and is generally a JSON object.
 * @param responceMessage.data - This is the json object for the data will change per function.
 * @param responceMessage.error - This is the error object contains the feilds to check the resoonce.
 * @param responceMessage.status - This is status True = Error False = No Error.
 * @param responceMessage.code - This is code assigned to the Error.
 * @param responceMessage.description - This is description of the Error.
 */
exports.sendConfig = functions.https.onCall((data, context) => {
    
    // Take the data from the request.
    const projectId = data.projectId;
    const cloudRegion = data.cloudRegion;
    const registryId = data.registryId;
    const deviceId = data.deviceId;
    const deviceConfig = data.deviceConfig;

    return google.auth.getClient().then(client => {
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

            return google.cloudiot('v1').projects.locations.registries.devices.modifyCloudToDeviceConfig(request).then(result => {
                console.log(result);
                responceMessage.data = "Done";
                return responceMessage;
            }).catch(error => {
                responceMessage.data = error;
                responceMessage.error.status = true;
                responceMessage.error.code = 1;
                responceMessage.error.description = `Failed to send the config to the device ${deviceId}` ;
                // 403  Device Error or NO device
                return responceMessage;
        });
    });
});

exports.getState = functions.https.onRequest((request, response) => {
    response.send("Hello from Firebase!");
});


/**
 * getConfig allows a user to get the data that was last sent to the selected device
 * @param {!express:Request} data on Call data.
 * @param data.projectId - This is teh project ID gotten from the home page of the project.
 * @param data.cloudRegion - This is the region the project device is in gotten from the device reg.
 * @param data.registryId - This is the device reg id.
 * @param data.deviceId - This is the device id found in the required Reg.
 * @param data.deviceConfig - This is the deviceconfig and is generally a JSON object.
 * @param {!express:Response} return HTTP response context.
 * @param return.responceMessage - This is the deviceconfig and is generally a JSON object.
 * @param responceMessage.data - This is the json object for the data will change per function.
 * @param responceMessage.error - This is the error object contains the feilds to check the resoonce.
 * @param responceMessage.status - This is status True = Error False = No Error.
 * @param responceMessage.code - This is code assigned to the Error.
 * @param responceMessage.description - This is description of the Error.
 */
exports.getConfig = functions.https.onCall((data, context) => {
    
    // Take the data from the request.
    const projectId = data.projectId;
    const cloudRegion = data.cloudRegion;
    const registryId = data.registryId;
    const deviceId = data.deviceId;
    const iotClient = new iot.v1.DeviceManagerClient({
        // optional auth parameters.
    });
    const devicePath = iotClient.devicePath(
    projectId,
    cloudRegion,
    registryId,
    deviceId
    );

    var configData = {
        currentVersion: null,
        numberOfVersions: 0,
        data:[]
    }
  
    return iotClient.listDeviceConfigVersions({name: devicePath}).then(responses => {
    // The Configs is the list of versions sent
    const configs = responses[0].deviceConfigs;
    var versionMax = 0;
    // Cycle through the config data.
    for (let i = 0; i < configs.length; i++) {
        configData.numberOfVersions ++;
        const config = configs[i];
        // Create the versions.
        var configVersionData = {
            version: config,
            data: config.binaryData.toString('utf8')
        };
        configData.data.push(configVersionData);
        // Here we get the Current VERSION and this is the Max Version Number
        if (config.version.version > versionMax)
        {
            versionMax = config.version.version;
            configData.currentVersion = configVersionData;
        }
    }
    responceMessage.data = configData;
    return responceMessage;
    }).catch(error => {
        responceMessage.data = error;
        responceMessage.error.status = true;
        responceMessage.error.code = 1;
        responceMessage.error.description = `Failed to get the configs for the device ${deviceId}` ;
        // 403  Device Error or NO device
        return responceMessage;
    });
    
    
});
