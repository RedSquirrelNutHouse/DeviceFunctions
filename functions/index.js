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
'use strict';
// Use Firebase functions.
const functions = require('firebase-functions');
// Use fs the file System
const fs = require('fs');
// START iot_get_client
const {google} = require('googleapis');
const iot = require('@google-cloud/iot');

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
/** 
* @param {!express:Request} req HTTP request context.
* @param {!express:Response} res HTTP response context.
*/
const API_VERSION = 'v1';
const DISCOVERY_API = 'https://cloudiot.googleapis.com/$discovery/rest';

// Start the iot core.
const client = new iot.v1.DeviceManagerClient();
// [END iot_get_client]

if (client === undefined) {
  console.log('Did not instantiate client.');
}

/** 
 * setIOTState - This allows the user to list the last states of the selected device
 * @param {!express:Request} req HTTP request context.
 * @param projectId - The id of the project.
 * @param deviceId - The Deviceid of the project.
 * @param registryId - The reg id of the project.
 * @param cloudRegion - The cloudRegion of the project.
 * @param registryId - The registryId of the project.
 * @param {!express:Response} res HTTP response context.
*/
exports.setIOTState = functions.https.onCall((data, context) => {

    // Obtain the device data from the request.
    const projectId = data.projectId;
    const deviceId = data.deviceId;
    const registryId = data.registryId;
    const cloudRegion = data.cloudRegion;
    // iot Client create
    const getDeviceState = async (
        client,
        deviceId,
        registryId,
        projectId,
        cloudRegion
      ) => {
        // [START iot_get_device_state]
        // const cloudRegion = 'us-central1';
        // const deviceId = 'my-device';
        // const projectId = 'adjective-noun-123';
        // const registryId = 'my-registry';
        const iot = require('@google-cloud/iot');
        const iotClient = new iot.v1.DeviceManagerClient({
          // optional auth parameters.
        });
        const devicePath = iotClient.devicePath(
          projectId,
          cloudRegion,
          registryId,
          deviceId
        );
        console.log(devicePath);
        try {
          const responses = await iotClient.listDeviceStates({name: devicePath});
          const states = responses[0].deviceStates;
          if (states.length === 0) {
            console.log(`No States for device: ${deviceId}`);
          } else {
            console.log(`States for device: ${deviceId}`);
          }
      
          for (let i = 0; i < states.length; i++) {
            const state = states[i];
            console.log(
              'State:',
              state,
              '\nData:\n',
              state.binaryData.toString('utf8')
            );
          }
        } catch (err) {
          console.error('Could not find device:', deviceId);
          console.error('trace:', err);
        }
        // [END iot_get_device_state]
    };
});