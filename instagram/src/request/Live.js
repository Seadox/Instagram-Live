var client = require("../../Client");
var globals = require("../../Globals");

create = (previewWidth, previewHeight, broadcastMessage, cb)=>{
    var data = JSON.stringify({
        _uuid: globals.uuid,
        _csrftoken: globals.csrftoken,
        preview_height: previewHeight,
        preview_width: previewWidth,
        broadcast_message: broadcastMessage,
        broadcast_type: "RTMP",
        internal_only: "0"
    });

    client.sendRequest("live/create/", data, function () {
        cb(globals.LastResponse);
    });
}

start = (broadcastId, cb)=>{
    var data = JSON.stringify({
        _uuid: globals.uuid,
        _csrftoken: globals.csrftoken,
        should_send_notifications: 1
    });

    client.sendRequest("live/" + broadcastId + "/start/", data, function () {
        cb(globals.LastResponse);
    });
}

end = (broadcastId, cb)=>{
    var data = JSON.stringify({
        _uuid: globals.uuid,
        _csrftoken: globals.csrftoken,
    });

    client.sendRequest("live/" + broadcastId + "/end_broadcast/", data, function () {
        cb(globals.LastResponse);
    });
}

getComments = (broadcastId, lastCommentTs, commentsRequested, cb)=>{
    client.sendRequest("live/" + broadcastId + "/get_comment/?last_comment_ts=" + lastCommentTs + "&num_comments_requested=" + commentsRequested, null, function () {
        cb(globals.LastResponse);
    });
}

getViewerList = (broadcastId, cb)=>{
    client.sendRequest("live/" + broadcastId + "/get_viewer_list/", null, function () {
        cb(globals.LastResponse);
    });
}

comment = (broadcastId, message, cb)=>{
    var data = JSON.stringify({
        user_breadcrumb: signatures.userBreadcrumb(message.length),
        idempotence_token: signatures.generateUUID(true),
        comment_text: message,
        live_or_vod: 1,
        offset_to_video_start: 0,
        _csrftoken: globals.csrftoken,
        _uid: globals.username_id,
        _uuid: globals.uuid
    });

    client.sendRequest("live/" + broadcastId + "/comment/", data, () => {
        cb(globals.LastResponse);
    });
}

module.exports.create = create;
module.exports.start = start;
module.exports.end = end;
module.exports.getComments = getComments;
module.exports.getViewerList = getViewerList;
module.exports.comment = comment;
