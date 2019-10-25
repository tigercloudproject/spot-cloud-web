import { getMainDomainName } from "./utils/url.js";

export default {
    bbxHost: window.location.host
    , publicPath: ''
    // 主域名名称
    , mainDomainName: getMainDomainName()
    // 主域名名称:端口
    , mainDomain: getMainDomainName( window.location.host )
    // , cloud
};
