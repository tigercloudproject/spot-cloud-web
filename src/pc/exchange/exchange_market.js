import React, {Component} from "react";
import { connect } from "react-redux";
import "../../assets/scss/pc/exchange/exchange_market.css";
import { getBbxTicker } from "../../redux/index.redux.js";
import { setCurrentCoinPair, bbxTickerInfo } from "../../redux/trade.redux.js";
import { cutOutDecimal, cutOut, stringCutOut} from "../../utils/dataProcess.js";
import { getQueryString } from "../../utils/getQueryString.js";
import { withRouter } from "react-router-dom";
import intl from "react-intl-universal";

@withRouter
@connect(
  state => ({ ...state.lang, ...state.index, ...state.trade }),
  {
    getBbxTicker,
    setCurrentCoinPair,
    bbxTickerInfo
  }
)
class ExchangeMarket extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      currentCoinPair: ""
    };
  }

  componentWillMount() {
    this.mounted = true;
    this.props.getBbxTicker();

    let coinPair = getQueryString(this.props.location.search, "coinPair") || 'BTC/USDT';
    if (this.mounted) {
      this.setState({
        currentCoinPair: coinPair
      });
      this.props.setCurrentCoinPair(coinPair);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.bbx_ticker !== nextProps.bbx_ticker) {
      this.setBbxTicker(nextProps.bbx_ticker);
    }
  }

  //设置币币交易列表
  setBbxTicker(list) {
    let result = [];
    let rise_fall_rate;
    let info_index = 0; //当前币值对编号
    list.forEach((item, index) => {
      rise_fall_rate = cutOut(item.ticker.rise_fall_rate * 100, 2);
      result.push({
        id: item.stock.name,
        stock_code: item.ticker.stock_code,
        name: item.stock.name,
        last_price: cutOutDecimal(item.ticker.last_price, item.stock.price_unit),
        rise_fall_rate: rise_fall_rate >= 0 ? "+" + rise_fall_rate : rise_fall_rate,
        rise_fall_value: cutOutDecimal(item.ticker.rise_fall_value, item.stock.price_unit),
        high: cutOutDecimal(item.ticker.high, item.stock.price_unit),
        low: cutOutDecimal(item.ticker.low, item.stock.price_unit ),
        totalVolume: cutOutDecimal(item.ticker.total_volume, item.stock.vol_unit),
        amount24: stringCutOut(item.ticker.amount24, 2)

      });

      if(item.stock_code === this.state.currentCoinPair) {
        info_index = index
      }

    });

    if (this.mounted) {
      this.setState({
        list: result
      });
      let info = this.getCurrntTicker(result);
      // console.log("info###", info);
      //设置当前ticker数据
      this.props.bbxTickerInfo(info);
    }

  }

  getCurrntTicker(list) {
    for(let i=0; i<list.length; i++) {
      if(list[i].stock_code === this.state.currentCoinPair) {
        return list[i];
      }
    }
  }

  selectCoinPair(item) {
    // console.log("item###", item.stock_code);
    this.props.setCurrentCoinPair(item.stock_code); //设置当前币值对
    this.props.bbxTickerInfo(item); //设置当前ticker

    let search = `?coinPair=${item.stock_code}`;
    if (this.props.default && this.props.default.value) {
      search = search + `&lang=${this.props.default.value}`;
    }

    if (this.state.qd !== "null") {
      search = search + `&qd=${this.state.qd}`;
    }

    this.props.history.push(`${search}`);
    if (this.mounted) {
      this.setState({
        currentCoinPair: item.stock_code
      });
    }
  }

  render() {
    let ListTr = this.state.list.map((item, index) => {
      return (
        <tr
          key={index}
          onClick={() => this.selectCoinPair(item)}
          className={
            this.state.currentCoinPair === item.stock_code ? "active" : ""
          }
        >
          <td>
            <span className="coin-pair">{item.name}</span>
          </td>
          <td>
            <span>
              {item.last_price}
            </span>
          </td>
          <td>
            <span className={item.rise_fall_rate >= 0 ? "green" : "red"}>
              {item.rise_fall_rate}%
            </span>
          </td>
        </tr>
      );
    });
    return (
      <div className="exchange-market">
        <h3 className="title">{intl.get("exchange_market")}</h3>
        <table className="table-head">
          <colgroup>
            <col width="90px" />
            <col width="76px" />
            <col width="90px" />
          </colgroup>
          <tbody>
            <tr>
              <th>{intl.get("index_thead_pairs")}</th>
              <th>{intl.get("index_thead_current")}</th>
              <th>{intl.get("index_thead_change")}</th>
            </tr>
          </tbody>
        </table>
        <div className="table-content">
          <table>
            <colgroup>
              <col width="90px" />
              <col width="96px" />
              <col width="70px" />
            </colgroup>
            <tbody>{ListTr}</tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default ExchangeMarket;
