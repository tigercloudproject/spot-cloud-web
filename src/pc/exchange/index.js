import React, {Component} from "react";
import { connect } from "react-redux";
import "../../assets/scss/pc/exchange/exchange.css";

import {withRouter} from "react-router-dom";
import MediaQuery from "react-responsive";

import Assets from "./exchange_assets";
import Ticker from "./exchange_ticker";
import Market from "./exchange_market";
import Kline from "./exchange_kline";
import Transaction from "./exchange_transaction";
import Depth from "./exchange_depth";
import Notice from "./exchange_notice";
import Submit from "./exchange_submit";
import RecordList from "./exchange_record_list";
import Introduce from "./exchange_introduce";

import MTop from "./m/exchange_top.js";

@withRouter
@connect(state => ({...state.lang}), {

})
class Exchange extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    render() {
        return <div className="exchange-container">
            <MediaQuery minWidth={700}>
                <div className="exchange-pc">
                    <div className="exchange-top-s">
                        <div className="exchange-assets-box">
                            <Assets></Assets>
                        </div>
                        <div className="exchange-ticker-box">
                            <Ticker></Ticker>
                        </div>
                    </div>
                    <div className="exchange-top">
                        <div className="exchange-top-left">
                            <div className="exchange-assets-box">
                                <Assets></Assets>
                            </div>
                            <div className="exchange-market-box">
                                <Market></Market>
                            </div>

                        </div>
                        <div className="exchange-top-middle">
                            <div className="exchange-ticker-box">
                                <Ticker></Ticker>
                            </div>
                            <div className="exchange-kline-box">
                                <Kline></Kline>
                            </div>
                            <div className="exchange-submit-box">
                                <Submit></Submit>
                            </div>
                        </div>
                        <div className="exchange-top-right">
                            <div className="exchange-depth-box">
                                <Depth></Depth>
                            </div>
                            <div className="exchange-transaction-box">
                                <Transaction></Transaction>
                            </div>
                        </div>
                    </div>
                    <div className="exchange-bottom">
                        <div className="record-list-box">
                            <RecordList></RecordList>
                        </div>

                    </div>
                </div>
            </MediaQuery>
            <MediaQuery maxWidth={700}>
                <div className="exchange-m">
                    <div className="exchange-assets-m">
                        <Assets></Assets>
                    </div>
                    <div className="exchange-ticker-box">
                        <MTop></MTop>
                    </div>
                    <div className="exchange-submit-m">
                        <Submit></Submit>
                    </div>
                    <div className="exchange-record-m">
                        <RecordList></RecordList>
                    </div>
                    <div className="exchange-kline-m">
                        <Kline></Kline>
                    </div>
                    <div className="exchange-depth-m">
                        <Depth></Depth>
                    </div>
                    <div className="exchange-transaction-m">
                        <Transaction></Transaction>
                    </div>
                    <div className="exchange-introduce-m" style={{"display": "none"}}>
                        <Introduce></Introduce>
                    </div>

                    <div style={{"display": "none"}}>
                        <Ticker></Ticker>
                    </div>
                </div>
            </MediaQuery>
        </div>
    }
}

export default Exchange;
