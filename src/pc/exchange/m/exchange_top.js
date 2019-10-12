import React, { Component } from "react";
import {connect} from "react-redux";
import intl from "react-intl-universal";
import {withRouter} from "react-router-dom";
import "../../../assets/scss/pc/exchange/exchange_m_top.css";
import MarketList from "../exchange_market.js";

@withRouter
@connect(
    state => ({...state.lang, ...state.trade})
)

class ExchangeMTop extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentCoinPair: "",
            isShow: false
        }
    }

    componentWillMount() {
        this.mounted = true;
        if (this.props.current_coin_pair) {
            if(this.mounted) {
                this.setState({
                  currentCoinPair: this.props.current_coin_pair
                });
            }
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentWillReceiveProps(nextProps) {
        if(this.props.current_coin_pair !== nextProps.current_coin_pair) {
            if(this.mounted) {
                this.setState({
                  currentCoinPair: nextProps.current_coin_pair
                });
            }
        }
    }

    toggleShow() {
        if(this.mounted) {
            this.setState({
                isShow: !this.state.isShow
            })
        }
    }

    render() {
        return <div className="exchange-m-top">
            <div className="select-top">
                <span onClick={() => this.toggleShow()}>{this.state.currentCoinPair}</span>
                <i className="iconfont icon-down"></i>
            </div>
            <div className="list-box" style={{ "display": this.state.isShow?"block":"none"}}>
                <MarketList></MarketList>
            </div>
        </div>
    }
}

export default ExchangeMTop;