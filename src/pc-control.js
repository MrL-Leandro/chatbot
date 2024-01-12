/**
 * 电脑控制，WOL、连接ssh执行命令
 */

const net = require('net');
const udp = require('dgram');
const { Client } = require('ssh2');

/**
 * 创建魔术封包
 * @param {string} mac 网卡MAC地址
 * @returns {Buffer}
 */
function createMagicPacket(mac) {
    mac = mac.replace(/[^0-9a-fA-F]/g, '');

    if (mac.length != 12) {
        throw new Error(`Bad MAC address "${mac}"`);
    }

    const bufMac = Buffer.from(mac, 'hex');

    let bufRes = Buffer.alloc(6, 0xff);
    for (let i = 0; i < 16; i++) {
        bufRes = Buffer.concat([bufRes, bufMac]);
    }

    return bufRes;
}

/**
 * 通过网络唤醒
 * @param {string} mac 网卡MAC地址
 * @param {object} options 可选项
 * @returns {Promise<boolean>}
 */
function wakeOnLAN(mac, options) {
    options = Object.assign({
        address: '255.255.255.255',
        port: 7
    }, options);

    return new Promise((resolve, reject) => {
        const packet = createMagicPacket(mac);

        const socket = udp.createSocket(
            net.isIPv6(options.address) ? 'udp6' : 'udp4'
        );

        socket.on('error', function (err) {
            socket.close();
            reject(err);
        });

        socket.once('listening', function () {
            socket.setBroadcast(true);
        });

        socket.send(
            packet,
            0,
            packet.length,
            options.port,
            options.address,
            function (err, res) {
                socket.close();
                if (err) {
                    return reject(err);
                }
                resolve(res == packet.length);
            }
        );
    });
}

/**
 * 远程连接ssh并执行命令
 * @param {string} cmd 执行的命令 
 * @param {string} ip 连接的终端ip 
 * @param {string} username 用户名
 * @param {string} password 密码
 */
function execCommand(cmd,ip,username,password) {
    const conn = new Client()
    conn.on('ready', () => {
        console.log('连接成功');
        conn.exec(cmd, (err, stream) => {
            if (err) throw err;
            stream.on('close', (code, signal) => {
                console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
                conn.end();
            }).on('data', (data) => {
                console.log('STDOUT: ' + data);
            }).stderr.on('data', (data) => {
                console.log('STDERR: ' + data);
            });
        });
    }).on("error",()=>{
        console.log("连接错误")
    }).on("end",()=>{
        console.log("连接结束")
    }).on("close",()=>{
        console.log("连接断开")
    }).connect({
        host: ip,
        port: 22,
        username: username,
        password: password
    });
}

// wakeOnLAN("08-BF-B8-A4-3F-49")

module.exports = {
    wakeOnLAN,
    execCommand,
};


