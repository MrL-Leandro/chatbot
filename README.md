# About

A personnal chatbot develop use [Wechaty](https://github.com/wechaty/wechaty/)

# Features

1. 单问单答：如果只想让AI回答问题，请直接输入问题，例如【马化腾是谁】；
2. 生成图片：如果要生成图片请说：【$生成图片 描述】，例如【$生成图片 打篮球的鸡】；
3. 查询生成图片任务状态:输入【$查询任务状态 taskId】，查询生成图片任务状态，例如【$查询任务状态 16999422】；
4. 获取生成的图片:输入【$获取图片 taskId】，获取生成的图片，例如【$获取图片 16999422】；
5. 查询余额：输入【$查询余额】可以查询当前服务的余额；
6. 连续聊天：输入【$开始聊天】，即可开始连续聊天，输入【$结束聊天】，即可结束聊天；
7. 查询目前用的是哪个服务：输入【$当前服务】；
8. 帮助:输入【帮助】，查看当前帮助信息；
9. 远程打开家里电脑：输入【$打开电脑】(管理员)。
10. 远程关闭家里电脑：输入【$关闭电脑】(管理员)。
请注意，如果用的是百度AI作画或者阿里通义万象生成图片会返回taskId，然后用3的命令用taskId去查询任务状态，用4的命令去获取图片。
请注意，连续聊天功能会耗费大量的tokens，请节制使用。



# How to use

## Step 1: Clone this Repository

```bash
git clone https://github.com/MrL-Leandro/chatbot.git
cd chatbot
```

## Step 2: Install Dependencies

You need to install dependencies by running the command below.

```bash
npm install
```

## Step 3: change configuration

edit file `/src/config.js`,add your own key or token or whatever 

```js
const config = {
    // 全局设置
    server: {
        // 接口服务选择 1-openAI-chatGPT,2-百度-文心一言,3-阿里-通义千问,4-Microsoft-newBing
        choose: 1,
        // 机器人名称
        name: 'chatbot-mrl'
    },
    // openAI设置
    openAI: {
        // APIkey
        key: '',
        // 代理域名
        domain: 'openai.api2d.net',
        // 协议
        protocol: 'https',
        // openAI聊天的设置
        chat: {
            // ai聊天用到的模型
            model: 'gpt-3.5-turbo',
            // 聊天时生成的最大tokens数 默认无限，实际上超过4096会报错
            max_tokens: '',
        },
        // openAI生成文本的设置
        text: {
            // 生成的文本最大tokens数 默认16
            max_tokens: 1000,
            // 文本生成用到的模型
            model: 'text-davinci-003',
        },
        // openAI生成图片的设置
        img: {
            // 生成的图片数量 1-10 默认1
            num: 1,
            // 生成的图片大小 256x256, 512x512, or 1024x1024 默认1024x1024
            size: '512x512',
            // 生成的图片返回形式 url or b64_json,默认url【base64日志会占用大量空间，强烈建议用url的方式】
            responseFormat: 'url',
        },
    },
    // 百度云文心一言设置
    baidu: {
        // 文心千帆appid
        appId: '',
        // 文心千帆apikey
        apiKey: '',
        // 文心千帆secretKey
        secretKey: '',
        // 百度账号accessKey
        account: {
            accessKey: '',
            // 百度账号secretKey
            secretKey: '',
        },
        // 百度获取ACCESS_TOKEN接口地址
        getToken: {
            url: 'https://aip.baidubce.com/oauth/2.0/token',
        },
        // 百度云文心一言URL
        // ERNIE-Bot
        wenxinyiyan: {
            url: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions',
            // ERNIE-Bot-turbo
            // wenxinyiyan.url: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/eb-instant',
        },
        // 百度AI作画参数设置
        aizuohua: {
            // 百度AI作画URL
            // 基础版
            url: 'https://aip.baidubce.com/rpc/2.0/ernievilg/v1/txt2img',
            // 高级版
            // url: 'https://aip.baidubce.com/rpc/2.0/ernievilg/v1/txt2imgv2',
            // 百度AI作画获取图片
            // 基础版
            getImg: {
                URL: 'https://aip.baidubce.com/rpc/2.0/ernievilg/v1/getImg',
            },
            // 高级版
            // getImg.URL: 'https://aip.baidubce.com/rpc/2.0/ernievilg/v1/getImgv2',
            // 图片大小，支持1024*1024、1024*1536、1536*1024，默认1024*1024
            size: '1024*1024',
            // 图片数量，支持1-6张，默认1
            num: 1,
            // 图片风格，支持目前支持风格有：探索无限、古风、
            // 二次元、写实风格、浮世绘、low poly 、
            // 未来主义、像素风格、概念艺术、赛博朋克、洛丽塔风格、
            // 巴洛克风格、超现实主义、水彩画、蒸汽波艺术、油画、卡通画
            style: '二次元',
        },
    },
    // 阿里云通义千问设置
    aliyun: {
        // 通义千问apiKey
        appKey: 'sk-',
        // 通义千问接口地址
        tongyiqianwen: {
            url: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
        },
        // 通义万象接口地址
        tongyiwanxiang: {
            url: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis',
            // 通义万象获取图片接口地址
            getImg: {
                url: 'https://dashscope.aliyuncs.com/api/v1/tasks',
            },
            // 通义万象参数设置
            // 生成的图片风格
            // "<photography>" 摄影,
            // "<portrait>" 人像写真,
            // "<3d cartoon>" 3D卡通,
            // "<anime>" 动画,
            // "<oil painting>" 油画,
            // "<watercolor>"水彩,
            // "<sketch>" 素描,
            // "<chinese painting>" 中国画,
            // "<flat illustration>" 扁平插画,
            // "<auto>" 默认
            style: 'auto',
            // 生成的图片数量 1-10 默认1
            num: 1,
            // 生成的图片大小 1024*1024, 720*1280, 1280*720,默认1024*1024
            size: '1024*1024',
        },
    },
    // pushdeer通知设置
    pushdeer: {
        url: 'https://api2.pushdeer.com/message/push',
        pushkey: '',
    },
    // wol唤醒
    wol: {
        // 要唤醒的主机ip地址
        ip: '192.168.1.1',
        // 要唤醒的主机mac地址
        mac: '',
        // 要唤醒的主机子网掩码
        mask: '255.255.255.0',
        // 要唤醒的主机ssh用户名，用于执行cmd命令来远程关机
        user: '',
        // 要唤醒的主机ssh密码，用于执行cmd命令来远程关机
        password: '',
    }
};

module.exports = config;
```

## Step 4: Run the Bot

```bash
npm start
```

