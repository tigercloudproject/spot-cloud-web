
function compareUp(propertyName) { // 升序排序  
    return function (object1, object2) { // 属性值为数字  
        var value1 = object1[propertyName];
        var value2 = object2[propertyName];
        return Number(value1) - Number(value2);
    }
}
function compareDown(data,propertyName) { // 降序排序  
    return function (object1, object2) { // 属性值为数字  
        var value1 = object1[propertyName];
        var value2 = object2[propertyName];
        return value2 - value1;
    }
}  

function sortTicker(array, key) {
    return array.sort(function(a, b) {
        var x = a[key];
        var y = b[key];
        return x - y;
    })
}

export function getRank(clist, list , key) {  //收藏的应优先显示（还未加)）
    list.forEach(item => {
        clist.forEach((citem, index) => {
            if (item[key] === citem.name) {
                item.rank = citem.rank;
            }
        })
    });

    let result = sortTicker(list, "rank");

    return result;
}

/*
*美元转换成其他货币
*@param value 要转换的美元
*@param coin 要转换的币种
*@param rates 费率列表
*/
export function usdExchange(value, coin_type, rates) { 
    rates.forEach((item,index) => {
        if(item.name===coin_type) {
            return value*item.rate;
        }
    })
}

//取小数点后num位
export function decimalProcess(value,num) {
    return Number(value).toFixed(num);
}

/*
*stocks取小数精度
*@param clist [array] 参考数组
*@param plist [array] 需处理的数组
*@param name [string] 对应参考数组的name
*@param price_unit [array] 需要按price_unit精度处理的字段们
*@param vol_unit [array] 需要按vol_unit精度处理的字段们
*/
export function getStocksPrecision(clist,plist,name,price_unit,vol_unit) {
    let p,v;
    plist.forEach((item) => {
        clist.forEach((pitem) => {
            if(item[name]==pitem.name) {
                //价格精度处理
                p = pitem.price_unit.split(".")[1].length;
                price_unit.forEach((uitem) => {
                    item[uitem] = Number(item[uitem]).toFixed(p);
                })
             
                v = pitem.vol_unit.split(".")[1]?pitem.vol_unit.split(".")[1].length:0;
                vol_unit.forEach((vitem) => {
                    item[vitem] = Number(item[vitem]).toFixed(v);
                })
            }
        })
    })

    return plist;
}

/*
*stocks交易对单个对象取小数精度
*@param clist [array] 参考数组
*@param obj [object] 需处理的对象
*@param name [string] 交易对名称
*@param price_unit [array] 需要按price_unit精度处理的字段们
*@param vol_unit [array] 需要按vol_unit精度处理的字段们
*/
export function getObjStocksPrecision(clist,obj,name,price_unit,vol_unit) {
    let p,v;
    clist.forEach((item) => {
        if(item.name===name) {
            //价格精度处理
            p = item.price_unit.split(".")[1].length;
            price_unit.forEach((uitem) => {
                obj[uitem] = Number(obj[uitem]).toFixed(p);
            })
        
            v = item.vol_unit.split(".")[1] ? item.vol_unit.split(".")[1].length : 0;
            vol_unit.forEach((vitem) => {
                obj[vitem] = Number(obj[vitem]).toFixed(v);
            })
        }
    })

    return obj;
}

//获取vol的小数位数单位
export function getVolUnit(clist,name) {
    //console.log('clist##',clist);
    //console.log('name###',name);
    let v;
    clist.forEach((item) => {
        if(item.name == name) {
            v = item.vol_unit.split(".")[1]?item.vol_unit.split(".")[1].length:0;
        }
    })
    return v;
}

//获取price的小数位数单位
export function getPriceUnit(clist,name) {
    let p;
    clist.forEach((item) => {
        if (item.name == name) {
            p = item.price_unit.split(".")[1] ? item.price_unit.split(".")[1].length : 0;
        }
    })
    return p;
}

//coin转换成USD
export function exchangeUSD(coin_price,coin) {
    for(let i=0;i<coin_price.length;i++) {
        if(coin_price[i].Name==coin) {
            return coin_price[i].price_usd;
        }
    }
    return 0;
}

export function getCNYRate(usd_rates,name) {
    for(let i=0;i<usd_rates.length;i++) {
        if(usd_rates[i].name==name) {
            return usd_rates[i].rate;
        }
    }
    return null;
}
// //coin转换成CNY
// export function exchangeCNY(coin_price,coin) {

// }

