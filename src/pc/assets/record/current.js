import React, { Component, Fragment } from "react";
import BBXTable from "../../component/bbx_table.js";
import intl from "react-intl-universal";
import { assetGetOpenOrders, assetCancelOrderPost } from "../../../redux/assets.redux.js";
import { connect } from "react-redux";
import { parseTime } from "../../../utils/parseTime.js";
import { notification } from "antd";
import { debounce } from "../../../utils/debounce.js";
import { cutOutDecimal } from "../../../utils/dataProcess.js";
import InputFundPwd from "../../component/input_fund_pwd";


@connect(state => ({ ...state.assets }), {
    assetGetOpenOrders,
    assetCancelOrderPost
})
class Current extends Component {  //币币交易当前委托
    constructor(props) {
        super(props);
        this.state = {
            list: [], // 当前委托列表
            showInputFundPwd: false, // 是否显示输入资金密码
        }

        this.getTableColumns = this.getTableColumns.bind(this); // 获取表格数据
        this.setFundPwd = this.setFundPwd.bind(this);
        this.closeInputFundPwd = this.closeInputFundPwd.bind(this);

        // 取消委托
        this.toCancelOrder = debounce((id, coinPair) => {
            this.props.assetCancelOrderPost(id, coinPair).then((response) => {
                if (response.data.errno == "OK") {
                    notification.success({
                        message: intl.get("alert_tip"),
                        description: intl.get("assets_success")
                    });

                    this.props.assetGetOpenOrders();

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
        }, 1000)
    }

    componentWillMount() {
        this.mounted = true;
        this.props.assetGetOpenOrders();
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.asset_open_order) {
            if (this.mounted) {
                this.setState({
                    list: nextProps.asset_open_order
                })
            }
        }
    }

    //设置输入的资金密码
    setFundPwd(value) {
        this.props.assetCancelOrderPost(this.state.currentId, this.state.currentCoinPair, value).then((response) => {
            if (response.data.errno == "OK") {
                notification.success({
                    message: intl.get("alert_tip"),
                    description: intl.get("assets_success")
                });
                this.props.assetGetOpenOrders(this.state.coinPair);

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

    //关闭输入资金密码框
    closeInputFundPwd() {
        if (this.mounted) {
            this.setState({
                showInputFundPwd: false
            })
        }
    }

    // 获取表格字段列表
    getTableColumns() {
        let units = this.props.units;
        const columns = [
            {
                title: intl.get("assets_order_thead_date"),
                width: "180px",
                render: (item) => {
                    return parseTime(item.created_at)
                }
            },
            {
                title: intl.get("assets_order_thead_pairs"),
                dataIndex: "stock_code"                
            },
            
            {
                title: intl.get("assets_order_thead_type"),
                render: (item) => {
                    return (
                        item.way == 1 ? (
                            <span className="green">{intl.get("assets_order_tab_buy")}</span>
                        ) : (
                                <span className="red">{intl.get("assets_order_tab_sell")}</span>
                            )
                    )
                }
            },
            {
                title: intl.get("assets_order_thead_price"),
                render: (item) => {
                    return <span>
                        {units[item.stock_code] ? cutOutDecimal(item.price, units[item.stock_code].price_unit) : item.price}
                    </span>
                }
            },
            {
                title: intl.get("assets_order_thead_amount"),
                render: (item) => {
                    return <span>
                        {units[item.stock_code] ? cutOutDecimal(item.vol, units[item.stock_code].vol_unit): item.vol}
                    </span>
                }
            },
            {
                title: intl.get("assets_order_thead_executed"),
                render: (item) => {
                    return <span>
                        {units[item.stock_code] ? cutOutDecimal(item.done_vol, units[item.stock_code].vol_unit) : item.done_vol}
                    </span>
                }
            },
            {
                title: intl.get("assets_order_thead_unexecuted"),
                render: (item) => {
                    let num = Number(Number(item.vol).sub(Number(item.done_vol)));
                    return <span>
                        {units[item.stock_code] ? cutOutDecimal(num, units[item.stock_code].price_unit) : num }
                    </span>
                }
            },
            {
                title: intl.get("assets_order_thead_action"),
                render: (item) => {
                    return <a onClick={() => this.toCancelOrder(item.order_id, item.stock_code)}>取消</a>
                }
            }
        ];
        return columns;
    }

    render() {
        return <Fragment>
            {this.state.showInputFundPwd ? <InputFundPwd close={this.closeInputFundPwd} setFundPwd={this.setFundPwd}></InputFundPwd> : null}
            <BBXTable data={this.state.list} columns={this.getTableColumns()}></BBXTable>
        </Fragment>
    }
}

export default Current;
