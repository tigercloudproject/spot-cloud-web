let host = window.location.host;
let bbxHost, publicPath;
if(host.indexOf("vip")>0) {
    bbxHost = "test.bbx.com";
}else {
    switch ( document.domain ) {
        case 'test.bbx.com':
            // development
            bbxHost = "http://test.bbx.com";
            publicPath = '';
            break;
        default:
            // production
            bbxHost = "https://www.bbx.com";
            publicPath = 'https://bbx-static.oss-accelerate.aliyuncs.com';
    }
}

export default {
    bbxHost,
    publicPath
};
