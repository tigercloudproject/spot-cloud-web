import React, {Component} from "react";
import { Slider } from "antd";
import { connect } from "react-redux";
import { getQueryString } from "../../utils/getQueryString.js";
import { withRouter, Link } from "react-router-dom";
import { getPropetyInfo } from "../../redux/assets.redux";
import { saveOrderPost, getOpenOrders, getOrderHistory, getTradeRecords } from "../../redux/exchange.redux";
import { debounce } from "../../utils/debounce.js";
import { notification } from "antd";
import { usdExchange, decimalProcess, getObjStocksPrecision, getVolUnit, getPriceUnit } from "../../utils/gconfig/stocksModel.js";
import intl from "react-intl-universal";
import {cutOut,stringCutOut} from "../../utils/dataProcess.js";
import { exchangeUSD, getCNYRate } from "../../utils/gconfig/stocksModel";
import { webExchangeSingle } from "../../utils/exchange.js";
import InputFundPwd from "../component/input_fund_pwd";
import ConfirmAlert from "../component/bbx_confirm_alert";
import { getCookie } from "../../utils/cookie.js";

import MediaQuery from "react-responsive";

@withRouter
@connect(state => ({ ...state.sdetails, ...state.gconfig, ...state.user, ...state.assets, ...state.lang,...state.index }),
{
  getPropetyInfo,
  saveOrderPost,
  getOpenOrders,
  getOrderHistory,
  getTradeRecords
})
class PayBix extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tabList: [
        {
          name: intl.get("exchange_form_tab_limit"),
          id: 0
        },
        {
          name: intl.get("exchange_form_market_order"),
          id: 1
        }
      ],
      tabList1: [ //只有现价单
        {
          name: intl.get("exchange_form_tab_limit"),
          id: 0
        }
      ],
      currentTab: 0, //0 现价单, 1市价单
      form: {
        buy_price: {
          valid: true,
          value: "",
          error: "",
          default_value: ""
        },
        buy_volume: {
          valid: true,
          value: "",
          error: ""
        },
        sell_price: {
          valid: true,
          value: "",
          error: "",
          default_value: ""
        },
        sell_volume: {
          valid: true,
          value: "",
          error: ""
        }
      },
      ticker: {},
      price_unit: 8, //价格单位
      vol_unit: 3, //数量单位
      user_assets: [],
      withdrawal_configs: [],
      coin_fee_configs: [],
      coinPair: '',
      buy_silder: 0,
      sell_silder: 0,
      big_buy_volume: 0,
      big_sell_volume: 0,
      canSubmitBuy: true, //买卖按钮是否可用
      canSubmitSell: true, //买卖按钮是否可用
      autoSetBuyPrice: true,//是否自动填入价格(在改变价格后不自动填入)
      autoSetSellPrice: true,//是否自动填入价格(在改变价格后不自动填入)
      minTradeAmount: 0, //最小交易额
      isSupportMarket: true, //是否支持市价单
      firstCoinVolUnit: 8, //第一个币的vol精度
      lastCoinVolUnit: 8, //第二个币的vol精度
      firstCoinCanRecharge: true,  //第一个币是否可充值
      lastCoinCanRecharge: true, //最后一个币是否可充值
      coinRate: 0, //第一个币的率 对美元
      buyCoinPrice: 0, //买币换算价
      sellCoinPrice: 0, //卖币换算价
      cnyRate: null, //人民币对美元
      buyCurrentPrice: '', //买当前价 市价单的时候用
      sellCurrentPrice: '', //卖当前价 市价单的时候用
      showInputFundPwd: false,
      fundPwd: "",
      currentSubmitData: null,
      isConfirm: false, //是否显示限价提示弹框
      tipLimit:0, //限价
      tipLimitDesc: "",
      currentWay: "", //当前交易方向
      qd: localStorage.getItem("qd"),  //渠道
      wayList: [
        {
          name: intl.get("assets_order_tab_buy"),
          id: "buy"
        },
        {
          name: intl.get("assets_order_tab_sell"),
          id: "sell"
        }
      ],
      currentTradeWay: "buy",
    };

    this.buyRangeOnChange = this.buyRangeOnChange.bind(this);
    this.sellRangeOnChange = this.sellRangeOnChange.bind(this);
    this.closeInputFundPwd = this.closeInputFundPwd.bind(this);
    this.setFundPwd = this.setFundPwd.bind(this);
    this.closeTipLimitAlert = this.closeTipLimitAlert.bind(this);
    this.confirmTipLimitAlert = this.confirmTipLimitAlert.bind(this);


    this.toSaveOrder = debounce(function (data) {
      
      this.props.saveOrderPost(data).then((response)=>{

        //解锁买卖按钮
        this.setState({
          canSubmitBuy: true,
          canSubmitSell: true
        })


        if (response.data.errno=="OK") {
          this.props.getPropetyInfo();
          notification.success({
            message: intl.get("ok_message_title"),
            description: response.data.message
          });
          this.props.getOpenOrders(this.state.coinPair);
          this.props.getOrderHistory(this.state.coinPair);
          this.props.getTradeRecords(this.state.coinPair);
        }else {
          if (response.data.errno == "ASSERT_PERMISSION_DENIED") {
            if(this.mounted) {
              this.setState({
                showInputFundPwd: true
              })
            }
          }else {
            notification.error({
              message: intl.get("error_message_title"),
              description: response.data.message
            });
          }
        }
      });

    }, 500);
  }

  componentWillMount() {
    this.mounted = true;
    let token = getCookie("token");
    if(token) {
      this.props.getPropetyInfo();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidMount() {
    
  }

  componentWillReceiveProps(nextProps) {
    let coinPair = getQueryString(this.props.location.search, "coinPair");
    let token = getCookie("token");

    if(this.mounted) {
      this.setState({
        coinPair: coinPair
      })
    }

    if (nextProps.clist.stocks && nextProps.spot_details && nextProps.spot_details.ticker) {
      let price_unit = ["last_price", "rise_fall_value", "high", "low"];
      let vol_unit = ["total_volume"];
      let ticker = getObjStocksPrecision(nextProps.clist.stocks, nextProps.spot_details.ticker, coinPair, price_unit, vol_unit);

      let volUnit = getVolUnit(nextProps.clist.stocks,coinPair);
      let priceUnit = getPriceUnit(nextProps.clist.stocks,coinPair);
      let minTradeAmount = this.getMinTradeAmount(nextProps.clist.stocks,coinPair);
      let tipLimit = this.getTipLimit(nextProps.clist.stocks,coinPair);
       //console.log("ticker.last_price####",ticker.last_price);
      if (this.mounted) {
        this.setState({
          ticker: ticker,
          price_unit: priceUnit,
          vol_unit: volUnit,
          minTradeAmount: minTradeAmount,
          tipLimit: tipLimit,
          form: {
            ...this.state.form,
            buy_price: {
              ...this.state.form.buy_price,
              default_value: ticker.last_price
            },
            sell_price: {
              ...this.state.form.sell_price,
              default_value: ticker.last_price
            }
          },
          buyCurrentPrice: ticker.last_price,
          sellCurrentPrice: ticker.last_price
        });

        //用这部分#########
        //判断是否切换币值对 和sell_price和buy_price文本框是否改变过
        if ((this.state.autoSetSellPrice && this.state.autoSetBuyPrice) || (this.props.spot_details && nextProps.spot_details.stock_code != this.props.spot_details.stock_code)) {
          if(this.mounted) {
            this.setState({
              form: {
                ...this.state.form,
                buy_price: {
                  ...this.state.form.buy_price,
                  value: ticker.last_price
                },
                sell_price: {
                  ...this.state.form.sell_price,
                  value: ticker.last_price
                }
              }
              // buy_silder:0,  //置0买选择条
              // sell_silder:0  //置0卖选择条
            });
          }
          
        }

        //只有在切换币值对时选择条置0
        if (this.props.spot_details && nextProps.spot_details.stock_code != this.props.spot_details.stock_code){
          this.setState({
            buy_silder: 0,  //置0买选择条
            sell_silder: 0,  //置0卖选择条
            form: {
              ...this.state.form,
              buy_volume: {
                valid: true,
                value: "",
                error: ""
              },
              sell_volume: {
                valid: true,
                value: "",
                error: ""
              },
            }
          })
        }
        //用这部分########
      }
    }

    //费率列表
    if (token && nextProps.user_config && nextProps.user_config.coin_fee_configs) {
      if(this.mounted) {
        this.setState({
          withdrawal_configs: nextProps.user_config.withdrawal_configs,
          coin_fee_configs: nextProps.user_config.coin_fee_configs
        })
        this.calculateBigBuyVolume();
        this.calculateBigSellVolume();
      }
    } else {
      if (nextProps.clist && nextProps.clist.coin_fee_configs) {
        if(this.mounted) {
          this.setState({
            coin_fee_configs: nextProps.clist.coin_fee_configs
          });
        }
        this.calculateBigBuyVolume();
        this.calculateBigSellVolume();
      }  
    }

    //用户资产
    if(nextProps.propety_info) {
      if(this.mounted) {
        if(nextProps.propety_info.user_assets) {
          this.setState({
            user_assets: nextProps.propety_info.user_assets
          })
        }else {
          this.setState({
            user_assets: []
          })
        }
        
      }
    }

    
    //判断是否选择了深度列表中的数据
    if(this.props.current_price!=nextProps.current_price) {
      //console.log("nextProps.current_price####",nextProps.current_price);
      //console.log("nextProps.current_price_type#####",nextProps.current_price_type);
      //console.log("nextProps.current_price_list####",nextProps.current_price_list);
      
      let buyVolume, sellVolume, buySilder, sellSilder;


      let myasset = this.getMyCurrentCoinPair();
      let coinPairArr = this.state.coinPair.split("/");
      let maxBuyVolume = this.getMaxBuyVolume(myasset.coin2,coinPairArr[1],nextProps.current_price);
      let maxSellVolume = this.getMaxSellVolume(myasset.coin1,coinPairArr[0],nextProps.current_price);

      //设置volume*******************
      let priceType = nextProps.current_price_type;
      let mergeVolume;;
      if(priceType==="buys") {
        mergeVolume = this.getMergeGTVolume(nextProps.current_price_list, nextProps.current_price);
        if(mergeVolume<=maxSellVolume) {
          sellVolume = mergeVolume;
        }else {
          sellVolume = maxSellVolume;
        }
        //buyVolume = Number(maxBuyVolume).mul(Number(Number(this.state.buy_silder).div(100)));
        buyVolume = 0;
      }else if(priceType==="sells") {
        mergeVolume = this.getMergeLTVolume(nextProps.current_price_list, nextProps.current_price);
        if(mergeVolume<=maxBuyVolume) {
          buyVolume = mergeVolume;
        }else {
          buyVolume = maxBuyVolume;
        }
        //sellVolume = Number(maxSellVolume).mul(Number(Number(this.state.buy_silder).div(100)));
        sellVolume = 0;
      }
      //设置volume结束*******************


      //设置silder**********************
      let b_one = maxBuyVolume?Number(maxBuyVolume).div(100):0;
      let s_one = maxSellVolume?Number(maxSellVolume).div(100):0;
      buySilder = b_one && buyVolume?Number(buyVolume).div(b_one):0;
      sellSilder = b_one && sellVolume?Number(sellVolume).div(s_one):0;
      //设置silder结束*******************
      
    
      if(this.mounted) {
        this.setState({
          form: {
            ...this.state.form,
            buy_price: {
              ...this.state.form.buy_price,
              value: nextProps.current_price
            },
            sell_price: {
              ...this.state.form.sell_price,
              value: nextProps.current_price
            },
            buy_volume: {
              ...this.state.form.buy_volume,
              value: cutOut(buyVolume, this.state.vol_unit)
            },
            sell_volume: {
              ...this.state.form.sell_volume,
              value: cutOut(sellVolume, this.state.vol_unit)
            }
          },
          autoSetBuyPrice: false,
          autoSetSellPrice: false,
          buy_silder: buySilder,
          sell_silder: sellSilder
        });
      }
    }

    // 判断是否切换了币值对，是否支持市价单
    if (nextProps.clist.stocks && this.props.spot_details && nextProps.spot_details &&nextProps.spot_details.stock_code != this.props.spot_details.stock_code && nextProps.clist.spot_coins) {
      this.setIssupportMarket(nextProps.clist.stocks,nextProps.spot_details.stock_code);
      //console.log("nextProps.spot_details.stock_code####", nextProps.spot_details.stock_code);
      let coinPair = nextProps.spot_details.stock_code;
      let coinArr = String(coinPair).split("/");
      let firstCoin = coinArr[0];
      let lastCoin = coinArr[1];
      let firstCoinVolUnit = this.getCoinVolUnit(nextProps.clist.spot_coins,firstCoin);
      let lastCoinVolUnit = this.getCoinVolUnit(nextProps.clist.spot_coins,lastCoin);
      let firstCoinCanRecharge = this.isCanRecharge(nextProps.clist.spot_coins,firstCoin);
      let lastCoinCanRecharge = this.isCanRecharge(nextProps.clist.spot_coins,lastCoin);


      if(this.mounted) {
        this.setState({
          firstCoinVolUnit: firstCoinVolUnit,
          lastCoinVolUnit: lastCoinVolUnit,
          firstCoinCanRecharge: firstCoinCanRecharge,
          lastCoinCanRecharge: lastCoinCanRecharge
        });
      }

      // let tabList = this.state.isSupportMarket ? this.state.tabList : this.state.tabList1;
      
    }

    //设置美元换算价格
    if (nextProps.clist && nextProps.clist.coin_prices && nextProps.clist.usd_rates && nextProps.spot_tickers && nextProps.spot_tickers.tickers) {
      let coinPair = getQueryString(this.props.location.search, "coinPair");
      let coinArr = coinPair.split("/");
      //let firstCoin = coinArr[0];
      let lastCoin = coinArr[1];

      let coinRateUSD = exchangeUSD(nextProps.clist.coin_prices, lastCoin);

      if (!coinRateUSD) {
        coinRateUSD = webExchangeSingle(lastCoin, "USD", 1, nextProps.clist.coin_prices, nextProps.clist.usd_rates, nextProps.spot_tickers.tickers);
      }

      if (this.mounted) {
        this.setState({ coinRate: coinRateUSD });
      }
    }

    //设置cny换算价格
    if (nextProps.clist && nextProps.clist.usd_rates) {
        let cnyRate = getCNYRate(nextProps.clist.usd_rates,'CNY');
        
        if(this.mounted) {
          this.setState({
            cnyRate: cnyRate
          })
        }
    }
    
  }

  //选择深度数据时，获取合并的量
  getMergeLTVolume(list,price) {
    let result = 0;
    list.forEach((item) => {
      if(Number(item.price)<=Number(price)) {
        result = Number(result).add(Number(item.vol));
      }
    })
    return result;
  }
  getMergeGTVolume(list, price) {
    let result = 0;
    list.forEach((item) => {
      if (Number(item.price) >= Number(price)) {
        result = Number(result).add(Number(item.vol));
      }
    })
    return result;
  }

  //判断币是否可充值
  isCanRecharge(spot_coins,coin) {
    for (let i = 0; i < spot_coins.length; i++) {
      if (spot_coins[i].name == coin) {
        if(spot_coins[i].cash_ability==3 || spot_coins[i].cash_ability==1) {
          return true;
        }else {
          return false;
        }
      }
    }
  }


  //获取币的vol_unit
  getCoinVolUnit(spot_coins,coin) {
    for(let i=0; i<spot_coins.length; i++) {
      if(spot_coins[i].name==coin) {
        let p = spot_coins[i].vol_unit.split(".")[1].length;
        return p;
      }
    }
    return 8;
  }

  // 判断是否支持市价单
  setIssupportMarket(stocks,coinPair) {
    for(let i=0;i<stocks.length;i++) {
      if(stocks[i].name==coinPair) {
        if(this.mounted) {
          this.setState({
            isSupportMarket: stocks[i].is_support_market_order
          })
        }
        return;
      }
    }
  }


  //获取当前币值对最小交易额
  getMinTradeAmount(stocks,coinPair) {
    for(let i=0; i<stocks.length; i++) {
      if(stocks[i].name == coinPair) {
        return stocks[i].min_amount;
      }
    }
    return 0;
  }

  //获取限价比例
  getTipLimit(stocks,coinPair) {
    for (let i = 0; i < stocks.length; i++) {
      if (stocks[i].name == coinPair) {
        return stocks[i].tip_limit;
      }
    }
    return 0;
  }

  buyRangeOnChange(value) {
    let one = 0;
    if(this.state.big_buy_volume) {
      one = Number(this.state.big_buy_volume).div(100);
    }
    let new_value = one*value;
    let buy_volume = Math.floor(new_value * Math.pow(10, this.state.vol_unit)) / (Math.pow(10, this.state.vol_unit));
    
    if(this.mounted) {
      this.setState({
        buy_silder: value,
        
      });

      if(buy_volume<this.state.big_buy_volume) {
        this.setState({
          form: {
            ...this.state.form,
            buy_volume: {
              ...this.state.form.buy_volume,
              value: buy_volume
            }
          }
        })
      }

    }
  }

  sellRangeOnChange(value) {
    let one = 0;

    if (this.state.big_sell_volume) {
      one = Number(this.state.big_sell_volume).div(100);
    }
    let new_value = Number(one).mul(Number(value));

    let x = Math.floor(Number(new_value).mul(Math.pow(10, this.state.vol_unit)));
    let y = Math.pow(10, this.state.vol_unit);
    let sell_volume = Number(x).div(Number(y));

    if (this.mounted) {
      this.setState({
        sell_silder: value,
        form: {
          ...this.state.form,
          sell_volume: {
            ...this.state.form.sell_volume,
            value: sell_volume
          }
        }
      });
    }
  }

  //切换限价委托和市价委托
  tabSelect(index) {
    if(index == 1) {
      if(this.mounted) {
        this.setState({
          form: {
            ...this.state.form,
            buy_price: {
              ...this.state.form.buy_price,
              value: this.state.buyCurrentPrice
            },
            sell_price: {
              ...this.state.form.sell_price,
              value: this.state.sellCurrentPrice
            }
          }
        })
      }
    }

    if (this.mounted) {
      this.setState({
        currentTab: index
      });
    }
  }



  clearNoNum(obj,dagit) {
    obj.value = obj.value.replace(/[^\d.]/g, ""); //清除“数字”和“.”以外的字符
    obj.value = obj.value.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的
  
    obj.value = obj.value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");

    switch(dagit) {
        case 0:
            obj.value = obj.value.replace(/^(\-)*(\d+)*$/, "$1$2"); 
            break;
        case 1:
            obj.value = obj.value.replace(/^(\-)*(\d+)\.(\d).*$/, "$1$2.$3");
            break;
        case 2:
            obj.value = obj.value.replace(/^(\-)*(\d+)\.(\d\d).*$/, "$1$2.$3");
            break;
        case 3:
            obj.value = obj.value.replace(/^(\-)*(\d+)\.(\d\d\d).*$/, "$1$2.$3");
            break;
        case 4:
            obj.value = obj.value.replace(/^(\-)*(\d+)\.(\d\d\d\d).*$/, "$1$2.$3");
            break;
        case 5:
            obj.value = obj.value.replace(/^(\-)*(\d+)\.(\d\d\d\d\d).*$/, "$1$2.$3");
            break;
        case 6:
            obj.value = obj.value.replace(/^(\-)*(\d+)\.(\d\d\d\d\d\d).*$/, "$1$2.$3");
            break;
        case 7:
            obj.value = obj.value.replace(/^(\-)*(\d+)\.(\d\d\d\d\d\d\d).*$/, "$1$2.$3");
            break;
        case 8:
            obj.value = obj.value.replace(/^(\-)*(\d+)\.(\d\d\d\d\d\d\d\d).*$/, "$1$2.$3");
            break;
        case 9:
            obj.value = obj.value.replace(/^(\-)*(\d+)\.(\d\d\d\d\d\d\d\d\d).*$/, "$1$2.$3");
            break;
    }
    //obj.value = obj.value.replace(/^(\-)*(\d+)\.(\d\d\d\d\d\d\d\d).*$/, "$1$2.$3"); //只能输入两个小数
    // if (obj.value.indexOf(".") < 0 && obj.value != "") {
    //   //以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额
    //   obj.value = parseFloat(obj.value);
    // }
    return obj;
  }
  isNumber(value) {
      var patrn = /^[0-9]*$/;
      if (patrn.exec(value) == null || value == "") {
          return false
      } else {
          return true
      }
  }
  //监听表单变化
  handleValueChange(field, value) {
    const { form } = this.state;
    const newFieldObj = { value, valid: true, error: "" };
    let b_one,s_one;

    switch (field) {
      case "buy_price":
        //不自动填入价格
        if (this.mounted) {
          this.setState({
            autoSetBuyPrice: false
          })
        }
        this.clearNoNum(newFieldObj,this.state.price_unit);

        break;
      case "buy_volume":
        this.clearNoNum(newFieldObj,this.state.vol_unit);
        if (this.state.big_buy_volume && this.isNumber(value)) {
          b_one = Number(this.state.big_buy_volume).div(100);
          //console.log("this.state.big_buy_volume###", this.state.big_buy_volume);
          //console.log("Number(value).div(b_one)###", Number(value).div(b_one));
          if(this.mounted) {
            this.setState({
              buy_silder: Number(value).div(b_one)
            })
          }
        }
        break;
      case "sell_price":
        //不自动填入价格
        if (this.mounted) {
          this.setState({
            autoSetSellPrice: false
          })
        }
        this.clearNoNum(newFieldObj,this.state.price_unit);

        break;
      case "sell_volume":
        this.clearNoNum(newFieldObj,this.state.vol_unit);
        if (this.state.big_sell_volume && this.isNumber(value)) {
          s_one = Number(this.state.big_sell_volume).div(100);
          if (this.mounted) {
            this.setState({
              sell_silder: Number(value).div(s_one)
            })
          }
        }
        break;
    }

    if (this.mounted) {
      this.setState({
        form: {
          ...form,
          [field]: newFieldObj
        }
      });
    }
  }

  //获取我拥有的当前币值对的量
  getMyCurrentCoinPair() {
    let coin1 = this.state.coinPair?this.state.coinPair.split("/")[0]:'';
    let coin2 = this.state.coinPair?this.state.coinPair.split("/")[1]:'';
    let coin1_vol = 0, coin2_vol = 0;

    this.state.user_assets.forEach((item) => {
      if(coin1==item.coin_code) {
        coin1_vol = item.available_vol;
      }
      if(coin2==item.coin_code) {
        coin2_vol = item.available_vol;
      }
    })
    return {
      coin1: coin1_vol,
      coin2: coin2_vol
    }
  }

  //获取当前币值对手续费
  getCurrentCoinPairFee() {
    let result;
    this.state.coin_fee_configs.forEach((item) => {
      if(item.stock_code==this.state.coinPair) {
        result = item;
      }
    })
    return result;
  }

  //设置计算最多可买的量
  calculateBigBuyVolume() {
    let coin = this.state.coinPair?this.state.coinPair.split("/")[1]:'';
    let my_asset = this.getMyCurrentCoinPair(); 
    let value =my_asset.coin2;
    let fee = this.getCurrentCoinPairFee();
    let result = value;
    let a;
    if(fee && fee.type) {
      if (fee.type == 1 || fee.type == 3) {
        if (coin === fee.coin_code) {
          a = Number(value).mul(Number(fee.fee_ratio));
          result = Number(value).sub(Number(a));
        }
        
      }
    }
    if(this.mounted) {
      this.setState({
        big_buy_volume: Number(result).div(this.state.form.buy_price.value)
      })
    }
  }

  //传参获得最大可买量
  getMaxBuyVolume(asset,coin,price) { 
    let fee = this.getCurrentCoinPairFee();
    let result = asset;
    let a;
    if(fee && fee.type) {
      if(fee.type==1 || fee.type==3) {
        if(coin == fee.coin_code) {
          a = Number(asset).mul(Number(fee.fee_ratio));
          result = Number(asset).sub(Number(a));
        }
      }
    }

    result = Number(result).div(price);
    return result;
  }

  //设置计算最多可卖的量
  calculateBigSellVolume() {
    let coin = this.state.coinPair ? this.state.coinPair.split("/")[0] : '';
    let my_asset = this.getMyCurrentCoinPair();
    let value = my_asset.coin1;
    let fee = this.getCurrentCoinPairFee();
    let result = value;
    let a;

    if(fee && fee.type) {
      if (fee.type === 2 || fee.type === 3) {
        if (coin == fee.coin_code) {
          a = Number(value).mul(Number(fee.fee_ratio));
          result = Number(value).sub(Number(a));
        }
      }
    }
    
    if(this.mounted) {
      this.setState({
        big_sell_volume: result
      })
    }
  }

  //传参获得最大可卖量
  getMaxSellVolume(asset, coin, price) { 
    let fee = this.getCurrentCoinPairFee();
    let result = asset;
    let a;
    if (fee && fee.type) {
      if (fee.type == 2 || fee.type == 3) {
        if (coin == fee.coin_code) {
          a = Number(asset).mul(Number(fee.fee_ratio));
          result = Number(asset).sub(Number(a));
        }
      }
    }
    return result;
  }

  calculateTotal(vol,price){
    let result,total=0,unit;
    if(this.state.price_unit) {
      total = Number(vol).mul(Number(price));
      unit = Math.pow(10,this.state.price_unit);
      
      result = total!=0?Number(Number(Number(total).mul(Number(unit))).div(unit)):0;  
    }
    return result;
  }

  //提交订单
  submitOrder(way) {
    //锁住买卖按钮
    let price,vol;
    if(this.mounted) {
      this.setState({
        currentWay: way   //设置当前交易方向
      })
    }

    //我的资产
    if(way==1) { //买
      vol = this.state.form.buy_volume.value;
      price = this.state.form.buy_price.value;
      this.setState({
        canSubmitBuy: false
      })

      //买入时，超过当前价tip_limt（低价买不提示）
      // console.log("price####", price);
      // console.log("default_value####", defaultValue);
      // console.log("tipLimit######", this.state.tipLimit);
      // console.log("limtPrice###", limtPrice);
      let defaultValue = this.state.buyCurrentPrice;
      let limtPrice = Number(defaultValue).add(Number(Number(defaultValue).mul(Number(this.state.tipLimit))));
      let desc = intl.get("buy_tip_limit_text1")+ " " + this.state.tipLimit * 100 + "%, " + intl.get("buy_tip_limit_text2");

      if(Number(price)>Number(limtPrice)) {
        if(this.mounted) {
          this.setState({
            tipLimitDesc: desc,
            isConfirm: true,
          })
        }
        return;
      }

      //如果交易量大于最大可交易量

      if (Number(vol) > Number(this.state.big_buy_volume)) {
        notification.error({
          message: intl.get("error_message_title"),
          description: intl.get("insufficient_balance")
        });

        this.setState({ canSubmitBuy: true });

        return;
      }

      //如果交易量小于 最小交易量则提示错误

      if(Number(vol)<Number(this.state.minTradeAmount)) {
        notification.error({
          message: intl.get("error_message_title"),
          description: intl.get("minimum_amount_of_this_trade_pair") + this.state.minTradeAmount
        });

        this.setState({
          canSubmitBuy: true
        })
        
        return;
      }
      

      
    }else { //卖
      vol = this.state.form.sell_volume.value;
      price = this.state.form.sell_price.value;
      this.setState({
        canSubmitSell: false
      })

      //买入时，超过当前价tip_limt（低价买不提示）
      // console.log("price####", price);
      // console.log("default_value####", defaultValue);
      // console.log("tipLimit######", this.state.tipLimit);
      // console.log("limtPrice###", limtPrice);
      let defaultValue = this.state.sellCurrentPrice;
      let limtPrice = Number(defaultValue).sub(Number(Number(defaultValue).mul(Number(this.state.tipLimit))));
      let desc = intl.get("sell_tip_limit_text1") + " " + this.state.tipLimit*100 + "%, "  + intl.get("sell_tip_limit_text2");

      if (Number(price) < Number(limtPrice)) {
        if (this.mounted) {
          this.setState({
            tipLimitDesc: desc,
            isConfirm: true
          });
        }
        return;
      }


      //console.log("big_sell_volume####", this.state.big_sell_volume);
      //如果交易量大于最大可交易量
      if (Number(vol) > Number(this.state.big_sell_volume)) {
        notification.error({
          message: intl.get("error_message_title"),
          description: intl.get("insufficient_balance")
        });

        this.setState({ 
          canSubmitSell: true
        });

        return;
      }

      //如果交易量小于 最小交易量则提示错误
      if (Number(vol) < Number(this.state.minTradeAmount)) {
        notification.error({
          message: intl.get("error_message_title"),
          description: intl.get("minimum_amount_of_this_trade_pair") + this.state.minTradeAmount
        });

        this.setState({
          canSubmitSell: true
        })

        return;
      }
    }

    //价格和数量不能为0
    if(Number(price)===0 || Number(vol)===0) {
      notification.error({
        message: intl.get("error_message_title"),
        description: intl.get("price_and_vol_can_not_zero")
      });

      this.setState({
        canSubmitSell: true,
        canSubmitBuy: true
      })

      return;
    }

    let date = Date.parse(String(new Date()).replace(/-/g, "/")) / 1000; 

    let data = {
      stock_code: this.state.coinPair,
      price: price,
      vol: vol,
      way: way,
      category: this.state.currentTab+1,
      nonce: date
    }

    if(this.mounted) {
      this.setState({
        currentSubmitData: data
      })
    }

    this.toSaveOrder(data);
  }

  //获取币转换为美元或人民币
  getExchangePriceString(rate,price,langIndex) {
    let exchangePrice = Number(price).mul(Number(rate));
    let result;
    if (langIndex === 3) {
      result = exchangePrice ? "≈" + " $ " + stringCutOut(exchangePrice, 2) : "≈ $ 0.00";
    } else {
      result = exchangePrice ? "≈" + " ¥ " + stringCutOut(exchangePrice, 2) : "≈ ¥ 0.00";
    }
    return result;
  }

  //关闭输入资金密码框
  closeInputFundPwd() {
    if(this.mounted) {
      this.setState({
        showInputFundPwd: false
      })
    }
  }

  //设置输入的资金密码
  setFundPwd(value) {

    this.props.saveOrderPost(this.state.currentSubmitData,value).then((response) => {
      if (response.data.errno == "OK") {
        this.props.getPropetyInfo();
        notification.success({
          message: intl.get("ok_message_title"),
          description: response.data.message
        });
        this.props.getOpenOrders(this.state.coinPair);
        this.props.getOrderHistory(this.state.coinPair);
        this.props.getTradeRecords(this.state.coinPair);
        
      } else {
        if (response.data.errno == "ASSERT_PERMISSION_DENIED" || response.data.errno=="INCORRET_ASSET_PASSWORD") {
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

  //关闭限价提示弹框
  closeTipLimitAlert() {
    if(this.mounted) {
      this.setState({
        isConfirm: false,
        canSubmitBuy: true,
        canSubmitSell: true,
      })
    }
  }
  //确认限价提示弹框
  confirmTipLimitAlert() {
    if(this.mounted) {
      this.setState({
        isConfirm: false   //关闭限价弹框
      });
    }

    //锁住买卖按钮
    let price, vol;

    //我的资产
    if (this.state.currentWay == 1) { //买
      vol = this.state.form.buy_volume.value;
      price = this.state.form.buy_price.value;
      this.setState({
        canSubmitBuy: false
      })

      //如果交易量大于最大可交易量

      if (Number(vol) > Number(this.state.big_buy_volume)) {
        notification.error({
          message: intl.get("error_message_title"),
          description: intl.get("insufficient_balance")
        });

        this.setState({ canSubmitBuy: true });

        return;
      }

      //如果交易量小于 最小交易量则提示错误

      if (Number(vol) < Number(this.state.minTradeAmount)) {
        notification.error({
          message: intl.get("error_message_title"),
          description: intl.get("minimum_amount_of_this_trade_pair") + this.state.minTradeAmount
        });

        this.setState({
          canSubmitBuy: true
        })

        return;
      }



    } else { //卖
      vol = this.state.form.sell_volume.value;
      price = this.state.form.sell_price.value;
      this.setState({
        canSubmitSell: false
      })
      //console.log("big_sell_volume####", this.state.big_sell_volume);
      //如果交易量大于最大可交易量
      if (Number(vol) > Number(this.state.big_sell_volume)) {
        notification.error({
          message: intl.get("error_message_title"),
          description: intl.get("insufficient_balance")
        });

        this.setState({
          canSubmitSell: true
        });

        return;
      }

      //如果交易量小于 最小交易量则提示错误
      if (Number(vol) < Number(this.state.minTradeAmount)) {
        notification.error({
          message: intl.get("error_message_title"),
          description: intl.get("minimum_amount_of_this_trade_pair") + this.state.minTradeAmount
        });

        this.setState({
          canSubmitSell: true
        })

        return;
      }
    }

    //价格和数量不能为0
    if (Number(price) === 0 || Number(vol) === 0) {
      notification.error({
        message: intl.get("error_message_title"),
        description: intl.get("price_and_vol_can_not_zero")
      });

      this.setState({
        canSubmitSell: true,
        canSubmitBuy: true
      })

      return;
    }

    let date = Date.parse(String(new Date()).replace(/-/g, "/")) / 1000;

    let data = {
      stock_code: this.state.coinPair,
      price: price,
      vol: vol,
      way: this.state.currentWay,
      category: this.state.currentTab + 1,
      nonce: date
    }

    if (this.mounted) {
      this.setState({
        currentSubmitData: data
      })
    }

    this.toSaveOrder(data);


  }

  switchWay(way) {
    if(this.mounted) {
      this.setState({
        currentTradeWay: way
      })
    }
  }

  render() {
    
    const { currentTab, coinPair, coin_fee_configs, big_buy_volume, big_sell_volume } = this.state;

    //判断是否支持市价单，决定tab项
    let tabList = this.state.isSupportMarket?this.state.tabList:this.state.tabList1;
    let tab_current = this.state.isSupportMarket?currentTab:0;
    let tabLi = tabList.map((item, index) => {
      return (
        <li className={index === tab_current ? "active" : ""} key={index} onClick={() => this.tabSelect(index)}>
          {item.name}
        </li>
      );
    });

    let defaultPrice = tab_current === 0 ? "0.00065395" : intl.get("exchange_form_market_order");

    let coin1_name = coinPair?coinPair.split("/")[0]:'';
    let coin2_name = coinPair?coinPair.split("/")[1]:'';


    let myasset = this.getMyCurrentCoinPair();


    let marks = {};
    marks = {
        0: {
          style: {
            color: "rgba(151,176,214,0.7)"
          },
          label: "0%"
        },
        25: {
          style: {
            color: "rgba(151,176,214,0.7)"
          },
          label: "25%"
        },
        50: {
          style: {
            color: "rgba(151,176,214,0.7)"
          },
          label: "50%"
        },
        75: {
          style: {
            color: "rgba(151,176,214,0.7)"
          },
          label: "75%"
        },
        100: {
          style: {
            color: "rgba(151,176,214,0.7)"
          },
          label: "100%"
        }
    };
    

    let buy_total = this.calculateTotal(this.state.form.buy_volume.value, this.state.form.buy_price.value);
    let sell_total = this.calculateTotal(this.state.form.sell_volume.value, this.state.form.sell_price.value);


    let langCode = "", search="";
    if(this.props.default && this.props.default.value) {
      langCode = this.props.default.value;
      search = `?lang=${this.props.default.value}`;
    }
    if(this.state.qd!=="null") {
      search = search?search + `&qd=${this.state.qd}`:`?qd=${this.state.qd}`;
    }

    let buyPriceRateString, sellPriceRateString;
    if(this.props.default && this.props.default.index == 3){
      if (this.state.coinRate) {
        buyPriceRateString = this.getExchangePriceString(this.state.coinRate,this.state.form.buy_price.value,3);
        sellPriceRateString = this.getExchangePriceString(this.state.coinRate,this.state.form.sell_price.value,3);
  
      }
    }else {
      if(this.state.cnyRate && this.state.coinRate) {
        let coinRate = Number(this.state.coinRate).mul(Number(this.state.cnyRate));
        buyPriceRateString = this.getExchangePriceString(coinRate, this.state.form.buy_price.value, 1);
        sellPriceRateString = this.getExchangePriceString(coinRate, this.state.form.sell_price.value, 1);
      }
    }

    //console.log("buy_silder####", this.state.buy_silder);

    let token = getCookie("token");

    let h5TradeWaySpan = this.state.wayList.map((item,index) => {
      return <span key={index} onClick={() => this.switchWay(item.id)}
          className={this.state.currentTradeWay===item.id?"active":""}
        >
        {item.name}
      </span>
    })

    let currentTradeWay = this.state.currentTradeWay;

    return (
      <section className="pay-bix-box">
      
        <MediaQuery maxWidth={676}>
          <div className="switch-way">
            {h5TradeWaySpan}
          </div>
        </MediaQuery>

        <ul className="pay-bix-tab">{tabLi}</ul>
        {/* {currentTab === 0 ? <div className="h-20" /> : null} */}

        

        <MediaQuery minWidth={676}>
        
          <div className="pay-bix-form">
            <div className="form-row">
              <div className="form-control5" style={{ paddingTop: "15px" }}>
                <div className="avbi">
                  {intl.get("exchange_form_avbl")}: {!!token ? cutOut(myasset.coin2, this.state.firstCoinVolUnit) : cutOut(0, this.state.firstCoinVolUnit)} {coin2_name}
                  {/* {
                    !!token ? <Link to={{ pathname: "/assets/deposit", search: `${search}`, state: `${coin2_name}` }} className="deposit">{intl.get("exchange_form_deposit_bnt")}</Link> :
                      <Link to={{ pathname: "/login", search: `${search}`, state: `${coin2_name}` }} className="deposit">{intl.get("exchange_form_deposit_bnt")}</Link>
                  } */}
                </div>
              </div>
              <div className="form-control5" style={{ paddingTop: "15px" }}>
                <div className="avbi">
                  {intl.get("exchange_form_avbl")}: {!!token ? cutOut(myasset.coin1, this.state.lastCoinVolUnit) : cutOut(0, this.state.lastCoinVolUnit)} {coin1_name}
                  {/* {
                    !!token ? <Link to={{ pathname: "/assets/deposit", search: `${search}`, state: `${coin1_name}` }} className="deposit">{intl.get("exchange_form_deposit_bnt")}</Link> :
                      <Link to={{ pathname: "/login", search: `${search}`, state: `${coin1_name}` }} className="deposit">{intl.get("exchange_form_deposit_bnt")}</Link>
                  } */}

                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-control5">
                <label>{intl.get("exchange_form_buy_price")}</label>
                <div className="input-box">
                  {
                    tab_current === 0 ? (
                      <input
                        type="text"
                        value={this.state.form.buy_price.value || ""}
                        onChange={e =>
                          this.handleValueChange("buy_price", e.target.value)
                        }
                        maxLength="16"
                      />
                    ) : (
                        <input disabled type="text" value={intl.get("exchange_form_market_order")} />
                      )
                  }

                  {
                    tab_current == 0 ? <span>{coin2_name}</span> : ''
                  }

                  {/* <input type="text" value="Market"/> */}
                  {/* <span>BTC</span> */}
                </div>
                <p style={{ height: "18px" }} className="price-rate">
                  {buyPriceRateString}
                </p>
              </div>
              <div className="form-control5">
                <label>{intl.get("exchange_form_sell_price")}</label>
                <div className="input-box">
                  {
                    tab_current == 0 ? (
                      <input
                        type="text"
                        value={this.state.form.sell_price.value || ""}
                        onChange={e =>
                          this.handleValueChange("sell_price", e.target.value)
                        }
                      />

                    ) : (
                        <input disabled type="text" value={intl.get("exchange_form_market_order")} />
                      )
                  }

                  {
                    tab_current == 0 ? <span>{coin2_name}</span> : ''
                  }

                  {/* <input type="text" value="Market"/> */}
                  {/* <span>BTC</span> */}
                </div>
                <p style={{ height: "18px" }} className="price-rate">
                  {sellPriceRateString}
                </p>
              </div>
            </div>
            <div className="form-row">
              <div className="form-control5">
                <label>{intl.get("exchange_form_volume")}</label>
                <div className="input-box">
                  <input
                    type="text"
                    value={this.state.form.buy_volume.value}
                    onChange={e =>
                      this.handleValueChange("buy_volume", e.target.value)
                    }
                  />
                  <span>{coin1_name}</span>
                </div>
                {/* <p>≈2.12 USD</p> */}
              </div>
              <div className="form-control5">
                <label>{intl.get("exchange_form_volume")}</label>
                <div className="input-box">
                  <input
                    type="text"
                    value={this.state.form.sell_volume.value}
                    onChange={e =>
                      this.handleValueChange("sell_volume", e.target.value)
                    }
                  />
                  <span>{coin1_name}</span>
                </div>
                {/* <p>≈2.12 USD</p> */}
              </div>
            </div>
            <div className="form-row">
              <div className="form-control5">
                <div className="range-box">
                  <Slider
                    marks={marks}
                    defaultValue={0}
                    tipFormatter={null}
                    value={this.state.buy_silder}
                    onChange={this.buyRangeOnChange}
                  />
                </div>
              </div>
              <div className="form-control5">
                <div className="range-box">
                  <Slider
                    marks={marks}
                    defaultValue={0}
                    tipFormatter={null}
                    value={this.state.sell_silder}
                    onChange={this.sellRangeOnChange}
                  />
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-control5">
                <div className="total-box">
                  <p className="total">{intl.get("exchange_form_totle")} <span className="num-limit"> {buy_total ? stringCutOut(buy_total, this.state.price_unit) : stringCutOut(0, this.state.price_unit)}</span> {coin2_name}</p>
                  {!!token ? (
                    <button className="buy-btn" disabled={!this.state.canSubmitBuy} onClick={() => this.submitOrder(1)}>{intl.get("assets_order_tab_buy")} {coin1_name}</button>
                  ) : (
                      <div className="btn-style">
                        <Link to={{ pathname: "/login", search: `${search}` }}>{intl.get("exchange_btn_login")}</Link> {intl.get("exchange_btn_or")} <Link to={{ pathname: "/register", search: `${search}` }}>{intl.get("exchange_btn_register")}</Link> {intl.get("exchange_btn_to_trade")}
                      </div>
                    )}
                </div>
              </div>
              <div className="form-control5">
                <div className="total-box">
                  <p className="total">{intl.get("exchange_form_totle")} <span className="num-limit"> {sell_total ? stringCutOut(sell_total, this.state.price_unit) : stringCutOut(0, this.state.price_unit)}</span> {coin2_name}</p>
                  {!!token ? (
                    <button className="sell-btn" disabled={!this.state.canSubmitSell} onClick={() => this.submitOrder(2)}>{intl.get("assets_order_tab_sell")} {coin1_name}</button>
                  ) : (
                      <div className="btn-style">
                        <Link to={{ pathname: "/login", search: `${search}` }}>{intl.get("exchange_btn_login")}</Link> {intl.get("exchange_btn_or")} <Link to={{ pathname: "/register", search: `${search}` }}>{intl.get("exchange_btn_register")}</Link> {intl.get("exchange_btn_to_trade")}
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        </MediaQuery>
        
        <MediaQuery maxWidth={676}>
          <div className="pay-bix-form">
            <div className="form-row">
              {
                currentTradeWay==="buy"?
                  <div className="form-control5" style={{ paddingTop: "15px" }}>
                    <div className="avbi">
                      {intl.get("exchange_form_avbl")}: {!!token ? cutOut(myasset.coin2, this.state.firstCoinVolUnit) : cutOut(0, this.state.firstCoinVolUnit)} {coin2_name}
                      {
                        !!token ? <Link to={{ pathname: "/assets/deposit", search: `${search}`, state: `${coin2_name}` }} className="deposit">{intl.get("exchange_form_deposit_bnt")}</Link> :
                          <Link to={{ pathname: "/login", search: `${search}`, state: `${coin2_name}` }} className="deposit">{intl.get("exchange_form_deposit_bnt")}</Link>
                      }

                    </div>
                  </div>:
                  <div className="form-control5" style={{ paddingTop: "15px" }}>
                    <div className="avbi">
                      {intl.get("exchange_form_avbl")}: {!!token ? cutOut(myasset.coin1, this.state.lastCoinVolUnit) : cutOut(0, this.state.lastCoinVolUnit)} {coin1_name}
                      {/* {
                        !!token ? <Link to={{ pathname: "/assets/deposit", search: `${search}`, state: `${coin1_name}` }} className="deposit">{intl.get("exchange_form_deposit_bnt")}</Link> :
                          <Link to={{ pathname: "/login", search: `${search}`, state: `${coin1_name}` }} className="deposit">{intl.get("exchange_form_deposit_bnt")}</Link>
                      } */}

                    </div>
                  </div>
              }
            
            </div>

            <div className="form-row">
              {
                currentTradeWay === "buy" ?
                  <div className="form-control5">
                    <label>{intl.get("exchange_form_buy_price")}</label>
                    <div className="input-box">
                      {
                        tab_current === 0 ? (
                          <input
                            type="text"
                            value={this.state.form.buy_price.value || ""}
                            onChange={e =>
                              this.handleValueChange("buy_price", e.target.value)
                            }
                            maxLength="16"
                          />
                        ) : (
                            <input disabled type="text" value={intl.get("exchange_form_market_order")} />
                          )
                      }

                      {
                        tab_current == 0 ? <span>{coin2_name}</span> : ''
                      }

                      {/* <input type="text" value="Market"/> */}
                      {/* <span>BTC</span> */}
                    </div>
                    <p style={{ height: "18px" }} className="price-rate">
                      {buyPriceRateString}
                    </p>
                  </div>:
                  <div className="form-control5">
                    <label>{intl.get("exchange_form_sell_price")}</label>
                    <div className="input-box">
                      {
                        tab_current == 0 ? (
                          <input
                            type="text"
                            value={this.state.form.sell_price.value || ""}
                            onChange={e =>
                              this.handleValueChange("sell_price", e.target.value)
                            }
                          />

                        ) : (
                            <input disabled type="text" value={intl.get("exchange_form_market_order")} />
                          )
                      }

                      {
                        tab_current == 0 ? <span>{coin2_name}</span> : ''
                      }

                      {/* <input type="text" value="Market"/> */}
                      {/* <span>BTC</span> */}
                    </div>
                    <p style={{ height: "18px" }} className="price-rate">
                      {sellPriceRateString}
                    </p>
                  </div>

              }
              
             
            </div>
            
            <div className="form-row">
              {
                currentTradeWay === "buy" ?
                  <div className="form-control5">
                    <label>{intl.get("exchange_form_volume")}</label>
                    <div className="input-box">
                      <input
                        type="text"
                        value={this.state.form.buy_volume.value}
                        onChange={e =>
                          this.handleValueChange("buy_volume", e.target.value)
                        }
                      />
                      <span>{coin1_name}</span>
                    </div>
                    {/* <p>≈2.12 USD</p> */}
                  </div>:
                  <div className="form-control5">
                    <label>{intl.get("exchange_form_volume")}</label>
                    <div className="input-box">
                      <input
                        type="text"
                        value={this.state.form.sell_volume.value}
                        onChange={e =>
                          this.handleValueChange("sell_volume", e.target.value)
                        }
                      />
                      <span>{coin1_name}</span>
                    </div>
                    {/* <p>≈2.12 USD</p> */}
                  </div>
              }
              
            
            </div>
            
            <div className="form-row">
              {
                currentTradeWay === "buy" ?
                  <div className="form-control5">
                    <div className="range-box">
                      <Slider
                        marks={marks}
                        defaultValue={0}
                        tipFormatter={null}
                        value={this.state.buy_silder}
                        onChange={this.buyRangeOnChange}
                      />
                    </div>
                  </div>:
                  <div className="form-control5">
                    <div className="range-box">
                      <Slider
                        marks={marks}
                        defaultValue={0}
                        tipFormatter={null}
                        value={this.state.sell_silder}
                        onChange={this.sellRangeOnChange}
                      />
                    </div>
                  </div>
              }
              
            </div>
            
            <div className="form-row">
              {
                currentTradeWay === "buy" ?
                  <div className="form-control5">
                    <div className="total-box">
                      <p className="total">{intl.get("exchange_form_totle")} <span className="num-limit"> {buy_total ? stringCutOut(buy_total, this.state.price_unit) : stringCutOut(0, this.state.price_unit)}</span> {coin2_name}</p>
                      {!!token ? (
                        <button className="buy-btn" disabled={!this.state.canSubmitBuy} onClick={() => this.submitOrder(1)}>{intl.get("assets_order_tab_buy")} {coin1_name}</button>
                      ) : (
                          <div className="btn-style">
                            <Link to={{ pathname: "/login", search: `${search}` }}>{intl.get("exchange_btn_login")}</Link> {intl.get("exchange_btn_or")} <Link to={{ pathname: "/register", search: `${search}` }}>{intl.get("exchange_btn_register")}</Link> {intl.get("exchange_btn_to_trade")}
                          </div>
                        )}
                    </div>
                  </div>:
                  <div className="form-control5">
                    <div className="total-box">
                      <p className="total">{intl.get("exchange_form_totle")} <span className="num-limit"> {sell_total ? stringCutOut(sell_total, this.state.price_unit) : stringCutOut(0, this.state.price_unit)}</span> {coin2_name}</p>
                      {!!token ? (
                        <button className="sell-btn" disabled={!this.state.canSubmitSell} onClick={() => this.submitOrder(2)}>{intl.get("assets_order_tab_sell")} {coin1_name}</button>
                      ) : (
                          <div className="btn-style">
                            <Link to={{ pathname: "/login", search: `${search}` }}>{intl.get("exchange_btn_login")}</Link> {intl.get("exchange_btn_or")} <Link to={{ pathname: "/register", search: `${search}` }}>{intl.get("exchange_btn_register")}</Link> {intl.get("exchange_btn_to_trade")}
                          </div>
                        )}
                    </div>
                  </div>
              }
              
            </div>
          </div>
        </MediaQuery>
        
        
        {/* 输入资金密码 */}
        {this.state.showInputFundPwd ? <InputFundPwd close={this.closeInputFundPwd} setFundPwd={this.setFundPwd}></InputFundPwd>:null}
        {/* 限价提示 */}
        {this.state.isConfirm ? <ConfirmAlert close={this.closeTipLimitAlert} confirm={this.confirmTipLimitAlert} desc={this.state.tipLimitDesc}></ConfirmAlert> : null}
      </section>
    );
  }
}

export default PayBix;