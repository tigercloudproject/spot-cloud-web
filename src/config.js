import { getMainDomainName } from "./utils/url.js";

let host = '';

switch ( window.location.hostname ) {
    case '192.168.1.1':
    case '127.0.0.1':
    case 'test.bbx.com':
        // development
        host = 'devapi.bbx.com';
        break;
    default:
        // production
        host = 'api.bbx.com';
};

export default {
    bbxHost: window.location.host
    , publicPath: ''
    // 主域名名称
    , mainDomainName: getMainDomainName()
    , reqHost: `https://${ host }/`   // 请求接口主域
    , reqWebsocket: `wss://${ host }/v1/ifspot/realTime`  // 请求WS
    // ======================= 这块代码是 Demo，仅供演示、说明用 ====================
    // 是否使用 SimRespon
    , isSimRespon: true
    // ================================== DEMO END =============================
};
