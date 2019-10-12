'use stric';
import { BigNumber } from "./bignumber";

Array.prototype.remove = function (val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};

Date.prototype.toString = function (format, loc) {
    var time = {};
    time.Year = this.getFullYear();
    time.TYear = ("" + time.Year).substr(2);
    time.Month = this.getMonth() + 1;
    time.TMonth = time.Month < 10 ? "0" + time.Month : time.Month;
    time.Day = this.getDate();
    time.TDay = time.Day < 10 ? "0" + time.Day : time.Day;
    time.Hour = this.getHours();
    time.THour = time.Hour < 10 ? "0" + time.Hour : time.Hour;
    time.hour = time.Hour < 13 ? time.Hour : time.Hour - 12;
    time.Thour = time.hour < 10 ? "0" + time.hour : time.hour;
    time.Minute = this.getMinutes();
    time.TMinute = time.Minute < 10 ? "0" + time.Minute : time.Minute;
    time.Second = this.getSeconds();
    time.TSecond = time.Second < 10 ? "0" + time.Second : time.Second;
    time.Millisecond = this.getMilliseconds();
    time.Week = this.getDay();

    var MMMArrEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var MMMArr = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
    var WeekArrEn = ["Sun", "Mon", "Tue", "Web", "Thu", "Fri", "Sat"];
    var WeekArr = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

    var oNumber = time.Millisecond / 1000;

    if (format != undefined && format.replace(/\s/g, "").length > 0) {
        if (loc != undefined && loc == "en") {
            MMMArr = MMMArrEn.slice(0);
            WeekArr = WeekArrEn.slice(0);
        }
        format = format
            .replace(/yyyy/ig, time.Year)
            .replace(/yyy/ig, time.Year)
            .replace(/yy/ig, time.TYear)
            .replace(/y/ig, time.TYear)
            .replace(/MMM/g, MMMArr[time.Month - 1])
            .replace(/MM/g, time.TMonth)
            .replace(/M/g, time.Month)
            .replace(/dd/ig, time.TDay)
            .replace(/d/ig, time.Day)
            .replace(/HH/g, time.THour)
            .replace(/H/g, time.Hour)
            .replace(/hh/g, time.Thour)
            .replace(/h/g, time.hour)
            .replace(/mm/g, time.TMinute)
            .replace(/m/g, time.Minute)
            .replace(/ss/ig, time.TSecond)
            .replace(/s/ig, time.Second)
            .replace(/fff/ig, time.Millisecond)
            .replace(/ff/ig, oNumber.toFixed(2) * 100)
            .replace(/f/ig, oNumber.toFixed(1) * 10)
            .replace(/EEE/g, WeekArr[time.Week]);
    }
    else {
        format = time.Year + "-" + time.Month + "-" + time.Day + " " + time.Hour + ":" + time.Minute + ":" + time.Second;
    }
    return format;
}


function accDiv(arg1, arg2) {
//   var t1 = 0,
//     t2 = 0,
//     r1,
//     r2;
//   try {
//     t1 = arg1.toString().split(".")[1].length;
//   } catch (e) {}
//   try {
//     t2 = arg2.toString().split(".")[1].length;
//   } catch (e) {}
//   //with (Math) {
//     r1 = Number(arg1.toString().replace(".", ""));
//     r2 = Number(arg2.toString().replace(".", ""));
//     return (r1 / r2) * Math.pow(10, t2 - t1);
  //}
    //return FPC.div(arg1,arg2);
    let x = new BigNumber(arg1);
    let y = new BigNumber(arg2);
    let result = x.dividedBy(y);
    // console.log("x####",x);
    // console.log("y####",y);
    return result.toNumber();
}

Number.prototype.div = function (arg) {
    return accDiv(this, arg);
}

function accMul(arg1, arg2) {
    // var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
    // try { m += s1.split(".")[1].length } catch (e) { }
    // try { m += s2.split(".")[1].length } catch (e) { }
    // return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
    //return FPC.mult(arg1, arg2);
    let x = new BigNumber(arg1);
    let y = new BigNumber(arg2);
    let result = x.multipliedBy(y);

    return result.toNumber();
}

Number.prototype.mul = function (arg) {
    return accMul(arg, this);
}

function accAdd(arg1, arg2) {
    // var r1, r2, m;
    // try { r1 = arg1.toString().split(".")[1].length } catch (e) { r1 = 0 }
    // try { r2 = arg2.toString().split(".")[1].length } catch (e) { r2 = 0 }
    // m = Math.pow(10, Math.max(r1, r2));
    // return (arg1 * m + arg2 * m) / m;
    //return FPC.add(arg1, arg2);
    let x = new BigNumber(arg1);
    let y = new BigNumber(arg2);
    let result = x.plus(y);
    return result.toNumber();
}

Number.prototype.add = function (arg) {
    return accAdd(arg, this);
}

function accSub(arg1, arg2) {
    // var r1, r2, m, n;
    // try { r1 = arg1.toString().split(".")[1].length } catch (e) { r1 = 0 }
    // try { r2 = arg2.toString().split(".")[1].length } catch (e) { r2 = 0 }
    // m = Math.pow(10, Math.max(r1, r2));
    // //last modify by deeka
    // //动态控制精度长度
    // n = (r1 >= r2) ? r1 : r2;
    // return ((arg2 * m - arg1 * m) / m).toFixed(n);
    //return FPC.sub(arg2, arg1);
    let x = new BigNumber(arg1);
    let y = new BigNumber(arg2);
    let result = y.minus(x);
    return result.toNumber();
}

Number.prototype.sub = function (arg) {
    return accSub(arg, this);
}