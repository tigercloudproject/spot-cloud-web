# CHANGELOG

## 0.1.0.1014
### a
- C 调整 `.gitignore`
- A 添加Changelog
### b
- A 区分生产和测试两个模式，使用不同指令进行控制，避免修改path的后遗症
- F 修复webpack server的domain保护机制，目前只会在 RUNES_ENV=development 时才会避免domain校验
- F 修复测试模式下因frame跨域造成的持续报错
- A 新增 Production_Public_Path，统一修改 publicPath
- C 调整`README.md`的内容
- F 修复 `charting_library.min.js` 域名错误
- F 补全本地缺省文件 `dash.css`
- F 更改`./src`前端文件的模式控制方式
- C 调整 `.gitignore`
- C 调整 node build 的规则
### c
- R 去掉 `./public/index.html` CNZZ 代码
- C 调整 node build 配置
- U 优化
