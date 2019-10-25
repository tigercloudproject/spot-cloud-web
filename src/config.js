import { getMainDomainName } from "./utils/url.js";

let reqHost = '';

switch ( window.location.hostname ) {
    case '127.0.0.1':
    case 'test.bbx.com':
        // development
        reqHost = 'devapi.bbx.com';
        break;
    default:
        // production
        reqHost = 'api.bbx.com';
};

// reqHost = '192.168.1.192';

export default {
    bbxHost: window.location.host
    , publicPath: ''
    // 主域名名称
    , mainDomainName: getMainDomainName()
    , reqHost: `https://${ reqHost }/`   // 请求接口主域
    , reqWebsocket: `wss://${ reqHost }/v1/ifspot/realTime`  // 请求WS
    // , cloud
};
