/**
 * 防反跳。func函数在最后一次调用时刻的wait毫秒之后执行！
 * @param func 执行函数
 * @param wait 时间间隔
 * @param immediate 为true, debounce会在wait时间间隔的开始调用这个函数
 * @returns {Function}
 */
export function debounce(func,wait,immediate) {
    var timeout, args, context, timestamp, result;
    var later = function() {
        var last = new Date().getTime() - timestamp; //timestamp会实时更新
        if(last < wait && last >= 0) {
            timeout = setTimeout(later, wait - last);
        } else {
            timeout = null;
            if(!immediate) {
                result = func.apply(context, args);
                if(!timeout) context = args = null;
            }
        }
    };
    return function() {
        context = this;
        args = arguments;
        timestamp = new Date().getTime();
        var callNow = immediate && !timeout;
        if(!timeout) {
            timeout = setTimeout(later, wait);
        }
        if(callNow) {
            result = func.apply(context, args);
            context = args = null;
        }
        return result;
    };
}