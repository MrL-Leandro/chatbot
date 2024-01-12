/**
 * 阿里服务
 */

const notifBot = require('./notify-bot')
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
    const url = config.aliyun.tongyiqianwen.url + "?version-id=v1&task-group=aigc&task=text-generation&function-call=generation"
    console.log("阿里通义千问请求地址:" + url)
    let params = {
        model: "qwen-turbo",
        input: {
            messages: messages
        }
    }
    console.log("阿里通义千问请求参数:" + JSON.stringify(params))
    await superagent.post(url)
        .set('Content-Type', 'application/json')
        .set("Authorization", "Bearer " + config.aliyun.appKey)
        .send(params)
        .then(res => {
            response = res.body
            console.log("阿里通义千问返回结果:" + JSON.stringify(response))
            result = response.output.text
            // console.log(result)
        }).catch(err => {
            // console.log(err)
            console.log("通义千问服务异常:", err.message)
            result = "通义千问服务异常:" + err.message
        })
    return result
}

/**
 * 查询余额
 * @returns string
 */
async function queryBalance() {
    result = "阿里云暂时用的免费额度，暂不支持余额查询。"
    return result
}

/**
 * 生成图片
 * @param {string} prompt 提示语 
 * @returns List<String> 
 */
async function generatIMG(prompt) {
    let result = []
    let response
    const url = config.aliyun.tongyiwanxiang.url
    console.log("阿里生成图片请求地址:" + url)
    let params = {
        model: "wanx-v1",
        input: {
            prompt: prompt
        },
        parameters: {}
    }
    if (config.aliyun.tongyiwanxiang.num) {
        params.parameters.n = config.aliyun.tongyiwanxiang.num
    }
    if (config.aliyun.tongyiwanxiang.size) {
        params.parameters.size = config.aliyun.tongyiwanxiang.size
    }
    if (config.aliyun.tongyiwanxiang.style) {
        params.parameters.style = config.aliyun.tongyiwanxiang.style
    }
    console.log("阿里成图片请求参数:" + JSON.stringify(params))
    await superagent.post(url)
        .set("Content-Type", "application/json")
        .set("Authorization", "Bearer " + config.aliyun.appKey)
        .set("X-DashScope-Async", "enable")
        .send(params)
        .then(res => {
            response = res.body
            console.log("阿里生成图片返回结果:" + JSON.stringify(response))
            result.push(response.output.task_id)
            // console.log(result)
        }).catch(err => {
            console.log("阿里生成图片服务异常:", err.message);
        });
    return result
}

/**
 * 用任务id查询任务状态
 * SUCCEEDED-成功
 * RUNNING-正在处理
 * PENDING-正在排队
 * FAILED-失败
 * UNKNOWN-未知
 * @param {string} taskId 任务id 
 * @returns string
 */
async function getImgTaskStatus(taskId) {
    let result
    let response
    const url = config.aliyun.tongyiwanxiang.getImg.url + "/" + taskId
    console.log("阿里获取图片任务状态请求地址:" + url)
    await superagent.get(url)
        .set("Content-Type", "application/json")
        .set("Authorization", "Bearer " + config.aliyun.appKey)
        .then(res => {
            response = res.body
            console.log("阿里获取图片任务状态返回结果:" + JSON.stringify(response))
            result = response.output.task_status
            // console.log(result)
        }).catch(err => {
            console.log("阿里获取图片任务状态异常", err.message)
            result = "UNKNOWN"
        })
    return result
}

/**
 * 用任务id查询图片
 * 返回的是图片的url列表
 * @param {string} taskId 任务id 
 * @returns List<String>
 */
async function getImg(taskId) {
    let result = []
    let response
    const url = config.aliyun.tongyiwanxiang.getImg.url + "/" + taskId
    console.log("阿里获取图片请求地址:" + url)
    await superagent.get(url)
        .set("Content-Type", "application/json")
        .set("Authorization", "Bearer " + config.aliyun.appKey)
        .then(res => {
            response = res.body
            console.log("阿里获取图片返回结果:" + JSON.stringify(response))
            response.output.results.forEach(item => {
                result.push(item.url)
            });
            // console.log(result)
        }).catch(err => {
            console.log("阿里获取图片异常", err.message)
        })
    return result
}

// generatIMG("打篮球的鸡").then(v => console.log(v))
// let messages = [
//     {
//         "role":"user",
//         "content":"科比是谁"
//     },
//     {
//         "role":"assistant",
//         "content":"不知道"
//     },
//     {
//         "role":"user",
//         "content":"再说一遍"
//     }
// ]
// chat(messages).then(v => console.log(v))

// getImgTaskStatus("6436f16f-c407-49b8-b716-4801a74c19de").then(v => console.log(111, v))
// getImg("6436f16f-c407-49b8-b716-4801a74c19de").then(v => console.log(111, v))

module.exports = {
    chat,
    queryBalance,
    generatIMG,
    getImgTaskStatus,
    getImg
};
