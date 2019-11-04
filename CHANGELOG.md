# CHANGELOG

## 1.2.0.1104
### a
- C 更新 README.md
- U 移除冗余代码
### b
- C 调整 `e-exchange-token` 为 `v-exchange-token`
- C 更新 README.md
### c
- R update.sh、languageRes.plist
- C 更新 README.md

## 1.2.0.1101
### a
- F 修复 websocket 死循环请求机制
- C 调整 页面加载loading过长
- F 修复 买入时的信息警告
- C 调整 .env.development HOST 为 127.0.0.1
- C 调整 src/ajax.js child_token
- C 补全 README.md
### b
- C 更新 README.md

## 1.1.3.1025
### a
- R 移除cnzz、google监测
- R 移除线路测速
- C 调整 `spotDetail`
- A 添加 `public/_simResponse` Demo 模拟接口
- C 调整运行模式

## 1.1.2.1014
### a
- C 调整线路测试中的best为<https://bbx-static.oss-accelerate.aliyuncs.com/ping>
- C 调整 `.gitignore`
- R 移除 git 内 `./build/index.html` 、 `./build1/static/tv-chart.fe3192321931572c06b8.html`
### b
- F 修复 coin pair 切换时，url param 内会出现 qd=undefined 的现象
- F 修复 coin pair 切换时，底部简介并不会跟着切换的现象

## 1.1.2.1012
### a
- C 调整 node build 的规则
- C 优化 `README.md` 的部署说明

## 1.1.1.1011
### a
- A 区分生产和测试两个模式，使用不同指令进行控制，避免修改path的后遗症
- F 修复webpack server的domain保护机制，目前只会在 RUNES_ENV=development 时才会避免domain校验
- F 修复测试模式下因frame跨域造成的持续报错
- A 新增 Production_Public_Path，统一修改 publicPath
- C 调整`README.md`的内容
- F 修复 `charting_library.min.js` 域名错误
### b
- F 补全本地缺省文件 `dash.css`
### c
- C 合并`线路测速功能分支`
- C 调整当测速超时后，不把超时数据-1和正常数据合并在一起，会更改名称为 `x ` 开头，从而进行区分
### d
- F 更改`./src`前端文件的模式控制方式
### e
- F 调整 `build/index.html`

## 1.1.0.1008
### a
-   C 修改publicUrl

## 1.1.0.1001
## a
-   C publicPath等所有静态资源路径，调整为 https://bbx-static.oss-accelerate.aliyuncs.com/

## 1.1.0.0929 - 线路测速功能分支
### a
- A 增加路线自动测速后，取中间值并上传至cnzz事件监听
- E `public/index.html` 中配置线路测速项
### b
- C 修改配置
### c
- F 线路测试，调整为complete触发机制，判断timeout

## 1.1.0.0910
### a
-   A CHANGELOG.md版本记录
-   E assets.redux.js中 getRechargeAddress(获取充值地址)添加回调方法
-   F 修复选择币种,切换地址bug,变量缓存引起
-   E 选择充值币种，添加进缓存，不再请求
