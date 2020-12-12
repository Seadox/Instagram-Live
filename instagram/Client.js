var request = require("request");
var Cookie = require("request-cookies").Cookie;

//Local
var constants = require("./Constants");
var globals = require("./Globals");
var signatures = require("./Signatures");

globals.cookies = request.jar();

function sendRequest(endpoint, data = null, cb, version = 0) {
  var headers = {
    Connection: "close",
    Accept: "*/*",
    ContentType: "application/x-www-form-urlencoded; charset=UTF-8",
    Cookie2: "$Version=1",
    "Accept-Language": "en-US",
    "User-Agent":
      "Instagram 85.0.0.21.100 Android (18/4.3; 320dpi; 720x1280; Xiaomi; HM 1SW; armani; qcom; en_US)",
  };
  //POST
  if (data != null) {
    request.post(
      {
        headers: headers,
        url: constants.API_URL[version] + endpoint,
        jar: globals.cookies,
        form: signatures.generateSignature(data),
      },
      (err, response, body) => {
        if (!err && response.statusCode == 200) {
          globals.statusCode = response.statusCode
          globals.LastResponse = body;
          var cookies = response.headers["set-cookie"];
          for (var i in cookies) {
            var cookie = new Cookie(cookies[i]);
            if (cookie.key == "csrftoken") {
              globals.csrftoken = cookie.value;
            }
            if (cookie.key == "sessionid") {
              globals.sessionid = cookie.value;
            }
          }
          try {
            cb(true);
          } catch {}
        } else {
          globals.statusCode = response.statusCode
          globals.LastResponse = body
          cb(true)
        }
      }
    );
  }
  //GET
  else {
    request.get(
      {
        headers: headers,
        url: constants.API_URL[version] + endpoint,
        jar: globals.cookies,
      },
      (err, response, body) => {
        if (!err && response.statusCode == 200) {
          globals.LastResponse = body;
          var cookies = response.headers["set-cookie"];

          for (var i in cookies) {
            var cookie = new Cookie(cookies[i]);
            if (cookie.key == "csrftoken") {
              globals.csrftoken = cookie.value;
            }
          }
          try {
            cb(true);
          } catch {}
        }
      }
    );
  }
}

function login(username, password, cb) {
  globals.uuid = signatures.generateUUID(true);
  globals.phone_id = signatures.generateUUID(true);

  if (!globals.isLoggedIn) {
    globals.device_id = signatures.generateDeviceId(username + password);
    sendRequest(
      "si/fetch_headers/?challenge_type=signup&guid=" +
        signatures.generateUUID(false),
      null,
      function (data) {
        if (data) {
          var data = JSON.stringify({
            _csrftoken: globals.csrftoken,
            username: username,
            guid: globals.uuid,
            device_id: globals.device_id,
            password: password,
            login_attempt_count: "0",
          });
          sendRequest("accounts/login/", data, function (data) {
            if (data) {
              globals.isLoggedIn = true;
              o = JSON.parse(globals.LastResponse);
              if(o.status != "fail"){
                globals.username_id = o.logged_in_user.pk;
                globals.rank_token = globals.username_id + "_" + globals.uuid;
                globals.token = globals.csrftoken;
                cb(globals.isLoggedIn);
              }
              else{
                globals.isLoggedIn = false
                cb(globals.isLoggedIn)
              }
            }
          });
        }
      }
    );
  }
}

function logout() {
  var data = JSON.stringify({
    _csrftoken: globals.csrftoken,
    guid: globals.uuid,
    device_id: globals.device_id,
    _uuid: globals.uuid,
  });
  sendRequest("accounts/logout/", data, ()=>{
    request.end()
  });
  
}

module.exports.sendRequest = sendRequest;
module.exports.login = login;
module.exports.logout = logout;
