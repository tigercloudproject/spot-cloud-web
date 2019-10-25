import axios from 'axios';
import {aesEncrypy} from "./utils/aes.js";
import {connect} from "react-redux";
import { setCookie, delCookie, getCookie } from "./utils/cookie.js";
import { getQueryString } from "./utils/getQueryString.js";
import CFG from "./config.js";
import { getGlobalHeader } from "./redux/global.redux";

// import Cookie from "js-cookie";

let nonce, timestamp;

// 全局 Headers
axios.defaults.headers["Content-Type"] = "application/json;charset=UTF-8";

//生成唯一ID
function getRandomToken() {
    // E.g. 8 * 32 = 256 bits token
    var randomPool = new Uint8Array(32);
    crypto.getRandomValues(randomPool);
    var hex = "";
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

// request
axios.interceptors.request.use( req => {
    timestamp = new Date().valueOf();
    nonce = timestamp + "000";  // 微秒时间戳
    // 给所有请求加时间戳
    if (req.url && req.url.indexOf("?") > -1) {
        req.url = req.url + "&t=" + timestamp;
    } else {
        req.url = req.url + "?t=" + timestamp;
    }

    // ======================= 这块代码是 Demo，仅供演示、说明用 ====================
    // 当前请求是否跳过设置 Headers
    if ( req.headers[ 'Skip-Set-Axios-Headers' ] !== 'true' ) {
        // 获取 Headers 的接口要跳过配置 Headers
        // NOTE: 每次请求前都会更新
        return getGlobalHeader()
            .then( data => {
                let bbxToken = data.token || ''
                  , bbxSsid = getCookie( 'ssid' ) || ''
                  , bbxSign = ''
                  , bbxAccesskey = ''
                  , bbxExpiredTs = ''
                  , bbxUid = getCookie( "uid" ) || ''
                  , bbxLang = localStorage.getItem( 'lang' ) || '';

                if ( bbxToken ) {
// TODO: ??? SSid是哪个
                    bbxSsid = data.accountInfo.origin_uid;
  // md5 的body是哪
                    // md5( body + token + ts )
                    bbxSign = aesEncrypy( bbxToken, nonce );
                    bbxAccesskey = data.access_key;
                    bbxExpiredTs = data.expired_ts;
                    bbxUid = data.accountInfo.account_id;

                    // 更新 cookie
                    setCookie( "token", bbxToken, 1, CFG.mainDomainName, "/" );
                    setCookie( "ssid", bbxSsid, 1, CFG.mainDomainName, "/" );
                    setCookie( "uid", bbxUid, 1, CFG.mainDomainName, "/" );
                };

                // 设置头部信息
                req.headers.common['Bbx-Ver'] = '1.0';
                req.headers.common['Bbx-Dev'] = 'web';
                req.headers.common["Content-Type"] = "application/json";
                req.headers.common['Bbx-Ts'] = nonce;

                req.headers.common['Bbx-Accesskey'] = bbxAccesskey;
                req.headers.common['Bbx-ExpiredTs'] = bbxExpiredTs;
                req.headers.common['Bbx-Sign'] = bbxSign;
                req.headers.common['Bbx-Ssid'] = bbxSsid;
                req.headers.common['Bbx-Uid'] = bbxUid;

                if(bbxLang.indexOf("zh")<0) {
                    bbxLang = "en";
                } else if(bbxLang.indexOf("zh-tw")>-1) {
                    bbxLang = "zh-cn";
                }

                req.headers.common['Bbx-Language'] = bbxLang;

                return req;
            } )
            .catch( e => {
                console.error( e );

                return req;
            } );
    } else {
        return req;
    }
    // ================================== DEMO END =============================
}, (err) => {
    //console.log("request###err##@@@######",err);
})

// response
axios.interceptors.response.use(response => {
    //非法请求 跳转到登录
    if(response.data.errno == "FORBIDDEN") {
        // 清除用户信息
        localStorage.removeItem( "user" );
        // 清除凭证
        delCookie( "token", CFG.mainDomainName, "/" );
        delCookie( "ssid", CFG.mainDomainName, "/" );
        delCookie( "uid", CFG.mainDomainName, "/" );

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

    let bbxToken = response.headers[ "bbx-token" ]
      , bbxSsid = response.headers[ "bbx-ssid" ]
      , bbxUid = response.headers[ "bbx-uid" ];

    // ======================= 这块代码是 Demo，仅供演示、说明用 ====================
    // NOTE: 登录、注册请求完成，且后端 success 后，后端应在 response.headers 带上 bbx-token、bbx-ssid、bbx-uid
    // NOTE: 前端会在上面获取并写入 cookie，以此做账号身份凭证
    // NOTE: 这里模拟在 Demo 中，登录、注册后自动进行赋值
    if ( !response.config.url.indexOf( '_simResponse/login' ) || !response.config.url.indexOf( '_simResponse/register' ) ) {
        bbxToken = 'f5a58f3011fc34fb4e6befbd0c1229b6'
        bbxSsid = '';
        bbxUid = '2090193280';
    };
    // ================================== DEMO =================================

    // 更新
    bbxToken
        && setCookie( "token", bbxToken, 1, CFG.mainDomainName, "/" );
    bbxSsid
        && setCookie( "ssid", bbxSsid, 1, CFG.mainDomainName, "/" );
    bbxUid
        && setCookie( "uid", bbxUid, 1, CFG.mainDomainName, "/" );

    return response;
}, (err) => {
    if(!err.response) {
        return;
    }
}
)

export default axios;
