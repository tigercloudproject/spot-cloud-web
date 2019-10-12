import React, {Component} from "react";
import { connect } from "react-redux";
import { decimalProcess } from "../../utils/gconfig/stocksModel.js";
import { getQueryString } from "../../utils/getQueryString.js";
import { cutOut, leastTwoDecimal } from "../../utils/dataProcess.js";
import { withRouter } from "react-router-dom";
import { getPriceUnit, getVolUnit } from "../../utils/gconfig/stocksModel.js";
import intl from "react-intl-universal";
import { getSpotDetails} from "../../redux/exchange.redux.js";


@withRouter
@connect(state => ({ ...state.sdetails, ...state.gconfig}), {
    getSpotDetails
})
class NewExchangeData extends Component {
    constructor(props){
        super(props);
        this.state = {
            list : [],
            trades: [],
            stocks: [], //为了处理小数位数（global里的stocks）
            priceUnit: '',
            volUnit: '',
            firstCoin: '',
            lastCoin: ''
        }
        this.getStringDate = this.getStringDate.bind(this);
    }

    componentWillMount() {
        this.mounted = true;
        let coinPair = getQueryString(this.props.location.search, "coinPair") || 'BTC/USDT';
        let coinArr = coinPair.split("/");
        this.setState({
            firstCoin: coinArr[0],
            lastCoin: coinArr[1]
        })
        this.props.getSpotDetails(coinPair);
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentWillReceiveProps(nextProps) {

        //保存global配置里的stocks
        if (nextProps.clist && nextProps.clist.stocks && nextProps.clist.stocks.length > 0) {
            let coinPair = getQueryString(this.props.location.search, "coinPair") || 'BTC/USDT';
            this.getCurrentUnit(coinPair, nextProps.clist.stocks);
        }


        //判断是否切换了币值对
        if (nextProps.spot_details && this.props.spot_details && nextProps.spot_details.stock_code != this.props.spot_details.stock_code && nextProps.clist.spot_coins) {
            let coinArr = String(nextProps.spot_details.stock_code).split("/");
            this.setState({
                firstCoin: coinArr[0],
                lastCoin: coinArr[1]
            })

        }


        if(nextProps.spot_details && nextProps.spot_details.trades) {
            if(this.mounted) {
                this.setState({
                    trades: nextProps.spot_details.trades
                })
            }
        }
    }

    // getPriceUnit(spot_coins,coin) {

    // }

    // getVolUnit(spot_coins,coin) {

    // }

    //根据global里面的stocks 获取当前币值对的price_unit
   // getCurrentPriceUnit(coinPair, list) {
    getCurrentUnit(coinPair, list) { //获取数量和价格的小数精度
        let price_unit = getPriceUnit(list, coinPair);
        let vol_unit = getVolUnit(list, coinPair);

        this.setState({
            priceUnit: price_unit,
            volUnit: vol_unit
        })
    }

    getStringDate(date) {
        let result = new Date(date).toString().split(" ")[1];
        return result;
    }

    timestampToTime(timestamp, is_time_date) { //is_time_date是否是日期时间
        let Y, M, D, h, m, s;
        //Date.parse(String(new Date()).replace(/-/g, "/")) / 1000;
        var date = new Date(timestamp); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
        //console.log('date####',date);
        //var date = new Date(timestamp * 1000); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
        Y = date.getFullYear() + "-";
        M = (date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1) + "-";
        D = date.getDate() + " ";
        h = date.getHours();
        m = date.getMinutes();
        s = date.getSeconds();
        if (m < 10) {
            m = "0" + m;
        }
        if (h < 10) {
            h = "0" + h;
        }
        if(s<10) {
            s = "0" + s;
        }
        //console.log("h%%%%%%",h);
        if (is_time_date) {
            return Y + M + D + "\u000A" + h + ":" + m + ":" + s;
        } else {
            return h + ":" + m + ":" + s;
        }

        //return h+ m;
    }

    render() {
        let redColor = {
            color: "#b83a3a"
        }
        let greenColor = {
            color: "#319e5c"
        }


        let trades = this.state.trades?this.state.trades:[];
        let list;

        if(this.state.priceUnit && this.state.volUnit) {
            list = trades.map((item, index) => {
                return <tr key={index}>
                    <td className="price-td" style={item.way==2?redColor:greenColor}><span className="price">{cutOut(item.deal_price, this.state.priceUnit)}</span></td>
                    <td className="vol-td"><span className="vol">{cutOut(item.deal_vol,this.state.volUnit)}</span></td>
                    <td className="time-td"><span className="time">{this.timestampToTime(item.created_at)}</span></td>
                </tr>;
            })
        }
        return (
            <div className="new-exchange-data">
                <h3 className="new-exchange-title">{intl.get("exchange_head_market_trades")}</h3>
                <table className="data-list-title">
                    <tbody>
                        <tr>
                            <td className="price-td"><span className="price">{intl.get("exchange_data_price")}({this.state.lastCoin})</span></td>
                            <td className="vol-td"><span className="vol">{intl.get("exchange_data_amount")}({this.state.firstCoin})</span></td>
                            <td className="time-td"><span className="time">{intl.get("exchange_data_time")}</span></td>
                        </tr>
                    </tbody>
                </table>
                {trades.length < 1 ? <div className="exchange-no-data">{intl.get("assets_no_data")}</div> : ""}
                <div className="data-list-box">
                    <table>
                        <tbody>
                            {list}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}

export default NewExchangeData;
