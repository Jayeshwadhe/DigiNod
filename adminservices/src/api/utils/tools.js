// const encryptConfig = require('../../../config/config.encrypt');
// import supplierUser from '../../models/supplier_users'
// // var CryptoJS = require("crypto-js");
// // Tools
// const validator = require('./validator');
// // const { UserType, UserStatus } = require('../datatypes/User'); // will need in for admin dashboard
// //const notificationType = require('../datatypes/Notification');
// //const { NotificationService } = require('../services/v0.1/notification.service');

// // Libraries
// const crypto = require('crypto');
// const jwt = require('jsonwebtoken');

// // Mongoose
// const mongoose = require('mongoose');

// //const CurrentFcm = mongoose.model('currentfcmtoken');

// //const AppVersions = mongoose.model('AppVersions');

// const tools = {

//   decryptApiKey: async (req, res, next) => {
//     try {
      

//     //         // console.log('#####################################');
//     //   // console.log('REQUEST');
//     //   // console.log(req);
//     //   // console.log('#####################################');
//     //   if(req.headers.safe) {
//     //     if(req.body.data) {
//     //     var decrypted = CryptoJS.AES.decrypt(req.body.data, "_digi_v0.1");
//     //     console.log('********************************');
//     //     console.log(req.body);
//     //     console.log(decrypted.toString(CryptoJS.enc.Utf8));
//     //     console.log(JSON.parse(decrypted.toString(CryptoJS.enc.Utf8)));
//     //     console.log('********************************');
//     //     req.body = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
//     //     res.append('safe', 'true');
//     //     res.setHeader('safe', 'true');
//     //   }
//     //   else{
//     //          res.append('safe', 'true');
//     //     res.setHeader('safe', 'true');
//     //   }
//     // }

//     //   let mySend = res.send;
//     //   res.send = function (obj) {
//     //     // let myObj = JSON.parse(obj);
//     //     let myObj = {};
//     //     if (res.get('safe')) {
//     //       console.log('********************************');
//     //       console.log('RESPONSE IS ENCRYPTING');
//     //       let myObjj 
//     //       myObjj =obj
//     //       let encrypted = CryptoJS.AES.encrypt(myObjj, "_digi_v0.1").toString();
//     //       console.log(obj);
//     //       //console.log(myObjj);
//     //       myObj.data = encrypted;
//     //       //obj.append('safe', 'true');
//     //       myObj.safe = 'true';
//     //       console.log('********************************');
//     //   }
//     //     let myObj1 = JSON.stringify(myObj);
//     //     mySend.call(this, myObj1);
//     //   };
      
                           


//       const { authorization } = req.headers;
      
//       if (!authorization || authorization === 'null') {
//         req.currentUser = null;
//         return next();
//       }

//       const decodedKey = await jwt.verify(authorization, encryptConfig.secret);
//       if (typeof decodedKey === 'undefined' || typeof decodedKey.userId === 'undefined') {
//         req.currentUser = null;
//         return next();
//       }

//       const { userId } = decodedKey; // changing userId to _id
//       const user = await supplierUser.findOne({
//         _id:userId // changing userId to _id
//       });

//       if (!user || !user._id ) {
//         req.currentUser = null;
//         return next();
//       }

//       // if (user.users.type === UserType.admin) {
//       //   user.admin = true;
//       // }

//       req.currentUser = user;

//       return next();
//     } catch (e) {
//       console.error('decrypt API e:', e);
//       req.currentUser = null;
//       return next();
//     }
//   },

//   makeSalt: function makeSalt() {
//     return Math.round((new Date().valueOf() * Math.random())) + ''; // eslint-disable-line
//   },

//   saltPassword: (password) => {
//     if (!password) {
//       return {
//         encrypt: '',
//         salt: '',
//       };
//     }

//     const salt = tools.makeSalt();

//     const encrypted = crypto
//       .createHmac('sha1', salt)
//       .update(password)
//       .digest('hex');

//     return { encrypted, salt };
//   },

//   decryptPassword: (password, salt) => {
//     if (!password || !salt) {
//       return false;
//     }

//     const decrypted = crypto
//       .createHmac('sha1', salt)
//       .update(password)
//       .digest('hex');

//     return decrypted;
//   },

//   removeTestEmails: (userArray) => {
//     const newUserArray = [];
//     userArray.forEach((user) => {
//       if (!validator.isTestAccount(user.email)) {
//         newUserArray.push(user);
//       }
//     });

//     return newUserArray;
//   },

//   // user exists 
//   userExists: async (query) =>{
//     const userCount = await supplierUser.count({ 'users.email': query.email });
//     return userCount > 0;
//   },

//   // createFCM: async (reqObj)=> {
//   //   if (reqObj.token === undefined || reqObj.token.trim() === '') {
//   //     return null;
//   //   }
//   //   const currentFcm = await CurrentFcm.findOne({
//   //     token: reqObj.token
//   //   });
//   //   // This means someone else already has this token registered to their account, we need to remove it
//   //   if (currentFcm && currentFcm.userID) {
//   //     currentFcm.token = '';
//   //     currentFcm.devicetype = undefined;
//   //     currentFcm.releaseType = undefined;
//   //     currentFcm.appVersion = undefined;
//   //     currentFcm.osVersion = undefined;
//   //     await currentFcm.save();
//   //   }

//   //   const currentUserToken = await CurrentFcm.findOne({
//   //     userID: parseInt(reqObj.userId, 10)
//   //   });

//   //   if (currentUserToken && currentUserToken.userID) {
//   //     // This means they have a different token assigned to their userId, so we need to update it
//   //     currentUserToken.token = reqObj.token;
//   //     currentUserToken.devicetype = reqObj.devicetype;
//   //     currentUserToken.releaseType = reqObj.releaseType;
//   //     currentUserToken.appVersion = reqObj.appVersion;
//   //     currentUserToken.osVersion = reqObj.osVersion;
//   //     return await currentUserToken.save();
//   //   }

//   //   const retUser = await Users.findOne({ userId: reqObj.userId });

//   //   // This means they don't already have a token, so we need to create one
//   //   const usrObj = {
//   //     userID: parseInt(reqObj.userId, 10),
//   //     devicetype: reqObj.devicetype,
//   //     token: reqObj.token,
//   //     releaseType: reqObj.releaseType,
//   //     appVersion: reqObj.appVersion,
//   //     osVersion: reqObj.osVersion
//   //   };
//   //   const createNewToken = new CurrentFcm(usrObj);
//   //   return await createNewToken.save();
//   // },

//   // logoutNotification: async (obj)=> {
//   //   try {
//   //     const { userId, token } = obj;

//   //     if (!token) {
//   //       return;
//   //     }

//   //     const fcmToken = await CurrentFcm.findOne({
//   //       userID: userId,
//   //     });

//   //     if (!fcmToken || !fcmToken.token || !fcmToken.devicetype) {
//   //       return;
//   //     }

//   //     if ((obj.token !== undefined && obj.token !== '' && validator.isValidString(obj.token)) && fcmToken.token === obj.token) {
//   //       return;
//   //     }

//   //     const notificationPayload = {
//   //       to: fcmToken.token,
//   //       data: {
//   //         notificationType: notificationType.logout,
//   //       },
//   //       content_available: true,
//   //       priority: 'high',
//   //       releaseType: fcmToken.releaseType
//   //     };

//   //     // call notification service to sent push notification to actor
//   //     try {
//   //       await NotificationService.sendPushNotification(fcmToken, notificationPayload, Math.floor(Date.now() / 1000) + 3600);
//   //     } catch (err) {
//   //       console.error('error occurred while sending notification', err);
//   //       // return null;
//   //     }

//   //     // Device type is not android or ios
//   //     return;
//   //   } catch (error) {
//   //     console.error('Unable to send logout notification:', error);
//   //   }
//   // },

//   // getLatestVersion: async (os, appVersion)=> {
//   //   try {
//   //     const latestVersion = await AppVersions.findOne({ os }).sort({ _id: -1 });
//   //     let isLatest = true;
//   //     if (latestVersion && this.compareVersions(latestVersion.version, appVersion) > 0) {
//   //       isLatest = false;
//   //     }
//   //     return {
//   //       isLatest,
//   //       forceUpdate: true
//   //     };
//   //   } catch (error) {
//   //     console.error('couldn\'t find the latest version ', error.message);
//   //     return {
//   //       isLatest: true,
//   //       forceUpdate: false
//   //     };
//   //   }
//   // },

//   // compareVersions: (version1, version2) => {
//   //   let i;
//   //   let diff;
//   //   const regExStrip0 = /(\.0+)+$/;
//   //   const segmentsA = version1.replace(regExStrip0, '').split('.');
//   //   const segmentsB = version2.replace(regExStrip0, '').split('.');
//   //   const lowest = Math.min(segmentsA.length, segmentsB.length);

//   //   for (i = 0; i < lowest; i += 1) {
//   //     diff = parseInt(segmentsA[i], 10) - parseInt(segmentsB[i], 10);
//   //     if (diff) {
//   //       return diff;
//   //     }
//   //   }
//   //   return segmentsA.length - segmentsB.length;
//   // },

//   // lowerCaseRegex: (string, exactMatch) => {
//   //   if (exactMatch) {
//   //     return new RegExp(`^${string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i');
//   //   }

//   //   return new RegExp(`${string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}`, 'i');
//   // }
// };

// module.exports = tools;
