import React, {Component} from "react";
import "../../assets/scss/pc/exchange/exchange_index.css";
import ExchangeHeader from "./exchange_header";
import DynamicData from "./dynamic_data";
import NewExchangeData from "./new_exchange_data";
//import ExchangeDash from "./exchange_dash";
import Trading from "./trading";
import PayBix from "./paybix.js";
import TradeList from "./trade_list";
import CoinBasics from "./coin_basics";
import { connect } from "react-redux";
import { getSpotDetails, getTradeRecords, changeCurrentCoinPair} from "../../redux/exchange.redux.js";
import { getGlobalConfig, getUserConfig } from "../../redux/global.redux.js";
import { getQueryString } from "../../utils/getQueryString.js";
import { withRouter } from "react-router-dom";
import { getspotTickersData } from "../../redux/index.redux.js";

import MediaQuery from "react-responsive";
import { intl } from "react-intl";

@withRouter
@connect(state => ({ ...state.sdetails, ...state.gconfig, ...state.user }), {
    getGlobalConfig,
    getUserConfig,
    getSpotDetails,
    getTradeRecords,
    getspotTickersData,
    changeCurrentCoinPair
})
class Exchange extends Component {
    constructor(props){
        super(props);
        this.state = {
            coinPair: '',
            
        }
        this.selectCoinPair = this.selectCoinPair;
    }

    componentWillMount() {
        this.mounted = true;
        let coinPair = getQueryString(this.props.location.search, "coinPair");
        if(this.mounted) {
            this.setState({
                coinPair: coinPair
            })
        }

        if (this.props.clist.length == 0) {
          this.getExchangeData2(coinPair);
        } else {
          this.getExchangeData(coinPair);
        }

        if(this.props.user) {
            this.props.getUserConfig();
        }

        
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentDidMount() {
        //console.log('exchange')
    }


    //获取交易页左侧，右侧和上部的数据(clist有值时，即是从首页跳转时)
    async getExchangeData(coinPair) {
        this.props.getSpotDetails(coinPair);
        this.props.getspotTickersData();
    }
    
    //获取交易页左侧，右侧和上部的数据(clist无值时，即是不是从首页跳转时)
    getExchangeData2(coinPair) {
        let promise = Promise.all([
            this.props.getGlobalConfig(),
            this.props.getSpotDetails(coinPair),
            this.props.getspotTickersData()
        ]);

        promise
            .then(() => {
               
            })
            .catch(err => {
                console.log("promise报错了###", err);
            });
    }

    render() {
        return <div className="exchange-container">
            <MediaQuery minWidth={676}>
              <ExchangeHeader selectCoinPair={this.selectCoinPair} />
              <section className="data-center">
                <div className="data-left">
                  <DynamicData coinPair={this.state.coinPair} />
                </div>
                <div className="data-middle">
                  <Trading coinPair={this.state.coinPair} />
                  {/* <ExchangeDash coinPair={this.state.coinPair}></ExchangeDash> */}
                  <PayBix />
                </div>
                <div className="data-right">
                  <NewExchangeData coinPair={this.state.coinPair} />
                </div>
              </section>
              <TradeList />
              <CoinBasics />
            </MediaQuery>

            <MediaQuery maxWidth={676}>
                <ExchangeHeader selectCoinPair={this.selectCoinPair} />
                <PayBix />
                <TradeList />
                <Trading coinPair={this.state.coinPair} />
                <DynamicData coinPair={this.state.coinPair} />
                <NewExchangeData coinPair={this.state.coinPair} />
                <CoinBasics />
            </MediaQuery>
          </div>;
    }

}

export default Exchange;

