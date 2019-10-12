const kLineType = [
  {
    id: 0,
    name: '0',
    buttonName: '分时',
    period: '5min',
    step: 5 * 60 * 1000,
    bit: 5,
    type: 'M',
    firstTime: '',
    lastTime: '',
    cache: [],
    noData: false, // 是否是第一次请求
    isIncremental: true // 是否是第一次增量
  },
  {
    id: 0,
    name: '5',
    buttonName: '5' + '分',
    period: '5min',
    step: 5 * 60 * 1000,
    bit: 5,
    type: 'M',
    firstTime: '',
    lastTime: '',
    cache: [],
    noData: false,
    isIncremental: true // 是否是第一次增量
  },
  {
    id: 1,
    name: '15',
    buttonName: '15' + '分',
    period: '15min',
    step: 15 * 60 * 1000,
    type: 'M',
    bit: 15,
    firstTime: '',
    lastTime: '',
    cache: [],
    noData: false,
    isIncremental: true // 是否是第一次增量
  },
  {
    id: 2,
    name: '30',
    buttonName: '30' + '分',
    period: '30min',
    step: 30 * 60 * 1000,
    type: 'M',
    bit: 30,
    firstTime: '',
    lastTime: '',
    cache: [],
    noData: false,
    isIncremental: true // 是否是第一次增量
  },
  {
    id: 3,
    name: '60',
    buttonName: '1' + '小时',
    period: '1hour',
    step: 60 * 60 * 1000,
    type: 'H',
    bit: 1,
    firstTime: '',
    lastTime: '',
    cache: [],
    noData: false,
    isIncremental: true // 是否是第一次增量
  },
  {
    id: 4,
    name: '120',
    buttonName: '2' + '小时',
    period: '2hour',
    step: 2* 60 * 60 * 1000,
    type: 'H',
    bit: 2,
    firstTime: '',
    lastTime: '',
    cache: [],
    noData: false,
    isIncremental: true // 是否是第一次增量
  },
  {
    id: 5,
    name: '240',
    buttonName: '4' + '小时',
    period: '4hour',
    step: 4 * 30 * 60 * 1000,
    type: 'H',
    bit: 4,
    firstTime: '',
    lastTime: '',
    cache: [],
    firstTime: '',
    lastTime: '',
    cache: [],
    noData: false,
    isIncremental: true // 是否是第一次增量
  },
  {
    id: 6,
    name: '360',
    buttonName: '6' + '小时',
    period: '6hour',
    step: 6 * 30  * 60 * 1000,
    type: 'H',
    bit: 6,
    firstTime: '',
    lastTime: '',
    cache: [],
    noData: false,
    isIncremental: true // 是否是第一次增量
  },
  {
    id: 7,
    name: '720',
    buttonName: '12' + '小时',
    period: '12hour',
    step: 12 * 60 * 60 * 1000,
    type: 'H',
    bit: 12,
    firstTime: '',
    lastTime: '',
    cache: [],
    noData: false,
    isIncremental: true // 是否是第一次增量
  },
  {
    id: 8,
    name: 'D',
    buttonName: '1' + '天',
    period: '1day',
    step: 1440 * 60 * 1000,
    type: 'D',
    bit: 1,
    firstTime: '',
    lastTime: '',
    cache: [],
    noData: false,
    isIncremental: true // 是否是第一次增量
  },
  {
    id: 9,
    name: 'W',
    buttonName: '1' + '周',
    period: '1week',
    step: 7 * 1440 * 60 * 1000,
    type: 'D',
    bit: 7,
    firstTime: '',
    lastTime: '',
    cache: [],
    noData: false,
    isIncremental: true // 是否是第一次增量
  }
]

class DataFeeds {
  constructor(spotApi, product, pricescale, contract) {
    this.spotApi = spotApi
    this.pricescale = pricescale
    this.product = product
    this.type = ''
    this.firstTime = ''
    this.lastTime = ''
    this.cmd = ''
    this.listenerGUID = ''
    this.timeout = null
    this.contract = contract
  }

  onReady(Callback) {
    setTimeout(() => {
      Callback({
        exchanges: [],
        symbolsTypes: [],
        supported_resolutions: ['5', '15', '30', '60', '120', '240', '360', '720', 'D', 'W'],
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
    // let bitId = symbolName.substr(-1, 1)
    // console.log('bitId', bitId)
    // let contractInfo = store.state.dictionary.contract.filter(item => {
    //   return item.id.toString() === bitId.toString()
    // })[0]
    // console.log('contractInfo', contractInfo)
    // bits = this.contract.filter(item => {
    //   return bitId === item.id.toString()
    // })[0].contractParam.entrustListPriceFloat
    // this.product = symbolName
    // console.log(this.product, bits, 22)
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
        'description': 'Description Inc.',
        'type': 'bitcoin',
        'supported_resolutions': ['5', '15', '30', '60', '120', '240', '360', '720', 'D', 'W'],
        'pricescale': Math.pow(10, bits),
        'ticker': symbolName
      })
    }, 0)
  }
  getDate (name, info, onDataCallback, isFirst) {
    info.isIncremental = true
    let time = isFirst ? Date.parse(String(new Date()).replace(/-/g, "/")) : info.firstTime
    this.spotApi(name, info.type, info.bit, time - info.step * 100, time)
    .then(res => {
      let bars = []
      let barData = res.data.data
      if (!barData || !barData.length) {
        info.noData = true
        return false
      }
      for (let i = 0; i < barData.length; i++) {
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
      info.cache = [...bars,...info.cache]
      onDataCallback(bars)
    })
  }
  getBars(symbolInfo, resolution, rangeStartDate, rangeEndDate, onDataCallback, onErrorCallback, firstDataRequest) {
    let info = kLineType.filter(item => {
      return item.name === resolution.toString()
    })[0]
    if (!firstDataRequest) {
      // this.firstTime && this.firstTime > rangeStartDate * 1000 && 
      if (info.noData) {
        onDataCallback([], { noData: true, nextTime: undefined })
      } else {
        this.getDate(symbolInfo.name, info, onDataCallback)
      }
    } else {
      if (info.cache.length) {
        onDataCallback(info.cache)
      } else {
        this.getDate(symbolInfo.name, info, onDataCallback, true)
      }
    }
  }

  subscribeBars(symbolInfo, resolution, onRealtimeCallback, listenerGUID, onResetCacheNeededCallback) {
    let info = kLineType.filter(item => {
      return item.name === resolution.toString()
    })[0]
    // let productInfo = this.contract.filter(item => {
    //   return item.id.toString() === symbolInfo.name.toString()
    // })[0]
    // let productId = productInfo.id
    clearTimeout(this.timeout)
    let getBar = () => {
      let end = Date.parse(String(new Date()).replace(/-/g, "/"));
      let time = info.isIncremental ? info.lastTime : 10
      info.isIncremental && (info.isIncremental = false)
      this.spotApi(symbolInfo.name, info.type, info.bit, end - time, end)
          .then(res => {
            let barData = res.data.data
            if (!barData || !barData.length) {
              return false
            }
            for (let i = 0; i < barData.length; i++) {
              if (barData[i].timestamp * 1000 >=  info.lastTime) {
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
            this.timeout = setTimeout(() => {
              getBar()
            }, 10000)
          })
          .catch(() => {
            this.timeout = setTimeout(() => {
              getBar()
            }, 10000)
          })
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

  unsubscribeBars(listenerGUID) {
    clearTimeout(this.timeout)
    this.timeout = null
    this.firstTime = ''
  }
}

export default DataFeeds
