let host = window.location.host;
let swapHost,bbxHost;
if(host.indexOf("vip")>0) {
    swapHost = "https://swap.bbx.vip";
    bbxHost = "https://www.bbx.vip";
}else {
    // swapHost = "https://swap.bbx.com";
    bbxHost = "https://test.bbx.com";
    // swapHost = "https://swap.bbx.com";
	swapHost = "https://devswap.bbx.com";
    // bbxHost = "https://www.bbx.com";
}

export default {
    swapHost: swapHost,
    bbxHost: bbxHost
};