/**
 *  根据配置文件，返回对应服务
 */
const config = require("./config");
const chatgpt = require('./chatgpt');
const baidu = require('./baidu');
const ali = require('./ali');

let server
/**
 * 获取当前服务
 * @returns 
 */
function getServer() {
    if (server == null || server == undefined) {
        switch(config.server.choose){
            case 1:
                server = chatgpt
                break
            case 2:
                server = baidu
                break
            case 3:
                server = ali
                break
            default:
                throw new Error('请在配置文件中配置正确的服务！');
                
        }
    }
    return server
}

/**
 * 生产图片是否需要任务id
 * true-是，false-否
 * @returns boolean
 */
function isTaskImg() {
    return "2" == config.server.choose || "3" == config.server.choose
}

module.exports = {
    getServer,
    isTaskImg
}