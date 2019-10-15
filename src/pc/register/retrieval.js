import React, { Component } from 'react';
import "../../assets/scss/pc/register/register.css";
// import PCHeader from '../home/pc_header';
// import PCFooter from '../home/pc_footer';
import TELInput from "./tel_input";
import TelCode from "./tel_code";
import { notification } from "antd";
import { debounce } from "../../utils/debounce.js";

import {connect} from "react-redux";
import { getVerifyCode, retrievalPost, getCaptchCheck } from "../../redux/user.redux.js";
import MD5 from "../../utils/md5.js";
import { Redirect, Link, withRouter } from "react-router-dom";
import intl from "react-intl-universal";

import { getCookie } from "../../utils/cookie.js";
import { getPropetyInfo } from "../../redux/assets.redux";
import { getUserConfig } from "../../redux/global.redux";
import { getQueryString } from "../../utils/getQueryString.js";

import MediaQuery from "react-responsive";


@withRouter
@connect(state => state.user,{
    getVerifyCode,
    retrievalPost,
    getPropetyInfo,
    getUserConfig,
    getCaptchCheck,
})
class Retrieval extends Component {
    constructor(props) {
        super(props);
        this.state = {
            code: intl.get("register_get_verify_code"),
            timmer: null,
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
            form: {
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
                verify_code: {
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
                qr_pwd: {
                    valid: false,
                    value: '',
                    error: ''
                },
                invite_code: {
                    valid: true,
                    value: '',
                    error: ''
                },
                agree: {
                    valid: true,
                    value: '',
                    error: ''
                }
            },
            canGetCode: true,
            canSubmit: true, //提交按钮是否可用
            pwdType: 'text',
            qr_pwdType: 'text',
            token: "",
            need_captcha: 2
        }
        this.getCode = this.getCode.bind(this);
        this.switchTab = this.switchTab.bind(this);
        this.handleValueChange = this.handleValueChange.bind(this);
        this.retrievalSubmit = this.retrievalSubmit.bind(this);
        this.captchaCheck = this.captchaCheck.bind(this);

        let self = this;
        this.toRetrieval = debounce(function (data) {
            let path = getQueryString(this.props.location.search, "path");
            self.props.retrievalPost(data).then(async () => {

                //解锁提交按钮
                if(this.mounted) {
                    this.setState({
                        canSubmit: true
                    })
                }
                if (this.props.user_error) {
                    notification.error({
                        message: intl.get("error_message_title"),
                        description: this.props.user_error.message
                    })
                }else {
                    this.props.getPropetyInfo();
                    await this.props.getUserConfig();
                    if (path) {
                        window.location.href = this.props.retrieval_success;
                    } else {
                        this.props.history.push(this.props.retrieval_success);
                    }
                }
            });
        }, 500);
    }
    componentWillMount() {
        this.mounted = true;
        let token = getCookie("token");
        if (!token) {
            localStorage.removeItem("user");
        }
        if (this.mounted) {
            this.setState({
                token: token
            })
        }
    }
    componentWillUnmount() {
        this.mounted = false;
    }

    componentDidMount() {
        this.initCaptcha();
    }

    getCode(validate) {
        //发出获取邀请码请求
        if (this.state.currentTab === 0) {
            let phone = this.state.form.phone_code.value + " " + this.state.form.phone.value;
            this.props.getVerifyCode(phone, 0, "ResetPasswordVerifyCode", validate).then((res) => {
                if(res.data.errno==='OK') {
                    this.countDown();
                }else {
                    notification.error({
                        message: intl.get("error_message_title"),
                        description: res.data.message
                    })
                }
            })
        } else {
            this.props.getVerifyCode(this.state.form.email.value, 1, "ResetPasswordVerifyCode",validate).then((res) => {
                if(res.data.errno==='OK') {
                    this.countDown();
                }else {
                    notification.error({
                        message: intl.get("error_message_title"),
                        description: res.data.message
                    })
                }
            })
        }
    }

    //初始化图片验证码
    initCaptcha() {
        //图片验证码
        let self = this;
        let lang = this.props.default && this.props.default.code ? this.props.default.code : "en";
        if (lang.indexOf("ko") > -1) {
            lang = "ko";
        } else if (lang.indexOf("en") > -1) {
            lang = "en";
        }
        window.initNECaptcha({
            element: '#captcha',
            captchaId: 'be46dd93dace4902946503549eeda729',
            mode: 'popup', // 仅智能无感知验证码时，mode 才能设置为 bind
            width: '320px',
            lang: lang,
            onVerify: function (err, data) {
                // 用户验证码验证成功后，进行实际的提交行为
                // todo
                if (data) {
                    //图片验证码成功则发起获取验证码
                    self.getCode(data.validate);
                }

            }
        }, function onload(instance) {
            // 初始化成功后，用户输入对应用户名和密码，以及完成验证后，直接点击登录按钮即可
            // console.log("instance#####", instance);
            self.captchaIns = instance;
        }, function onerror(err) {
            // 验证码初始化失败处理逻辑，例如：提示用户点击按钮重新初始化
            //console.log("err####",err);
        })
    }

    //图片验证码（获取验证码之前先通过图片验证码）
    captchaCheck() {
        //判断是否需要图片验证码
        this.props.getCaptchCheck("ResetPasswordVerifyCode").then((res) => {
            if (res.data.errno === "OK") {
               if(res.data.data && !res.data.data.need) {
                    this.getCode();
               }else {
                    this.initCaptcha();
                    this.captchaIns && this.captchaIns.popUp();
               }
            } else {
                notification.error({
                    message: intl.get("error_message_title"),
                    description: res.data.message
                })
            }
        });
        
    }

    countDown() { //倒计时

        this.state.code = 60;
        //禁用获取验证码按钮
        if (this.mounted) {
            this.setState({
                canGetCode: false
            })
        }
        this.state.timmer = setInterval(() => {
            if (this.mounted) {
                this.setState({
                    code: this.state.code - 1
                })
            }
            if (this.state.code == 0) {
                clearInterval(this.state.timmer);
                if (this.mounted) {
                    this.setState({
                        code: intl.get("register_get_verify_code"),
                        canGetCode: true
                    })
                }
            }
        }, 1000);
    }
    switchTab(index) {
        clearInterval(this.state.timmer);
        if (this.mounted) {
            this.setState({
                currentTab: index,
                code: intl.get("register_get_verify_code"),
                canGetCode: true,
                form: {
                    ...this.state.form,
                    verify_code: {
                        ...this.state.form.verify_code,
                        value: '',
                        error: ''
                    },
                    pwd: {
                        ...this.state.form.pwd,
                        value: '',
                        error: ''
                    },
                    qr_pwd: {
                        ...this.state.form.qr_pwd,
                        value: '',
                        error: ''
                    }
                }
            })
        }
    }

    changePhoneCode(code) {
        this.handleValueChange('phone_code', code);
    }

    changePhone(phone) {
        this.handleValueChange('phone', phone);
    }

    //监听表单项变化
    handleValueChange(field, value) {
        const { form } = this.state;
        const newFieldObj = { value, valid: true, error: '' };

        switch (field) {
            case 'email': {
                let emailReg = /^([a-zA-Z0-9._-])+@([a-zA-Z0-9._-])+(.[a-zA-Z0-9_-])+/;
                if (!emailReg.test(value)) {
                    newFieldObj.error = intl.get("login_email_format_error");
                    newFieldObj.valid = false;
                } else if (value.length === 0) {
                    newFieldObj.error = intl.get("register_user_placeholder");
                    newFieldObj.valid = false;
                }
                break;
            }
            case 'phone': {
                if (value.length === 0) {
                    newFieldObj.error = intl.get("login_please_enter_mobile_phone");
                    newFieldObj.valid = false;
                }
                break;
            }
            case 'verify_code': {
                //console.log('verify_code###',value);
                if (value.length === 0) {
                    newFieldObj.error = intl.get("register_verify_code_placeholder");
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
                let pwdReg = /^([a-zA-Z0-9]){8,20}/;
                if (!pwdReg.test(value)) {
                    newFieldObj.error = intl.get("register_pwd_error1");
                    newFieldObj.valid = false;
                } else if (value.length === 0) {
                    newFieldObj.error = intl.get("login_pwd_placeholder");
                    newFieldObj.valid = false;
                }
                if(this.mounted) {
                    this.setState({
                        pwdType: 'password'
                    })
                }
                break;
            }
            case 'qr_pwd': {
                if (value.length === 0) {
                    newFieldObj.error = intl.get("register_pwd2_error1");
                    newFieldObj.valid = false;
                } else if (value != form.pwd.value) {
                    newFieldObj.error = intl.get("register_pwd2_error2");
                    newFieldObj.valid = false;
                }
                if(this.mounted) {
                    this.setState({
                        qr_pwdType: 'password'
                    })
                }
                break;
            }
            case 'agree': {
                if (!value) {
                    newFieldObj.valid = false;
                }
            }
        }

        if (this.mounted) {
            this.setState({
                form: {
                    ...form,
                    [field]: newFieldObj
                }
            })
        }
    }

    retrievalSubmit() {
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

        data["inviter_id"] = form.invite_code.value;
        data["code"] = form.verify_code.value;

        //md5加密
        let password = new MD5(form.pwd.value);
        data["password"] = password.hash();

        //锁住提交按钮
        if(this.mounted) {
            this.setState({
                canSubmit: false,
                form: {
                    ...this.state.form,
                    pwd: {
                        ...this.state.form.pwd,
                        value: ''
                    },
                    qr_pwd: {
                        ...this.state.form.qr_pwd,
                        value: ''
                    }
                },
                pwdType:'text',
                qr_pwdType: 'text'
            })
        }
        
        this.toRetrieval(data);
    }

    back() {
        history.go(-1); //后退1页  
    }  

    render() {
        let state = this.state
        let tabList = this.state.tabList.map((item, index) => {
            return <a key={index} className={state.currentTab === index ? 'active' : ''} onClick={() => this.switchTab(index)}>
                {item.name}
            </a>
        })
        const { form: { email, phone, phone_code, pwd, qr_pwd, verify_code, invite_code, agree } } = this.state;
        const currentTab = this.state.currentTab;
        const canSubmit = this.state.canSubmit;
        const valid = !canSubmit || (currentTab === 1 && !email.valid) || (currentTab === 0 && !phone.valid) || (currentTab === 0 && !phone_code.valid) || !verify_code.valid || !pwd.valid || !qr_pwd.valid || !agree.valid;


        const canGetCode = this.state.canGetCode;
        const codeValid = (currentTab===1 && !email.valid) || (currentTab===0 && !phone.valid) || (currentTab===0 && !phone_code.valid) || !canGetCode;
        
        return <div className="bbx-container">

            {this.props.retrieval_success ? <Redirect to={this.props.retrieval_success} /> : null}
            <MediaQuery minWidth={700}>
                <div className="login-box">
                    <div className="login">
                        <p className="left-bottom-desc">{intl.get("BANNERTITLE")}</p>
                        <h3 className="login-tit">{intl.get("retieve_password_title")}</h3>
                        <p className="retrieval-tips" style={{marginTop: "10px"}}>【{intl.get("retieve_password_tips")}】</p>
                        <div className="login-tab" style={{marginTop: "20px"}}>
                            {/* <a>手机号</a>
                                <a className="active">邮箱</a> */}
                            {tabList}
                        </div>
                        <div className="login-form retrieval-form">
                            <div className="form-control">
                                {state.currentTab === 1 ? (
                                    <input type="text" placeholder={intl.get("login_please_enter_email")} onChange={(e) => this.handleValueChange('email', e.target.value)} />
                                ) : (
                                        <TELInput changePhoneCode={this.changePhoneCode.bind(this)} changePhone={this.changePhone.bind(this)}></TELInput>
                                    )}
                            </div>
                            <p className="error">
                                {this.state.currentTab === 1 && !email.valid && <span>{email.error}</span>}
                                {this.state.currentTab === 0 && !phone.valid && <span>{phone.error}</span>}
                                {this.state.currentTab === 0 && !phone_code.valid && <span>{phone_code.error}</span>}
                            </p>
                            {/* <div className="form-control">
                                    
                                </div> */}
                            <div className="form-control">
                                <input type="text" placeholder={intl.get("register_verify_code_placeholder")} value={this.state.form.verify_code.value || ""} onChange={(e) => this.handleValueChange('verify_code', e.target.value)} />
                                <button className="get-code" onClick={this.captchaCheck} disabled={codeValid}>
                                    {this.state.code}
                                </button>
                            </div>
                            <p className="error">{!verify_code.valid && <span>{verify_code.error}</span>}</p>
                            <div className="form-control">
                                <input autoComplete="new-password" type={this.state.pwdType} placeholder={intl.get("register_pwd_placeholder")} value={this.state.form.pwd.value || ""} onChange={(e) => this.handleValueChange('pwd', e.target.value)} />
                            </div>
                            <p className="error">{!pwd.valid && <span>{pwd.error}</span>}</p>
                            <div className="form-control">
                                <input autoComplete="new-password" type={this.state.qr_pwdType} placeholder={intl.get("register_pwd2_error1")} value={this.state.form.qr_pwd.value || ""} onChange={(e) => this.handleValueChange('qr_pwd', e.target.value)} />
                            </div>
                            <p className="error">{!qr_pwd.valid && <span>{qr_pwd.error}</span>}</p>
                            <div id="captcha"></div>
                            <p className="agree">
                                {/* <input type="checkbox" defaultChecked="true" onChange={(e) => this.handleValueChange('agree', e.target.checked)} /> {intl.get("register_agreement")} <span> */}
                                <span className="agree-input">
                                    <input type="checkbox" id="hide" defaultChecked="true" onChange={e => this.handleValueChange("agree", e.target.checked)} />
                                    <label htmlFor="hide"></label>
                                </span>
                                {/* <Link to="/terms">{intl.get("register_agreement_txt1")}</Link> 
                                <Link to="/risk">{intl.get("register_agreement_txt2")}</Link> */}
                            {/* </span> */}
                            </p>
                            <button className="submit" onClick={this.retrievalSubmit} disabled={valid}>{intl.get("retieve_password_btn")}</button>
                        </div>
                    </div>
                </div>
            </MediaQuery>

            <MediaQuery maxWidth={700}>
                <div className="login-h5-box">
                    <div className="login-h5">
                        <div className="login-h5-header">
                            <i className="iconfont icon-left" onClick={() => this.back()}></i>
                            {state.currentTab === 0 ? <span onClick={() => this.switchTab(1)}>{intl.get("login_type_email")}</span> : null}
                            {state.currentTab === 1 ? <span onClick={() => this.switchTab(0)}>{intl.get("login_type_phone")}</span> : null}
                        </div>
                        <div className="login-h5-body">
                            <h3 className="title">{intl.get("retieve_password_title")}</h3>
                            <div className="form-block-h5">
                                <label>
                                    {
                                        state.currentTab === 1 ? intl.get("login_type_email") : intl.get("login_type_phone")
                                    }
                                </label>
                                <div className="form-control-h5">
                                    {state.currentTab === 1 ? (
                                        <input type="text" placeholder={intl.get("login_please_enter_email")} onChange={(e) => this.handleValueChange('email', e.target.value)} />
                                    ) : (
                                            <TELInput changePhoneCode={this.changePhoneCode.bind(this)} changePhone={this.changePhone.bind(this)}></TELInput>
                                        )}
                                </div>
                                <p className="error">
                                    {this.state.currentTab === 1 && !email.valid && <span>{email.error}</span>}
                                    {this.state.currentTab === 0 && !phone.valid && <span>{phone.error}</span>}
                                    {this.state.currentTab === 0 && !phone_code.valid && <span>{phone_code.error}</span>}
                                </p>
                            </div>
                            <div className="form-block-h5">
                                <label>{intl.get("register_code")}</label>
                                <div className="form-control-h5">
                                    <input type="text" placeholder={intl.get("register_verify_code_placeholder")} value={this.state.form.verify_code.value || ""} onChange={(e) => this.handleValueChange('verify_code', e.target.value)} />
                                    <button className="get-code" onClick={this.captchaCheck} disabled={codeValid}>
                                        {this.state.code}
                                    </button>
                                </div>
                                <p className="error">
                                    {!verify_code.valid && <span>{verify_code.error}</span>}
                                </p>
                            </div>
                            <div className="form-block-h5">
                                <label>{intl.get("usercenter_set_password")}<span>（{intl.get("register_pwd_info")}）</span></label>
                                <div className="form-control-h5">
                                    <input autoComplete="new-password" type={this.state.pwdType} placeholder={intl.get("register_pwd_placeholder")} value={this.state.form.pwd.value || ""} onChange={(e) => this.handleValueChange('pwd', e.target.value)} />
                                </div>
                                <p className="error">{!pwd.valid && <span>{pwd.error}</span>}</p>
                            </div>
                            <div id="captcha"></div>
                            <div className="form-block-h5">
                                <label>{intl.get("usercenter_repeat_password")}</label>
                                <div className="form-control-h5">
                                        <input autoComplete="new-password" type={this.state.qr_pwdType} placeholder={intl.get("register_pwd2_error1")} value={this.state.form.qr_pwd.value || ""} onChange={(e) => this.handleValueChange('qr_pwd', e.target.value)} />
                                </div>
                                <p className="error">{!qr_pwd.valid && <span>{qr_pwd.error}</span>}</p>
                            </div>

                            <button className="submit" onClick={this.retrievalSubmit} disabled={valid}>{intl.get("retieve_password_btn")}</button>
                        </div>
                    </div>
                </div>
            </MediaQuery>
        </div>;
    }
}

export default Retrieval;