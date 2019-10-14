import React, {Component} from "react";
import "../../assets/scss/pc/register/tel_input.css";
import { connect } from "react-redux";
import { getPhoneCode } from "../../redux/user.redux.js";
import { debounce } from "../../utils/debounce.js";
import intl from "react-intl-universal";

@connect(state => ({...state.lang,...state.user}), { getPhoneCode })
class TELInput extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false,
            currentTel: "+86",
            country: '中国',
            currentPhone: "",
            codeList: [],
            codeSearchList: []
        }
        this.toggleList = this.toggleList.bind(this);
        this.hideList = this.hideList.bind(this);
        this.selectTel = this.selectTel.bind(this);
        this.telOnChange = this.telOnChange.bind(this);
        this.searchTel = this.searchTel.bind(this);

        let self = this;
        this.delaySearch = debounce(function (search) {  //搜索去抖
            self.searchTel(search);
        }, 500);
    }

    componentWillMount() {
       this.props.getPhoneCode();
       this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
        
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.phone_code && nextProps.phone_code.codes) {
            if(this.mounted) {
                this.setState({
                    codeList: nextProps.phone_code.codes,
                    codeSearchList: nextProps.phone_code.codes
                })
            }
        }
    }

    selectTel(item) {
        // console.log("item###",item);
        this.setState({
            currentTel: "+" + item.code,
            show: false
        })
        this.props.changePhoneCode("+" + item.code);
    }

    toggleList() {
        if(this.mounted) {
            this.setState({
                show: !this.state.show
            });
        } 
    }
    hideList() {
        if (this.mounted) {
            this.setState({
                show: false
            })
        }
    }

    telOnChange(e) {
        if (this.mounted) {
            this.setState({
                currentTel: e.target.value
            })
        }
        this.delaySearch(e.target.value);
        this.props.changePhoneCode(e.target.value);
    }

    searchTel(search) {
        let result = [];
        this.state.codeList.forEach((item) => {
            if(item.code.indexOf(search)>-1 || item.us_name.indexOf(search)>-1 || item.cn_name.indexOf(search)>-1) {
                result.push(item);
            }
        })
        if(this.mounted) {
            this.setState({
                codeSearchList: result
            })
        }
    }


    render() {
        let showStyle = {
            display: this.state.show?"block":'none'
        }
        
        let telLi = this.state.codeSearchList.map((item,index) => {
            return <li key={index} onClick={() => {this.selectTel(item)}}>
                {(this.props.default.index === 1 || this.props.default.index === 2) ? item.cn_name:item.us_name}<span>{item.code}</span>
            </li>
        })


        return(
            <div className="tel-intpu-box">
                <div className="tel-mask" onClick={this.hideList} style={showStyle}></div>
               {/* <button className="tel-select" onClick={this.toggleList}>{this.state.country}+{this.state.currentTel}<i className="iconfont icon-down"></i></button> */}
               <div className={this.state.show?"tel-select focus":"tel-select"} onClick={this.toggleList}>
                    <input autoComplete="off" type="text" value={this.state.currentTel} onChange={this.telOnChange}/>
                    <i className="iconfont icon-down"></i>
               </div>
               <input autoComplete="off" type="text" className="tel-input" placeholder={intl.get("login_please_enter_mobile_phone")} onChange={(e) => this.props.changePhone(e.target.value)}/>
                <div className="tel-list-box" style={showStyle}>
                    <ul className="tel-list" >
                        {telLi}
                    </ul>
               </div>
               
            </div>
        )
    }

}

export default TELInput;