# 币币云 - spot-cloud-web

## 部署本地开发环境

### 1.安装依赖

- [Install Node.js 10.x](http://nodejs.org)：前端脚手架依赖

### 2.部署包

```bash
# bash
npm install
npm install webpack -g
```

### 3.选择build模式

#### 本地开发模式

```bash
# bash
npm start
```
打开<http://localhost:3000>

#### build开发测试版

```bash
# bash
npm run dev-build
```
打包 `./build` 文件夹

#### build生产版

```bash
# bash
npm run build
```
打包 `./build` 文件夹

## 更改Public的步骤及逻辑

- 前端 src
    - `./src/hostConfig.js`
        - 依靠 `document.domain` 进行判断，为 `test.bbx.com` 域名访问时，则为测试、开发模式，否则生产模式
        - `publicPath` 的值
- node build
    - `./config/paths.js`
        - 依靠 `process.env.RUNES_ENV` 的值为 development 就是测试、开发环境，其他则为生产
        - `Production_Public_Path` 的值
