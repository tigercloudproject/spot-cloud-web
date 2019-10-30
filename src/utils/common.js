import CFG from "../config.js";
import { setCookie, delCookie, getCookie } from "./cookie.js";

// 清除与凭证相关的缓存数据
export function clearSignCaches() {
    // 清除用户信息
    localStorage.removeItem( 'user' );
    // 凭证
    delCookie( "user_token", CFG.mainDomainName,"/" );
    delCookie( "origin_uid", CFG.mainDomainName, "/" );
    delCookie( "bbx_token", CFG.mainDomainName, "/" );
    delCookie( "bbx_access_key", CFG.mainDomainName, "/" );
    delCookie( "bbx_expired_ts", CFG.mainDomainName, "/" );
    delCookie( "bbx_ssid", CFG.mainDomainName, "/" );
    delCookie( "bbx_uid", CFG.mainDomainName, "/" );
}

export function setSignCaches() {

}
