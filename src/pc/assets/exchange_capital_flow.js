import React, { Component, Fragment } from "react";
// import Breadcrumbs from "./record/breadcrumbs.js";
import intl from "react-intl-universal";
// import "../../assets/scss/pc/assets/swap_capital_flow.css";
// import Operating from "./record/operating.js";
import { connect } from "react-redux";
import { parseTimeTos } from "../../utils/parseTime.js";
import { cutOutDecimal } from "../../utils/dataProcess.js";
import Pagecomponent from "../component/Pagecomponent.js";
import { getGlobalConfig } from "../../redux/global.redux.js";
import { IsReverse, MarginCoin } from "../../utils/contractFormula/common";
import BBXTable from "../component/bbx_table.js";
import BbxTip from "../component/bbx_tip";
import { getSettlesList } from "../../redux/assets.redux.js";
import { getQueryString } from "../../utils/getQueryString.js";
import { withRouter } from "react-router-dom";


import H5Header from "../component/h5_header.js";
import MediaQuery from "react-responsive";

@withRouter
@connect(state => ({ ...state.gconfig, ...state.assets, ...state.lang }), {
    getGlobalConfig,
    getSettlesList
})
class ExchangeCapitalFlow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            breadcrumbsList: [ // 面包屑导航
                {
                    name: intl.get("contract_coin_account"), // 币币账户
                    url: "/assets/exchange_account"
                },
                {
                    name: intl.get("contract_asset_menu3"), // 资金记录
                    url: ""
                }
            ],
            recordsList: [],
            totalRecord: 0,
            coinList: [],
            typeList: [
                {
                    name: intl.get("assets_all_records_deposit"),
                    id: 'deposit'
                },
                {
                    name: intl.get("assets_all_records_withdrawal"),
                    id: 'withdraw'
                },
                {
                    name: intl.get("assets_all_records_airdrop"),
                    id: 'airdrop'
                },
                {
                    name: intl.get("assets_all_records_reward"),
                    id: 'bouns'
                },
                {
                    name: intl.get("assets_all_records_spot_to_contract"),
                    id: 'transferE2C'
                },
                {
                    name: intl.get("assets_all_records_contract_to_spot"),
                    id: 'transferC2E'
                },
                // {
                //     name: intl.get("assets_all_records_c2c_entry"),
                //     id: 'OTCIN'
                // },
                // {
                //     name: intl.get("assets_all_records_c2c_enter"),
                //     id: 'OTCOUT'
                // }

            ],
            currentCoin: '',
            currentType: ''
        }

        this.selectCoin = this.selectCoin.bind(this);
        this.selectType = this.selectType.bind(this);
        this.getCurrentPage = this.getCurrentPage.bind(this);
    }

    componentWillMount() {
        this.mounted = true;
        let coin = getQueryString(this.props.location.search, "coin");
        let type = getQueryString(this.props.location.search, "type");
        if ( coin && type ) {
            this.props.getSettlesList(type, coin);
            if (this.mounted) {
                this.setState({
                    currentCoin: coin,
                    currentType: type,
                })
            }
        }

        if (this.props.clist.length === 0) {
            this.props.getGlobalConfig();
        } else {
            if (coin && type) {
                if (this.mounted) {
                    this.setState({
                        coinList: this.props.clist.spot_coins
                    })
                }
            } else {
                this.firstGetList(type, coin, this.props.clist.spot_coins);
            }
        }

    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentWillReceiveProps(nextProps) {
        //console.log('nextProps####', nextProps);
        if (nextProps.settles_list && nextProps.settles_list.settles) {
            if (this.mounted) {
                this.setState({
                    recordsList: nextProps.settles_list.settles,
                    totalRecord: nextProps.settles_list.total
                })
            }
        } else {
            if (this.mounted) {
                this.setState({
                    recordsList: [],
                    totalRecord: 0
                })
            }
        }

        if (nextProps.clist && nextProps.clist.spot_coins && !this.state.currentCoin && !this.state.currentType) {
            let type = "deposit";
            let coin = nextProps.clist.spot_coins[0].name;
            this.firstGetList(type, coin, nextProps.clist.spot_coins);
            // this.props.getSettlesList(type, coin);
            // if (this.mounted) {
            //     this.setState({
            //         coinList: nextProps.clist.spot_coins,
            //         currentCoin: coin,
            //         currentType: type
            //     })
            // }
        }
    }

    firstGetList(type, coin, spot_coins) {
        this.props.getSettlesList(type, coin);
        if (this.mounted) {
            this.setState({
                coinList: spot_coins,
                currentCoin: coin,
                currentType: type
            })
        }
    }

    //选择币
    selectCoin(item) {
        //console.log("selectCoin###",item);
        let langCode = "";
        if(this.props.default && this.props.default.value) {
            langCode = this.props.default.value;
        }
        if (this.mounted) {
            this.setState({
                currentCoin: item.name
            })
        }
        this.props.history.push(`/assets/exchange_capital_flow?lang=${langCode}&coin=${item.name}&type=${this.state.currentType}`);
        this.props.getSettlesList(this.state.currentType, item.name);

    }
    //选择类型
    selectType(item) {
        //console.log("selectType###",item);
        let langCode = "";
        if (this.props.default && this.props.default.value) {
            langCode = this.props.default.value;
        }
        if (this.mounted) {
            this.setState({
                currentType: item.id
            })
        }
        this.props.history.push(`/assets/exchange_capital_flow?lang=${langCode}&coin=${this.state.currentCoin}&type=${item.id}`);
        this.props.getSettlesList(item.id, this.state.currentCoin);
    }

    getType(type) {
        switch (type) {
            case 1: {
                return intl.get("assets_all_records_deposit");
            }
            case 2: {
                return intl.get("assets_all_records_withdrawal");
            }
            case 3: {
                return intl.get("assets_all_records_reward");
            }
            case 4: {
                return intl.get("assets_all_records_airdrop");
            }
            case 5: {
                //return intl.get("assets_all_records_deductions");
                return intl.get("assets_all_records_entry");
            }
            case 6: {
                return intl.get("assets_all_records_enter");
            }
            case 7: {
                return intl.get("assets_all_records_spot_to_contract");
            }
            case 8: {
                return intl.get("assets_all_records_contract_to_spot");
            }
            case 9: {
                return intl.get("assets_all_records_c2c_entry");
            }
            case 10: {
                return intl.get("assets_all_records_c2c_enter");
            }
            default: {
                return;
            }
        }
    }

    getCurrentPage(currentPage) {
        this.props.getSettlesList(this.state.currentType, this.state.currentCoin, 10, (currentPage - 1) * 10);
    }

    // 获取表格字段列表
    getTableColumns() {
        const columns = [
            {
                title: intl.get("assets_all_records_coin"),
                dataIndex: "coin_code"
            },
            {
                title: intl.get("assets_all_records_date"),
                render: (item) => {
                    return parseTimeTos(item.created_at);
                }
            },
            {
                title: intl.get("assets_all_records_type"),
                render: (item) => {
                    return this.getType(item.type);
                }
            },
            {
                title: intl.get("assets_all_records_amount"),
                render: (item) => {
                    return (item.status !== 3 ? <span className="green">{item.vol}</span> : <span className="red">{item.vol}</span>)
                }
            },
            {
                title: intl.get("assets_all_records_fee"),
                render: (item) => {
                    return <Fragment>
                        {item.fee}
                        {item.status === 3 ? <BbxTip tit={intl.get('assets_failed')} desc={item.reject_reason} color="#b83a3a"></BbxTip> : null}
                    </Fragment>
                }
            }
        ];
        return columns;
    }

    // 根据类型返回类型名称
    getCurrentTypeName(type) {
        let list = this.state.typeList;
        for (let i=0; i<list.length; i++) {
            if (list[i].id === type) {
                return list[i].name;
            }
        }

    }

    render() {
        let coinList = this.state.coinList;
        const {currentCoin, currentType} = this.state;
        let coinSelectData = {
            name: intl.get("assets_menu2_coin"), // 币种
            list: coinList,
            key: "name",
            current: currentCoin
        }

        let typeList = this.state.typeList;
        let typeCurrent = this.getCurrentTypeName(currentType);
        let typeSelectData = {
            name: intl.get("assets_menu2_type"), // 类型
            list: typeList,
            key: "name",
            current: typeCurrent
        }

        let pageConfig;
        if (this.state.totalRecord && this.state.currentCoin && this.state.currentType) {
            let totalPage = Math.ceil(this.state.totalRecord / 10);
            pageConfig = {
                totalPage: totalPage
            }
        } else {
            pageConfig = '';
        }
        return <div className="capital-flow-box">
            <MediaQuery maxWidth={700}>
                <H5Header title={intl.get("contract_asset_menu3")}></H5Header>
            </MediaQuery>
            {/*<Breadcrumbs list={this.state.breadcrumbsList}></Breadcrumbs>*/}
            <div className="capital-flow-body">
                <div className="title">
                    {intl.get("contract_asset_menu3")}
                </div>
                <div className="flow-operating">
                    <Operating coin={coinSelectData}
                        coinselect={this.selectCoin}
                        type={typeSelectData}
                        typeselect={this.selectType}
                        ></Operating>
                </div>
                <div className="flow-list-box">
                    <BBXTable data={this.state.recordsList} columns={this.getTableColumns()}></BBXTable>
                    <div className="paging-box clearfix">
                        <div className="paging-right">
                            {pageConfig && pageConfig.totalPage > 0 ? <Pagecomponent pageConfig={pageConfig}
                                pageCallbackFn={this.getCurrentPage} /> : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }
}
export default ExchangeCapitalFlow;
