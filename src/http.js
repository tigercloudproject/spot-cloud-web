import axios from 'axios';
import {aesEncrypy} from "./utils/aes.js";
import { setCookie, delCookie, getCookie } from "./utils/cookie.js";
import { getQueryString } from "./utils/getQueryString.js";
import { clearSignCaches } from "./utils/common.js";
import qs from 'qs';
import { notification } from "antd";
import intl from "react-intl-universal";
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
        , bbxUid = getCookie( "bbx_uid" ) || ''
        , bbxLang = localStorage.getItem( 'lang' ) || ''
        , nonce = new Date().valueOf() + "000"  // 微秒时间戳
        } = opt
        , bbxSign = '';

    // 有 token 才 Sign
    if ( bbxToken ) {
// md5 的body是哪
        // md5( body + token + ts )
        bbxSign = aesEncrypy( JSON.stringify( {
            origin_uid: 21,
            vol: 1,
            coin_code: 'BTC'
        } ), bbxToken, nonce );
        console.log( 'aesEncrypy: ', config.data, bbxToken, nonce );
        console.log( 'bbxSign:', bbxSign );

        // 设置头部信息
        config.headers.common['Bbx-Ver'] = '1.0';
        config.headers.common['Bbx-Dev'] = 'web';
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

    return updateHeaders( config );

    // ======================= 这块代码是 Demo，仅供演示、说明用 ====================
    // 当前请求是否跳过设置 Headers
    // if ( config.headers[ 'Skip-Set-Axios-Headers' ] === 'true' ) {
    //     return config;
    // } else {
    //     return config;
    //     // let bbxToken = getCookie( 'token' ) || '';
    //     // // 是否存在云 token
    //     // if ( bbxToken ) {
    //     //     // 更新 sign
    //     //     return updateHeaders( config, { bbxToken } );
    //     // } else {
    //     //     // 获取 bbx Token
    //     //     // NOTE: Demo 中，该流程需要先登录 Token 平台，然后再获得 Token。实际情况可跳过该步骤
    //     //     return ( function( config ) {
    //     //         return getDemoHeaderLogin()
    //     //             .then( e => {
    //     //                 if ( e.code !== 0 ) {
    //     //                     notification.error({
    //     //                       message: intl.get("error_message_title") + ': getDemoHeaderLogin',
    //     //                       description: e.message || e.msg
    //     //                     });
    //     //                     return config;
    //     //                 };
    //     //                 return getDemoHeader( e.data.token )
    //     //                     .then( e => {
    //     //                         /*
    //     //                         	"access_key": "122f02dc-2e38-430e-b611-7d36921489a9",
    //     //                             	"accountInfo": {
    //     //                             		"account_id": 2555509712,
    //     //                             		"api_key": "122f02dc-2e38-430e-b611-7d36921489a9",
    //     //                             		"api_key_expired_at": "2019-11-24T03:10:22.225893Z",
    //     //                             		"api_secret": "a305ff06-caf5-4960-90e0-719482b1bbdf",
    //     //                             		"app_id": 2017184040,
    //     //                             		"assets": null,
    //     //                             		"created_at": "2019-10-25T03:10:22.23287Z",
    //     //                             		"origin_uid": "sunbeyond",
    //     //                             		"status": 1,
    //     //                             		"updated_at": "2019-10-25T03:10:22.225893Z"
    //     //                             	},
    //     //                             	"expired_ts": "1574565022000000",
    //     //                             	"token": "858a4adbe2b5ea7d7985ab9d37b7be9f"
    //     //                          */
    //     //                         let bbxToken = e.token
    //     //                           , bbxAccesskey = e.access_key
    //     //                           , bbxExpiredTs = e.expired_ts
    //     //                           , bbxSsid = ''
    //     //                           , bbxUid = e.accountInfo.account_id;
    //     //
    //     //                         // 更新 cookie
    //     //                         setCookie( "token", bbxToken, 1, CFG.mainDomainName, "/" );
    //     //                         setCookie( "access_key", bbxAccesskey, 1, CFG.mainDomainName, "/" );
    //     //                         setCookie( "expired_ts", bbxExpiredTs, 1, CFG.mainDomainName, "/" );
    //     //                         setCookie( "ssid", bbxSsid, 1, CFG.mainDomainName, "/" );
    //     //                         setCookie( "uid", bbxUid, 1, CFG.mainDomainName, "/" );
    //     //
    //     //                         return updateHeaders( config, {
    //     //                             bbxToken
    //     //                             , bbxAccesskey
    //     //                             , bbxExpiredTs
    //     //                             , bbxSsid
    //     //                             , bbxUid
    //     //                         } );
    //     //                     } )
    //     //                     .catch( e => {
    //     //                         notification.error({
    //     //                           message: intl.get("error_message_title") + ': getDemoHeader',
    //     //                           description: e.message || e.msg
    //     //                         });
    //     //
    //     //                         return config;
    //     //                     } );
    //     //             } )
    //     //             .catch( e => {
    //     //                 notification.error({
    //     //                   message: intl.get("error_message_title") + ': getDemoHeaderLogin',
    //     //                   description: e.message || e.msg
    //     //                 });
    //     //
    //     //                 return config;
    //     //             } );
    //     //     } )( config );
    //     // }
    // }
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
