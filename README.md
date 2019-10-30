# 币币交易 - bbx-spot-web

> 老虎币币云前端demo
> 该项目使用了react框架，有关工作原理的详细说明请查看官方文档
> 项目方需自己实现登陆注册功能，本demo只提供币币交易功能

## 部署

#### 1. 安装依赖环境

*仅限本地开发环境*
-   [Install Node.js 8.x/10.x](http://nodejs.org)

#### 2. git clone 项目或 download zip 项目包

#### 3. 安装项目依赖包

*仅限本地开发环境*
``` bash
# install dependencies
npm install

# install global webpack
npm install webpack -g
```

#### 4. 配置

##### 各模式的 .env 配置

根目录下存在两个 `.env` 的文件，各项参数的说明请直接参看文件内的注释部分。如果要更改配置项，优先在这里面
- `.env.development` 本地开发配置项  
- `.env.production` build配置项  

？？？？？？？
修改成自己的接口

本地模拟接口数据

1.env 配置


？？？？？？？？？？？

#### 5. 运行模式

项目共两种运行模式，具体请参考 **Mode** 中所提供的步骤进行操作。

## Mode

### 本地开发模式

对应根目录的 `.env.development`，会自动启动 webpack-dev-server。

#### 步骤

1.  配置 `.env.development` 内的 `HOST` 为自己所需的域名（修改后需修改后续步骤中的domain）
2.  本地host配置相关domain
    ```
    127.0.0.1 test.bbx.com
    ```
3.  运行
    ```bash
    npm start
    ```
4.  等待显示出 `test.bbx.com:3000` 后再进行访问

### 生产、测试build模式

对应根目录的 `.env.production`。

#### 步骤

1.  配置 `.env.development` 内的 `HOST` 为自己所需的域名（修改后需修改后续步骤中的domain）
2.  本地host配置相关domain
    ```
    127.0.0.1 test.bbx.com
    ```
3.  运行
    ```bash
    npm start
    ```
4.  等待显示出 `test.bbx.com:3000` 后再进行访问



- 生产环境部署
    ```bash
    # bash
    npm run build
    ```
- 测试、开发环境部署
    ```bash
    # bash
    npm run dev-build
    ```
    访问<http://test.bbx.com:3000>
- 本地启服
    ```bash
    # bash
    npm start
    ```

## 更改Public的步骤及逻辑

- 前端 src
    - `./src/config.js`
        - 依靠 `document.domain` 进行判断，为 `test.bbx.com` 域名访问时，则为测试、开发模式，否则生产模式
        - `publicPath` 的值
- node build
    - `./config/paths.js`
        - 依靠 `process.env.RUNES_ENV` 的值为 development 就是测试、开发环境，其他则为生产
        - `Production_Public_Path` 的值


## 登录、退出相关逻辑
- 退出:     pc/component/user_info  此文件内 可自行添加相关内容， 例：kyc身份认证、api管理等等。。。。
- 登录：


## 组件

| 组件名称 | 文件 | 容器 |
|----------|-----------------------------------------|--------------------------------------|
| 顶部导航 | src/pc/component/pc-header.js | className="pc-header" |
| 市场 | src/pc/exchange/exchange_market.js | className="exchange-market-box" |
| 交易深度 | src/pc/exchange/exchange_depth.js | className="exchange-depth-box" |
| 实时成交 | src/pc/exchange/exchange_transaction.js | className="exchange-transaction-box" |
| 公告 | src/pc/exchange/exchange_notice.js | className="exchange-notice-box" |
| 币种介绍 | src/pc/exchange/exchange_introduce.js | className="introduce-box" |
| 登录 | src/pc/register/login.js | className="login-box" |
| 注册 | src/pc/register/register.js | className="login-box" |

*容器名+'-h5'则为移动端界面*

## FAQ

1. 修改 `币种介绍` 的文本内容  
    目前通过接口 `coinBrief` 动态获取，可针对该接口做处理
2. Response 返回 `invalid request`  
    请检查Request Header中是否带有 `Bbx-Accesskey`、`Bbx-ExpiredTs`、`Bbx-Uid`、`Bbx-Sign`、`Bbx-Ver`、`Bbx-Dev`、`Bbx-Ts` 这些key。如果有缺少，则需要在 `./assets/js/axiosClassYun` 下进行配置。一般不会出现这问题。


账号的登录、登出、注册机制
账号登录后，更新 `Cookie` 内的 `token`、`ssid`、`uid` 并写入 ，用户数据写入 `localStorage` 的 `user`；
账号登出后，删除 `Cookie` 内的 `token`、`ssid`、`uid`，清除 `localStorage` 的 `user`。


localStorage.setItem("user", JSON.stringify(data));
}
setCookie("token", token, 1, CFG.mainDomainName, "/");
setCookie("ssid", ssid, 1, CFG.mainDomainName, "/");
setCookie("uid", uid, 1, CFG.mainDomainName, "/");


# 功能介绍
- 登录
- 退出

- 合并深度保留  1、2位小数
- 委托展示:卖和买、只买、只卖
- 限价委托购买、卖出
- 市价委托购买、卖出
- 当前委托展示
- 历史委托展示
- 交易记录展示
- 是否显示其他交易对
- 批量撤单
- 查看所有操作记录
- 点击深度价格进行相应买卖
- 点击眼睛 展示和隐藏资产
- 语言切换：支持简体中文、繁体中文、英文、韩文等语种

- 切换交易对->币种介绍




token 来自 response.headers["bbx-token"]
ssid  response.headers["bbx-ssid"]
uid response.headers["bbx-uid"]

ls user 来自用户数据


从 Response Headers 获得 `bbx-token`、`bbx-ssid`、`bbx-uid`，在有值的情况下存入 Cookie 的 `token`、`ssid`、`uid`。
当 Request 时，从在其 Headers 中加入 `Bbx-Ts`、`Bbx-Ver`、`Bbx-Dev`、`Bbx-Accesskey`、`Bbx-ExpiredTs`、`Bbx-Sign`、`Bbx-Ssid`、`Bbx-Uid`。

本 Demo 模拟了账号 Request，


http.js 要删掉
let bbxToken = response.headers[ "bbx-token" ] || 'f5a58f3011fc34fb4e6befbd0c1229b6'
  , bbxSsid = response.headers[ "bbx-ssid" ] || ''
  , bbxUid = response.headers[ "bbx-uid" ] || '2090193280';


  if ( response.config.url.indexOf( '_simResponse/login' ) === 0 ) {
      bbxToken = 'f5a58f3011fc34fb4e6befbd0c1229b6'
      bbxSsid = '';
      bbxUid = '2090193280';
  };


Headers 内 { 'Skip-Set-Axios-Headers': true }




user.redux.js
    loginPost  要改成 get
    registerPost 要改成 get


    v1/ifglobal/global                               全局配置
v1/ifglobal/userConfigs                       用户配置
v1/ifglobal/appBuilds

v1/ifaccount/verifyCode                         验证码
v1/ifaccount/users/register                    注册
v1/ifglobal/phoneCode                         手机号前缀
v1/ifaccount/login                                登录
v1/ifaccount/users/resetPassword        重置密码
v1/ifaccount/bindEmail                        绑定邮箱
v1/ifaccount/bindPhone                       绑定手机
v1/ifaccount/users/active
v1/ifaccount/logout                             登出
v1/ifaccount/captchCheck?action=      检查是否需要图片验证码

v1/ifmarket/v2/spotTickers
bbx_websocket

v1/ifmarket/spotDetail         现货交易信息
v1/ifmarket/v2/spot?            
v1/ifmarket/submitOrder      提交订单           post
v1/ifmarket/getOrders          委托记录           get
v1/ifmarket/getUserTrades    用户交易记录    get
v1/ifmarket/cancelOrder       撤销订单           post
v1/ifmarket/cancelOrders     批量撤单            post
v1/ifmarket/stocks              获取现货对          get
v1/ifglobal/coinBrief           币种介绍              get


v1/ifaccount/users/me         获取用户资产



token 云token
ssid  云ssid，非web的设备上使用
uid 云uid




用户token  user_token
