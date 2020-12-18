var uuid = require("uuid/v4");
var crypto = require("crypto");
const utf8 = require("utf8");
var lodash = require('lodash')

var constants = require("./Constants");

module.exports.generateUUID = function (type) {
  if (type) {
    return uuid();
  } else {
    return uuid().replace("-", "");
  }
};

module.exports.generateSignature = function (data) {
  var hash = crypto
    .createHmac("sha256", utf8.encode(constants.IG_SIG_KEY))
    .update(utf8.encode(data))
    .digest("hex");
  return "ig_sig_key_version=4&signed_body=" + hash + "." + encodeURI(data);
};

module.exports.generateDeviceId = function (source) {
  return (
    "android-" +
    crypto
      .createHash("md5")
      .update(crypto.createHash("md5").update(source) + "12345")
      .digest()
      .toString()
      .substring(0, 16)
  );
};

module.exports.userBreadcrumb = (size)=>{
  const term = lodash.random(2, 3) * 1000 + size + lodash.random(15, 20) * 1000;
  const textChangeEventCount = Math.round(size / lodash.random(2, 3)) || 1;
  const data = `${size} ${term} ${textChangeEventCount} ${Date.now()}`;

  const signature = Buffer.from(
    crypto
      .createHmac('sha256', constants.userBreadcrumbKey)
      .update(data)
      .digest('hex'),
  ).toString('base64');

  const body = Buffer.from(data).toString('base64');
  return `${signature}\n${body}\n`;
}
