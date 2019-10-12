import React, { Component } from "react";
import "../../assets/scss/pc/component/bbx_select.css";

class BBXSelect extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false,
            currentName: '',
        }
        this.toggletList = this.toggletList.bind(this);
    }

    componentWillMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    toggletList() {
        if(this.mounted) {
            this.setState({
                show: !this.state.show,
            })
        }
    }

    hideList(e) {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        if(this.mounted) {
            this.setState({
                show: false
            })
        }
    }

    selectItem(e,item) {
        this.hideList(e);
        if(this.mounted) {
            this.setState({
                currentName: this.props.name?item[this.props.name]:item
            })
        }
        this.props.select(item);
    }

    render() {
        let boxStyle = {
            width: this.props.width ? this.props.width : "240px",
            height: this.props.height ? this.props.height : "50px"
        };
        let iconStyle = {
            lineHeight: this.props.height ? this.props.height : "50px",
            width: '20%'
        };
        let conStyle = {
            lineHeight: this.props.height ? this.props.height : "50px",
            width: '80%'
        }
        let listStyle = {
            display: this.state.show ? "block" : "none",
            top: this.props.height ? this.props.height : "50px",
        };


        let listLi = this.props.list.map((item,index) => {
            return <li key={index} onClick={e => this.selectItem(e, item)}>
                {this.props.name?item[this.props.name]:item}
              </li>;
        })

        // let currentName;
        // if(this.props.list.length>0 && !this.state.currentName) {
        //     currentName = this.props.list[0][this.props.name];
        // }else {
        //     currentName = this.state.currentName;
        // }

        let currentName;
        //无值也无默认值时显示列表第一条
        if (!this.state.currentName && this.props.list.length > 0 && !this.props.defaultCoin) {
          currentName = this.props.name ? this.props.list[0][this.props.name] : this.props.list[0];
        }
        //无值时有默认值则显示默认值
        if (!this.state.currentName && this.props.defaultCoin) {
            currentName = this.props.defaultCoin;
        }
        //有当前值，显示当前值
        if (this.state.currentName) {
            currentName = this.state.currentName;
        }
        
        return (
            <div className={this.state.show ? "bbx-select focus" : "bbx-select"} style={boxStyle}>
                {this.state.show?<div className="bbx-mask" onClick={(e) => {this.hideList(e)}}></div>:''}
                <div className="bbx-select-con" onClick={this.toggletList}>
                    <span className="con" style={conStyle}>{currentName}</span>
                    <span className="icon" style={iconStyle}><i className="iconfont icon-down"></i></span>
                </div>
                <ul className="bbx-select-list" style={listStyle}>
                    {listLi}
                </ul>
            </div>
        )
    }
}

export default BBXSelect;;

