import React, { Component } from "react";
import { connect } from "react-redux";
import "../../assets/scss/pc/exchange/exchange_notice.css";
import intl from "react-intl-universal";
import { parseTimeTos } from "../../utils/parseTime.js";

@connect(
    state => ({ ...state.lang })
)
class ExchangeNotice extends Component {
    constructor(props) {
        super(props);
        this.state = {
            articles: [], //文章列表
        }
    }

    componentWillMount() {
        this.mounted = true;
        // console.log("this.props.default.index####", this.props.default.index);
        if(this.props.default && this.props.default.index) {
            this.setArticles(this.props.default.index);
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentWillReceiveProps(nextProps) {
        if(this.props.default!== nextProps.default) {
            this.setArticles(nextProps.default.index);
        }
    }

    setArticles(index) {
        const Http = new XMLHttpRequest();
        let url;
        // if (index === 1 || index === 2) {
        //     url = "https://bbx.zendesk.com/api/v2/help_center/zh-cn/articles.json";
        // } else {
        //     url = "https://bbx.zendesk.com/api/v2/help_center/en-us/articles.json";
        // }
         if (index === 1 || index === 2) {
             // url = "https://bbx.zendesk.com/api/v2/help_center/zh-cn/articles.json";
             url = "https://bbx.zendesk.com/api/v2/help_center/zh-cn/categories/360000051514/articles.json";
         } else {
             // url = "https://bbx.zendesk.com/api/v2/help_center/en-us/articles.json";
             url = "https://bbx.zendesk.com/api/v2/help_center/en-us/categories/360000051514/articles.json";
         }
        Http.open("GET", url);
        Http.send();

        let self = this;
        let data;
        Http.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                data = JSON.parse(Http.responseText);
                if (self.mounted && data && data.articles) {
                  self.setState({
                    articles: data.articles
                  });
                }
            }
        }
    }
    

    render() {
        let list=[], ListLi;
        if(this.state.articles.length>0) {
            list = this.state.articles.slice(0,4);
        }
        ListLi = list.map((item, index) => {
            return <li key={index}>
                <a href={item.html_url}>{item.name}</a>
                <p>{parseTimeTos(item.created_at)}</p>
              </li>;
        })

        return <div className="exchange-notice">
            <h3>{intl.get("ANNOUNCEMENT")} <a href="https://support.bbx.com/hc/zh-cn/categories/360000051514" target="_blank">{intl.get("assets_order_tab_the_more")}<i className="iconfont icon-iconmore-copy"></i></a></h3>
            <ul>
                {ListLi}
                {/* <li>
                    <a>关于BBX社区志愿者招募的公告</a>
                    <p>2018-03-06 14:31:17</p>
                </li>
                <li>
                    <a>BBX网页版币币交易功能上线</a>
                    <p>2018-03-06 14:31:17</p>
                </li>
                <li>
                    <a>BBX邀请返佣规则说明</a>
                    <p>2018-03-06 14:31:17</p>
                </li>
                <li>
                    <a>BBX积分介绍</a>
                    <p>2018-03-06 14:31:17</p>
                </li> */}
            </ul>
        </div>
    }
}

export default ExchangeNotice;