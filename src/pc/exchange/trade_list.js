import React, {Component} from "react";
import { connect } from "react-redux";
import { notification } from "antd";
import { Link, withRouter } from "react-router-dom";
import { debounce } from "../../utils/debounce.js";
// import { getPropetyInfo } from "../../redux/assets.redux";
import { getOpenOrders, cancelOrderPost, getOrderHistory, getTradeRecords } from "../../redux/exchange.redux.js";
import { cutOut, leastTwoDecimal,stringCutOut } from "../../utils/dataProcess.js";
import intl from "react-intl-universal";
import nextIcon from "../../assets/images/icon-next2.png";
import loadingImg from "../../assets/images/loadding.gif";
import noDataImg from "../../assets/images/icon-Nocontent.png";
import InputFundPwd from "../component/input_fund_pwd";
import { getQueryString } from "../../utils/getQueryString.js";
import { getCookie } from "../../utils/cookie.js";

@withRouter
@connect(state => ({ ...state.sdetails, ...state.lang, ...state.user }), {
  getOpenOrders,
  cancelOrderPost,
  getOrderHistory,
  getTradeRecords,
  // getPropetyInfo
})
class TradeList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      open_orders: [],
      history_orders: [],
      trade_records: [],
      typeTabList: [
        {
          name: intl.get("assets_open_orders"),
          id: "open"
        },
        {
          name: intl.get("assets_order_history"),
          id: "history"
        },
        {
          name: intl.get("assets_trade_records"),
          id: "trade"
        }
      ],
      currentType: 0,
      statusTabList: [
        {
          name: intl.get("assets_order_tab_buy"),
          id: "buy"
        },
        {
          name: intl.get("assets_order_tab_sell"),
          id: "sell"
        },
        {
          name: intl.get("assets_order_tab_all"),
          id: "all"
        }
      ],
      currentStatus: 2,
      isLoading: true, //列表数据在加载中
      fundPwd: "",
      showInputFundPwd: false,
      currentCoinPair: "",
      currentId: "",
      qd: localStorage.getItem("qd"), //渠道
    };

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
             
                this.props.getOpenOrders(coinPair);
                this.props.getOrderHistory(coinPair);
                this.props.getTradeRecords(coinPair);
                
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
    let coinPair = getQueryString(this.props.location.search, "coinPair");
    
    let token = getCookie("token");
    if(token) {
      this.props.getOpenOrders(coinPair);
      this.props.getOrderHistory(coinPair);
      this.props.getTradeRecords(coinPair);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.open_order !== this.props.open_order) {
      if (this.mounted) {
        this.setState({
          open_orders: nextProps.open_order ? nextProps.open_order:[],
          isLoading: false
        });
      }
    }

    if (nextProps.order_history !== this.props.order_history) {
      if (this.mounted) {
        this.setState({
          history_orders: nextProps.order_history ? nextProps.order_history:[],
          isLoading: false
        });
      }
    }
    if (nextProps.trade_records !== this.props.trade_records) {
      if (this.mounted) {
        this.setState({
          trade_records: nextProps.trade_records?nextProps.trade_records:[],
          isLoading: false
        });
      }
    }

    //判断是否切换币值对
    // console.log("nextProps.exchange_current_coinpair####", nextProps.exchange_current_coinpair);
    // console.log("this.props.exchange_current_coinpair####", this.props.exchange_current_coinpair);
  
    if (nextProps.exchange_current_coinpair !== this.props.exchange_current_coinpair) {   
      let token = getCookie("token");
      if (token) {
        this.props.getOpenOrders(nextProps.exchange_current_coinpair);
        this.props.getOrderHistory(nextProps.exchange_current_coinpair);
        this.props.getTradeRecords(nextProps.exchange_current_coinpair);
      }
    }

  }

  typeTabChange(index) {
    if (this.mounted) {
      this.setState({
        currentType: index
      });
    }
  }

  statusTabChange(index) {
    if (this.mounted) {
      this.setState({
        currentStatus: index
      });
    }
  }

  cancelOrder(id) {}

  getListThead() {
    if (this.state.currentType == 1) {
      return (
        <thead>
          <tr>
            <th>{intl.get("assets_order_thead_date")}</th>
            <th>{intl.get("assets_order_thead_pairs")}</th>
            <th>{intl.get("assets_order_thead_type")}</th>
            <th>{intl.get("assets_order_thead_price")}</th>
            <th>{intl.get("assets_order_thead_amount")}</th>
            <th>{intl.get("assets_order_thead_executed")}</th>
            <th>{intl.get("assets_order_thead_average_price")}</th>
            <th>{intl.get("assets_order_thead_action")}</th>
          </tr>
        </thead>
      );
    } else if (this.state.currentType == 2) {
      return (
        <thead>
          <tr>
            <th>{intl.get("assets_order_thead_date2")}</th>
            <th>{intl.get("assets_order_thead_pairs")}</th>
            <th>{intl.get("assets_order_thead_type")}</th>
            <th>{intl.get("assets_order_thead_done_price")}</th>
            <th>{intl.get("assets_order_thead_done_amount")}</th>
            <th>{intl.get("assets_order_thead_done_total")}</th>
            <th>{intl.get("assets_order_thead_fee")}</th>
          </tr>
        </thead>
      );
    } else {
      //0和其他情况
      return <thead>
          <tr>
            <th>{intl.get("assets_order_thead_date")}</th>
            <th>{intl.get("assets_order_thead_pairs")}</th>
            <th>{intl.get("assets_order_thead_type")}</th>
            <th>{intl.get("assets_order_thead_price")}</th>
            <th>{intl.get("assets_order_thead_amount")}</th>
            <th>{intl.get("assets_order_thead_done_amount")}</th>
            <th>{intl.get("assets_order_thead_unexecuted")}</th>
            <th>{intl.get("assets_order_thead_action")}</th>
          </tr>
        </thead>;
    }
  }

  parseTime(string) {
    let timestamp = new Date(String(string)).valueOf();
    let Y, M, D, h, m, s;
    var date = new Date(timestamp); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
    Y = date.getFullYear() + "-";
    M =
      (date.getMonth() + 1 < 10
        ? "0" + (date.getMonth() + 1)
        : date.getMonth() + 1) + "-";
    D = date.getDate() + " ";
    h = date.getHours();
    m = date.getMinutes();

    if(h<10) {
      h = "0" + h;
    }

    if(m<10) {
      m = "0" + m;
    }

    //s = date.getSeconds();
    return Y + M + D + "\u000A" + h + ":" + m;
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

  getListBody(open_order, history_orders, trade_orders) {
    let result;
    if (this.state.currentType == 2) {
      result = trade_orders.map((item, index) => {
        if (item.way === this.state.currentStatus + 1) {
          //做buy,sell,all筛选
          return (
            <tr key={index}>
              <td>{this.parseTime(item.created_at)}</td>
              <td>{item.stock_code}</td>
              <td>
                {item.way == 1 ? (
                  <span className="green">{intl.get("assets_order_tab_buy")}</span>
                ) : (
                  <span className="red">{intl.get("assets_order_tab_sell")}</span>
                )}
              </td>
              <td>{leastTwoDecimal(Number(item.deal_price))}</td>
              <td>{leastTwoDecimal(Number(item.deal_vol))}</td>
              <td>{leastTwoDecimal(Number(item.deal_vol).mul(Number(item.deal_price)))}</td>
              <td>{Number(item.fee).toFixed(12)}</td>
            </tr>
          );
        }
        if (this.state.currentStatus === 2) {
          return (
            <tr key={index}>
              <td>{this.parseTime(item.created_at)}</td>
              <td>{item.stock_code}</td>
              <td>
                {item.way == 1 ? (
                  <span className="green">{intl.get("assets_order_tab_buy")}</span>
                ) : (
                  <span className="red">{intl.get("assets_order_tab_sell")}</span>
                )}
              </td>
              <td>{leastTwoDecimal(Number(item.deal_price))}</td>
              <td>{leastTwoDecimal(Number(item.deal_vol))}</td>
              <td>{leastTwoDecimal(Number(item.deal_vol).mul(Number(item.deal_price)))}</td>
              <td>{Number(item.fee).toFixed(12)}</td>
            </tr>
          );
        }
      });
    } else if (this.state.currentType == 1) {
      //console.log('history_orders###',history_orders);
      result = history_orders.map((item, index) => {
        ///成交均价要怎么显示？
        //console.log('history_orders###',history_orders);
        if (item.way === this.state.currentStatus + 1) {
          //做buy,sell,all筛选
          return (
            <tr key={index}>
              <td>{this.parseTime(item.created_at)}</td>
              <td>{item.stock_code}</td>
              <td>
                {item.way == 1 ? (
                  <span className="green">{intl.get("assets_order_tab_buy")}</span>
                ) : (
                  <span className="red">{intl.get("assets_order_tab_sell")}</span>
                )}
              </td>
              <td>{leastTwoDecimal(Number(item.price))}</td>
              <td>{leastTwoDecimal(Number(item.vol))}</td>
              <td>{leastTwoDecimal(Number(item.done_vol))}</td>
              <td>{(item.swap_vol!=0&&item.done_vol!=0)?stringCutOut(Number(Number(item.swap_vol).div(Number(item.done_vol))),8):"0.00"}</td>
              <td>
                {this.getHistoryStatus(item.errno)}
              </td>
            </tr>
          );
        }
        if (this.state.currentStatus == 2) {
          return (
            <tr key={index}>
              <td>{this.parseTime(item.created_at)}</td>
              <td>{item.stock_code}</td>
              <td>
                {item.way == 1 ? (
                  <span className="green">{intl.get("assets_order_tab_buy")}</span>
                ) : (
                  <span className="red">{intl.get("assets_order_tab_sell")}</span>
                )}
              </td>
              <td>{leastTwoDecimal(Number(item.price))}</td>
              <td>{leastTwoDecimal(Number(item.vol))}</td>
              <td>{leastTwoDecimal(Number(item.done_vol))}</td>
              {/* <td>{(item.swap_vol!=0&&item.done_vol!=0)?cutOut(Number(Number(item.swap_vol).div(Number(item.done_vol))), 2):0}</td> */}
              <td>{(item.swap_vol!=0&&item.done_vol!=0)?stringCutOut(Number(Number(item.swap_vol).div(Number(item.done_vol))),8):"0.00"}</td>
             
              <td>
                {this.getHistoryStatus(item.errno)}
              </td>
            </tr>
          );
        }
      });
    } else {
      result = open_order.map((item, index) => {
        if (item.way === this.state.currentStatus + 1) {
          //做buy,sell,all筛选
          return (
            <tr key={index}>
              <td>{this.parseTime(item.created_at)}</td>
              <td>{item.stock_code}</td>
              <td>
                {item.way == 1 ? (
                  <span className="green">{intl.get("assets_order_tab_buy")}</span>
                ) : (
                  <span className="red">{intl.get("assets_order_tab_sell")}</span>
                )}
              </td>
              <td>{leastTwoDecimal(Number(item.price))}</td>
              <td>{leastTwoDecimal(Number(item.vol))}</td>
              <td>{leastTwoDecimal(Number(item.done_vol))}</td>
              <td>{leastTwoDecimal(Number(Number(item.vol).sub(Number(item.done_vol))))}</td>
              <td className="option">
                <a onClick={() => this.toCancelOrder(item.order_id,item.stock_code)}>{intl.get("assets_order_cancel")}</a>
              </td>
            </tr>
          );
        }
        if (this.state.currentStatus === 2) {
          return (
            <tr key={index}>
              <td>{this.parseTime(item.created_at)}</td>
              <td>{item.stock_code}</td>
              <td>
                {item.way == 1 ? (
                  <span className="green">{intl.get("assets_order_tab_buy")}</span>
                ) : (
                  <span className="red">{intl.get("assets_order_tab_sell")}</span>
                )}
              </td>
              <td>{leastTwoDecimal(Number(item.price))}</td>
              <td>{leastTwoDecimal(Number(item.vol))}</td>
              <td>{leastTwoDecimal(Number(item.done_vol))}</td>
              <td>{leastTwoDecimal(Number(Number(item.vol).sub(Number(item.done_vol))))}</td>
              <td className="option">
                <a onClick={() => this.toCancelOrder(item.order_id,item.stock_code)}>{intl.get("assets_order_cancel")}</a>
              </td>
            </tr>
          );
        }
      });
    }
    return result;
  }

  getNoDataDiv(list) {
    //console.log('list##',list);
    for (let i = 0; i < list.length; i++) {
      //console.log('list[i]###',list[i])
      if (list[i]) {
        return true;
      }
    }
    return false;
  }

  closeInputFundPwd() {
    if (this.mounted) {
      this.setState({
        showInputFundPwd: false
      })
    }
  }

  setFundPwd(value) {
    this.props.cancelOrderPost(this.state.currentId, this.state.currentCoinPair, value).then((response) => {
      if (response.data.errno == "OK") {
        //this.props.getPropetyInfo();
        notification.success({
          message: intl.get("ok_message_title"),
          description: response.data.message
        });

        let coinPair = this.state.currentCoinPair;
        this.props.getOpenOrders(coinPair);
        this.props.getOrderHistory(coinPair);
        this.props.getTradeRecords(coinPair);

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

  render() {
    let {
      typeTabList,
      statusTabList,
      currentType,
      currentStatus,
      open_orders,
      history_orders,
      trade_records
    } = this.state;
    let redColor = {
      color: "#FD3A3A"
    };
    let greenColor = {
      color: "#2EB564"
    };

    let TypeTab = typeTabList.map((item, index) => {
      return (
        <li
          className={index === currentType ? "active" : ""}
          key={index}
          onClick={() => this.typeTabChange(index)}
        >
          {item.name}
        </li>
      );
    });

    let StatusTab = statusTabList.map((item, index) => {
      return (
        <li
          className={index === currentStatus ? "active" : ""}
          key={index}
          onClick={() => this.statusTabChange(index)}
        >
          {item.name}
        </li>
      );
    });

    let listThead = this.getListThead();
    let listBody = this.getListBody(open_orders, history_orders, trade_records);
    //console.log('listBody###',listBody);
    let noDataDiv = this.getNoDataDiv(listBody);
    //console.log('listBody###',listBody);

    let search="";
    if(this.props.default && this.props.default.value) {
      search = `?lang=${this.props.default.value}`;
    }

    if(this.state.qd!=="null") {
      search = search?search+`&qd=${this.state.qd}`:`?qd=${this.state.qd}`;
    }

    return (
      <div className="trade-list">
      {this.state.showInputFundPwd ? <InputFundPwd close={this.closeInputFundPwd} setFundPwd={this.setFundPwd}></InputFundPwd>:null}
        <div className="trade-title clearfix">
          <ul className="left">{TypeTab}</ul>

          {
            this.props.user ? <Link to={{ pathname:"/assets/exchange_record/transaction",search:`${search}`}} className="more"><span>{intl.get("assets_order_tab_the_more")}</span> <img src={nextIcon} /></Link>:
            <Link to={{pathname:"/login",search:`${search}`}} className="more"><span>{intl.get("assets_order_tab_the_more")}</span> <img src={nextIcon} alt="nextIcon"/></Link>
          }
          
          
          <ul className="right">{StatusTab}</ul>
        </div>
        {/* <table className="trade-table">
                    
                </table> */}
        <div className="trade-table-scroll">
          <table className="trade-table">
            {listThead}
            <tbody>{listBody}</tbody>
          </table>
          {noDataDiv ? "" : <div className="no-data-img-box"><img src={noDataImg} /></div>}
          {noDataDiv ? "" : <div className="no-data-box">{intl.get("assets_no_data")}</div>}
        </div>
        {/* {this.state.isLoading?<div className="list-data-loading"><img src={loadingImg} /></div>:""} */}
        
        
        {/* <div className="no-trade-list">{noDataDiv ? "" : intl.get("assets_no_data")}</div> */}
      </div>
    );
  }
}

export default TradeList;