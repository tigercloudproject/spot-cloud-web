/**
 * 创建并返回一个像节流阀一样的函数，当重复调用函数的时候，最多每隔wait毫秒调用一次该函数
 * @param func执行函数
 * @param wait时间间隔
 * @param options 如果你想禁用第一次首先执行的画，传递{leading:false},
 * 如果你想禁用最后一次执行的话，传递{trailing: false}
 * @returns {Function}
 */
export function throttle(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function () {
        previous = options.leading === false ? 0 : new Date().getTime();
        timeout = null;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
    };
    return function () {
        var now = new Date().getTime();
        if (!previous && options.leading === false) previous = now;
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining);
        }
        return result;
    };
}