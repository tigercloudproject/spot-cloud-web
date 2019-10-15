import React, {Component} from "react";
import { connect } from "react-redux";
import "../../assets/scss/pc/exchange/exchange_ticker.css";
import { getBbxTickerInfo, setBbxCurrentCoinPrice } from "../../redux/trade.redux.js";
import { webExchangeSingle, getCoinPriceUSD} from "../../utils/exchange.js";
import intl from "react-intl-universal";
import { stringCutOut, NumberFormatter } from "../../utils/dataProcess.js";


@connect(
  state => ({ ...state.lang, ...state.trade, ...state.gconfig, ...state.index }),
  {
    getBbxTickerInfo,
    setBbxCurrentCoinPrice
  }
)
class ExchangeTicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      info: null,
      currentCoinPrice: null, //last-price
      currentCoinPriceRate: null, //美元或人民币
    };
  }

  componentWillMount() {
    this.mounted = true;
    
    // if (this.props.current_coin_pair) {
    //     this.props.getBbxTickerInfo(this.props.current_coin_pair);
    // }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentWillReceiveProps(nextProps) {
      // if(this.props.current_coin_pair !== nextProps.current_coin_pair) {
      //     // this.props.getBbxTickerInfo(nextProps.current_coin_pair);
      //   console.log("current_coin_pair%%ticker###", nextProps.current_coin_pair);
      // }
      // console.log("nextProps#####", nextProps);
      if(this.props.bbx_ticker_info !== nextProps.bbx_ticker_info || nextProps.bbx_ticker_info && !this.state.info) {
        // console.log("nextProps.bbx_ticker_info####", nextProps.bbx_ticker_info);
        let currentCoinPriceRate = this.getAmountUSD(nextProps.bbx_ticker_info);
        if (this.state.currentCoinPrice !== nextProps.bbx_ticker_info.last_price) {
          this.props.setBbxCurrentCoinPrice({
            bbx_current_coin_price: nextProps.bbx_ticker_info.last_price,
            bbx_current_coin_price_rate: currentCoinPriceRate,
            bbx_current_coin_rise_fall_rate: nextProps.bbx_ticker_info.rise_fall_rate
          });
        }
        if(this.mounted) {
          this.setState({
            info: nextProps.bbx_ticker_info,
            currentCoinPrice: nextProps.bbx_ticker_info.last_price,
            currentCoinPriceRate: currentCoinPriceRate
          });
        }
        
      }
  }


  getAmountUSD(item) {
        if(!item) {
          return null;
        }
        let spot_tickers = this.props.bbx_ticker && this.props.bbx_ticker.ticker?this.props.bbx_ticker.ticker:[];       
        let coin_prices = (this.props.clist && this.props.clist.coin_prices) ? this.props.clist.coin_prices : [];
        let usd_rates = (this.props.clist && this.props.clist.usd_rates) ? this.props.clist.usd_rates : [];
        let result = "-", coin="";
            coin = item.stock_code.split("/")[1];
            for (let i = 0; i < coin_prices.length; i++) {
              if (coin_prices[i].Name == coin) {
                result = Number(item.last_price).mul(Number(coin_prices[i].price_usd));
              }
            }
            if (result === "-") {
              if(!result) {
                result = webExchangeSingle(coin, "USD", item.last_price, coin_prices, usd_rates, spot_tickers);
              }
            }
            
        if(this.props.default && (this.props.default.index === 1 || this.props.default.index === 2 )) { //中文和繁体
          let cny = this.getRates("CNY", usd_rates);
            result = Number(cny).mul(Number(result));
            if (Number.isNaN(result)) {
                return "";
            }
            return "¥" + stringCutOut(Number(result), 2);
        }else {
            if (Number.isNaN(result)) {
                return "";
            }
            return "$" + stringCutOut(Number(result), 2);
        }
  }

  getRates(name, list) {
    list = list?list: [];
    for (let i = 0; i < list.length; i++) {
      if (list[i].name == name) {
        return list[i].rate;
      }
    }
  }


  render() {
    let {info} = this.state;
    let coin1,coin2;
    if(info) {
      coin1 = info.stock_code.split("/")[0];
      coin2 = info.stock_code.split("/")[1];
    }
    return (
      <div className="exchange-ticker">
        <div className="coin-pair">{info ? info.stock_code: "--"}</div>
        <div className={info && info.rise_fall_rate < 0 ? "red last-price" : "green last-price"}>
          {this.state.currentCoinPrice ? this.state.currentCoinPrice: "--"}
          <span> ≈ {this.state.currentCoinPriceRate?this.state.currentCoinPriceRate:"--"}</span>
        </div>
        <ul>
          <li>
            <p>
              <span>{intl.get("exchange_thead_change")}：</span>
              <span className={info && info.rise_fall_rate<0?"red":"green"}>{info?info.rise_fall_rate:"--"}%</span>
            </p>
            <p>
              <span>{intl.get("index_thead_change_num")}：</span>
              <span className={info && info.rise_fall_rate < 0 ? "red" : "green"}>{info?info.rise_fall_value:"--"}</span>
            </p>
          </li>
          <li>
            <p>
              <span>{intl.get("exchange_thead_high")}：</span> {info ? info.high: "--"}
            </p>
            <p>
              <span>{intl.get("exchange_thead_low")}：</span> {info ? info.low: "--"}
            </p>
          </li>
          <li>
            <p>
              <span>24H {intl.get("exchange_thead_24volume")}({coin1?coin1:"--"})：</span>{info ? info.totalVolume:"--"}
            </p>
            <p>
              {/* <span>24H {intl.get("exchange_head_total")}({coin2?coin2:"--"})：</span>{info ? info.amount24:"--"} */}
              <span>24H {intl.get("exchange_head_total")}({coin2 ? coin2 : "--"})：</span>{info ? NumberFormatter(info.amount24, 2):"--"}
            </p>
          </li>
        </ul>
      </div>
    );
  }
}

export default ExchangeTicker;