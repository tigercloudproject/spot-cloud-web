import React, { Component } from "react";
import { connect } from "react-redux";
import { parseTimeTos } from "../../../utils/parseTime.js";
import intl from "react-intl-universal";
import { cutOutDecimal } from "../../../utils/dataProcess.js";
import noDataImg from "../../../assets/images/icon-Nocontent.png";
import loadingImg from "../../../assets/images/loadding.gif";

@connect(
    state => ({ ...state.lang, ...state.trade })
)

class HistoryList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            list: null,
            stocks: [], //配置信息
        }
    }

    componentWillMount() {
        this.mounted = true;
        if(this.mounted && this.props.bbx_history_entrust) {
            this.setState({
                list: this.props.bbx_history_entrust
            })
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentWillReceiveProps(nextProps) {
        // console.log("current####", nextProps);
        if (this.props.bbx_history_entrust !== nextProps.bbx_history_entrust) {
            if (this.mounted) {
                this.setState({
                    list: nextProps.bbx_history_entrust
                })
            }
        }
    }

    getHistoryStatus(status) {
        switch (status) {
            case 0: {
                return intl.get("assets_order_status0");
            }
            case 1: {
                return intl.get("assets_order_status1");
            }
            case 2: {
                return intl.get("assets_order_status2");
            }
            case 3: {
                return intl.get("assets_order_status3");
            }
            case 4: {
                return intl.get("assets_order_status4");
            }
        }
    }

    render() {
        // console.log("this.props.units####", this.props.units);
        let price, vol, done_vol, average_price;
        let price_unit, vol_unit;
        let ListLi;

        if(this.state.list) {
            ListLi = this.state.list.map((item, index) => {
                price = item.price;
                vol = item.vol;
                done_vol = item.done_vol;
                average_price = (item.swap_vol != 0 && item.done_vol != 0) ? Number(Number(item.swap_vol).div(Number(item.done_vol))) : 0;
                if (this.props.units && this.props.units[item.stock_code]) {
                    price_unit = this.props.units[item.stock_code].price_unit;
                    vol_unit = this.props.units[item.stock_code].vol_unit;
                    price = cutOutDecimal(price, price_unit);
                    vol = cutOutDecimal(vol, vol_unit);
                    done_vol = cutOutDecimal(done_vol, vol_unit);
                    average_price = cutOutDecimal(average_price, price_unit);
                }
                return (
                    <li key={index}>
                        <span className="date">{parseTimeTos(item.created_at)}</span>
                        <span className="coin-pair">{item.stock_code}</span>
                        <span className={item.way === 1 ? "way green" : "way red"}>{item.way === 1 ? "买入" : "卖出"}</span>
                        <span>{ Number(price) > 0 ? price : intl.get("exchange_market_price") }</span>
                        <span>{vol}</span>
                        <span>{done_vol}</span>
                        <span>{average_price}</span>
                        <span className="operation">
                            {this.getHistoryStatus(item.errno)}
                        </span>
                    </li>
                );
            });
        }
        
        return <div className="list-box">
            <ul className="list-head">
                <li className="date">{intl.get("assets_order_thead_date")}</li>
                <li className="coin-pair">{intl.get("assets_order_thead_pairs")}</li>
                <li className="way">{intl.get("assets_order_thead_type")}</li>
                <li>{intl.get("assets_order_thead_price")}</li>
                <li>{intl.get("assets_order_thead_amount")}</li>
                <li>{intl.get("assets_order_thead_executed")}</li>
                <li>{intl.get("assets_order_thead_average_price")}</li>
                <li className="operation">{intl.get("assets_order_thead_action")}</li>
            </ul>
            <div className="list-body">
                <div className="no-data-loading" style={{ display: this.state.list === null || this.state.list.length < 1 ? "block" : "none" }}>
                    {this.state.list === null ? <img src={loadingImg}/> : null}
                    {this.state.list.length < 1 ? <img src={noDataImg}/> : null}
                    {this.state.list.length < 1 ? <p>{intl.get("assets_no_data")}</p> : null}
                </div>
                <ul>{ListLi}</ul>
            </div>
        </div>
    }
}

export default HistoryList;