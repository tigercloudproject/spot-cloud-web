import React, { Component } from "react";
import { connect } from "react-redux";
import { parseTimeTos } from "../../../utils/parseTime.js";
import intl from "react-intl-universal";
import { cutOutDecimal, stringCutOut, cutOutFloor2} from "../../../utils/dataProcess.js";
import noDataImg from "../../../assets/images/icon-Nocontent.png";
import loadingImg from "../../../assets/images/loadding.gif";
import { getTradeRecordsList } from "../../../redux/trade.redux";
import { getQueryString } from "../../../utils/getQueryString.js";
import { withRouter } from "react-router-dom";

@withRouter
@connect(
  state => ({ ...state.lang, ...state.trade }),
  {
    getTradeRecordsList
  }
)
class TList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: null,
      stocks: [] //配置信息
    };
  }

  componentWillMount() {
    this.mounted = true;
    // this.props.getTradeRecordsList();
    let coinPair = getQueryString(this.props.location.search, "coinPair");
    if (this.props.bbx_show_all) {
      this.props.getTradeRecordsList();
    } else {
      this.props.getTradeRecordsList(coinPair);
    }
    if (this.mounted && this.props.bbx_transation_record) {
      this.setState({
        list: this.props.bbx_transation_record
      });
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.bbx_transation_record !== nextProps.bbx_transation_record) {
      if (this.mounted) {
        this.setState({
          list: nextProps.bbx_transation_record
        });
      }
    }
  }

  render() {
    let deal_price, deal_vol, amount, fee;
    let price_unit, vol_unit;
    let ListLi;
    if (this.state.list) {
      ListLi = this.state.list.map((item, index) => {
        deal_price = item.deal_price;
        deal_vol = item.deal_vol;
        // amount = leastTwoDecimal(Number(item.deal_vol).mul(Number(item.deal_price)));
        fee = cutOutDecimal(Number(item.fee), "0.00000001");
        if (this.props.units && this.props.units[item.stock_code]) {
          price_unit = this.props.units[item.stock_code].price_unit;
          vol_unit = this.props.units[item.stock_code].vol_unit;
          deal_price = cutOutDecimal(deal_price, price_unit);
          deal_vol = cutOutDecimal(deal_vol, vol_unit);

          amount = Number(item.deal_vol).mul(Number(item.deal_price));
          if (Number(amount) < Number(price_unit)) {
            amount = 0.0;
          }
          amount = cutOutFloor2(amount, price_unit);
          // console.log("Number(item.deal_vol).mul(Number(item.deal_price))#####", Number(item.deal_vol).mul(Number(item.deal_price)));
        }
        return (
          <li key={index}>
            <span className="date">{parseTimeTos(item.created_at)}</span>
            <span className="coin-pair">{item.stock_code}</span>
            <span className={item.way === 1 ? "way green" : "way red"}>
              {item.way === 1
                ? intl.get("assets_order_tab_buy")
                : intl.get("assets_order_tab_sell")}
            </span>
            <span>{deal_price}</span>
            <span>{deal_vol}</span>
            <span>{amount}</span>
            <span>{fee}</span>
          </li>
        );
      });
    }

    return (
      <div className="list-box">
        <ul className="list-head">
          <li className="date">{intl.get("assets_order_thead_date2")}</li>
          <li className="coin-pair">{intl.get("assets_order_thead_pairs")}</li>
          <li className="way">{intl.get("assets_order_thead_type")}</li>
          <li>{intl.get("assets_order_thead_done_price")}</li>
          <li>{intl.get("assets_order_thead_done_amount")}</li>
          <li>{intl.get("assets_order_thead_done_total")}</li>
          <li>{intl.get("assets_order_thead_fee")}</li>
        </ul>
        <div className="list-body">
          <div
            className="no-data-loading"
            style={{
              display:
                this.state.list === null || this.state.list.length < 1
                  ? "block"
                  : "none"
            }}
          >
            {this.state.list === null ? <img src={loadingImg} /> : null}
            {this.state.list && this.state.list.length < 1 ? (
              <img src={noDataImg} />
            ) : null}
            {this.state.list && this.state.list.length < 1 ? (
              <p>{intl.get("assets_no_data")}</p>
            ) : null}
          </div>
          <ul>{ListLi}</ul>
        </div>
      </div>
    );
  }
}

export default TList;
