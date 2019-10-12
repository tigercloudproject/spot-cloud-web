import React, { Component } from "react";
import "../../assets/scss/pc/component/default_select.css";

class DefaultSelect extends Component {
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
        if (this.mounted) {
            this.setState({
                show: !this.state.show,
            })
        }
    }

    hideList(e) {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        if (this.mounted) {
            this.setState({
                show: false
            })
        }
    }

    selectItem(e, item) {
        this.hideList(e);
        if (this.mounted) {
            this.setState({
                currentName: this.props.name?item[this.props.name]:item
            })
        }
        this.props.select(item);
    }

    render() {
        let boxStyle = {
            width: this.props.width ? this.props.width : "auto",
            height: this.props.height ? this.props.height : "50px",
            lineHeight: this.props.height ? this.props.height: "50px"
        };
        let iconStyle = {
            //lineHeight: this.props.height ? this.props.height : "50px",
            //width: '20%'
            color: this.props.color?this.props.color:"#fff"
        };
        let conStyle = {
            //lineHeight: this.props.height ? this.props.height : "50px",
            color: this.props.color ? this.props.color : "#fff"
            //width: '80%'
        }
        let listStyle = {
            display: this.state.show ? "block" : "none",
            top: this.props.height ? this.props.height : "50px",
            background: this.props.background ? this.props.background : "#1a1e2b",
            border: this.props.listBorder ? `1px solid ${this.props.listBorder}`: "none",
            
        };


        let listLi = this.props.list.map((item, index) => {
            return <li key={index} onClick={e => this.selectItem(e, item)}>
                {this.props.name?item[this.props.name]:item}
              </li>;
        })

        let currentName;
        if (this.props.list.length > 0 && !this.state.currentName) {
            if(!this.props.defaultItem) {
                currentName = this.props.name ? this.props.list[0][this.props.name] : this.props.list[0];
            }else {
                currentName = this.props.defaultItem;
            }
            
        } else {
            currentName = this.state.currentName;
        }

        return (
            <div className="default-select" style={boxStyle}>
                {this.state.show ? <div className="bbx-mask" onClick={(e) => { this.hideList(e) }}></div> : ''}
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

export default DefaultSelect;