// function coinPriceExchangeETH(coin_price, usd_rates, coin) {
//   const { sETHPriceUsd } = getPrice(coin_price, usd_rates);

// }

export function getCoinPriceUSD(coin_price, coin) {
    for (let i = 0; i < coin_price.length; i++) {
        if (coin_price[i].Name === coin) {
            return coin_price[i].price_usd;
        }
    }
    return null;
}

//key 可用还是冻结
export function webExchange(array, toCode, coin_price, usd_rates, spotTickers, key) {
    if (array.length == 0) {
        return 0;
    }
    let balanceUSDT = 0;
    let balanceUSD = 0;
    let item;
    let usdItem, usdtItem;

    let ethPriceUsd = getCoinPriceUSD(coin_price, "ETH");
    let usdtPriceUsd = getCoinPriceUSD(coin_price, "USDT");
    // console.log("usdtPriceUsd###", usdtPriceUsd);

    for (let i = 0; i < array.length; i++) {
        item = array[i];
        if (item == null) {
            continue;
        }

        // usdItem = getCoinPriceUSD(coin_price,item.coin_code);
        // if(usdItem === null) {
        //     usdItem = exchange2ETH(item.coin_code, Number(item[key]), null, spotTickers);
        //     usdItem = Number(usdItem).mul(Number(ethPriceUsd));

        // }else {
        //     usdItem = Number(Number(usdItem).mul(Number(item[key])));
        // }
        // if (item.coin_code === "ETH" || item.coin_code === "USDT" || item.coin_code === "BTC") {
        //     usdItem = getCoinPriceUSD(coin_price, item.coin_code);
        //     // console.log("###usdItem####", item.coin_code, "###", usdItem);
        //     usdItem = Number(Number(usdItem).mul(Number(item[key])));
        // } else {
            // usdItem = exchange2ETH(item.coin_code, Number(item[key]), null, spotTickers);
            usdtItem = exchange2USDT(item.coin_code, Number(item[key]), null, spotTickers);
            usdItem = Number(usdtItem).mul(Number(usdtPriceUsd));
        // }
        if (isNaN(usdtItem) || !usdtItem){
            usdItem = getCoinPriceUSD(coin_price, item.coin_code);
            usdItem = Number(Number(usdItem).mul(Number(item[key])));
            // usdtItem = exchange2USDT(item.coin_code, Number(item[key]), null, spotTickers);
        }

        if (isNaN(usdtItem)) {
            usdtItem = 0;
        }
        // console.log("###coin####",item.coin_code,"###",usdtItem);
        balanceUSDT += usdtItem;
        balanceUSD += usdItem;
        //balanceUSDT += exchange2ETH(item.coin_code,Number(item[key]),null,spotTickers);
    }

    const {
        sETHPriceUsd,
        sETHPriceCNY
    } = getPrice(coin_price, usd_rates);

    if (toCode == "abit") {
        let abit = exchangeToCoin("ETH", "abit", balanceUSDT, null, spotTickers);
        return abit;
    } else if (toCode == "ETH") {
        return balanceUSDT;
    } else if (toCode == "USD") {
        // return Number(sETHPriceUsd).mul(Number(balanceUSDT));
        return balanceUSD;
    } else if (toCode == "CNY") {
        return Number(sETHPriceCNY).mul(Number(balanceUSDT));
    } else if(toCode == "USDT") {
        return balanceUSDT;
    }

    return 0;
}

//转换单个币(主要用在交易界面)
export function webExchangeSingle(from, to, vol, coin_price, usd_rates, spotTickers) {
    let balanceUSDT = 0;
    balanceUSDT = exchange2USDT(from, vol, null, spotTickers);

    const {
        sETHPriceUsd,
        sETHPriceCNY
    } = getPrice(coin_price, usd_rates);
    if (to == "USD") {
        return Number(sETHPriceUsd).mul(Number(balanceUSDT));
    } else if (to == "CNY") {
        return Number(sETHPriceCNY).mul(Number(balanceUSDT));
    } else if (to == "USDT") {
        return balanceUSDT;
    } else {
        return balanceUSDT;
    }
    // return 0;
}

//获取对应美元和对应CNY
function getPrice(coin_price, usd_rates) {
    //console.log('usd##',usd_rates);
    let result = {};
    let name = '',
        cname = '';
    coin_price.forEach((item) => {
        name = "s" + item.Name + "PriceUsd";

        result[name] = item.price_usd;
        usd_rates.forEach((citem) => {
            cname = "s" + item.Name + "Price" + citem.name;
            result[cname] = result[name] * citem.rate;
        })
    })

    return result;
}



// function isContainInCoinPrice(coin,coin_price) {
//     let item;
//     for(let i=0;i<coin_price.length;i++) {
//         item = coin_price[i];
//         if(item.Name==coin) {
//             return true
//         }
//     }
//     return false;
// }

function exchange2USDT(coin_code, vol, scanedTickers, spotTicker) {
    // console.log("coin_code###", coin_code);
    // console.log("scanedTickers###", scanedTickers);
    // console.log("spotTicker###", spotTicker);
    let balanceEth = 0.0;
    let bingo = false;
    let stock_code, stock_code_reserve;
    let ticker = null,
        ticker_reserve = null;

    if (coin_code == "USDT") {
        bingo = true;
        balanceEth = parseFloat(Number(vol).toFixed(8));
    } else {

        stock_code = coin_code + "/USDT";
        ticker = getSpotTicker(spotTicker, stock_code);
        // console.log("vol####",vol);
        // console.log("coin_code#####",coin_code);
        // console.log("stock_code###",stock_code);
        // console.log("ticker####",ticker);
        if (ticker != null) {
            bingo = true;
            balanceEth = Number(Number(Number(vol).mul(Number(ticker.last_price))).toFixed(8));
            return balanceEth;
        } else {
            stock_code_reserve = "USDT/" + coin_code;
            ticker_reserve = getSpotTicker(spotTicker, stock_code_reserve);
            if (ticker_reserve != null) {
                bingo = true;
                if (ticker_reserve.last_price != 0) {
                    balanceEth = Number(Number(Number(vol).div(Number(ticker_reserve.last_price))).toFixed(8));
                } else {
                    balanceEth = 0;
                }
                return balanceEth;
            }

        }
    }

    if (!bingo) {
        let spotTickers = getAssociatedSpotTicker(spotTicker, coin_code);
        if (spotTickers == null || spotTickers.length == 0) {
            return 0.0;
        }

        if (scanedTickers == null) {
            scanedTickers = [];
        }

        let item, code, balanceCode;
        for (let i = 0; i < spotTickers.length; i++) {
            item = spotTickers[i];
            if (item == null) {
                continue
            }

            if (isAlreadyScaned(scanedTickers, item)) {
                continue;
            }

            code = item.stock_code.split("/");
            // console.log("1111####", code);
            if (code == null || code.length < 2) {
                continue;
            }

            scanedTickers.push(item);



            if (code[1] == coin_code) { //正向的
                let a;
                if (Number(item.last_price) > 0) {
                    a = item.last_price !== 0 ? Number(1).div(Number(item.last_price)) : 0;
                } else {
                    a = 0;
                }
                // let a = item.last_price!==0?Number(1).div(Number(item.last_price)):0;
                //console.log("a####",a);
                balanceCode = Number(Number(vol).mul(Number(a)));
                balanceEth = exchange2USDT(code[0], Number(balanceCode.toFixed(8)), scanedTickers, spotTicker);
                if (balanceEth > 0) { //计算成功
                    break;
                    //return balanceUSDT;
                }
            } else if (code[0] == coin_code) { //反向的
                if (item.last_price != 0) {
                    //balanceCode = vol && item.last_price?Number(Number(vol).div(Number(item.last_price))):0;
                    balanceCode = Number(item.last_price).mul(Number(vol));
                } else {
                    balanceCode = 0;
                }
                balanceEth = exchange2USDT(code[1], Number(balanceCode.toFixed(8)), scanedTickers, spotTicker);
                if (balanceEth > 0) { //计算成功
                    break;
                    //return balanceUSDT;
                }
            }
        }
    }
    //console.log("balanceEth#####", balanceEth);
    return balanceEth;
}

//查找stocks里是否包含coin_code
function getSpotTicker(spotTicker, coin_code) {
    for (let i = 0; i < spotTicker.length; i++) {
        // console.log("2222###", spotTicker[i]);
        if (spotTicker[i].ticker && spotTicker[i].ticker.stock_code == coin_code) {
            return spotTicker[i].ticker;
        }
    }
    return null;
}

function getAssociatedSpotTicker(spotTicker, coin_code) {
    let result = [];
    spotTicker.forEach((item) => {
        // console.log("3333####", item);
        if (item.ticker.stock_code.indexOf(coin_code) > -1) {
            result.push(item.ticker);
        }
    })

    return result;
}

function isAlreadyScaned(scanedTickers, spotTicker) {
    if (scanedTickers == null || scanedTickers.length == 0) {
        return false;
    }

    if (spotTicker == null) {
        return true;
    }

    let item, code;
    for (let i = 0; i < scanedTickers.length; i++) {
        item = scanedTickers[i];
        if (item == null) {
            continue;
        }
        // console.log("4444###", item);
        code = item.stock_code.split("/");
        if (code == null || code.length < 2) {
            continue;
        }
        // console.log("5555####", spotTicker);
        if (spotTicker.stock_code.indexOf(code[0]) > -1 && spotTicker.stock_code.indexOf(code[1] > -1)) {
            return true;
        }

    }
    return false;
}

function exchangeToCoin(from, to, vol, scanedTickers, spotTicker) {
    let balance = 0.0;
    let bingo = false;
    let stock_code, stock_code_reserve;
    let ticker = null,
        ticker_reserve = null;

    if (to == from) {
        bingo = true;
        balance = parseFloat(Number(vol).toFixed(8));
    } else {
        stock_code = from + "/" + to;
        ticker = getSpotTicker(spotTicker, stock_code);
        if (ticker != null) {
            bingo = true;
            balance = Number(vol).mul(Number(ticker.last_price));
        } else {
            stock_code_reserve = to + "/" + from;
            ticker_reserve = getSpotTicker(spotTicker, stock_code_reserve);
            if (ticker_reserve != null) {
                bingo = true;
                if (ticker_reserve.last_price != 0) {
                    balance = Number(vol).div(Number(ticker_reserve.last_price));
                } else {
                    balance = 0;
                }
            }
        }
    }

    if (!bingo) {
        let spotTickers = getAssociatedSpotTicker(spotTicker, from);
        if (spotTickers == null || spotTickers.length == 0) {
            return 0.0;
        }

        if (scanedTickers == null) {
            scanedTickers = [];
        }

        let item, code, balanceCode;
        for (let i = 0; i < spotTickers.length; i++) {
            item = spotTickers[i];
            if (item == null) {
                continue
            }

            if (isAlreadyScaned(scanedTickers, item)) {
                continue;
            }
            // console.log("7777@####", item);
            code = item.ticker.stock_code.split("/");
            if (code == null || code.length < 2) {
                continue;
            }

            scanedTickers.push(item);

            if (code[1] == to) {
                balanceCode = Number(vol).sub(Number(item.last_price));
                balance = exchangeToCoin(code[0], to, Number(balanceCode.toFixed(8)), scanedTickers);
                if (balance > 0) { //计算成功
                    break;
                }
            } else if (code[0] == to) {
                if (item.last_price != 0) {
                    balanceCode = Number(vol).div(Number(item.last_price));
                } else {
                    balanceCode = 0;
                }
                balance = exchangeToCoin(code[1], to, Number(balanceCode.toFixed(8)), scanedTickers);
                if (balance > 0) { //计算成功
                    break;
                }
            }
        }
    }
    return balance;
}
