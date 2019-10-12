import BigNumber from "./bignumber.js";

// //value 要处理的数据， num 保留位数
export function cutOut(value,num) {
    let result;
    if(num) {
        result = Math.floor(Number(Number(value).mul(Math.pow(10, num)))) / (Math.pow(10, num));
    }else {
        result = Number(value);
    }

    result = result ? new BigNumber(result) : 0;
    return result.toFixed(num);
    // return cutOutFloor(value, num);
}

export function stringCutOut(value,num) {
    // let arr = String(value).split(".");
    // let result;
    // if(arr.length<2) {
    //     if(num==0) {
    //         result = value;
    //     }else {
    //         result = value + "." + getZero(num);
    //     }
    // }else if(arr[1].length<=num) {
    //     result = String(arr[0])+"."+arr[1] + getZero(num-arr[1].length);
    // }else if(arr[1].length>num) {
    //     result = String(arr[0])+"." + String(arr[1]).slice(0,num);
    // }
    let x = new BigNumber(value);
    let result = x.toFixed(Number(num));

    return result;
}
//num 0.1,0.001,0.0001等
export function cutOutDecimal(value, num) {
    let n
    if (String(num).indexOf(".") > -1) {
        n = String(num).split(".")[1] ? String(num).split(".")[1].length : 0;
    } else {
        n = num;
    }
    
    let x = new BigNumber(value);
    let result = x.toFixed(Number(n));
    return result;
}

// export function cutOutCeil(value,num) {
//     let x = String(value);
//     let arr = x.split(".");
//     num = Number(num);
//     let d, n;
//     if (arr[1]) {
//         d = String(arr[1]);
//         if (num > d.length) {
//             d = d + getZero(num - d.length);
//         } else {
//             d = d.slice(0, num);
//             let last = Number(d[d.length-1]) + 1;
//             d[d.length-1] = d;
//         }
//     } else {
//         d = "";
//     }

//     return arr[0] + d;
// }

// function getSlice(value,num) {

// }

// function getZero(num) {
//     let result = "";
//     for(let i=0;i<num;i++) {
//         result = result+"0";
//     }
//     return result;
// }

//至少保留2位小数，本身为整数则处理为两位小数，本身大于两位小数，则先不予以处理
export function leastTwoDecimal(value) {
    let string = String(value);
    let t = string.split(".")[1];
    if(t && t.length>2){
        return value;
    }else {
        return Number(value).toFixed(2);
    }
}

//科学计数法转换成小数
// function scientificToNumber(num) {
//     var str = num.toString();
//     var reg = /^(\d+)(e)([\-]?\d+)$/;
//     var arr, len,
//         zero = '';

//     /*6e7或6e+7 都会自动转换数值*/
//     if (!reg.test(str)) {
//         return num;
//     } else {
//         /*6e-7 需要手动转换*/
//         arr = reg.exec(str);
//         len = Math.abs(arr[3]) - 1;
//         for (var i = 0; i < len; i++) {
//             zero += '0';
//         }

//         return '0.' + zero + arr[1];
//     }
// }

export function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = year + seperator1 + month + seperator1 + strDate;
    return currentdate;
}

// 数字加逗号
export function addCommom(num, len) {
    if (isNaN(num) || !num) return num
    num = String(num)
    if (!isNaN(len)) {
        if (len === 0) {
            num = num.split('.')[0]
        }
        return num.replace(/(\d+)(\.\d+)?/, (a, b, c) => {
            // console.log(b, c)
            return b.replace(/(\d)(?=(?:\d{3})+$)/g, '$1,') + (c ? c.slice(0, len + 1) : '')
        })
    } else {
        return num.replace(/^\d+/, (a) => { return a.replace(/(\d)(?=(?:\d{3})+$)/g, '$1,') })
    }
}

// 获取小数位数
export function retainDecimals(value, obj = {}) {
    if (!value) return 0
    value = value.toString()
    if (~value.indexOf('e')) {
        return 0
    }
    let decimals = ''
    if (value.indexOf('.') > 0 && obj.decimal !== 0) {
        let decimalsRe = new RegExp('[.]{1}[0-9]{0,' + (obj.decimal || 8) + '}')
        let decimalsExec = decimalsRe.exec(value)
        decimalsExec && (decimals = decimalsExec[0])
    }
    let v = 0
    let re = new RegExp('^-?[0-9]{1}[0-9]{0,' + (obj.integer - 1 || 8) + '}')
    v = re.exec(value)
    let n = ''
    if (v) {
        n = v[0]
    }
    return n + decimals
}

function getZero(num) {
    let result = "";
    for (let i = 0; i < num; i++) {
        result = result + "0";
    }
    return result;
}

//舍
export function cutOutFloor(value, num) {
    // let x = new BigNumber(value)
    let x = String(value);
    let arr = x.split(".");
    
    num = Number(num);
    let d, n;
    if (arr[1]) {
        d = String(arr[1]);
        if (num > d.length) {
            d = d + getZero(num - d.length);
        } else {
            d = d.slice(0, num);
        }
        return arr[0] + "." + d;
    } else {
        d = "";
        return arr[0];
    }
}

export function cutOutFloor2(value, num) {
    // let x = new BigNumber(value)
    let x = String(BigNumber(value));
    let arr = x.split(".");
    num = String(num).split(".")[1] ? String(num).split(".")[1].length : 0;
    
    let d, n;
    // if (arr[1] || arr[1] === "0") {
        if(arr[1]) {
            d = String(arr[1]);
        }else {
            d = "0";
        }
        if (num > d.length) {
            d = d + getZero(num - d.length);
        } else {
            d = d.slice(0, num);
        }
        return arr[0] + "." + d;
    // } else {
    //     d = "";
    //     return arr[0];
    // }
}

export function NumberFormatter(num, digits) {
    const si = [
        {value: 1, symbol: ""},
        {value: 1E3, symbol: "K"},
        {value: 1E6, symbol: "M"}
        // { value: 1E9, symbol: "G" },
        // { value: 1E12, symbol: "T" },
        // { value: 1E15, symbol: "P" },
        // { value: 1E18, symbol: "E" }
    ];

    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    let i;
    for (i = si.length - 1; i > 0; i--) {
        if (num >= si[i].value) {
            break;
        }
    }
    return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}