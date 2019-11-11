import { getMainDomainName } from "./utils/url.js";
import { setCookie } from "./utils/cookie.js";

const mainDomainName = process.env.DOMAIN || getMainDomainName();

// 默认值
setCookie( 'bbx_ver', '1.0', 1, mainDomainName, "/" );
setCookie( 'bbx_dev', 'web', 1, mainDomainName, "/" );

export default {
    publicPath: process.env.PUBLIC_URL
    // 主域名名称
    , mainDomainName
    // 请求接口主域
    , reqHost: process.env.REQ_HOST
    // 请求WS
    , reqWebsocket: process.env.REQ_WEBSOCKET
    , reqWebsocketCD: process.env.REQ_WEBSOCKET_CD
    , reqWebsocketHeartCheckCD: process.env.REQ_WEBSOCKET_HEARTCHECK_CD
    , reqTimeout: process.env.REQ_TIMEOUT
    // ======================= 这块代码是 Demo，仅供演示、说明用 ====================
    // 是否使用 SimResponse
    , isSimResponse: process.env.SIM_RESPONSE
    // ================================== DEMO END =============================
};
