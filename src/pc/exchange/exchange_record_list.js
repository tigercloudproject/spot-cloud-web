import React, { Component } from "react";
import { connect } from "react-redux";
import "../../assets/scss/pc/exchange/exchange_record_list.css";
import { getAssets, batchRevocation, getTradeRecordsList, setShowAll } from "../../redux/trade.redux";
import Current from "./record/current.js";
import Trade from "./record/trade.js";
import History from "./record/history.js";
import { getCookie } from "../../utils/cookie.js";
import { getQueryString } from "../../utils/getQueryString.js";
import { withRouter } from "react-router-dom";
import intl from "react-intl-universal";
import InputFundPwd from "../component/input_fund_pwd";
import { notification } from "antd";
import { debounce } from "../../utils/debounce.js";
import Tips from "../component/bbx_configurable_alert.js";

@withRouter
@connect(
  state => ({ ...state.lang, ...state.trade }),
  {
    getAssets,
    batchRevocation,
    getTradeRecordsList,
    setShowAll
  }
)
class ExchangeRecordList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tabList: [
        {
          id: 1,
          name: intl.get("assets_open_orders")
        },
        {
          id: 2,
          name: intl.get("assets_order_history")
        },
        {
          id: 3,
          name: intl.get("assets_trade_records")
        }
      ],
      currentTab: {
        id: 1,
        name: intl.get("assets_open_orders")
      },
      list: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      units: null, //单位列表
      token: "",
      bbx_current_entrust: [],
      showInputFundPwd: false,
      cancelDate: null,
      isShowAll: true, //是否显示所有币种订单
      showTips: false
    };

    this.setFundPwd = this.setFundPwd.bind(this);
    this.closeInputFundPwd = this.closeInputFundPwd.bind(this);
    this.batchRevocation = this.batchRevocation.bind(this);
    this.closeTips = this.closeTips.bind(this);
    this.openTips = this.openTips.bind(this);

    this.toBatchRevocation = debounce(data => {
      this.props.batchRevocation(data).then(response => {
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
                cancelDate: data
              });
            }
          } else {
            notification.error({
              message: intl.get("error_message_title"),
              description: response.data.message
            });
          }
        }
      });
    }, 1000);
  }

  componentWillMount() {
    this.mounted = true;
    let token = getCookie("token");
    let coinPair = getQueryString(this.props.location.search, "coinPair");
    // let coinPair = getQueryString(this.props.location.search, "coinPair") || 'BTC/USDT';
    if (this.mounted) {
      this.setState({
        token: token
      });
    }
    if (token) {
      this.props.getAssets(coinPair);
      this.props.getTradeRecordsList(coinPair);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.stocks !== nextProps.stocks) {
      this.setUnitList(nextProps.stocks);
    }

    if (this.props.bbx_current_entrust !== nextProps.bbx_current_entrust) {
      if (this.mounted) {
        this.setState({
          bbx_current_entrust: nextProps.bbx_current_entrust
        });
      }
    }

    // 切换币值对
    if (this.props.current_coin_pair !== nextProps.current_coin_pair) {
      let token = getCookie("token");
      if(token) {
        if (this.state.isShowAll) {
          this.props.getAssets();
          this.props.getTradeRecordsList();
        } else {
          this.props.getAssets(nextProps.current_coin_pair);
          this.props.getTradeRecordsList(nextProps.current_coin_pair);
        }
      }else {
        // if(this.mounted) {

        // }
      }
    }
  }

  closeTips() {
    if (this.mounted) {
      this.setState({
        showTips: false
      })
    }
  }

  openTips() {
    if (this.mounted) {
      this.setState({
        showTips: true
      })
    }
  }

  selectTab(item) {
    if (this.mounted) {
      this.setState({
        currentTab: item
      });
    }
  }

  //设置单位列表
  setUnitList(list) {
    let result = {};
    list.forEach((item, index) => {
      result[item.stock.name] = {
        price_unit: item.stock.price_unit,
        vol_unit: item.stock.vol_unit
      };
    });

    if (this.mounted) {
      this.setState({
        units: result
      });
    }
  }

  changeCheckbox(e) {
    let coinPair = getQueryString(this.props.location.search, "coinPair");
    // let coinPair = getQueryString(this.props.location.search, "coinPair") || 'BTC/USDT';

    if(this.mounted) {
      this.setState({
        isShowAll: e.target.checked
      })
    }
    this.props.setShowAll(e.target.checked);
    if (this.state.token) {
      if (e.target.checked) {
        this.props.getAssets();
        this.props.getTradeRecordsList();
      } else {
        this.props.getAssets(coinPair);
        this.props.getTradeRecordsList(coinPair);
      }
    }
  }

  //资金密码
  setFundPwd(value) {
    // this.toBatchRevocation(this.state.cancelDate);
    this.props.batchRevocation(this.state.cancelDate, value).then(response => {
      if (response.data.errno == "OK") {
        //this.props.getPropetyInfo();
        notification.success({
          message: intl.get("ok_message_title"),
          description: response.data.message
        });
        this.closeInputFundPwd();
      } else {
        if (
          response.data.errno == "ASSERT_PERMISSION_DENIED" ||
          response.data.errno == "INCORRET_ASSET_PASSWORD"
        ) {
          if (this.mounted) {
            this.setState({
              showInputFundPwd: true
            });
          }
        }
        notification.error({
          message: intl.get("error_message_title"),
          description: response.data.message
        });
      }
    });
  }

  //关闭资金密码输入框
  closeInputFundPwd() {
    if (this.mounted) {
      this.setState({
        showInputFundPwd: false
      });
    }
  }

  getOrderIdList() {
    let result = [];
    let resultItem = {};
    this.state.bbx_current_entrust.forEach(item => {
      if (
        resultItem[item.stock_code] &&
        resultItem[item.stock_code].length > 0
      ) {
        resultItem[item.stock_code].push(item.order_id);
      } else {
        resultItem[item.stock_code] = [item.order_id];
      }
    });

    for (let key in resultItem) {
      result.push({
        stock_code: key,
        orders: resultItem[key]
      });
    }

    return result;
  }

  batchRevocation() {
    this.closeTips();
    let data = {};
    if (this.state.bbx_current_entrust.length < 1) {
      return;
    }

    let orders = this.getOrderIdList();

    data["orders"] = orders;
    let nonce = new Date();
    data["nonce"] = Math.floor(nonce.valueOf() / 1000);
    this.toBatchRevocation(data);
  }

  render() {
    let tabLi = this.state.tabList.map((item, index) => {
      return (
        <li
          key={index}
          onClick={() => this.selectTab(item)}
          className={this.state.currentTab.id === item.id ? "active" : ""}
        >
          {item.name}
        </li>
      );
    });

    let search = "";
    if (this.props.default && this.props.default.value) {
      search = `?lang=${this.props.default.value}`;
    }

    let moreUrl="";
    let currentTab = this.state.currentTab;
    if (currentTab.id === 1) {
      moreUrl = "/assets/exchange_record/current";
    } else if(currentTab.id === 2) {
      moreUrl = "/assets/exchange_record/history";
    } else if(currentTab.id === 3) {
      moreUrl = "/assets/exchange_record/transaction";
    }


    return (
      <div className="exchange-record-list">
        {this.state.showInputFundPwd ? (
          <InputFundPwd
            close={this.closeInputFundPwd}
            setFundPwd={this.setFundPwd}
          />
        ) : null}
        <div className="title">
          <ul className="tab-list">{tabLi}</ul>
          <div className="right">
            <div className="radio-box">
              <input
                type="checkbox"
                name="radio"
                id="radio"
                value={this.state.isShowAll || false}
                defaultChecked="true"
                onChange={e => this.changeCheckbox(e)}
              />
              <label htmlFor="radio" className="radio" />
              <label htmlFor="radio">{intl.get("exchange_displays_other_pairs")}</label>
            </div>
            <div className="cancel-all">
              {/* <a onClick={this.batchRevocation}> */}
              <a onClick={this.openTips}>
                {intl.get("exchange_close_all")}
              </a>
            </div>
            <a
              className="the-more"
              href={
                this.state.token
                  ? `${moreUrl}${search}`
                  : `/login${search}`
              }
            >
              <span>{intl.get("broadcast_more")}</span>
              <i className="iconfont icon-iconmore-copy" />
            </a>
          </div>
        </div>
        {this.state.currentTab.id === 1 ? (
          <Current units={this.state.units} />
        ) : null}
        {this.state.currentTab.id === 2 ? (
          <History units={this.state.units} />
        ) : null}
        {this.state.currentTab.id === 3 ? (
          <Trade units={this.state.units} />
        ) : null}

        {this.state.showTips ? (
          <Tips
            close={this.closeTips}
            tipsTitle={intl.get("exchange_close_all")}
            content={intl.get("exchange_close_all_confirm_text")}
            type={2}
            leftText={intl.get("exchange_close_all_ok")}
            rightText={intl.get("tip_limit_btn_cancel")}
            left={this.batchRevocation}
            right={this.closeTips}
          />
        ) : null}
      </div>
    );
  }
}

export default ExchangeRecordList;
