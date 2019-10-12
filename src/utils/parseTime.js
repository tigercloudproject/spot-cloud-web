export function parseTime(string) {
    let timestamp = new Date(string).valueOf();
    let Y, M, D, h, m, s;
    var date = new Date(timestamp); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
    Y = date.getFullYear() + "-";
    M =
        (date.getMonth() + 1 < 10
            ? "0" + (date.getMonth() + 1)
            : date.getMonth() + 1) + "-";
    D = Number(date.getDate()) < 10 ? "0" + date.getDate() : date.getDate();
    h = Number(date.getHours()) < 10 ? "0" + date.getHours() : date.getHours();
    m = Number(date.getMinutes()) < 10 ? "0" + date.getMinutes() : date.getMinutes();
    s = Number(date.getSeconds()) < 10 ? "0" + date.getSeconds() : date.getSeconds();

    return Y + M + D + " " + h + ":" + m;
}

export function parseTimeTos(string) { //单位到秒
    let timestamp = new Date(string).valueOf();
    let Y, M, D, h, m, s;
    var date = new Date(timestamp); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
    Y = date.getFullYear() + "-";
    M =
        (date.getMonth() + 1 < 10
            ? "0" + (date.getMonth() + 1)
            : date.getMonth() + 1) + "-";
    D = Number(date.getDate()) < 10 ? "0" + date.getDate() : date.getDate();
    h = Number(date.getHours()) < 10 ? "0" + date.getHours() : date.getHours();
    m = Number(date.getMinutes()) < 10 ? "0" + date.getMinutes() : date.getMinutes();
    s = Number(date.getSeconds()) < 10 ? "0" + date.getSeconds() : date.getSeconds();

    return Y + M + D + " " + h + ":" + m + ":" + s;
}

export function parseDate(string) {//年月日
    let timestamp = new Date(String(string)).valueOf();
    let Y, M, D;
    var date = new Date(timestamp);
    Y = date.getFullYear() + "-";
    M = (date.getMonth() + 1 <10?"0"+(date.getMonth() +1):date.getMonth() +1) + "-";
    D = Number(date.getDate())<10?"0"+date.getDate() : date.getDate(); 

    return Y + M + D;
}