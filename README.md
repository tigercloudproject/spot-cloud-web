# 币币交易 - bbx-spot-web

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
    顶部导航--    pc/component/pc-header.js 下 className="pc-header" 容器
    市场--        pc/exchange/index.js 下 className="exchange-market-box" 容器
    交易深度--     pc/exchange/index.js 下 className="exchange-depth-box" 容器
    实时成交--     pc/exchange/index.js 下 className="exchange-transaction-box" 容器
    公告--        pc/exchange/index.js 下  className="exchange-notice-box" 容器
    币种介绍--    pc/exchange/index.js 下 className="introduce-box" 容器
