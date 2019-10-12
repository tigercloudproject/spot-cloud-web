import React, {Component} from "react";
import { connect } from "react-redux";
import "../../assets/scss/pc/exchange/exchange_transaction.css";
import { getBbxTickerInfo, getStocks } from "../../redux/trade.redux.js";
import { retainDecimals, cutOut, stringCutOut } from "../../utils/dataProcess.js";
import intl from "react-intl-universal";


@connect(
  state => (
    { ...state.lang, ...state.trade }),
    {
      getBbxTickerInfo,
      getStocks
    }
)

class ExchangeTransaction extends Component {
    constructor(props) {
        super(props);
        this.state = {
            list: [],
            currentCoinPair: "",
            priceUnit: null,
            volUnit: null
        };
    }

    componentWillMount() {
        this.mounted = true;
        if(this.props.current_coin_pair) {
            this.props.getBbxTickerInfo(this.props.current_coin_pair);
            if(this.mounted) {
                this.setState({
                    currentCoinPair: this.props.current_coin_pair
                })
            }
        }

        if (!this.props.stocks || this.props.stocks.length<1) {
            this.props.getStocks();
        } else {
            this.setUnit(this.props.stocks, this.props.current_coin_pair);
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.current_coin_pair !== nextProps.current_coin_pair || !this.state.priceUnit) {
            this.props.getBbxTickerInfo(nextProps.current_coin_pair);
            if(this.mounted) {
                this.setState({
                    currentCoinPair: nextProps.current_coin_pair
                })
            }

            this.setUnit(nextProps.stocks, nextProps.current_coin_pair);
        }

        if(this.props.transactions !== nextProps.transactions) {
            if(this.mounted) {
                this.setState({
                    list: nextProps.transactions
                })
            }
        }
    }

    //设置单位
    setUnit(list, coinPair) {
        let priceUnit = this.getPriceUnit(list, coinPair);
        let volUnit = this.getVolUnit(list, coinPair);
        if (priceUnit && this.mounted) {
            this.setState({
                priceUnit: priceUnit,
                decimal: priceUnit
                // decimal: this.state.priceUnit !== priceUnit ? priceUnit : this.state.decimal,
            })
        }
        if (volUnit && this.mounted) {
            this.setState({
                volUnit: volUnit
            })
        }
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
        if (s < 10) {
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

    getCurrentStock(list) {
        for(let i=0; i<list.length; i++) {
            if (list[i].stock && list[i].stock.name === this.state.currentCoinPair) {
                return list[i].stock;
            }
        }
    }

    getPriceUnit(list, coinPair) {
        coinPair = coinPair ? coinPair : this.state.currentCoinPair;
        let p;
        for (let i = 0; i < list.length; i++) {
            if (list[i].stock.name === coinPair) {
                p = list[i].stock.price_unit.split(".")[1] ? list[i].stock.price_unit.split(".")[1].length : 0;
                return p;
            }
        }
    }

    getVolUnit(list, coinPair) {
        coinPair = coinPair ? coinPair : this.state.currentCoinPair;
        let p;
        for (let i = 0; i < list.length; i++) {
            if (list[i].stock.name === coinPair) {
                p = list[i].stock.vol_unit.split(".")[1] ? list[i].stock.vol_unit.split(".")[1].length : 0;
                return p;
            }
        }
    }

    render() {
        let currentStock;
        if(this.props.stocks && this.props.stocks.length>0) {
            currentStock = this.getCurrentStock(this.props.stocks);
        }

        let coinArr = [];
        if(this.state.currentCoinPair) {
            coinArr = this.state.currentCoinPair.split("/");
        }

        let price,vol;
        let {priceUnit, volUnit} = this.state;
        let listLI = this.state.list.map((item, index) => {
            let n = Math.random() * 10;
            price = item?item.deal_price:null;
            if (price!==null && currentStock) {
                price = retainDecimals(price,{decimals: currentStock.price_unit});
            }
            vol = item?item.deal_vol:null;
            if (vol !== null && currentStock) {
                vol = retainDecimals(vol, { decimals: currentStock.vol_unit });                
            }
            return (
                <li key={index}>
                    <div className="list-item">
                        <span>{item ? this.timestampToTime(item.created_at): null}</span>
                        <span className={item && item.way==2?"red":"green"}>{priceUnit!==null?stringCutOut(price, priceUnit):price}</span>
                        <span>{volUnit?stringCutOut(vol, volUnit):vol}</span>
                    </div>
                </li>
            );
        });
        return (
        <div className="exchange-transaction">
            <h3 className="title">{intl.get("exchange_the_latest_deal")}</h3>
            <div className="list-head">
            <span>{intl.get("exchange_data_time")}</span>
            <span>{intl.get("exchange_data_price")}({coinArr[1]?coinArr[1]:""})</span>
            <span>{intl.get("exchange_data_amount")}({coinArr[0]?coinArr[0]:""})</span>
            </div>
            <div className="list-body">
            <ul>{listLI}</ul>
            </div>
        </div>
        );
    }
}

export default ExchangeTransaction;