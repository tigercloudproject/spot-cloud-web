import React, { Component } from "react";
import "../../assets/scss/pc/register/register.css";
// import PCHeader from "../home/pc_header";
// import PCFooter from "../home/pc_footer";
import TELInput from "./tel_input";
import { notification } from "antd";
import {debounce} from "../../utils/debounce.js";

import MD5 from "../../utils/md5.js";
import { Redirect, Link, NavLink, withRouter } from "react-router-dom";
import {connect} from "react-redux";
import {loginPost,getCaptchCheck} from "../../redux/user.redux";
import {getPropetyInfo} from "../../redux/assets.redux";
import {getUserConfig} from "../../redux/global.redux";
import intl from "react-intl-universal";
import nextIcon from "../../assets/images/icon-next2.png";
import { getQueryString } from "../../utils/getQueryString.js";
import { getCookie } from "../../utils/cookie.js";
import BbxPwd from "../component/bbx_pwd.js";
import MediaQuery from "react-responsive";



@withRouter
@connect(state=> ({ ...state.lang, ...state.user }),{
  loginPost,
  getPropetyInfo,
  getUserConfig,
  getCaptchCheck})
class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tabList: [
        {
          name: intl.get("login_type_phone"),
          id: 'phone'
        },
        {
          name: intl.get("login_type_email"),
          id: 'email'
        }
      ],
      currentTab: 0,
      form : {
        email: {
          valid: false,
          value: '',
          error: ''
        },
        phone: {
          valid: false,
          value: '',
          error: ''
        },
        phone_code: {
          valid: true,
          value: '+86',
          error: ''
        },
        pwd: {
          valid: false,
          value: '',
          error: ''
        },
        agree: {
          valid: true,
          value: '',
          error: ''
        }
      },
      canSubmit: true,
      passwordType: 'text',
      inSubmission: false,
      //outsidePath: "",  //地址中带的path
      qd: localStorage.getItem("qd"), //渠道
      token: "",
      path: "",
      need_captcha: 2,
      captcha_validate: ""
    }

    this.loginSubmit = this.loginSubmit.bind(this);
    this.removeReadOnly = this.removeReadOnly.bind(this);
    this.setReadOnly = this.setReadOnly.bind(this);

    let self = this;
    this.toLogin = debounce(function (data) {
      // let path = getQueryString(this.props.location.search, "path");
      let path = this.getPath();
      this.props.loginPost(data,path).then(async () => {

        if (this.props.user_error) {
          notification.error({
            message: intl.get("error_message_title"),
            description: this.props.user_error.message
          })
          this.captchaCheck();
        }else {
            this.props.getPropetyInfo();
            await this.props.getUserConfig();
            if(path) {
              window.location.href = unescape(this.props.login_success);
            }else {
              this.props.history.push(this.props.login_success);
            }
        }

        //解锁提交按钮
        if (this.mounted) {
          this.setState({
            canSubmit: true,
            inSubmission: false
          });
        }
      }).catch((err) => {
        this.captchaCheck;
      })

    }, 500);
  }

  componentWillMount() {
    this.mounted = true;
    let token = getCookie("token");
    if(!token) {
      localStorage.removeItem("user");
    }
    if(this.mounted) {
      this.setState({
        token: token
      })
    }

    this.captchaCheck();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidMount() {
    let path = this.getPath();
    if(this.mounted) {
      this.setState({
        path: path
      })
    }

    this.initCaptcha();
  }

  //获取登录成功后要跳转的地址
  getPath() {
    let url = this.props.location.search;
    let arr = [];
    if(url.indexOf('path') > 0) {
      arr = url.split('path=');
    }
    if(arr[1]) {
      return arr[1];
    }
    return "";
  }

  captchaCheck() {
    //判断是否需要图片验证码
    this.props.getCaptchCheck("login").then((res) => {
      if (res && res.data && res.data.errno === "OK" && res.data.data) {
        if (this.mounted) {
          this.setState({
            need_captcha: res.data.data.need ? 1 : 0  //1为需要输入行为验证码，0为不需要
          })
        }

        if(res.data.data.need) {
          this.initCaptcha();
        }

      } else {
        // if(res && res.data) {
        //   notification.error({
        //     message: intl.get("error_message_title"),
        //     description: res.data.message
        //   });
        // }
        if (this.mounted) {
          this.setState({
            need_captcha: 2
          })
        }
      }
    });
  }

  initCaptcha() {
    //图片验证码
    let self = this;
    // let lang = this.props.default && this.props.default.code ? this.props.default.code : "en";
    let lang = localStorage.getItem("lang") || this.props.default.code;
    if (lang.indexOf("ko") > -1) {
      lang = "ko";
    } else if (lang.indexOf("en") > -1) {
      lang = "en";
    } else if (lang === "zh-tw") {
      lang = "zh-TW";
    } else if (lang === "zh-cn") {
      lang = "zh-CN";
    }


    if (window.initNECaptcha) {
      window.initNECaptcha({
        captchaId: 'be46dd93dace4902946503549eeda729',
        element: '#captcha',
        mode: 'float',
        lang: lang,
        onVerify: function (err, data) {
          // 用户验证码验证成功后，进行实际的提交行为
          // todo
          // console.log("onVerify###",data);
          if (data && self.mounted) {
            self.setState({
              captcha_validate: data.validate
            })
          }
          // console.log("err###",err);
        }
      }, function onload(instance) {
        // 初始化成功后，用户输入对应用户名和密码，以及完成验证后，直接点击登录按钮即可
        // console.log("instance#####", instance);
      }, function onerror(err) {
        // 验证码初始化失败处理逻辑，例如：提示用户点击按钮重新初始化
        //console.log("err####",err);
      })
    }
  }

  switchTab(index) {
    if (this.mounted) {
      this.setState({
        currentTab: index,
        form: {
          ...this.state.form,
          pwd: {
            ...this.state.form.pwd,
            value: "",
            error: ""
          }
        },
        passwordType: "text"
      });
    }
  }

  changePhoneCode(code) {
      this.handleValueChange('phone_code',code);
  }

  changePhone(phone) {
      this.handleValueChange('phone', phone);
  }

    //监听表单项变化
  handleValueChange(field, value) {
    const { form } = this.state;
    const newFieldObj = {value, valid: true, error: ''};

    switch ( field ) {
        case 'email': {
            let emailReg = /^([a-zA-Z0-9._-])+@([a-zA-Z0-9._-])+(.[a-zA-Z0-9_-])+/;
            if (!emailReg.test(value)) {
                newFieldObj.error = intl.get("login_email_format_error");
                newFieldObj.valid = false;
            } else if (value.length === 0) {
                newFieldObj.error = intl.get("login_please_enter_email");
                newFieldObj.valid = false;
            }
            break;
        }
        case 'phone': {
            if(value.length===0) {
                newFieldObj.error = intl.get("login_please_enter_mobile_phone");
                newFieldObj.valid = false;
            }
            break;
        }
        case 'phone_code': {
            if (value.length === 0) {
                newFieldObj.error = intl.get("login_please_enter_then_international_code");
                newFieldObj.valid = false;
            }
            break;
        }
        case 'pwd': {
            //let pwdReg = /^([a-zA-Z0-9]){8,20}/;
            // if (!pwdReg.test(value)) {
            //     newFieldObj.error = "密码格式错误!";
            //     newFieldObj.valid = false;
            // }else
            if(value.length===0) {
                newFieldObj.error = intl.get("login_pwd_placeholder");
                newFieldObj.valid = false;
            }
            // if(this.mounted) {
            //   this.setState({ passwordType: 'password' });
            // }
            break;
        }
        case 'agree':
            if(!value) {
                newFieldObj.valid = false;
            }
            break;
        default:
    }

    if(this.mounted) {
        this.setState({
            form: {
                ...form,
                [field]: newFieldObj
            }
        })
    }
  }

  loginSubmit() {
    let data = {};
    let form = this.state.form;

    if (this.state.currentTab === 0) {
      data["phone"] = form.phone_code.value + " " + form.phone.value;
      data["account_type"] = 2;
    }
    if (this.state.currentTab === 1) {
      data["email"] = form.email.value;
      data["account_type"] = 1;
    }

    let timestamp = new Date().valueOf();
    let random = timestamp + "000";

    let password_md5 = new MD5(form.pwd.value);
    let password = new MD5(password_md5.hash()+random);
    data["password"] = password.hash();
    data["nonce"] = parseInt(random);

    //图片验证码
    if(this.state.need_captcha===1) {
      data["validate"] = this.state.captcha_validate;
    }


    //点击提交按钮后暂时锁住按钮

    if(this.mounted) {
      this.setState({
        canSubmit: false,
        form: {
          ...this.state.form,
          pwd: {
            ...this.state.form.pwd,
            valid: false,
            value: ''
          }
        },
        passwordType: "text",
        inSubmission: true
      })
    }
    //return;
    this.toLogin(data);
  }

  removeReadOnly() {
    //this.refs.mima.removeAttribute("readonly");
    if (this.mounted) {
      this.setState({ passwordType: 'password' });
    }
  }
  setReadOnly() {
    this.refs.mima.setAttribute("readonly",true);
  }

  back() {
    history.go(-1); //后退1页
  }

  render() {
    let TabTop = {
        paddingTop: "36px",
        paddingBottom: "36px"
    }
    let PaddingTop30 = {
        paddingTop: "20px"
    }
    let state = this.state;
    const { form: { email, phone, phone_code, pwd, agree } } = this.state;
    let tabList = this.state.tabList.map((item, index) => {
      return <a key={index} className={state.currentTab === index ? 'active' : ''} onClick={() => this.switchTab(index)}>
        {item.name}
      </a>
    })

    const currentTab = this.state.currentTab;
    const canSubmit = this.state.canSubmit;
    //console.log("this.state.need_captcha###", this.state.need_captcha);
    const valid = !canSubmit || (currentTab === 1 && !email.valid) || (currentTab === 0 && !phone.valid) || (currentTab === 0 && !phone_code.valid) || !pwd.valid || !agree.valid || (this.state.need_captcha===1 && !this.state.captcha_validate);


    let search = '';
    if (this.props.default && this.props.default.value) {
      search = `?lang=${this.props.default.value}`;
    }
    if (this.state.qd !== "null" && this.state.qd !== "undefined" && this.state.qd != null) {
      search = search ? search + `&qd=${this.state.qd}` : `?qd=${this.state.qd}`;
    }

    if(this.state.path) {
      search = search ? search + `&path=${this.state.path}` : `?path=${this.state.path}`;
    }

    // console.log("user###this.props.user#####",this.props.user);

    return (
      <div className="bbx-container">
        {this.state.token ? <Redirect to="/" /> : null}
        <MediaQuery minWidth={700}>
          <div className="login-box">

            <input type="text" name="username" style={{"display":"none"}} />
            <input type="password" style={{width: "0px",height: "0px", visibility: "hidden",position:"absolute",left:"0px",top:"0px"}} />
            <input type="password" name="password" style={{"display":"none"}} />

            <div className="login">
              <p className="left-bottom-desc">{intl.get("BANNERTITLE")}</p>
              <div style={{height:"50px",width:"100%"}}></div>
              <h3 className="login-tit">{intl.get("login_title")}</h3>
              <div className="login-tab" style={TabTop}>
                {tabList}
              </div>
              <div className="login-form">
                <div className="form-control">
                  {state.currentTab === 1 ? (
                    <input type="text" autoComplete="off" placeholder={intl.get("login_please_enter_email")} onChange={(e) => this.handleValueChange('email', e.target.value)} />
                  ) : (
                      <TELInput changePhoneCode={this.changePhoneCode.bind(this)} changePhone={this.changePhone.bind(this)}></TELInput>
                    )}
                </div>
                <p className="error">
                  {this.state.currentTab === 1 && !email.valid && <span>{email.error}</span>}
                  {this.state.currentTab === 0 && !phone.valid && <span>{phone.error}</span>}
                  {this.state.currentTab === 0 && !phone_code.valid && <span>{phone_code.error}</span>}
                </p>
                <div className="form-control" style={PaddingTop30}>
                  <input type={this.state.passwordType} name="password" autoComplete="new-password"
                    placeholder={intl.get("login_pwd_placeholder")}
                    value={this.state.form.pwd.value || ""}
                    onChange={(e) => this.handleValueChange('pwd', e.target.value)}
                    onFocus={this.removeReadOnly}
                    ref="mima"
                  />
                </div>
                <p className="error">{!pwd.valid && <span>{pwd.error}</span>}</p>

                <div className="captcha-box" style={{display: this.state.need_captcha===1?"block":"none"}}>
                  <div id="captcha"></div>
                </div>


                {
                  !this.state.inSubmission?<button className="submit" style={{marginTop:"20px"}} disabled={valid} onClick={this.loginSubmit}>{intl.get("login_btn")}</button>:
                    <button className="ms-submission submit" style={{marginTop:"20px"}} disabled="disabled">{intl.get("in_the_login_btn")}<span>...</span></button>
                }

                <p className="login-goto-prompt clearfix">
                  <Link to={{pathname:"/retrieval",search:`${search}`}} className="forget">{intl.get("login_forgot_password")}?</Link>
                  <span>{intl.get("login_no_account")}? <Link to={{pathname:"/register",search:`${search}`}}>{intl.get("login_to_register")}</Link> <img src={nextIcon} /></span>
                </p>
              </div>
            </div>
          </div>

        </MediaQuery>

        <MediaQuery maxWidth={700}>
              <div className="login-h5-box">
                  <div className="login-h5">
                    <div className="login-h5-header">
                        <i className="iconfont icon-left" onClick={() => this.back()}></i>
                        {state.currentTab===0?<span onClick={()=>this.switchTab(1)}>{intl.get("login_type_email")}</span>:null}
                        {state.currentTab===1?<span onClick={()=>this.switchTab(0)}>{intl.get("login_type_phone")}</span>:null}
                    </div>
                    <div className="login-h5-body">
                        <h3 className="title">{intl.get("login_title")}</h3>
                        <div className="form-block-h5">
                          <label>
                            {
                              state.currentTab === 1? intl.get("login_type_email"): intl.get("login_type_phone")
                            }
                          </label>
                          <div className="form-control-h5">
                              {state.currentTab === 1 ? (
                                <input type="text" autoComplete="off" placeholder={intl.get("login_please_enter_email")} onChange={(e) => this.handleValueChange('email', e.target.value)} />
                              ) : (
                                  <TELInput changePhoneCode={this.changePhoneCode.bind(this)} changePhone={this.changePhone.bind(this)}></TELInput>
                                )}
                          </div>
                          <p className="error"></p>
                        </div>
                        <div className="form-block-h5">
                          <label>{intl.get("login_pwd")}</label>
                          <div className="form-control-h5">
                            <input type={this.state.passwordType} name="password" autoComplete="new-password"
                              placeholder={intl.get("login_pwd_placeholder")}
                              value={this.state.form.pwd.value || ""}
                              onChange={(e) => this.handleValueChange('pwd', e.target.value)}
                              onFocus={this.removeReadOnly}
                              ref="mima"
                            />
                          </div>
                          <p className="error"></p>
                        </div>
                        <div className="captcha-box" style={{ display: this.state.need_captcha === 1 ? "block" : "none" }}>
                          <div id="captcha"></div>
                        </div>

                        {/* <button className="submit">{intl.get("LOGIN")}</button> */}
                        {
                          !this.state.inSubmission ? <button className="submit" style={{ marginTop: "20px" }} disabled={valid} onClick={this.loginSubmit}>{intl.get("login_btn")}</button> :
                            <button className="ms-submission submit" style={{ marginTop: "20px" }} disabled="disabled">{intl.get("in_the_login_btn")}<span>...</span></button>
                        }
                        <div className="forget-pwd">
                          <Link to={{pathname:"/retrieval",search:`${search}`}}>{intl.get("login_forgot_password")}?</Link>
                        </div>
                    </div>

                    <div className="login-h5-bottom">
                        <hr />
                        <div>
                          {intl.get("login_no_account")}？<Link to={{pathname:"/register",search:`${search}`}}>{intl.get("login_to_register")}</Link>
                        </div>
                        <hr />
                    </div>
                  </div>
              </div>
        </MediaQuery>

      </div>
    );
  }
}

export default Login;
