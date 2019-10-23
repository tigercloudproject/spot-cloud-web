import React, {Component} from "react";
import DataFeeds from "../../assets/js/datafeed3.js";
import {connect} from "react-redux";
import intl from "react-intl-universal";
import { getKlineDate, getStocks } from "../../redux/trade.redux";
import { indexAjax } from "../../ajax";
import CFG from "../../hostConfig";
import webSocketFn from "../../assets/js/webSocket.js";
import "../../assets/scss/pc/exchange/exchange_kline.css";
import { getQueryString } from "../../utils/getQueryString.js";
import { withRouter } from "react-router-dom";

@withRouter
@connect(
  state => ({ ...state.lang, ...state.trade }),
  {
    getKlineDate,
    getStocks
  }
)
class ExchangeKline extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stocks: [], //为了处理小数位数（global里的stocks
      currentCoinPair: ""
    };

    this.kLineType = [
      //k线tab
      {
        id: 0,
        name: "0",
        buttonName: intl.get("exchange_dash_line"),
        period: "5min",
        step: 5 * 60 * 1000,
        bit: 5,
        type: "M",
        firstTime: "",
        lastTime: "",
        cache: [],
        noData: false,
        isIncremental: true
      },
      {
        id: 0,
        name: "5",
        buttonName: intl.get("exchange_dash_5min"),
        period: "5min",
        step: 5 * 60 * 1000,
        bit: 5,
        type: "M",
        firstTime: "",
        lastTime: "",
        cache: [],
        noData: false,
        isIncremental: true
      },
      {
        id: 1,
        name: "15",
        buttonName: intl.get("exchange_dash_15min"),
        period: "15min",
        step: 15 * 60 * 1000,
        type: "M",
        bit: 15,
        firstTime: "",
        lastTime: "",
        cache: [],
        noData: false,
        isIncremental: true
      },
      {
        id: 2,
        name: "30",
        buttonName: intl.get("exchange_dash_30min"),
        period: "30min",
        step: 30 * 60 * 1000,
        type: "M",
        bit: 30,
        firstTime: "",
        lastTime: "",
        cache: [],
        noData: false,
        isIncremental: true
      },
      {
        id: 3,
        name: "60",
        buttonName: intl.get("exchange_dash_1hour"),
        period: "1hour",
        step: 60 * 60 * 1000,
        type: "H",
        bit: 1,
        firstTime: "",
        lastTime: "",
        cache: [],
        noData: false,
        isIncremental: true
      }, // { // 是否是第一次请求 // 是否是第一次增量 // 是否是第一次增量 // 是否是第一次增量 // 是否是第一次增量 // 是否是第一次增量
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
        name: "240",
        buttonName: intl.get("exchange_dash_4hour"),
        period: "4hour",
        step: 4 * 30 * 60 * 1000,
        type: "H",
        bit: 4,
        firstTime: "",
        lastTime: "",
        cache: [],
        noData: false,
        isIncremental: true
      }, // { // 是否是第一次增量
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
        name: "D",
        buttonName: intl.get("exchange_dash_1day"),
        period: "1day",
        step: 1440 * 60 * 1000,
        type: "D",
        bit: 1,
        firstTime: "",
        lastTime: "",
        cache: [],
        noData: false,
        isIncremental: true
      },
      {
        id: 9,
        name: "W",
        buttonName: intl.get("exchange_dash_1week"),
        period: "1week",
        step: 7 * 1440 * 60 * 1000,
        type: "D",
        bit: 7,
        firstTime: "",
        lastTime: "",
        cache: [],
        noData: false,
        isIncremental: true
      }
    ]; // 是否是第一次增量 // 是否是第一次增量
  }

  componentWillMount() {
    this.mounted = true;
    this.props.getStocks();

    if (this.props.current_coin_pair) {
      if (this.mounted) {
        this.setState({
          currentCoinPair: this.props.current_coin_pair
        });
      }
    }

    if (!window.webSocket_bbx) {
      window.webSocket_bbx = webSocketFn(indexAjax.bbx_websocket);
    }

    if(this.props.stocks) {
        if(this.mounted) {
            this.setState({
                stocks: this.props.stocks
            })
        }
    }
  }

  componentWillUnmount() {
    this.mounted = false;

    if (this.clear) {
      this.clear();
    }
  }

  componentWillReceiveProps(nextProps) {
    //当前stocks配置变化
    if (this.props.stocks !== nextProps.stocks) {
      if (this.mounted) {
        this.setState({
          stocks: nextProps.stocks
        });
      }
    }
    // console.log("nextProps###", nextProps);
    //当前币值对变化
    if (this.props.current_coin_pair !== nextProps.current_coin_pair) {
      if (this.mounted) {
        this.setState({
          currentCoinPair: nextProps.current_coin_pair
        });
      }

      this.kLineType.forEach(element => {
        element.cache = [];
        element.firstTime = "";
        element.lastTime = "";
        element.noData = false;
        element.isIncremental = true;
      });
      this.clear();
      this.init();
    }
  }

  componentDidMount() {
    this.timeInit();
  }

  init() {
    let coinPair = getQueryString(this.props.location.search, "coinPair");
    // let coinPair = getQueryString(this.props.location.search, "coinPair") || 'BTC/USDT';

    let lang = this.props.default.value || "zh-CN";
    let langObj = {
      "zh-CN": "zh",
      "zh-TW": "en",
      "en-US": "en"
    };
    let kLineType = this.kLineType;

    let getChartproperties = JSON.parse(
      window.localStorage.getItem("tradingview.chartproperties")
    );
    if (
      getChartproperties &&
      getChartproperties.paneProperties &&
      getChartproperties.paneProperties.background !== "#141b2e"
    ) {
      getChartproperties.paneProperties.background = "#141b2e";
      window.localStorage.setItem(
        "tradingview.chartproperties",
        JSON.stringify(getChartproperties)
      );
    }
    // console.log()
    let TradingView = window.TradingView;

    let dataFeeds = new DataFeeds(kLineType,this.state.stocks,getKlineDate,"QuoteBin");
    this.clear = () => {
      dataFeeds.unsubscribeBars();
    };

    let widget = (this.widget = window.tvWidget = new TradingView.widget({
      width: "100%",
      // 高度大于460才显示工具栏，在1.14版本才修复
      height: 480,
      symbol: coinPair,
      interval: "5",
      allow_symbol_change: true,
      timezone: "Asia/Hong_Kong",
      container_id: "tv_chart_container",
      // BEWARE: no trailing slash is expected in feed URL
      datafeed: dataFeeds,
      // (!~window.location.hostname.indexOf('bbx') ? '' : 'https://static.bbx.com') +
      //   "http://local.bbx.com/testjs/charting_library/charting_library.min.js",
      library_path: CFG.publicPath + "/js/charting_library/charting_library.min.js",
      locale: langObj[lang] || "en", // this.changeLocale() || 'zh',
      // custom_css_url: "/testjs/charting_library/static/base.css",
      custom_css_url: CFG.publicPath + "/js/charting_library/static/dash.css",
      debug: false,
      toolbar_bg: "red",
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
        "hide_last_na_study_output",
        "hide_left_toolbar_by_default"
      ],
      charts_storage_api_version: "1.1",
      client_id: window.location.host.slice(-7),
      user_id: 1, // public_user_id
      loading_screen: {
        backgroundColor: "#141b2e"
      },
      overrides: {
        volumePaneSize: "medium",
        "paneProperties.background": "#141b2e", // 整个背景
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
        "scalesProperties.textColor": "rgba(151,176,214, 0.7)", // 字母和数字
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
      widget.chart().createStudy("Moving Average", false, false, [5], null, {
        "Plot.color.0": "#ff9500",
        "Plot.linewidth": 2
      });
      widget.chart().createStudy("Moving Average", false, false, [10], null, {
        "Plot.color.0": "#d32f2f",
        "Plot.linewidth": 2
      });
      widget.chart().createStudy("Moving Average", false, false, [20], null, {
        "Plot.color.0": "#b4ad14",
        "Plot.linewidth": 2
      });
      widget.chart().createStudy("Moving Average", false, false, [60], null, {
        "Plot.color.0": "#10172a",
        "Plot.linewidth": 2
      });
      let buttonList = kLineType.map((item, i) => {
        return widget
          .createButton()
          .data("interval", item.name)
          .on("click", e => {
            buttonList.map(item => {
              item.removeClass("selected");
            });
            buttonList[i].addClass("selected");
            widget.chart().setChartType(item.name === "0" ? 3 : 1);
            widget
              .chart()
              .getAllStudies()
              .map(items => {
                if (items.name === "Moving Average") {
                  widget
                    .chart()
                    .setEntityVisibility(items.id, item.name !== "0");
                }
              });
            if (item.name === "0" || item.name === "5") {
              // 点击分时
              if (
                widget.chart().resolution() !== "0" &&
                widget.chart().resolution() !== "5"
              )
                widget.chart().setResolution(item.name);
            } else widget.chart().setResolution(item.name);
          }) //
          .append(
            window.$(
              '<a class="time-interval" id=interval' +
                item.name +
                ">" +
                item.buttonName +
                "</a>"
            )
          );
      });
      buttonList.map(item => {
        if (item.data("interval") === widget.chart().resolution()) {
          item.addClass("selected");
        }
      });
      // widget.createButton()
      // // .append(window.$('<a class="time-interval" id=interval' + 12 + '>' + this.$t('typeTitle.lxcj') + '</a>'))
      // .append(window.$('<a class="time-interval" target="_blank"  style="border-bottom: 1px dotted rgba(151,176,214, 0.7)" href="' + `https://k.chainfor.com/?k=249-${this.productInfo.contract.name}` + '">' + this.$t('typeTitle.lxcj') + '</a>'))
    });

    let t;
    let klineIfarme = document.querySelector("#" + widget.id);
    klineIfarme.style.visibility = "hidden";
    let isLoad = () => {
      try {
          if ( klineIfarme.contentWindow && klineIfarme.contentWindow.document.readyState === "complete")
          {
            klineIfarme.style.visibility = "";
            clearInterval(t);
          }
      } catch (e) {

      } finally {

      }
    };
    t = setInterval(isLoad, 1000);
  }

  timeInit() {
    try {
      this.init();
    } catch (ex) {
      // console.log("333");
      setTimeout(() => {
        this.timeInit();
      }, 50);
    }
  }

  render() {
    let style = {
      width: "100%",
      height: "100%",
      background: "#141b2e"
    };
    return (
      <div className="exchange-kline" style={style}>
        <div id="tv_chart_container" />
      </div>
    );
  }
}

export default ExchangeKline;
