

const path = require("path");
const fs = require("fs");
const url = require("url");

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const Production_Public_Path = 'https://bbx-static.oss-accelerate.aliyuncs.com';
const Development_Public_Path = '/';

const Default_Public_Path = process.env.RUNES_PUBLIC_PATH = process.env.RUNES_ENV === 'development' ? Development_Public_Path : Production_Public_Path;

const envPublicUrl = process.env.PUBLIC_URL;

function ensureSlash(path, needsSlash) {
  const hasSlash = path.endsWith("/");
  if (hasSlash && !needsSlash) {
    return path.substr(path, path.length - 1);
  } else if (!hasSlash && needsSlash) {
    return `${path}/`;
  } else {
    return path;
  }
}

const getPublicUrl = appPackageJson =>
  envPublicUrl || require(appPackageJson).homepage;

// We use `PUBLIC_URL` environment variable or "homepage" field to infer
// "public path" at which the app is served.
// Webpack needs to know it to put the right <script> hrefs into HTML even in
// single-page apps that may serve index.html for nested URLs like /todos/42.
// We can't use a relative path in HTML because we don't want to load something
// like /todos/42/static/js/bundle.7289d.js. We have to know the root.
// function getServedPath(appPackageJson) {
//   const publicUrl = getPublicUrl(appPackageJson);
//   const servedUrl =
//     envPublicUrl || (publicUrl ? url.parse(publicUrl).pathname : 'https://static.bbx.com/');
//   return ensureSlash(servedUrl, true);
// }
// function getServedPath(appPackageJson) {
//   const publicUrl = getPublicUrl(appPackageJson);
//   const servedUrl =
//     envPublicUrl || (publicUrl ? url.parse(publicUrl).pathname : 'https://static.bbxapp.net/');
//   return ensureSlash(servedUrl, true);
// }
// function getServedPath(appPackageJson) {
//   const publicUrl = getPublicUrl(appPackageJson);
//   const servedUrl =
//     envPublicUrl || (publicUrl ? url.parse(publicUrl).pathname : 'https://static.bbxapp.net/');
//   return ensureSlash(servedUrl, true);
// }
// 正式环境
function getServedPath(appPackageJson) {
    let publicUrl = getPublicUrl(appPackageJson);
    let servedUrl = envPublicUrl || (publicUrl ? url.parse(publicUrl).pathname : Default_Public_Path );

    return ensureSlash(servedUrl, true);
}

//为了service-worker.js配置index.html测试环境
function getServedPath1(appPackageJson) {
    const publicUrl = getPublicUrl(appPackageJson);
    const servedUrl =envPublicUrl || (publicUrl ? url.parse(publicUrl).pathname : "/");
    return ensureSlash(servedUrl, true);
}

// config after eject: we're in ./config/
module.exports = {
  dotenv: resolveApp(".env"),
  appBuild: resolveApp("build"),
  appPublic: resolveApp("public"),
  appHtml: resolveApp("public/index.html"),
  appIndexJs: resolveApp("src/index.js"),
  appPackageJson: resolveApp("package.json"),
  appSrc: resolveApp("src"),
  yarnLockFile: resolveApp("yarn.lock"),
  testsSetup: resolveApp("src/setupTests.js"),
  appNodeModules: resolveApp("node_modules"),
  publicUrl: getPublicUrl(resolveApp("package.json")),
  servedPath: getServedPath(resolveApp("package.json")),
  servedPath1: getServedPath1(resolveApp("package.json"))
};
