var uuid = require("uuid/v4");
var crypto = require("crypto");
const utf8 = require("utf8");

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
