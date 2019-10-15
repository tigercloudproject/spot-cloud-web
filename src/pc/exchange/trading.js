import React, {Component} from "react";
import DataFeeds from '../../assets/js/datafeed'
import { getQueryString } from "../../utils/getQueryString.js";
import { withRouter, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { getSpotDashTwo} from "../../redux/exchange.redux.js";
import CFG from "../../hostConfig.js";
import intl from "react-intl-universal";
@withRouter
@connect(
  state => ({ ...state.lang, ...state.sdetails, ...state.gconfig })
)
class Trading extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stocks: [], //为了处理小数位数（global里的stocks
      currentCoinPair: ""
    }
    // 第一次加载字典
    this.isFirst = true
    this.stocks = []

    this.kLineType = [
      {
        id: 0,
        name: '0',
        buttonName: intl.get("exchange_dash_line"),
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
        buttonName: intl.get("exchange_dash_5min"),
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
        buttonName: intl.get("exchange_dash_15min"),
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
        buttonName: intl.get("exchange_dash_30min"),
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
        buttonName: intl.get("exchange_dash_1hour"),
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
      // {
      //   id: 4,
      //   name: '120',
      //   buttonName: '2' + this.$t('common.hour'),
      //   period: '2hour',
      //   step: 2 * 60 * 60 * 1000,
      //   type: 'H',
      //   bit: 2,
      //   firstTime: '',
      //   lastTime: '',
      //   cache: [],
      //   noData: false,
      //   isIncremental: true // 是否是第一次增量
      // },
      {
        id: 5,
        name: '240',
        buttonName: intl.get("exchange_dash_4hour"),
        period: '4hour',
        step: 4 * 30 * 60 * 1000,
        type: 'H',
        bit: 4,
        firstTime: '',
        lastTime: '',
        cache: [],
        noData: false,
        isIncremental: true // 是否是第一次增量
      },
      // {
      //   id: 6,
      //   name: '360',
      //   buttonName: '6' + this.$t('common.hour'),
      //   period: '6hour',
      //   step: 6 * 30 * 60 * 1000,
      //   type: 'H',
      //   bit: 6,
      //   firstTime: '',
      //   lastTime: '',
      //   cache: [],
      //   noData: false,
      //   isIncremental: true // 是否是第一次增量
      // },
      // {
      //   id: 7,
      //   name: '720',
      //   buttonName: '12' + this.$t('common.hour'),
      //   period: '12hour',
      //   step: 12 * 60 * 60 * 1000,
      //   type: 'H',
      //   bit: 12,
      //   firstTime: '',
      //   lastTime: '',
      //   cache: [],
      //   noData: false,
      //   isIncremental: true // 是否是第一次增量
      // },
      {
        id: 8,
        name: 'D',
        buttonName: intl.get("exchange_dash_1day"),
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
        buttonName: intl.get("exchange_dash_1week"),
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
  }
  init () {
    let coinPair = getQueryString(this.props.location.search, "coinPair")
    let lang = this.props.default.value || 'zh-CN';
    let langObj = {
      'zh-CN': 'zh',
      'zh-TW': 'en',
      'en-US': 'en'
    }
    window.localStorage.removeItem("tradingview.chartproperties");
    let TradingView = window.TradingView
    let dataFeeds = new DataFeeds(getSpotDashTwo, this.kLineType, this.stocks)
    this.clear = () => {
        dataFeeds.unsubscribeBars()
    }
    let widget = (this.widget = window.tvWidget = new TradingView.widget({
      width: "100%",
      height: 410,
      symbol: coinPair,
      interval: "5",
      allow_symbol_change: true,
      timezone: "Asia/Hong_Kong",
      container_id: "tv_chart_container",
      // BEWARE: no trailing slash is expected in feed URL
      datafeed: dataFeeds,
      library_path: CFG.publicPath + '/js/charting_library/',
      locale: langObj[lang] || "en", // this.changeLocale() || 'zh',
      custom_css_url: CFG.publicPath + '/js/charting_library/static/base.css',
      debug: false,
      // Regression Trend-related functionality is not implemented yet, so it's hidden for a while
      drawings_access: {
        type: "black",
        tools: [{ name: "Regression Trend" }]
      },
      disabled_features: [
        "legend_context_menu",
        "volume_force_overlay",
        "timeframes_toolbar",
        "display_market_status",
        "compare_symbol",
        "go_to_date",
        "header_chart_type",
        "header_compare",
        "header_interval_dialog_button",
        "header_screenshot",
        "header_symbol_search",
        "header_undo_redo",
        "show_hide_button_in_legend",
        "show_interval_dialog_on_key_press",
        "snapshot_trading_drawings",
        "symbol_info",
        "border_around_the_chart",
        "remove_library_container_border",
        "header_saveload",
        "show_interval_dialog_on_key_press",
        "header_interval_dialog_button",
        "header_resolutions"
      ],
      enabled_features: [
        "move_logo_to_main_pane",
        "dont_show_boolean_study_arguments",
        "hide_last_na_study_output"
      ],
      charts_storage_api_version: "1.1",
      //client_id: "tradingview.com",
      client_id: 'bbx.com',
      user_id: "1",
      loading_screen: {
        backgroundColor: "#1F2636"
      },
      overrides: {
        volumePaneSize: "medium",
        "paneProperties.background": "#1F2636", // 整个背景
        "paneProperties.horzGridProperties.color": "rgba(50,69,101,0.15)", // grid 横线
        "paneProperties.vertGridProperties.color": "rgba(50,69,101,0.15)", // grid 竖线
        "paneProperties.crossHairProperties.color": "#CDD5DF", // 交叉轴
        "paneProperties.topMargin": 30,
        "paneProperties.legendProperties.showSeriesTitle": false,
        // Candles styles
        "mainSeriesProperties.candleStyle.drawBorder": true,
        "mainSeriesProperties.candleStyle.borderUpColor":
          "rgb(49, 158, 92)", // 蜡烛边框
        "mainSeriesProperties.candleStyle.borderDownColor":
          "rgb(184, 58, 58)", // 蜡烛边框
        "mainSeriesProperties.candleStyle.upColor": "rgb(49, 158, 92)", // 蜡烛 升
        "mainSeriesProperties.candleStyle.downColor": "rgb(184, 58, 58)", // 蜡烛 降
        "mainSeriesProperties.candleStyle.wickUpColor": "rgb(49, 158, 92)", // 蜡烛成交上线颜色
        "mainSeriesProperties.candleStyle.wickDownColor":
          "rgb(184, 58, 58)", // 蜡烛成交下颜色
        "mainSeriesProperties.candleStyle.barColorsOnPrevClose": true,
        "paneProperties.priceAxisProperties.alignLabels": true,
        "paneProperties.legendProperties.showLegend": false,
        "scalesProperties.lineColor": "rgba(50,69,101,0.5)", // 内部 边框线
        "scalesProperties.fontSize": 12,
        "scalesProperties.textColor": "#97B0D6", // 字母和数字
        "mainSeriesProperties.barStyle.downColor": "#ffff00", // #d32f2f
        "mainSeriesProperties.haStyle.upColor": "#DC143C",
        "mainSeriesProperties.haStyle.downColor": "#d75442", // ---------------------
        "mainSeriesProperties.areaStyle.color1": "rgba(95,142,212, 0.05)", // 分时颜色上
        "mainSeriesProperties.areaStyle.color2": "rgba(95,142,212, 0.05)", // 分时颜色下
        "mainSeriesProperties.areaStyle.linecolor": "rgba(95,142,212, 0.8)", // 分时线颜色
        "mainSeriesProperties.areaStyle.linewidth": 0.5 // 分时线宽度
      },
      studies_overrides: {
        "volume.volume.color.0": "#874755", // 倒影
        "volume.volume.color.1": "#0a6b61", // 倒影
        "volume.volume.transparency": 50,
        "volume.show ma": true,
        "volume.volume ma.color": "#7e9efd",
        "volume.volume ma.plottype": "line",
        "volume.volume ma.linewidth": 2,
        "Moving Average.precision": 4 // 加号中的位数
      }
    }));
    widget.onChartReady(() => {
      widget.chart().createStudy('Moving Average', false, false, [5], null, {
        'Plot.color.0': '#ff9500',
        'Plot.linewidth': 2
      })
      widget.chart().createStudy('Moving Average', false, false, [10], null, {
        'Plot.color.0': '#d32f2f',
        'Plot.linewidth': 2
      })
      widget.chart().createStudy('Moving Average', false, false, [20], null, {
        'Plot.color.0': '#b4ad14',
        'Plot.linewidth': 2
      })
      widget.chart().createStudy('Moving Average', false, false, [60], null, {
        'Plot.color.0': '#107efa',
        'Plot.linewidth': 2
      })
      let buttonList = this.kLineType.map((item, i) => {
        return widget.createButton()
          .data('interval', item.name)
          .on('click', (e) => {
            buttonList.map(item => {
              item.removeClass('selected')
            })
            buttonList[i].addClass('selected')
            widget.chart().setChartType(item.name === '0' ? 3 : 1)
            widget.chart().getAllStudies().map(items => {
              if (items.name === 'Moving Average') {
                widget.chart().setEntityVisibility(items.id, item.name !== '0')
              }
            })
            if (item.name === '0' || item.name === '5') { // 点击分时
              if (widget.chart().resolution() !== '0' && widget.chart().resolution() !== '5') widget.chart().setResolution(item.name)
            } else widget.chart().setResolution(item.name)
          }) //
          .append(window.$('<a class="time-interval" id=interval' + item.name + '>' + item.buttonName + '</a>'))
      })
      buttonList.map(item => {
        if (item.data('interval') === widget.chart().resolution()) {
          item.addClass('selected')
        }
      })
    })
  }
  timeInit () {
    try {
      this.init()
    } catch(ex) {
      setTimeout(() => { this.timeInit() }, 50)
    }
  }
  componentDidMount () {

    this.timeInit()
  }
  componentWillReceiveProps (nextProps) {
      //保存global配置里的stocks
      if (this.isFirst && nextProps.clist && nextProps.clist.stocks && nextProps.clist.stocks.length > 0) {
        this.isFirst = false
        this.stocks = nextProps.clist.stocks
        this.clear();
         this.timeInit()
      }
       //判断是否切换了币值对
      //if (nextProps.spot_details && this.props.spot_details && nextProps.spot_details.stock_code != this.props.spot_details.stock_code) {
      if (nextProps.exchange_current_coinpair != this.props.exchange_current_coinpair){
        if(this.mounted) {
          this.setState({
            currentCoinPair: nextProps.exchange_current_coinpair,
            hasOption: false,
            isChangeCoinPair: true
          });
        }

        this.kLineType.forEach(element => {
          element.cache = []
          element.firstTime = ''
          element.lastTime = ''
          element.noData = false
          element.isIncremental = true
        })
        this.clear();
        this.widget.setSymbol(nextProps.exchange_current_coinpair, this.widget.chart().resolution().toString())
        // this.init()
    }
  }

  componentWillMount() {
    this.mounted = true;
    let coinPair = getQueryString(this.props.location.search, "coinPair");
    if (this.mounted) {
      this.setState({
        currentCoinPair: coinPair
      })
    }
  }

  componentWillUnmount() {
       this.clear();
       this.mounted = false;
  }
  render() {
    let coinPairString, lxcoinPairString;;

    if (this.state.currentCoinPair) {
      coinPairString = this.state.currentCoinPair.split("/").join("");
      coinPairString = "bbx-" + coinPairString.toLocaleLowerCase();
      lxcoinPairString = this.state.currentCoinPair.split("/").join("");
    }
    return <div className="exchange-trading-container">
      <div className="link-box">
        <a target="_blank" className="aicoin" href={`https://www.aicoin.net.cn/chart/${coinPairString}`}>{intl.get("aicoin-chart")}</a>
        {/* <a target="_blank" className="lxcj" href={`https://k.chainfor.com/?k=243-${lxcoinPairString}`}>{intl.get("lxcj")}</a> */}
      </div>
      <div id="tv_chart_container"></div>
    </div>;
  }
}

export default Trading;
