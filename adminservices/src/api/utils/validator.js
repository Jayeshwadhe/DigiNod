//const { SocialDataTypes } = require('../datatypes/SocialLogin');

const REGEX_EMAIL = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; //eslint-disable-line
const REGEX_RATE = /^\$?[0-9]+(\.[0-9][0-9])?$/;
const TEST_ACCOUNT_REGEX = /\+[0-9]+@supplierdiscounting.com/;
const REGEX_PANNumber = /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/;
const validator = {
  isValidId(id) {
    return !isNaN(id);
  },
  isValidString(str, len) {
    if (!str || str.length === 0 || typeof str !== 'string') return false;
    if (len && str.length < len) return false;
    return true;
  },
  isValidMobileNumber(mobile){
  if(!mobile || mobile.length < 7 || mobile.length > 12) return false;
  return true
  },
  isValidEmail(email) {
    if (!email) return false;
    return REGEX_EMAIL.test(String(email.trim()).toLowerCase());
  },
  // isValidPANNumber(PANNumber) {
  //  // if (!email) return false;
  //   return REGEX_PANNumber.test(String(email.trim()).toLowerCase());
  // },
  isValidPassword(name) {
    // Check if the value is greater or equal to 5 characters
    return (name.length >= 6);
  },
  isValidEmailHash(id) {
    return (id.length === 40);
  },
  isValidEpoch(_time) {
    let time = _time;
    if (String.valueOf(time).length <= 10) {
      time *= 1000;
    }

    const startEpoch = (new Date(time)).getTime();
    // if(startEpoch - new Date().getTime()<0)
    // {
    //   return false;
    // }
    if (startEpoch === undefined || isNaN(startEpoch) || startEpoch < 1) {
      return false;
    }
    return time;
  },
  isValidRate(rate) {
    if (REGEX_RATE.test(rate.toString())) {
      return true;
    }
    return false;
  },
  // isSocialType(socialType) {
  //   const allTypes = SocialDataTypes;
  //   let returnType = false;
  //   Object.keys(allTypes).forEach((type) => { // eslint-disable-line
  //     if (Number(socialType) === Number(allTypes[type])) {
  //       returnType = true;
  //     }
  //   });

  //   return returnType;
  // },
  toCamelCase(str) {
    const splitStr = str.toLowerCase().split(' ');
    for (let i = 0; i < splitStr.length; i += 1) {
      // You do not need to check if i is larger than splitStr length, as your for does that for you
      // Assign it back to the array
      splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    // Directly return the joined string
    return splitStr.join(' ');
  },
  isTestAccount(email) {
    if (TEST_ACCOUNT_REGEX.test(email)) {
      return true;
    }

    return false;
  }
};

module.exports = validator;
