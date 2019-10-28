import { getMainDomainName } from "./utils/url.js";

console.log( 'process.env.HOST', process.env );

export default {
    publicPath: process.env.PUBLIC_URL
    // 主域名名称
    , mainDomainName: process.env.DOMAIN || getMainDomainName()
    // 请求接口主域
    , reqHost: process.env.REQ_HOST
    // 请求WS
    , reqWebsocket: process.env.REQ_WEBSOCKET
    // 是否使用 SimResponse
    , isSimResponse: process.env.SIM_RESPONSE
    , reqTimeout: process.env.REQ_TIMEOUT
};
