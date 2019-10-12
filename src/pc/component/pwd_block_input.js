import React, { Component } from "react";
import "../../assets/scss/pc/component/pwd_block_input.css";

class pwdBlockInput extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentCursor: 0,
            currentPwdCircle: 0,
            pwdValue: '',
            pwdBlockMaskShow: false,
            pwdList: [
                {
                    id: 1
                },
                {
                    id: 2
                },
                {
                    id: 3
                },
                {
                    id: 4
                },
                {
                    id: 5
                },
                {
                    id: 6
                }
            ],
            passwordType: "text"
        }
    }
    componentWillMount() {
        this.mounted = true;
    }
    componentWillUnmount() {
        this.mounted = false;
    }

    inputPwdFocus() {
        this.textInput.focus();
        let pwdLen = this.state.pwdValue.length;
        //console.log("pwdLen####",pwdLen);
        if(this.mounted) {
            this.setState({
                currentCursor: pwdLen + 1,
                currentPwdCircle: pwdLen,
                pwdBlockMaskShow: true
            })
        }
    }

    inputPwdBlur(){
        this.textInput.blur();
        if(this.mounted) {
            this.setState({
                currentCursor: 0,
                pwdBlockMaskShow: false
            })
        }
    }

    handlePwdChange(e) {
        let value = e.target.value;
        let length = value.length;
        //console.log("value###value长度####",e.target.value,"####",e.target.value.length);
        if(this.mounted) {
            this.setState({
                currentCursor: length+1,
                pwdValue: value,
                currentPwdCircle: length,
                passwordType: 'password'
            })
        }

        this.props.change(value);

    }

    render() {
        let focusStyle = {
            border: "1px solid #2b93f6"
        }

        // 密码方式显示
        let pwdLi = this.state.pwdList.map((item,index) => {
            return <li key={index} style={this.state.currentCursor==item.id?focusStyle:{}}>
                {this.state.currentCursor == item.id ? <span /> : null}
                {item.id<=this.state.currentPwdCircle ? <i /> : null}
              </li>;
        })

        // 谷歌验证码明文显示
        let pwdLiGoogle = this.state.pwdList.map((item,index) => {
            return <li key={index} style={this.state.currentCursor==item.id?focusStyle:{}}>
                {this.state.currentCursor == item.id ? <span /> : null}
                {/* {item.id<=this.state.currentPwdCircle ? <i /> : null} */}
                {item.id<=this.state.currentPwdCircle ? this.state.pwdValue[index] : null}
              </li>;
        })

        return <div className="pwd-block-input-box">
            {/* {this.state.pwdBlockMaskShow?<div className="pwd-block-mask" onClick={() => this.inputPwdBlur()}></div>:null} */}
            <input type="password" ref={(input) => { this.textInput = input; }} className="pwd-block-input-hide"
                maxLength="6"
                onChange={(e) => this.handlePwdChange(e)} 
                type="text"
                onBlur={() => this.inputPwdBlur()} />
            <ul style={this.state.pwdBlockMaskShow?{zIndex:"2"}:{}} className="block-input-list-box" onClick={() => this.inputPwdFocus()}>
                {this.props.isgoogle ? pwdLiGoogle : pwdLi}
                {/* {pwdLi} */}
            </ul>
        </div>
    }
}

export default pwdBlockInput;