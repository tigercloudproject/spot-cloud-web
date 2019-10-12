/**
 * calculateCloseLongProfitAmount 计算多仓位的未实现盈亏
 * vol: 持仓量
 * openPrice: 持仓均价
 * closePrice: 当前标记价
 * contractSize: 合约大小
 * isRevers: 是否是反向合约
 */
export function calculateCloseLongProfitAmount(
    vol,
    openPrice,
    closePrice,
    contractSize,
    isReverse
){
    //let openValue,closeValue;
    if(vol<=0 || contractSize<=0 || openPrice<=0 || closePrice<=0) {
        return 0;
    }

    if(isReverse) {
        // openValue = Number(Number(vol).mul(Number(contractSize))).div(Number(openPrice));
        // closeValue = Number(Number(vol).mul(Number(contractSize))).div(Number(closePrice));
        // return Number(openValue).sub(Number(closeValue));
        // let a = Number(1).div(Number(Number(openPrice).sub(Number(1)))).div(Number(closePrice));
        let a = Number(Number(1).div(Number(openPrice))).sub(Number(Number(1).div(closePrice)));
        return Number(vol).mul(Number(contractSize)).mul(Number(a));
    }

    // openValue = Number(Number(vol).mul(Number(contractSize))).mul(Number(openPrice));
    // closeValue = Number(Number(vol).mul(Number(contractSize))).mul(Number(closePrice));
    //return Number(closeValue).sub(Number(openValue));
    return Number(vol).mul(Number(contractSize)).mul(Number(Number(closePrice).sub(Number(openPrice))));
}

/**
 * CalculateCloseShortProfitAmount 计算空仓位的未实现盈亏
 * vol: 持仓量
 * openPrice: 持仓均价
 * closePrice: 当前标记价
 * contractSize: 合约大小
 * isReverse: 是否是反向合约
 */
export function CalculateCloseShortProfitAmount(
    vol,
    openPrice,
    closePrice,
    contractSize,
    isReverse
) {
    //let openValue, closeValue;
    if(vol<=0 || contractSize<=0 || openPrice<=0 || closePrice<=0) {
        return 0;
    }

    if(isReverse) {
        // openValue = Number(Number(vol).mul(Number(contractSize))).div(Number(openPrice));
        // closeValue = Number(Number(vol).mul(Number(contractSize))).div(Number(closePrice));
        //return Number(closeValue).sub(Number(openValue));
        //let a = Number(1).div(Number(Number(closePrice).sub(Number(1)))).div(Number(openPrice));
        let a = Number(Number(1).div(Number(closePrice))).sub(Number(Number(1).div(openPrice)));
        return Number(vol).mul(Number(contractSize)).mul(Number(a));
    }
    // openValue = Number(Number(vol).mul(Number(contractSize))).div(Number(openPrice));
    // closeValue = Number(Number(vol).mul(Number(contractSize))).div(Number(closePrice));
    //return Number(openValue).sub(Number(closeValue));
    return Number(vol).mul(Number(contractSize)).mul(Number(Number(openPrice).sub(Number(closePrice))));
}

// export function LongOrSort(vol, openPrice, closePrice, contract, way) {
//     return way ? CalculateCloseLongProfitAmount(vol, openPrice, closePrice, contract) : CalculateCloseShortProfitAmount(vol, openPrice, closePrice, contract)
// }