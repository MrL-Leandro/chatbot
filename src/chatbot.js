#!/usr/bin/env -S node --no-warnings --loader ts-node/esm
/**
 * 利用wechaty开发的个人工具机器人
 * wechaty - https://github.com/wechaty/wechaty
 */
const {
    ScanStatus,
    WechatyBuilder,
    log,
    types
} = require('wechaty')
const { FileBox } = require('file-box')
const qrcodeTerminal = require('qrcode-terminal')
const config = require("./config");
const notifBot = require('./notify-bot');
const chatgpt = require('./chatgpt');
const baidu = require('./baidu');
const ali = require('./ali');
const pcControl = require('./pc-control');

//帮助信息
const helpMsg = "1.单问单答：如果只想让AI回答问题，请直接输入问题，例如【马化腾是谁】；\n" +
    "2.生成图片：如果要生成图片请说：【$生成图片 描述】，例如【$生成图片 打篮球的鸡】；\n" +
    "3.查询生成图片任务状态:输入【$查询任务状态 taskId】，查询生成图片任务状态，例如【$查询任务状态 16999422】；\n" +
    "4.获取生成的图片:输入【$获取图片 taskId】，获取生成的图片，例如【$获取图片 16999422】；\n" +
    "5.查询余额：输入【$查询余额】可以查询当前服务的余额；\n" +
    "6.连续聊天：输入【$开始聊天】，即可开始连续聊天，输入【$结束聊天】，即可结束聊天；\n" +
    "7.查询目前用的是哪个服务：输入【$当前服务】；\n" +
    "8.帮助:输入【帮助】，查看当前帮助信息；\n" +
    "9.远程打开家里电脑：输入【$打开电脑】(管理员)。\n" +
    "10.远程关闭家里电脑：输入【$关闭电脑】(管理员)。\n" +
    "请注意，如果用的是百度AI作画或者阿里通义万象生成图片会返回taskId，然后用3的命令用taskId去查询任务状态，用4的命令去获取图片。\n" +
    "请注意，连续聊天功能会耗费大量的tokens，请节制使用。"
//存放用户的消息记录
var user_messages = {}
//存放用户当前是否处于连续聊天的状态,true-是,false-否
var user_status = {}
//存放用户开始聊天的时间
var user_time = {}
//设置30分钟过期时间
const EXPIRED_TIME = 1000 * 60 * 30

/**
 *  扫描二维码回调函数
 */
function onScan(qrcode, status) {
    if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
        const qrcodeImageUrl = [
            'https://wechaty.js.org/qrcode/',
            encodeURIComponent(qrcode),
        ].join('')
        log.info('StarterBot', 'onScan: %s(%s) - %s', ScanStatus[status], status, qrcodeImageUrl)
        notifBot.sendMessage("聊天机器人需要扫码登录！")
        qrcodeTerminal.generate(qrcode, { small: true })  // show qrcode on console

    } else {
        log.info('StarterBot', 'onScan: %s(%s)', ScanStatus[status], status)
    }
}

/**
 *  登陆成功回调函数
 */
function onLogin(user) {
    log.info('StarterBot', '%s login', user)
}

/**
 *  登出回调函数
 */
function onLogout(user) {
    log.info('StarterBot', '%s logout', user)
}

/**
 *  收到消息回调函数
 */
async function onMessage(msg) {
    //联系人
    const contact = msg.talker()
    //消息
    const message = msg.text()
    //联系人备注
    const alias = contact.alias()
    //回复消息
    let result
    //是否回复图片
    let isImgBack = false
    //生成图片、获取图片回调函数
    let getImgCallback = v => {
        if (v != undefined && v != null && v.length > 0) {
            isImgBack = true
            result = []
            v.forEach(item => {
                const fileBox = FileBox.fromUrl(item)
                result.push(fileBox)
            })
        } else {
            result = "生成图片失败，请重试。"
        }
    }

    log.info('收到联系人消息，联系人名称:' + contact.name() + ",联系人类型:" + contact.type())
    log.info('联系人类型:0=未知,1=个人,2=公众号,3=企业')
    log.info('联系人id:' + contact.id)
    log.info('消息：' + message)

    //来自自身的消息，不进行回复
    if (msg.self()) {
        return
    }
    //来自非个人的消息，不进行回复
    //   Unknown     = 0, 未知
    //   Individual  = 1, 个人
    //   Official    = 2, 公众号
    //   Corporation = 3, 企业
    if (contact.type() != types.Contact.Individual) {
        return
    }
    if (message.startsWith('$')) {
        if (message === '$开始聊天') {
            if (user_status.userId != undefined && user_status.userId != null && user_status.userId) {
                result = "已开启连续聊天，请不要重复开启！"
            } else {
                user_status.userId = true
                user_time.userId = new Date()
                result = "已开启连续聊天，会增加tokens的使用量，聊天内容请不要过长，30分钟未关闭连续聊天，会自动关闭。"
            }
        } else if (message === '$结束聊天') {
            delete user_status.userId
            delete user_messages.userId
            delete user_time.userId
            result = "已关闭连续聊天！"
        } else if (message === '$查询余额') {
            if (config.server.choose == 1) {
                await chatgpt.queryBalance().then(v => result = v)
            } else if (config.server.choose == 2) {
                await baidu.queryBalance().then(v => result = v)
            } else if (config.server.choose == 3) {
                await ali.queryBalance().then(v => result = v)
            } else {
                result = "未知服务"
            }
        } else if (message === '$当前服务') {
            if (config.server.choose == 1) {
                result = "当前服务为openAI的chatgpt和生成图片"
            } else if (config.server.choose == 2) {
                result = "当前服务为百度的文心一言和AI作画"
            } else if (config.server.choose == 3) {
                result = "当前服务为阿里的通义千问和通义万象"
            } else {
                result = "未知服务"
            }
        } else if (message.startsWith('$生成图片')) {
            //生成图片(taskid)回调函数
            let tmp = v => {
                if (v != undefined && v != null && v.length > 0) {
                    result = "正在生成图片，taskId:【" + v[0] + "】，稍后可以用taskId去获取图片。"
                } else {
                    result = "生成图片失败,可能对应的服务不支持生成图片。"
                }
            }
            let prompt = message.substr(6)
            if (config.server.choose == 1) {
                await chatgpt.generatIMG(prompt).then(getImgCallback)
            } else if (config.server.choose == 2) {
                await baidu.generatIMG(prompt).then(tmp)
            } else if (config.server.choose == 3) {
                await ali.generatIMG(prompt).then(tmp)
            } else {
                result = "未知服务"
            }
        } else if (message.startsWith('$查询任务状态')) {
            //查询任务状态回调函数
            let tmp = v => {
                if (v === 'SUCCEEDED') {
                    result = "任务成功，请用【$获取图片 taskId】获取图片。"
                } else if (v === 'RUNNING') {
                    result = "任务正在处理，请稍后再重新查询。"
                } else if (v === 'PENDING') {
                    result = "任务正在排队，请稍后再重新查询。"
                } else if (v === 'FAILED') {
                    result = "任务失败！"
                } else if (v === 'UNKNOWN') {
                    result = "任务不存在，请重新生成图片。"
                } else {
                    result = "任务异常，请重新生成图片。"
                }
            }
            let taskId = message.substring(8);
            if (config.server.choose == 1) {
                result = "只有百度AI作画或者阿里通义万象生成图片需要用taskId去获取图片，您可以输入【$当前服务】来查询当前使用的的服务。"
            } else if (config.server.choose == 2) {
                await baidu.getImgTaskStatus(taskId).then(tmp)
            } else if (config.server.choose == 3) {
                await ali.getImgTaskStatus(taskId).then(tmp)
            } else {
                result = "未知服务"
            }
        } else if (message.startsWith('$获取图片')) {
            let taskId = message.substring(6);
            if (config.server.choose == 1) {
                result = "只有百度AI作画或者阿里通义万象生成图片需要用taskId去获取图片，你可以输入【$当前服务】来查询当前使用的的服务。"
            } else if (config.server.choose == 2) {
                await baidu.getImg(taskId).then(getImgCallback)
            } else if (config.server.choose == 3) {
                await ali.getImg(taskId).then(getImgCallback)
            } else {
                result = "未知服务"
            }
        } else if (message === '$打开电脑') {
            if (alias === 'admin') {
                pcControl.wakeOnLAN(config.wol.mac)
                result = '指令发送成功,请稍后查看电脑的启动状态'
            } else {
                result = '您不是此bot的管理员，无权使用该命令!'
            }
        } else if (message === '$关闭电脑') {
            if (alias === 'admin') {
                pcControl.execCommand("shutdown -s -t 60", config.wol.ip, config.wol.user, config.wol.password)
                result = '指令发送成功，不出意外电脑将在60s后关闭'
            } else {
                result = '您不是此bot的管理员，无权使用该命令!'
            }
        } else {
            result = "未知命令，请输入【帮助】查看所有命令！"
        }
    } else if (message === '帮助') {
        result = helpMsg
    } else if (/^\s*$/.test(message)) {
        //空白消息，不进行回复
        return
    } else {
        //处于连续聊天状态
        if (user_status.userId != null && user_status.userId != undefined && user_status.userId) {
            let messages
            if (user_time.userId.getTime() + EXPIRED_TIME < new Date().getTime()) {
                //30分钟已到，连续状态到期
                delete user_status.userId;
                delete user_time.userId
                delete user_messages.userId
                messages = [];
                messages.push({ role: "user", content: message });
                if (config.server.choose == 1) {
                    await chatgpt.chat(messages).then(v => result = "连续聊天已关闭。\n" + v)
                } else if (config.server.choose == 2) {
                    await baidu.chat(messages).then(v => result = "连续聊天已关闭。\n" + v)
                } else if (config.server.choose == 3) {
                    await ali.chat(messages).then(v => result = "连续聊天已关闭。\n" + v)
                } else {
                    result = "未知服务"
                }

            } else {
                //处于连续聊天状态，从user_messages里拿历史记录
                messages = user_messages.userId
                if (messages == null || messages == undefined) {
                    messages = []
                }
                messages.push({ role: "user", content: message })
                //获取ai返回消息回调函数
                let tmp = v => {
                    if (v == undefined || v == null || v == "") {
                        result = "服务异常，请稍后再试！"
                    } else {
                        messages.push({ role: "assistant", content: v });
                        user_messages.userId = messages
                        result = v
                    }
                }
                if (config.server.choose == 1) {
                    await chatgpt.chat(messages).then(tmp)
                } else if (config.server.choose == 2) {
                    await baidu.chat(messages).then(tmp)
                } else if (config.server.choose == 3) {
                    await ali.chat(messages).then(tmp)
                } else {
                    result = "未知服务"
                }

            }
        } else {
            //获取ai的返回信息,单问单答
            //消息体
            let messages = [
                {
                    role: "user",
                    content: message
                }
            ]
            //获取AI返回消息回调函数
            let tmp = v => {
                result = v
            }
            if (config.server.choose == 1) {
                await chatgpt.chat(messages).then(tmp)
            } else if (config.server.choose == 2) {
                await baidu.chat(messages).then(tmp)
            } else if (config.server.choose == 3) {
                await ali.chat(messages).then(tmp)
            } else {
                result = "未知服务"
            }

        }
    }
    //如果是发送图片，result是列表，遍历发送图片
    if (isImgBack) {
        result.forEach(item => {
            msg.say(item)
        })
    } else {
        log.info("回复消息:" + result)
        await msg.say(result)
    }
}

/**
 * 好友请求回调函数
 */
async function onFriendship(friendship) {
    try {
        let friend = friendship.contact()
        let message = friendship.hello()
        switch (friendship.type()) {
            /**
             *
             * 1. New Friend Request
             *
             */
            case types.Friendship.Receive:
                log.info('接收到好友:' + friend.name() + '的请求验证信息:' + message)
                await friendship.accept()
                log.info("已成功添加好友:" + friend.name())
                //延迟1s
                await new Promise(r => setTimeout(r, 1000))
                await friend.say(helpMsg)
                log.info("发送给好友消息:" + helpMsg)
                break

            /**
             *
             * 2. Friend Ship Confirmed
             *
             */
            case types.Friendship.Confirm:
                log.info('friend ship confirmed with ' + friendship.contact().name())
                break
        }
    } catch (e) {
        log.error(e.message)
    }
}

const bot = WechatyBuilder.build({
    name: config.server.name,
})

bot.on('scan', onScan)
bot.on('login', onLogin)
bot.on('logout', onLogout)
bot.on('message', onMessage)
bot.on('friendship', onFriendship)

bot.start()
    .then(() => log.info('StarterBot', 'Starter Bot Started.'))
    .catch(e => log.error('StarterBot', e))