/*
*获取router search 里的参数
*@parmas search [string]
*@parmas paramName [string]
*/
export function getQueryString(search, paramName) {
    let paramValue = "", isFound = !1, arrSource, i;
    if (search.indexOf("?") == 0 && search.indexOf("=") > 1) {
        arrSource = unescape(search).substring(1, search.length).split("&"), i = 0;
        while (i < arrSource.length && !isFound) arrSource[i].indexOf("=") > 0 && arrSource[i].split("=")[0].toLowerCase() == paramName.toLowerCase() && (paramValue = arrSource[i].split("=")[1], isFound = !0), i++
    }
    return paramValue == "" && (paramValue = null), paramValue
}
