let timeout = null
let themeOut = null
let errorFn = null
class DataFeeds {
    constructor(kLineType, productList, bar, theme) {
    // constructor(kLineType, stocks, bar, theme) {
        this.kLineType = kLineType
        this.productList = productList
        // this.stocks = stocks  //小数位等配置信息
        this.bar = bar
        this.theme = theme
        this.type = ''
        this.firstTime = ''
        this.lastTime = ''
        this.cmd = ''
        this.listenerGUID = ''
    }

    onReady(Callback) {
        setTimeout(() => {
            Callback({
                exchanges: [],
                symbolsTypes: [],
                supported_resolutions: ['1', '5', '15', '30', '60', '120', '240', '360', '720', 'D', 'W'],
                supports_marks: false, // TODO: find out what this is
                supports_timescale_marks: false, // TODO: find out what this is
                supports_time: false,
                supports_search: true,
                supports_group_request: false
            })
        }, 0)
    }

    resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {
        let bits = 8

        if (this.productList && this.productList.length) {
            // let num = symbolName.split(':')
            // num = num.length === 1 ? num[0] : num[1]
            let info = this.productList.filter(item => {
                // return item.stock.name === symbolName
                return symbolName.indexOf(item.stock.name) > -1
            })[0]
            if (info) {
                let stock = info.stock;
                bits = stock.price_unit.length - stock.price_unit.indexOf(".") - 1;
            }
        }

        setTimeout(() => {
            onSymbolResolvedCallback({
                'name': symbolName,
                'exchange-traded': 'CustomExchange',
                'exchange-listed': 'CustomExchange',
                'timezone': 'Asia/Hong_Kong',
                'minmov': 1,
                'minmov2': 0,
                'session-regular': '24x7',
                'has_weekly_and_monthly': true,
                'has_intraday': true,
                'has_empty_bars': false,
                'has_no_volume': false,
                'pointvalue': 1,
                'volume_precision': 3,
                // 'volume_precision': Math.pow(10, bits),
                'description': 'Description Inc.',
                'type': 'bitcoin',
                'supported_resolutions': ['1', '5', '15', '30', '60', '120', '240', '360', '720', 'D', 'W'],
                'pricescale': Math.pow(10, bits),
                'ticker': symbolName
            })
        }, 0)
    }
    // source 1：第一次请求 2：历史增量请求
    getDate(name, info, onDataCallback, source) {
        let time = Date.parse(String(new Date()).replace(/-/g, '/'))
        let isOneOrHis = ~[1, 2].indexOf(source) // 第一次和历史增量请求
        let startTime
        if (isOneOrHis) {
            if (source === 1) {
                // 每种不同分时的第一次请求都要把增量充值为第一次
                info.isIncremental = true
            } else {
                time = info.firstTime - info.step * 1  // 如果查询历史数据则通过当前本地数据的早时间去查询 比上次的最早时间还要早一点
            }
            startTime = time - info.step * 200 // 无论是第一次请求或者历史增量请求都是查询100条
        }
        // console.log(startTime, time)
        this.bar(name, info.type, info.bit, startTime, time)
            .then(res => {
                let bars = []
                let barData = res && res.data.data
                if (!barData || !barData.length) {
                    isOneOrHis && (info.noData = true) // 表示当前分时已经没有历史数据了
                    onDataCallback([], { noData: true, nextTime: undefined })
                    return false
                }
                let len = barData.length
                for (let i = 0; i < len; i++) {
                    // console.log(Number(barData[i + 1].timestamp * 1000) - Number(barData[i].timestamp * 1000))
                    // if (i < barData.length - 1 && Number(barData[i + 1].timestamp * 1000) - Number(barData[i].timestamp * 1000) !== info.step) {
                    //   bars = []
                    //   continue
                    // }
                    let barValue = {
                        time: Number(barData[i].timestamp * 1000),
                        open: Number(barData[i].open),
                        close: Number(barData[i].close),
                        high: Number(barData[i].high),
                        low: Number(barData[i].low),
                        volume: Number(barData[i].volume)
                    }
                    bars.push(barValue)
                }
                info.firstTime = bars[0].time
                info.lastTime = bars[bars.length - 1].time
                info.cache = [...bars, ...info.cache]
                onDataCallback(bars)
                if (len < 200) {
                    isOneOrHis && (info.noData = true) // 表示当前分时已经没有历史数据了
                    onDataCallback([], { noData: true, nextTime: undefined })
                }
            })
    }
    getBars(symbolInfo, resolution, rangeStartDate, rangeEndDate, onDataCallback, onErrorCallback, firstDataRequest) {
        // console.log("symbolInfo###", symbolInfo);
        let info = this.kLineType.filter(item => {
            return item.name === resolution.toString()
        })[0]
        if (!firstDataRequest) {
            if (info.noData) {
                onDataCallback([], { noData: true, nextTime: undefined })
            } else {
                this.getDate(symbolInfo.name, info, onDataCallback, 2)
            }
        } else {
            if (info.cache.length) {
                info.isIncremental = true
                onDataCallback(info.cache)
            } else {
                this.getDate(symbolInfo.name, info, onDataCallback, 1)
            }
        }
    }

    subscribeBars(symbolInfo, resolution, onRealtimeCallback, listenerGUID, onResetCacheNeededCallback) {
        let info = this.kLineType.filter(item => {
            return item.name === resolution.toString()
        })[0]
        // let productInfo = this.contract.filter(item => {
        //   return item.id.toString() === symbolInfo.name.toString()
        // })[0]
        // let productId = productInfo.id
        let getBar = () => {
            let end = Date.parse(String(new Date()).replace(/-/g, '/'))
            let time = end - 10
            if (info.isIncremental) {
                info.isIncremental = false
                if (info.lastTime) {
                    time = info.lastTime
                }
                this.bar(symbolInfo.name, info.type, info.bit, time, end)
                    .then(res => {
                        this.dispose(res.data.data, info, onRealtimeCallback)
                        clearTimeout(timeout)
                        timeout = setTimeout(() => {
                            getBar()
                        }, 10000)
                    })
                    .catch(() => {
                        clearTimeout(timeout)
                        timeout = setTimeout(() => {
                            getBar()
                        }, 10000)
                    })
            } else {
                if (!this.theme) return
                let theme = this.theme + info.bit + info.type.toLowerCase()
                theme = `${theme}:${symbolInfo.name}`
                errorFn = () => {
                    // if (window.webSocket_bbx.isConnection()) {
                    //   window.webSocket_bbx.webSocketSend(`{"action":"subscribe","args":["${theme}"]}`)
                    // } else {
                    // }
                    info.isIncremental = true
                    getBar()
                }
                window.webSocket_bbx.errorCallBackFunObj["kline"] = errorFn;
                window.webSocket_bbx.successFn[theme] = res => {
                  this.dispose(res.data, info, onRealtimeCallback);
                };
                themeOut = `{"action":"unsubscribe","args":["${theme}"]}`
                window.webSocket_bbx.webSocketSend(`{"action":"subscribe","args":["${theme}"]}`);
            }
        }
        // if (type !== this.type || this.product.indexOf(productId) < 0) {
        //   clearTimeout(this.timeout)
        //   this.timeout = setTimeout(() => {
        //     getBar()
        //   }, 10000)
        //   return
        // }
        getBar()
    }
    dispose(barData, info, onRealtimeCallback) {
        if (!barData || !barData.length) {
            return false
        }
        for (let i = 0; i < barData.length; i++) {
            if (barData[i].timestamp * 1000 >= info.lastTime) {
                let barValue = {
                    time: Number(barData[i].timestamp * 1000),
                    open: Number(barData[i].open),
                    close: Number(barData[i].close),
                    high: Number(barData[i].high),
                    low: Number(barData[i].low),
                    volume: Number(barData[i].volume)
                }
                info.cache.push(barValue)
                onRealtimeCallback(barValue)
            }
        }
        if (barData[barData.length - 1]) {
            info.lastTime = barData[barData.length - 1].timestamp * 1000
        }
    }
    unsubscribeBars(listenerGUID) {
        clearTimeout(timeout)
        timeout = null
        this.firstTime = ''
        if (themeOut) {
            window.webSocket_bbx.webSocketSend(themeOut);
            delete window.webSocket_bbx.errorCallBackFunObj["kline"];
        }
    }
}

export default DataFeeds
