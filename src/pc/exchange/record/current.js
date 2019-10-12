import React, { Component } from "react";
import { connect } from "react-redux";
import { parseTimeTos } from "../../../utils/parseTime.js";
import intl from "react-intl-universal";
import { cutOutDecimal } from "../../../utils/dataProcess.js";
import { cancelOrderPost } from "../../../redux/exchange.redux";
import InputFundPwd from "../../component/input_fund_pwd";
import { notification } from "antd";
import { debounce } from "../../../utils/debounce.js";
import noDataImg from "../../../assets/images/icon-Nocontent.png";
import loadingImg from "../../../assets/images/loadding.gif";

@connect(
    state => ({ ...state.lang, ...state.trade }), {
        cancelOrderPost
    }
)

class Current extends Component {
    constructor(props) {
        super(props);
        this.state = {
            list: null,
            stocks: [], //配置信息
        }

        this.setFundPwd = this.setFundPwd.bind(this);
        this.closeInputFundPwd = this.closeInputFundPwd.bind(this);

        this.toCancelOrder = debounce((id,coinPair)=> {
            this.props.cancelOrderPost(id,coinPair).then((response) => {
                if (response.data.errno == "OK") {
                    //this.props.getPropetyInfo();
                    notification.success({
                        message: intl.get("ok_message_title"),
                        description: response.data.message
                    });    
                } else { 
                    if (response.data.errno == "ASSERT_PERMISSION_DENIED") {
                    if (this.mounted) {
                        this.setState({
                        showInputFundPwd: true,
                        currentCoinPair: coinPair,
                        currentId: id
                        });
                    }
                    } else {
                    notification.error({
                        message: intl.get("error_message_title"),
                        description: response.data.message
                    });
                    }
                }
            })
        },1000)
    }

    componentWillMount() {
        this.mounted = true;
        if (this.mounted && this.props.bbx_current_entrust) {
            this.setState({
                list: this.props.bbx_current_entrust
            })
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.bbx_current_entrust !== nextProps.bbx_current_entrust) {
            if(this.mounted) {
                this.setState({
                    list: nextProps.bbx_current_entrust
                })
            }
        }
    }

    //设置资金密码
    setFundPwd(value) {
        this.props.cancelOrderPost(this.state.currentId, this.state.currentCoinPair, value).then((response) => {
            if (response.data.errno == "OK") {
                //this.props.getPropetyInfo();
                notification.success({
                    message: intl.get("ok_message_title"),
                    description: response.data.message
                });
                this.closeInputFundPwd();
            } else {
                if (response.data.errno == "ASSERT_PERMISSION_DENIED" || response.data.errno == "INCORRET_ASSET_PASSWORD") {
                    if (this.mounted) {
                        this.setState({
                            showInputFundPwd: true
                        })
                    }
                }

                notification.error({
                    message: intl.get("error_message_title"),
                    description: response.data.message
                });

            }

        })
    }

    closeInputFundPwd() {
        if (this.mounted) {
            this.setState({
                showInputFundPwd: false
            })
        }
    }

    render() {
        // console.log("this.props.units####", this.props.units);
        let price, vol, done_vol, no_vol;
        let price_unit, vol_unit;
        let ListLi;
        if(this.state.list) {
            ListLi = this.state.list.map((item, index) => {
                price = item.price;
                vol = item.vol;
                done_vol = item.done_vol;
                no_vol = Number(Number(item.vol).sub(Number(item.done_vol))); //未成数量
                if (this.props.units && this.props.units[item.stock_code]) {
                    price_unit = this.props.units[item.stock_code].price_unit;
                    vol_unit = this.props.units[item.stock_code].vol_unit;
                    price = cutOutDecimal(price, price_unit);
                    vol = cutOutDecimal(vol, vol_unit);
                    done_vol = cutOutDecimal(done_vol, vol_unit);
                    no_vol = cutOutDecimal(no_vol, vol_unit);
                }
                return (
                    <li key={index}>
                        <span className="date">{parseTimeTos(item.created_at)}</span>
                        <span className="coin-pair">{item.stock_code}</span>
                        <span className={item.way === 1 ? "way green" : "way red"}>{item.way === 1 ? "买入" : "卖出"}</span>
                        <span>{price}</span>
                        <span>{vol}</span>
                        <span>{done_vol}</span>
                        <span>{no_vol}</span>
                        <span className="operation">
                            <a onClick={() => this.toCancelOrder(item.order_id, item.stock_code)}>撤单</a>
                        </span>
                    </li>
                );
            });
        }
       
        return <div className="list-box">
            {this.state.showInputFundPwd ? <InputFundPwd close={this.closeInputFundPwd} setFundPwd={this.setFundPwd}></InputFundPwd> : null}
            <ul className="list-head">
                <li className="date">{intl.get("assets_order_thead_date")}</li>
                <li className="coin-pair">{intl.get("assets_order_thead_pairs")}</li>
                <li className="way">{intl.get("assets_order_thead_type")}</li>
                <li>{intl.get("assets_order_thead_price")}</li>
                <li>{intl.get("assets_order_thead_amount")}</li>
                <li>{intl.get("assets_order_thead_done_amount")}</li>
                <li>{intl.get("assets_order_thead_unexecuted")}</li>
                <li className="operation">{intl.get("assets_order_thead_action")}</li>
            </ul>
            <div className="list-body">
                <div className="no-data-loading" style={{ display: this.state.list === null || this.state.list.length < 1 ? "block" : "none" }}>
                    {this.state.list === null ? <img src={loadingImg} /> : null}
                    {this.state.list.length < 1 ? <img src={noDataImg} /> : null}
                    {this.state.list.length < 1 ? <p>{intl.get("assets_no_data")}</p> : null}
                </div>
                <ul>{ListLi}</ul>
            </div>
        </div>
    }
}

export default Current;