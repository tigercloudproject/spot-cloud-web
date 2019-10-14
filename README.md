# 币币云 - spot-cloud-web

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
    
## 发布至生产环境（上线）



## 更改Public的步骤及逻辑

- 前端 src
    - `./src/hostConfig.js`
        - 依靠 `document.domain` 进行判断，为 `test.bbx.com` 域名访问时，则为测试、开发模式，否则生产模式
        - `publicPath` 的值
- node build
    - `./config/paths.js`
        - 依靠 `process.env.RUNES_ENV` 的值为 development 就是测试、开发环境，其他则为生产
        - `Production_Public_Path` 的值
