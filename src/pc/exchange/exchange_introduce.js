import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import Icon from "../../assets/images/eth-icon-test.png";
import { getCoinBrief } from "../../redux/exchange.redux";
import { getQueryString } from "../../utils/getQueryString.js";
import { parseDate } from "../../utils/parseTime.js";
import nextIcon from "../../assets/images/icon-next2.png";
import intl from "react-intl-universal";
import "../../assets/scss/pc/exchange/exchange_introduce.css";

@withRouter
@connect(state => ({ ...state.sdetails, ...state.gconfig, ...state.lang }), {
    getCoinBrief
})
class CoinBasics extends Component {
    constructor(props) {
        super(props);
        this.state = {
            coinIcon: "",
            coinData: null,
            coinFullName: "",
            coinName: "",
            show: true,
        }
    }

    componentWillMount() {
        this.mounted = true;
        // let coinPair = getQueryString(this.props.location.search, "coinPair");
        let coinPair = getQueryString(this.props.location.search, "coinPair") || 'BTC/USDT';
        let coinArr = coinPair.split("/");
        this.props.getCoinBrief(coinArr[0]);
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentWillReceiveProps(nextProps) {
        //切换币值对了
        if (nextProps.exchange_current_coinpair != this.props.exchange_current_coinpair) {
            //console.log("币值对切换了");
            this.props.getCoinBrief(nextProps.exchange_current_coinpair.split("/")[0]);
        }

        if (nextProps.coin_brief !== this.props.coin_brief) {
            //console.log("coin######",nextProps.coin_brief);
            if (this.mounted) {
                this.setState({
                    coinData: nextProps.coin_brief
                })
            }
        }

        //获取spot_coins
        if (nextProps.clist && nextProps.clist.spot_coins) {
            // let coinPair = getQueryString(this.props.location.search, "coinPair");
            let coinPair = getQueryString(this.props.location.search, "coinPair") || 'BTC/USDT';
            let coinArr = coinPair.split("/");
            this.getCoinIcon(nextProps.clist.spot_coins, coinArr[0]);
        }

    }

    getCoinIcon(list, coin) {
        let lang;
        if (this.props.default && this.props.default.index) {
            lang = this.props.default.index;
        }
        for (let i = 0; i < list.length; i++) {
            if (list[i].name === coin) {
                let fullName = Number(lang) === 3 ? list[i].full_name_en : list[i].full_name_zh;
                if (this.mounted) {
                    this.setState({
                        coinIcon: list[i].big,
                        coinFullName: fullName,
                        coinName: list[i].name
                    })
                }
                break;
            }
        }
    }

    toggle() {
        if (this.mounted) {
            this.setState({
                show: !this.state.show
            })
        }
    }

    render() {
        let coinData = this.state.coinData;
        let langIndex;
        if (this.props.default && this.props.default.index) {
            langIndex = this.props.default.index;
        }

        let styleShow = {
            transform: "rotate(90deg)"
        }
        let styleHide = {
            transform: "rotate(0deg)"
        }

        let heightStyle0 = {
            height: "0px"
        }

        let heightStyleAuto = {
            height: "auto"
        }

        return (
            <section className="coin-basics-box">
                <div className="coin-basics-title clearfix" onClick={() => this.toggle()}>
                    <i className="right-icon" style={this.state.show ? styleShow : styleHide}></i>
                    {intl.get("coin_brief_title")}
                    <a className="the-more" href={coinData ? coinData.link : ""} target="_blank" rel="noopener noreferrer"><span>{intl.get("coin_brief_more")}</span> <i className="iconfont icon-iconmore-copy" /></a>
                </div>
                <div className="coin-basics-con" style={this.state.show ? heightStyleAuto : heightStyle0}>
                    <div className="left">
                        <div className="icon-box">
                            <img className="coin-icon" src={this.state.coinIcon} alt="coinIcon" />
                            <span className="coin-name">{this.state.coinName}</span>
                            <span className="coin-full-name">({this.state.coinFullName})</span>
                        </div>
                        <h3>{intl.get("coin_introduction")}</h3>
                        <p>
                            {langIndex === 3 && coinData ? coinData.brief_en : null}
                            {(langIndex === 1 || langIndex === 2) && coinData ? coinData.brief_zh : null}
                            {langIndex === 4 && coinData ? coinData.brief_en : null}
                        </p>
                    </div>
                    <div className="right">
                        <table>
                            <tbody>
                                <tr>
                                    <td>{intl.get("coin_brief_publish_time")}</td>
                                    <td>{coinData && coinData.pubed_at ? parseDate(coinData.pubed_at) : "-"}</td>
                                </tr>
                                <tr>
                                    <td>{intl.get("coin_brief_publish_total")}</td>
                                    <td>{coinData ? coinData.max_supply : null}</td>
                                </tr>
                                <tr>
                                    <td>{intl.get("coin_brief_total_circulation")}</td>
                                    <td>{coinData ? coinData.circulating_supply : null}</td>
                                </tr>
                                <tr>
                                    <td>{intl.get("coin_brief_issue_Price")}</td>
                                    <td>{coinData ? coinData.raise_price : null}</td>
                                </tr>
                                <tr>
                                    <td>{intl.get("coin_brief_white_paper")}</td>
                                    <td><a href={coinData ? coinData.white_paper : ""} target="_blank" rel="noopener noreferrer">{coinData ? coinData.white_paper : null}</a></td>
                                </tr>
                                <tr>
                                    <td>{intl.get("coin_brief_offical_website")}</td>
                                    <td><a href={coinData ? coinData.website : ""} target="_blank" rel="noopener noreferrer">{coinData ? coinData.website : null}</a></td>
                                </tr>
                                <tr>
                                    <td>{intl.get("coin_brief_block_browser")}</td>
                                    <td><a href={coinData ? coinData.blockchain : ""} target="_blank" rel="noopener noreferrer">{coinData ? coinData.blockchain : null}</a></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        )
    }
}

export default CoinBasics;
