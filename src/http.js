import axios from 'axios';
import {aesEncrypy} from "./utils/aes.js";
import { setCookie, delCookie, getCookie } from "./utils/cookie.js";
import { getQueryString } from "./utils/getQueryString.js";
import qs from 'qs';
import CFG from "./config.js";
import { getDemoHeader, getDemoHeaderLogin } from "./redux/global.redux";

// 全局 Headers
axios.defaults.headers["Content-Type"] = "application/json;charset=UTF-8";
axios.defaults.timeout = CFG.reqTimeout;

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

// 更新 Headers
// opt.cloudToken 必填
function updateHeaders( config, opt ) {
    let { cloudToken = ''
        , cloudAccesskey = getCookie( 'cloud_access_key' ) || ''
        , cloudExpiredTs = getCookie( 'cloud_expired_ts' ) || ''
        , cloudSsid = getCookie( 'cloud_ssid' ) || ''
        , cloudUid = getCookie( "cloud_uid" ) || ''
        , bbxLang = localStorage.getItem( 'lang' ) || ''
        , nonce = new Date().valueOf() + "000"  // 微秒时间戳
        } = opt
        , cloudSign = '';

    // 设置头部信息
    config.headers.common['Bbx-Ver'] = '1.0';
    config.headers.common['Bbx-Dev'] = 'web';
    config.headers.common["Content-Type"] = "application/json";
    config.headers.common['Bbx-Ts'] = nonce;

    // 有 token 才 Sign
    if ( cloudToken ) {
// md5 的body是哪
        // md5( body + token + ts )
        cloudSign = aesEncrypy( config.data, cloudToken, nonce );
    }

    config.headers.common['Bbx-Accesskey'] = cloudAccesskey;
    config.headers.common['Bbx-ExpiredTs'] = cloudExpiredTs;
    config.headers.common['Bbx-Sign'] = cloudSign;
    config.headers.common['Bbx-Ssid'] = cloudSsid;
    config.headers.common['Bbx-Uid'] = cloudUid;

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
    if(config.method === 'post' || config.method === 'get') {
        config.data = qs.stringify(config.data);
    }

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
        let cloudToken = getCookie( 'cloud_token' ) || '';
        // 是否存在云 token
        if ( cloudToken ) {
            // 更新 sign
            return updateHeaders( config, { cloudToken } );
        } else {
            // 获取 Cloud Token
            // NOTE: Demo 中，该流程需要先登录 Token 平台，然后再获得 Token。实际情况可跳过该步骤
            return ( function( config ) {
                return getDemoHeaderLogin()
                    .then( e => {
                        if ( e.code !== 0 ) {
                            console.error( 'getDemoHeaderLogin', e );
                            return config;
                        };
                        return getDemoHeader( e.data.token )
                            .then( e => {
                                /*
                                	"access_key": "122f02dc-2e38-430e-b611-7d36921489a9",
                                    	"accountInfo": {
                                    		"account_id": 2555509712,
                                    		"api_key": "122f02dc-2e38-430e-b611-7d36921489a9",
                                    		"api_key_expired_at": "2019-11-24T03:10:22.225893Z",
                                    		"api_secret": "a305ff06-caf5-4960-90e0-719482b1bbdf",
                                    		"app_id": 2017184040,
                                    		"assets": null,
                                    		"created_at": "2019-10-25T03:10:22.23287Z",
                                    		"origin_uid": "sunbeyond",
                                    		"status": 1,
                                    		"updated_at": "2019-10-25T03:10:22.225893Z"
                                    	},
                                    	"expired_ts": "1574565022000000",
                                    	"token": "858a4adbe2b5ea7d7985ab9d37b7be9f"
                                 */
                                let cloudToken = e.token
                                  , cloudAccesskey = e.access_key
                                  , cloudExpiredTs = e.expired_ts
                                  , cloudSsid = ''
                                  , cloudUid = e.accountInfo.account_id;

                                // 更新 cookie
                                setCookie( "cloud_token", cloudToken, 1, CFG.mainDomainName, "/" );
                                setCookie( "cloud_access_key", cloudAccesskey, 1, CFG.mainDomainName, "/" );
                                setCookie( "cloud_expired_ts", cloudExpiredTs, 1, CFG.mainDomainName, "/" );
                                setCookie( "cloud_ssid", cloudSsid, 1, CFG.mainDomainName, "/" );
                                setCookie( "cloud_uid", cloudUid, 1, CFG.mainDomainName, "/" );

                                return updateHeaders( config, {
                                    cloudToken
                                    , cloudAccesskey
                                    , cloudExpiredTs
                                    , cloudSsid
                                    , cloudUid
                                } );
                            } )
                            .catch( e => {
                                console.error( e );

                                return config;
                            } );
                    } )
                    .catch( e => {
                        console.error( e );

                        return config;
                    } );
            } )( config );
        }
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
        // 用户凭证
        delCookie( "token", CFG.mainDomainName, "/" );
        delCookie( "ssid", CFG.mainDomainName, "/" );
        delCookie( "uid", CFG.mainDomainName, "/" );
        // cloud 凭证
        delCookie( "cloud_token", CFG.mainDomainName, "/" );
        // delCookie( "cloud_access_key", CFG.mainDomainName, "/" );
        // delCookie( "cloud_expired_ts", CFG.mainDomainName, "/" );
        delCookie( "cloud_ssid", CFG.mainDomainName, "/" );
        delCookie( "cloud_uid", CFG.mainDomainName, "/" );

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
