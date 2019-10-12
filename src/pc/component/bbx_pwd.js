import React, { Component } from "react";
import "../../assets/scss/pc/component/bbx_pwd.css";

class BbxPwd extends Component{
    constructor(props) {
        super(props);
        this.state = {
            password: "",
            test: "",
            show: true
        }
    }

    handleChange(e) {
        // console.log("currentTarget######", e.currentTarget.value);
        // console.log("Target######", e.target.value);
        let result = "";
        let value = e.target.value;
        for(let i=0;i<value.length;i++) {
            result = result + "●";
        }
        this.setState({
            test: result,
            password: value,
            pwdtype: "text"
        })
    }

    handleChangeTest(e) {
        this.setState({
            password: e.target.value
        })
    }

    passwordFocus() {
        this.setState({
            pwdtype: "password"
        })
    }

    passwordOnblur() {
        
        this.setState({
            password: "",
            pwdtype: "type",
            show: false,
        })
    }

    render() {
        // let inputStyle = {
        //     color: "#fff",
        //     caretColor: "red"
        // }
        return <div className="bbx-pwd">
            {/* <input type="text" className="pwd-hide" value={this.state.password || ""} onChange={e => this.handleChange(e)} />
            <input type="text" className="pwd-show" 
                value={this.state.test}
                onChange={e=>this.handleChangeTest(e)}
            /> */}
            <input type={this.state.pwdtype} 
                onChange={(e) => this.handleChangeTest(e)}
                onFocus={()=>this.passwordFocus()}
                onBlur={()=>this.passwordOnblur()} 
                value={this.state.password || ""}
                ref="test"/>
          </div>;
    }
}

export default BbxPwd;