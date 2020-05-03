
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
        service: 'functions',
        version: 'V1.2.0'
    }
});

// Lets the user know its ready to debug,
debug.isReady().then(() => {
    debugInitialized = true;  
    console.log("Debugger is initialize");
});

const functions = require('firebase-functions');
'use strict';
const fs = require('fs');
const {google} = require('googleapis');

const iot = require('@google-cloud/iot');


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

// Used to reset the responce Message.
function resetMessage()
{
    responceMessage = {
        data : null,
        error : {
            status : false,
            code : 0,
            description: ""
        }
    }
}

/**
 * addDevice allows a user to add a device to a Regsistry.
 * @param {!express:Request} data on Call data.
 * @param data.projectId - This is teh project ID gotten from the home page of the project.
 * @param data.cloudRegion - This is the region the project device is in gotten from the device reg.
 * @param data.registryId - This is the device reg id.
 * @param data.deviceId - This is the device id found in the required Reg.
 * @param data.commandMessage - This is the devicecommand and is generally a JSON object.
 * @param {!express:Response} return HTTP response context.
 * @param return.responceMessage - This is the device responce to the command and is generally a JSON object.
 * @param responceMessage.data - This is the json object for the data will change per function.
 * @param responceMessage.error - This is the error object contains the feilds to check the resoonce.
 * @param responceMessage.status - This is status True = Error False = No Error.
 * @param responceMessage.code - This is code assigned to the Error.
 * @param responceMessage.description - This is description of the Error.
 */
exports.addDevice = functions.https.onCall((data, context) => {
    resetMessage();
    // Take the data from the request.
    const projectId = data.projectId;
    const cloudRegion = data.cloudRegion;
    const registryId = data.registryId;
    const deviceId = data.deviceId;
    const publicKeyFormat = data.publicKeyFormat;
    const publicKeyFile = data.publicKeyFile;
    const iotClient = new iot.v1.DeviceManagerClient({
    // optional auth parameters.
    });
    var keytoUse = backslash(publicKeyFile);
    var backslash = require('backslash');
    const regPath = iotClient.registryPath(projectId, cloudRegion, registryId);
    const device = {
      id: deviceId,
      credentials: [
        {
          publicKey: {
            format: publicKeyFormat,
            key: keytoUse,
          },
        },
      ],
    };
  
    const request = {
      parent: regPath,
      device,
    };
    return iotClient.createDevice(request).then(responses => {
        const response = responses[0];
        console.log('Created device', response);
      } ).catch(error => {
        responceMessage.data = error;
        responceMessage.error.status = true;
        responceMessage.error.code = 3;
        responceMessage.error.description = `Failed to send a command to the device ${deviceId}` ;
        // 403  Device Error or NO device.
        return responceMessage;
    });
      
    // Public key ec_public.pem
});

exports.deleteDevice = functions.https.onRequest((request, response) => {
    response.send("Hello from Firebase!");
});

exports.listDevices = functions.https.onRequest((request, response) => {
    response.send("Hello from Firebase!");
});


/**
 * sendCommand allows a user to send data to the selected device as a command.
 * @param {!express:Request} data on Call data.
 * @param data.projectId - This is teh project ID gotten from the home page of the project.
 * @param data.cloudRegion - This is the region the project device is in gotten from the device reg.
 * @param data.registryId - This is the device reg id.
 * @param data.deviceId - This is the device id found in the required Reg.
 * @param data.commandMessage - This is the devicecommand and is generally a JSON object.
 * @param {!express:Response} return HTTP response context.
 * @param return.responceMessage - This is the device responce to the command and is generally a JSON object.
 * @param responceMessage.data - This is the json object for the data will change per function.
 * @param responceMessage.error - This is the error object contains the feilds to check the resoonce.
 * @param responceMessage.status - This is status True = Error False = No Error.
 * @param responceMessage.code - This is code assigned to the Error.
 * @param responceMessage.description - This is description of the Error.
 */
exports.sendCommand = functions.https.onCall((data, context) => {
    
    resetMessage();
    // Take the data from the request.
    const projectId = data.projectId;
    const cloudRegion = data.cloudRegion;
    const registryId = data.registryId;
    const deviceId = data.deviceId;
    const commandMessage = data.commandMessage;
    const iotClient = new iot.v1.DeviceManagerClient({
    // optional auth parameters.
    });

    // Get the device path.
    const devicePath = iotClient.devicePath(
    projectId,
    cloudRegion,
    registryId,
    deviceId
    );

    // Used to hold the ccommand.
    const binaryData = Buffer.from(JSON.stringify(commandMessage)).toString('base64');
    // the Request Object.
    const request = {
      name: devicePath,
      binaryData: binaryData,
    };
  
    return iotClient.sendCommandToDevice(request).then(responses => {
    // The responce.
    const responce = responses[0];
    responceMessage.data = responce;
    return responceMessage;
    }).catch(error => {
        responceMessage.data = error;
        responceMessage.error.status = true;
        responceMessage.error.code = 3;
        responceMessage.error.description = `Failed to send a command to the device ${deviceId}` ;
        // 403  Device Error or NO device.
        return responceMessage;
    });

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
    
    resetMessage();
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
 * @param responceMessage.data.currentVersion - This is the current version of the config.
 * @param responceMessage.data.numberOfVersions - This is the number of configs read.
 * @param responceMessage.data.data - This is the lits of the last 10 configs.
 * @param responceMessage.error - This is the error object contains the feilds to check the resoonce.
 * @param responceMessage.status - This is status True = Error False = No Error.
 * @param responceMessage.code - This is code assigned to the Error.
 * @param responceMessage.description - This is description of the Error.
 */
exports.getConfig = functions.https.onCall((data, context) => {
    
    resetMessage();
    // Take the data from the request.
    const projectId = data.projectId;
    const cloudRegion = data.cloudRegion;
    const registryId = data.registryId;
    const deviceId = data.deviceId;
    const iotClient = new iot.v1.DeviceManagerClient({
    // optional auth parameters.
    });

    // Get the device path
    const devicePath = iotClient.devicePath(
    projectId,
    cloudRegion,
    registryId,
    deviceId
    );

    // Used to hold the config Data for the responce
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
        if (Number(config.version) > versionMax)
        {
            versionMax = Number(config.version) ;
            configData.currentVersion = configVersionData;
        }
    }
    responceMessage.data = configData;
    return responceMessage;
    }).catch(error => {
        responceMessage.data = error;
        responceMessage.error.status = true;
        responceMessage.error.code = 2;
        responceMessage.error.description = `Failed to get the configs for the device ${deviceId}` ;
        // 403  Device Error or NO device
        return responceMessage;
    });

});

exports.getState = functions.https.onRequest((request, response) => {
    response.send("Hello from Firebase!");
});

