# 老虎云币币交易 - 前端 Demo

> 该项目使用了react框架，有关工作原理的详细说明请查看官方文档
> 项目方需自己实现登陆注册功能，本demo只提供币币交易功能
> 只有开发环境需要 Node.js 支持

## 部署

#### 1. 安装依赖环境

-   [Install Node.js 8.x/10.x](http://nodejs.org): 开发环境依赖

#### 2. git clone 项目或 download zip 项目包

#### 3. 开发环境安装项目依赖包

``` bash
# install dependencies
npm install

# install global webpack
npm install webpack -g
```

#### 4. 配置各模式的.env

项目共三种运行模式，根目录下存在三个 `.env.**` 的文件，分别对应各个模式。`.env.**` 内有各项参数的注释说明。
- `.env.development` 开发模式配置
- `.env.test` 测试模式配置
- `.env.production` 生产模式配置

#### 5. 运行模式

##### 开发模式

本模式会启动 `webpackDevServer`。

1.  配置 `.env.development` 。其 `HOST` 为自己所需的域名（后续步骤中的 domain 也请一并修改），默认为127.0.0.1。老虎云接口默认为测试API。
2.  本地host配置相关domain。因为 Webpack 会检查该 `HOST`，如果找不到则会中断报错。
    ```
    127.0.0.1 spot.bbx.com
    ```
3.  运行
    ```bash
    npm start
    ```
4.  等待显示出 `spot.bbx.com:3000` 后再进行访问

##### 测试模式

1.  配置 `.env.test`。老虎云接口默认为测试API。
2.  运行
    ```bash
    npm run test
    ```
    会在根目录生成 `./build` 文件夹
3.  请把 `./build` 文件夹打包上传至测试服
4.  配置 nginx 的 try_files
```
location / {
    add_header X-Frame-Options SAMEORIGIN;
    root /data/www/build;
    try_files $uri /index.html;
}
```

##### 生产模式

1.  配置 `.env.production`。老虎云接口默认为正式API。
2.  运行
    ```bash
    npm run build
    ```
    会在根目录生成 `./build` 文件夹
3.  请把 `./build` 文件夹打包上传至正式服
4.  配置 nginx 的 try_files
```
location / {
    add_header X-Frame-Options SAMEORIGIN;
    root /data/www/build;
    try_files $uri /index.html;
}
```

## 说明

### 账号流程演示

1. 打开页面后，点击右上角的按钮
<img src="https://gitlab.com/bbx-tech-team/rd-team/web-team/bbx-spot-web/raw/master/README/assets/images/img1.jpg" width="768" hegiht="auto" align="center" />
2. 当前会自动填写注册信息，这里需要记录下邮箱地址，注册密码是**111111**
<img src="https://gitlab.com/bbx-tech-team/rd-team/web-team/bbx-spot-web/raw/master/README/assets/images/img2.jpg" width="768" hegiht="auto" align="center" />
3. 注册完成后，点开头像点击UID，进入账号信息
<img src="https://gitlab.com/bbx-tech-team/rd-team/web-team/bbx-spot-web/raw/master/README/assets/images/img3.jpg" width="768" hegiht="auto" align="center" />
4. 这里的 Demo，演示交易所转钱、查询账户的功能，
<img src="https://gitlab.com/bbx-tech-team/rd-team/web-team/bbx-spot-web/raw/master/README/assets/images/img4.jpg" width="768" hegiht="auto" align="center" />

### 接口

项目内所有请求分为 `交易所接口` 和 `老虎云接口`。  

#### 老虎云接口

Request Headers 必须带上以下 Key:

- `Bbx-Accesskey`: 服务器返还的 access key
- `Bbx-ExpiredTs`: 服务器返还的时间戳有效期
- `Bbx-Uid`: 云用户id，非交易所用户id
- `Bbx-Sign`: 签名，公式请在 `./src/http.js` 内查看
- `Bbx-Ver`: 固定版本值
- `Bbx-Dev`: 固定模式值
- `Bbx-Ts`: 前端生成的当前请求时间戳
- `Bbx-Ssid`: 针对移动设备专用，web端为空

针对这部分的配置，可查看 `./src/http.js`。

#### 交易所接口

由于 `交易所接口` 需要第三方来部署，因此本项目包含 Demo 性质的模拟接口数据，可在对应模式的 `./env.**` 文件中的 `SIM_RESPONSE` 配置为 `true`， 即可打开体验。  
模拟接口数据存放在 `./public/_simResponse` 内。  
由于采用 `axios.interceptors` ，为了区分两大规则的接口，这里采用在
 Request 时给 Headers 新增 `Skip-Set-Axios-Headers: 'true'`，即可跳过 `老虎云接口` 的 Headers 配置，防止 Headers 污染。

以下为 Demo 中已完成的接口例子，可在 `./ajax.js` 中修改成交易所的接口地址

- userAjax.child_token: 从交易所获得子账号token等必要参数
- userAjax.register: 交易所的用户账号注册
- userAjax.login: 交易所的用户账号登录
- userAjax.logout: 交易所的用户账号登出
- userAjax.asset_app2account: 交易所内的母账号给子账号（本账号）转钱
- userAjax.asset_query_account: 交易所内查询本账号的资产

### 缓存机制

- 当前的账号登录判定以 Cookies `bbx_token` 是否存在为条件。

### 组件

*容器名+'-h5'则为移动端界面*

| 组件名称 | 文件 | 容器名 |
|----------|-----------------------------------------|--------------------------------------|
| 顶部导航 | src/pc/component/pc-header.js | className="pc-header" |
| 市场 | src/pc/exchange/exchange_market.js | className="exchange-market-box" |
| 交易深度 | src/pc/exchange/exchange_depth.js | className="exchange-depth-box" |
| 实时成交 | src/pc/exchange/exchange_transaction.js | className="exchange-transaction-box" |
| 公告 | src/pc/exchange/exchange_notice.js | className="exchange-notice-box" |
| 币种介绍 | src/pc/exchange/exchange_introduce.js | className="introduce-box" |
| 登录 | src/pc/register/login.js | className="login-box" |
| 注册 | src/pc/register/register.js | className="login-box" |

### 功能点

- 账号注册、登录、登出
- 合并深度保留1、2位小数
- 委托展示: 卖和买、只买、只卖
- 限价委托购买、卖出
- 市价委托购买、卖出
- 当前委托展示
- 历史委托展示
- 交易记录展示
- 是否显示其他交易对
- 批量撤单
- 查看所有操作记录
- 点击深度价格进行相应买卖
- 点击眼睛: 展示和隐藏资产
- 语言切换: 支持简体中文、繁体中文、英文、韩文等语种
- 切换交易对可改变币种介绍

## FAQ

1. 修改 `币种介绍` 的文本内容  
    目前通过接口 `coinBrief` 动态获取，可针对该接口做处理
2. Response 返回 `invalid request`  
    请检查 Request Headers 中是否带有 `Bbx-Accesskey`、`Bbx-ExpiredTs`、`Bbx-Uid`、`Bbx-Sign`、`Bbx-Ver`、`Bbx-Dev`、`Bbx-Ts`、`Bbx-Ssid` 这些key。如有缺少，则需要在 `./src/http.js` 下进行配置。
3. 修改css样式后会被删除  
    编辑样式时，需修改 `.scss` 文件，同文件名的 `.css` 为自动生成
