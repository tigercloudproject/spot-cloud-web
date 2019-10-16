let host = window.location.host;
let swapHost,bbxHost, publicPath;
if(host.indexOf("vip")>0) {
    swapHost = "https://swap.bbx.vip";
    bbxHost = "https://www.bbx.vip";
}else {
    switch ( document.domain ) {
        case 'test.bbx.com':
            // development
            bbxHost = "http://test.bbx.com";
            // swapHost = "https://devswap.bbx.com";
            publicPath = '';
            break;
        default:
            // production
            bbxHost = "https://www.bbx.com";
            // swapHost = "https://swap.bbx.com";
            publicPath = 'https://bbx-static.oss-accelerate.aliyuncs.com';
    }
}

export default {
    // swapHost,
    bbxHost,
    publicPath
};
