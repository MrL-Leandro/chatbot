/**
 * 百度服务
 */

const notifBot = require('./notify-bot')
const config = require("./config")
const superagent = require('superagent');
const dateutils = require('./dateutils');

//鉴权token
var ACCESS_TOKEN

/**
 * 接受消息列表，返回AI消息
 * @param {List<Message>} messages 消息列表
 * @returns string
 */
async function chat(messages) {
    let result
    let response
    if (ACCESS_TOKEN == null || ACCESS_TOKEN == undefined || ACCESS_TOKEN == '') {
        await setAccessToken()
    }
    const url = config.baidu.wenxinyiyan.url + "?access_token=" + ACCESS_TOKEN
    console.log("百度文心一言请求地址:" + url)
    let params = { messages: messages }
    console.log("百度文心一言请求参数:" + JSON.stringify(params))
    await superagent.post(url)
        .set('Content-Type', 'application/json')
        .send(params)
        .then(res => {
            response = res.body
            console.log("文心一言返回结果:" + JSON.stringify(response))
            result = response.result
            // console.log(result)
        }).catch(err => {
            console.log("文心一言服务异常:", err.message)
            result = "文心一言服务异常:" + err.message
        })
    return result
}

/**
 * 查询余额
 * @returns string
 */
async function queryBalance() {
    result = "百度服务暂不支持余额查询"
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
    if (ACCESS_TOKEN == null || ACCESS_TOKEN == undefined || ACCESS_TOKEN == '') {
        await setAccessToken()
    }
    const url = config.baidu.aizuohua.url + "?access_token=" + ACCESS_TOKEN
    console.log("百度生成图片请求地址:" + url)
    let params = { text: prompt }
    if (config.baidu.aizuohua.num) {
        params.num = config.baidu.aizuohua.num
    }
    if (config.baidu.aizuohua.size) {
        params.resolution = config.baidu.aizuohua.size
    }
    if (config.baidu.aizuohua.style) {
        params.style = config.baidu.aizuohua.style
    }
    console.log("百度生成图片请求参数:" + JSON.stringify(params))
    await superagent.post(url)
        .send(params)
        .then(res => {
            response = res.body
            console.log("百度生成图片返回结果:" + JSON.stringify(response))
            result.push(response.data.taskId)
            // console.log(result)
        }).catch(err => {
            console.log("百度生成图片服务异常:", err.message);
            setAccessToken()
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
    if (ACCESS_TOKEN == null || ACCESS_TOKEN == undefined || ACCESS_TOKEN == '') {
        await setAccessToken()
    }
    const url = config.baidu.aizuohua.getImg.URL + "?access_token=" + ACCESS_TOKEN
    console.log("百度获取图片任务状态请求地址:" + url)
    let params = { taskId: taskId }
    console.log("百度获取图片任务状态请求参数:" + JSON.stringify(params))
    await superagent.post(url)
        .set('Content-Type', 'application/json')
        .send(params)
        .then(res => {
            response = res.body
            console.log("百度获取图片任务状态返回结果:" + JSON.stringify(response))
            result = response.data.status == 1 ? "SUCCEEDED":"UNKNOWN"
            // console.log(result)
        }).catch(err => {
            console.log("百度获取图片任务状态异常:", err.message)
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
    if (ACCESS_TOKEN == null || ACCESS_TOKEN == undefined || ACCESS_TOKEN == '') {
        await setAccessToken()
    }
    const url = config.baidu.aizuohua.getImg.URL + "?access_token=" + ACCESS_TOKEN
    console.log("百度获取图片请求地址:" + url)
    let params = { taskId: taskId }
    console.log("百度获取图片请求参数:" + JSON.stringify(params))
    await superagent.post(url)
        .set('Content-Type', 'application/json')
        .send(params)
        .then(res => {
            response = res.body
            console.log("百度获取图片返回结果:" + JSON.stringify(response))
            response.data.imgUrls.forEach(item => {
                result.push(item.image)
            });
            // console.log(result)
        }).catch(err => {
            console.log("百度获取图片异常:", err.message)
        })
    return result
}

/**
 * 设置鉴权token
 */
async function setAccessToken() {
    console.log("开始获取百度access_token");

    await superagent.get(config.baidu.getToken.url, {
        grant_type: "client_credentials",
        client_id: config.baidu.apiKey,
        client_secret: config.baidu.secretKey
    })
        .then(res => {
            response = res.body
            console.log("获取百度access_token返回结果:" + JSON.stringify(response))
            ACCESS_TOKEN = response.access_token
        }).catch(err => {
            console.log("获取百度access_token异常:", err.message);
        });
}

// getImgTaskStatus("18311220").then(v => console.log(111,v))
// async function test() {
//     const messages = [
//         {
//             "role":"user",
//             "content":"hello"
//         }
//     ]
//     let result
//     await chat(messages).then(v => result = v)
//     console.log(111,result)
// }

// test()

module.exports = {
    chat,
    queryBalance,
    generatIMG,
    getImgTaskStatus,
    getImg
};
