module.exports = {
  log: (msg, obj = '') => {
    console.log(msg, obj);
  },
  info: (msg, obj = '') => {
    console.log(msg, obj);
  },
  error: (msg, obj = '') => {
    if (obj && obj.message) {
      console.error(msg, obj.message);
    } else {
      console.error(msg, obj);
    }
  },
  warn: (msg, obj = '') => {
    console.warn(msg, obj);
  },
};
