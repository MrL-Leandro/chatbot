/**
 * 通知机器人
 */

const config = require("./config");
const superagent = require('superagent');

/**
 * 发送通知消息
 * @param {string} message 消息 
 */
function sendMessage(message) {
    console.log("发送通知---消息内容:",message);
    const url = config.pushdeer.url + "?pushkey=" + config.pushdeer.pushkey;
    superagent.post(url)
        .send({text:message})
        .end((err, res) => {
            if (err) {
                return console.log(err);
            }
            console.log("发送通知---返回结果:",res.body);
        });
}
module.exports = {
    sendMessage
};