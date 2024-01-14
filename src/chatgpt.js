/**
 * openai服务，chatgpt
 */

const notifBot = require('./notifyBot')
const config = require("./config")
const superagent = require('superagent');
const dateutils = require('./dateutils');

/**
 * 接受消息列表，返回AI消息
 * @param {List<Message>} messages 消息列表
 * @returns string
 */
async function chat(messages) {
    let result
    let response
    const url = config.openAI.protocol + "://" + config.openAI.domain + "/v1/chat/completions"
    console.log("chatgpt对话请求地址:" + url)
    let params = { model: config.openAI.chat.model, messages: messages }
    if (config.openAI.chat.max_tokens) {
        params.max_tokens = config.openAI.chat.max_tokens
    }
    console.log("chatgpt对话请求参数:" + JSON.stringify(params))
    await superagent.post(url)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + config.openAI.key)
        .send(params)
        .then(res => {
            response = res.body
            console.log("chatgpt对话返回结果:" + JSON.stringify(response))
            result = response.choices[0].message.content
            // console.log(result)
        }).catch(err => {
            console.log("chatgpt对话服务异常:", err.message);
            result = "chatgpt对话服务异常" + err.message
        });
    return result
}

/**
 * 查询余额
 * @returns string
 */
async function queryBalance() {
    const url = config.openAI.protocol + "://" + config.openAI.domain + "/dashboard/billing/credit_grants"
    console.log("chatgpt查询余额请求地址:" + url)
    await superagent.get(url)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + config.openAI.key)
        .then(res => {
            response = res.body
            console.log("chatgpt返回结果:" + JSON.stringify(response))
            result = "剩余" +
                response.total_available +
                "P,过期时间" +
                dateutils.formattedDate(response.expire_at) + "."
            console.log(result)
        }).catch(err => {
            console.log("chatgpt查询余额异常", err.message);
            result = "chatgpt查询余额异常" + err.message
        });
    return result
}

/**
 * 生成图片
 * 返回的是图片的url列表，图片的url可以是base64格式
 * @param {string} prompt 提示语 
 * @returns List<String> 
 */
async function generatIMG(prompt) {
    let result = []
    let response
    const url = config.openAI.protocol + "://" + config.openAI.domain + "/v1/images/generations"
    console.log("chatgpt生成图片请求地址:" + url)
    let params = { prompt: prompt }
    if (config.openAI.img.num) {
        params.n = config.openAI.img.num
    }
    if (config.openAI.img.size) {
        params.size = config.openAI.img.size
    }
    if (config.openAI.img.responseFormat) {
        params.response_format = config.openAI.img.responseFormat
    }
    console.log("chatgpt生成图片请求参数:" + JSON.stringify(params))
    await superagent.post(url)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + config.openAI.key)
        .send(params)
        .then(res => {
            response = res.body
            console.log("chatgpt生成图片返回结果:" + JSON.stringify(response))
            response.data.forEach(item => {
                if (config.openAI.img.responseFormat === 'b64_json'){
                    result.push("base64://" + item.b64_json)
                }else {
                    result.push(item.url)
                }
            });
            // console.log(result)
        }).catch(err => {
            console.log("chatgpt生成图片异常:", err.message);
        });
    return result
}

module.exports = {
    chat,
    queryBalance,
    generatIMG
};
