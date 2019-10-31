import { getMainDomainName } from "./utils/url.js";

export default {
    publicPath: process.env.PUBLIC_URL
    // 主域名名称
    , mainDomainName: process.env.DOMAIN || getMainDomainName()
    // 请求接口主域
    , reqHost: process.env.REQ_HOST
    // 请求WS
    , reqWebsocket: process.env.REQ_WEBSOCKET
    , reqWebsocketCD: process.env.REQ_WEBSOCKET_CD
    , reqTimeout: process.env.REQ_TIMEOUT
    // ======================= 这块代码是 Demo，仅供演示、说明用 ====================
    // 是否使用 SimResponse
    , isSimResponse: process.env.SIM_RESPONSE
    // ================================== DEMO END =============================
};
