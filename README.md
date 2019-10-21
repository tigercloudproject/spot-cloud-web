# 币币交易 - bbx-spot-web
- 老虎币币云前端demo
- 该项目使用了react框架，有关工作原理的详细说明请查看官方文档
- 项目方需自己实现登陆注册功能，本demo只提供币币交易功能

最快本地部署流程：

1.git clone 项目或 download zip 项目包

2.安装项目依赖包
    npm install
    npm install webpack -g

3.配置

## 部署

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
    - `./src/hostConfig.js`
        - 依靠 `document.domain` 进行判断，为 `test.bbx.com` 域名访问时，则为测试、开发模式，否则生产模式
        - `publicPath` 的值
- node build
    - `./config/paths.js`
        - 依靠 `process.env.RUNES_ENV` 的值为 development 就是测试、开发环境，其他则为生产
        - `Production_Public_Path` 的值


## 登录、退出相关逻辑
- 退出:     pc/component/user_info  此文件内 可自行添加相关内容， 例：kyc身份认证、api管理等等。。。。
- 登录：


- 交易页：
    顶部导航--     文件：pc/component/pc-header.js
                  引用：pc/component/pc-header.js 下 className="pc-header" 容器

    市场--        文件：pc/exchange/exchange_market.js
                  引用：pc/exchange/index.js 下 className="exchange-market-box" 容器

    交易深度--     文件：pc/exchange/exchange_depth.js
                  引用：pc/exchange/index.js 下 className="exchange-depth-box" 容器

    实时成交--     文件：pc/exchange/exchange_transaction.js
                  引用：pc/exchange/index.js 下 className="exchange-transaction-box" 容器

    公告--        文件：pc/exchange/exchange_notice.js
                  引用：pc/exchange/index.js 下  className="exchange-notice-box" 容器

    币种介绍--    文件：pc/exchange/exchange_introduce.js
                 引用：pc/exchange/index.js 下 className="introduce-box" 容器


# 功能介绍
- 登录
- 退出
- 切换交易对->币种介绍
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
