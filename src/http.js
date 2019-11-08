import axios from 'axios';
import { getCookie } from "./utils/cookie.js";
import { getQueryString } from "./utils/getQueryString.js";
import { clearSignCaches } from "./utils/common.js";
import MD5 from "./utils/md5.js";
import CFG from "./config.js";

// 全局 Headers
axios.defaults.headers["Content-Type"] = "application/json;charset=UTF-8";
axios.defaults.timeout = CFG.reqTimeout;

//生成唯一ID
function getRandomToken() {
    // E.g. 8 * 32 = 256 bits token
    var randomPool = new Uint8Array(32);
    crypto.getRandomValues(randomPool);
    var hex = '';
    for (var i = 0; i < randomPool.length; ++i) {
    hex += randomPool[i].toString(16);
    }
    // E.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
    return hex;
}

let unique_id = localStorage.getItem("unique_id");
if(!unique_id) {
    unique_id = getRandomToken();
    localStorage.setItem("unique_id",unique_id);
}

// 更新 Headers
// opt.bbxToken 必填
function updateHeaders( config, opt = {} ) {
    let { bbxToken = getCookie( 'bbx_token' ) || ''
        , bbxAccesskey = getCookie( 'bbx_access_key' ) || ''
        , bbxExpiredTs = getCookie( 'bbx_expired_ts' ) || ''
        , bbxSsid = getCookie( 'bbx_ssid' ) || ''
        , bbxUid = getCookie( 'bbx_uid' ) || ''
        , bbxVer = getCookie( 'bbx_ver' ) || ''
        , bbxDev = getCookie( 'bbx_dev' ) || ''
        , bbxLang = localStorage.getItem( 'lang' ) || ''
        , nonce = new Date().valueOf() + "000"  // 微秒时间戳
        } = opt
        , bbxSign = '';

    // 有 token 才 Sign
    if ( bbxToken ) {
        // md5( body + token + ts )
        console.log( 'config.data', config.data )
        let body = config.data;

        // 如果无参数，则 body 应为空字符串
        if ( body == null ) {
            body = '';
        }
        if ( typeof body === 'object' ) {
            body = JSON.stringify( body );
        }

        let s = body + bbxToken + nonce;
        bbxSign = new MD5( s ).hash()
        console.log( s )
        console.log( 'aesEncrypy: ', body, bbxToken, nonce );
        console.log( 'bbxSign:', bbxSign );

        // 设置头部信息
        config.headers.common['Bbx-Ver'] = bbxVer;
        config.headers.common['Bbx-Dev'] = bbxDev;
        config.headers.common["Content-Type"] = "application/json";
        config.headers.common['Bbx-Ts'] = nonce;
        config.headers.common['Bbx-Accesskey'] = bbxAccesskey;
        config.headers.common['Bbx-ExpiredTs'] = bbxExpiredTs;
        config.headers.common['Bbx-Sign'] = bbxSign;
        config.headers.common['Bbx-Ssid'] = bbxSsid;
        config.headers.common['Bbx-Uid'] = bbxUid;
    }

    if( bbxLang.indexOf("zh")<0) {
        bbxLang = "en";
    } else if(bbxLang.indexOf("zh-tw")>-1) {
        bbxLang = "zh-cn";
    }

    config.headers.common['Bbx-Language'] = bbxLang;

    return config;
};

// request
axios.interceptors.request.use( config => {
    console.log( config )

    // NOTE: 取消预检请求 OPTIONS
    // if(config.method === 'post' || config.method === 'get') {
    //     config.data = qs.stringify(config.data);
    // }

    let timestamp = new Date().valueOf();

    // 给所有请求加时间戳
    if ( config.url && config.url.indexOf("?") > -1 ) {
        config.url = config.url + "&t=" + timestamp;
    } else {
        config.url = config.url + "?t=" + timestamp;
    };

    // ======================= 这块代码是 Demo，仅供演示、说明用 ====================
    // 当前请求是否跳过设置 Headers
    if ( config.headers[ 'Skip-Set-Axios-Headers' ] === 'true' ) {
        return config;
    } else {
        return updateHeaders( config );
    }
    // ================================== DEMO END =============================
}, err => {
    //console.log("request###err##@@@######",err);
} )

// response
axios.interceptors.response.use(response => {
    //非法请求 跳转到登录
    if(response.data.errno == "FORBIDDEN") {

        clearSignCaches();  // 清除与凭证相关的缓存数据

        let path = getQueryString( window.location.search, "path" );

        // 只有在usercenter和assets相关的页面发生FORBIDDEN时跳到登录页
        if (window.location.href.indexOf("assets")>0 || window.location.href.indexOf("usercenter")>0) {
            if (path) {
                window.location.href = window.location.protocol + "//" + window.location.host + `/login?path=${path}`;
            } else {
                window.location.href = window.location.protocol + "//" + window.location.host + '/login';
            }
        }
    }

    return response;
    // ================================== DEMO =================================
}, (err) => {
    if(!err.response) {
        return;
    }
}
)

export default axios;
