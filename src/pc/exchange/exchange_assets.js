import React, {Component} from "react";
import {connect} from "react-redux";
import "../../assets/scss/pc/exchange/exchange_assets.css";
import { getCookie } from "../../utils/cookie.js";
import { webExchangeSingle, webExchange } from "../../utils/exchange2.js";
import { cutOutDecimal } from "../../utils/dataProcess.js";
import intl from "react-intl-universal";
import { withRouter } from "react-router-dom";

@withRouter
@connect(
  state => ({
    ...state.lang,
    ...state.trade,
    ...state.gconfig,
    ...state.index
  }),
  {}
)
class ExchangeAssets extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: "",
      show: true, //是否显示资产
      totalUSDT: "",
      totalUSD: "",
      totalCNY: "",
      priceUSD: null,
      usdtVolUnit: null, //单位列表
      usdtPriceUnit: null, //单位列表
      tickers: []
    };
  }

  componentWillMount() {
    this.mounted = true;
    let token = getCookie( 'bbx_token' );
    if (this.mounted) {
      this.setState({
        token: token
      });
    }

    if (this.props.clist && this.props.clist.spot_coins) {
      this.setUSDTUnit(this.props.clist.spot_coins);
    }

    if (this.props.clist && this.props.clist.coin_prices) {
      this.setPrice(this.props.clist.coin_prices);
    }
    if (this.mounted) {
      let eye = localStorage.getItem("eye");
      eye = eye === null ? true : eye;
      this.setState({
        show: eye === "true" ? true : false
      });
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.clist &&
      this.props.clist.spot_coins !== nextProps.clist.spot_coins
    ) {
      this.setUSDTUnit(nextProps.clist.spot_coins);
    }

    if (
      nextProps.clist &&
      nextProps.clist.coin_prices &&
      this.props.clist.coin_prices !== nextProps.clist.coin_prices
    ) {
      this.setPrice(nextProps.clist.coin_prices);
    }

    if (this.props.bbx_ticker !== nextProps.bbx_ticker) {
      this.getTicker(nextProps.bbx_ticker);
    }
  }

  setPrice(list) {
    let priceUSD = {};
    list.forEach(item => {
      priceUSD[item.Name] = item.price_usd;
    });

    if (this.mounted) {
      this.setState({
        priceUSD: priceUSD
      });
    }
  }

  getCNYrate(list) {
    for (let i = 0; i < list.length; i++) {
      if (list[i].name === "CNY") {
        return list[i].rate;
      }
    }
  }

  //设置单位列表
  setUSDTUnit(list) {
    for (let i = 0; i < list.length; i++) {
      if (list[i].name === "USDT") {
        if (this.mounted) {
          this.setState({
            usdtVolUnit: list[i].vol_unit,
            usdtPriceUnit: list[i].price_unit
          });
          break;
        }
      }
    }
  }

  getTicker(list) {
    // let result = [];
    // list.forEach(item => {
    //   result.push(item.ticker);
    // });

    // if (this.mounted) {
    //   this.setState({
    //     tickers: result
    //   });
    // }

    if (this.mounted) {
      this.setState({
        tickers: list
      })
    }
  }

  calculateAssets(list) {
    let spot_tickers = this.state.tickers;
    let coin_prices =
      this.props.clist && this.props.clist.coin_prices
        ? this.props.clist.coin_prices
        : [];
    let usd_rates =
      this.props.clist && this.props.clist.usd_rates
        ? this.props.clist.usd_rates
        : [];
    let priceUSD = this.state.priceUSD;
    let cny = this.getCNYrate(usd_rates);
    let usd = 0,
      usd_result = 0,
      cny_result = 0;

    let available = webExchange(list, "USDT", coin_prices, usd_rates, spot_tickers, "available_vol");
    let freezeVol = webExchange(list, "USDT", coin_prices, usd_rates, spot_tickers, "freeze_vol");
    let usdt_result = Number(available).add(Number(freezeVol));
    usd_result = usdt_result.mul(Number(priceUSD["USDT"]));
    cny_result = Number(usd_result).mul(Number(cny));


    return {
      totalUSD: usd_result,
      totalUSDT: usdt_result,
      totalCNY: cny_result
    };
  }

  eyeToggle() {
    if (this.mounted) {
      localStorage.setItem("eye", !this.state.show);
      this.setState({
        show: !this.state.show
      });
    }
  }

  render() {
    let money;
    // console.log("this.props.bbx_assets_list#####", this.props.bbx_assets_list);
    if (this.props.bbx_assets_list && this.props.bbx_assets_list.length > 0) {
      money = this.calculateAssets(this.props.bbx_assets_list);
    }
    let langIndex;
    if (this.props.default && this.props.default.index) {
      langIndex = this.props.default.index;
    }

    let usdt_price = 0,
      usd_price = "0.00",
      cny_price = "0.00";
    if (money) {
      usdt_price = money.totalUSDT;
      if (money.totalUSD) {
        usd_price = cutOutDecimal(money.totalUSD, 0.01);
      }
      if (money.totalCNY) {
        cny_price = cutOutDecimal(money.totalCNY, 0.01);
      }
    }
    if (this.state.usdtVolUnit) {
      // usdt_price = cutOutDecimal(usdt_price, this.state.usdtVolUnit);
      usdt_price = cutOutDecimal(usdt_price, 2);
    }

    let token = getCookie( 'bbx_token' );

    return (
      <div className="exchange-assets">
        <i
          className={this.state.show ? "eye-open" : "eye-close"}
          onClick={() => this.eyeToggle()}
        />
        <h3>{intl.get("exchange_assets")}：</h3>
        {token ? (
          <p className="login">
            {this.state.show ? (
              <span>
                {usdt_price} USDT
                <span className="price">
                  {langIndex === 1 ? " ≈ ¥" + cny_price : null}
                  {langIndex !== 1 ? " ≈ $" + usd_price : null}
                </span>
              </span>
            ) : (
              <span className="is-close">** USDT</span>
            )}
          </p>
        ) : (
          <p className="no-login">
            <span className="money">-- USDT</span>
            <a className="to-login" href={`/login?path=/exchange${window.location.search}`}>
              {intl.get("exchange_btn_login")}
            </a>
            <span>{intl.get("exchange_btn_or")}</span>
            <a className="to-register" href={`/register?path=exchange${window.location.search}`}>
              {intl.get("exchange_btn_register")}
            </a>
            <span>{intl.get("exchange_btn_to_trade")}</span>
          </p>
        )}
      </div>
    );
  }
}

export default ExchangeAssets;
