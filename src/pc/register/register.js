import React,{Component} from 'react';
import "../../assets/scss/pc/register/register.css";
import TELInput from "./tel_input";
import { notification } from 'antd';
import { debounce } from "../../utils/debounce.js";
import { connect } from "react-redux";
import { getVerifyCode, registerPost, getCaptchCheck } from "../../redux/user.redux.js";
import MD5 from "../../utils/md5.js";
import { Redirect, Link, withRouter } from "react-router-dom";
import intl from "react-intl-universal";
import nextIcon from "../../assets/images/icon-next2.png";
import { getQueryString } from "../../utils/getQueryString.js";
import { getCookie } from "../../utils/cookie.js";
import GotoContract from "./goto_contract_alert.js";
import MediaQuery from "react-responsive";

@withRouter
@connect(state => ({ ...state.lang, ...state.user }), { 
    getVerifyCode, 
    registerPost,
    getCaptchCheck 
})
class Register extends Component {
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
            canGetCode: true,  //是否可以获取验证码
            canSubmit: true, //是否可以用提交按钮
            pwdType: "text",
            qr_pwdType: "text",
            inSubmission: false,
            qd: localStorage.getItem("qd"),
            token: "",
            showGotoContract: false,  //显示去返佣弹框
            path: "", //url上的path参数
        }
        this.getCode = this.getCode.bind(this);
        this.switchTab = this.switchTab.bind(this);
        this.handleValueChange = this.handleValueChange.bind(this);
        this.registerSubmit = this.registerSubmit.bind(this);
        this.closeGotoContract = this.closeGotoContract.bind(this);
        this.captchaCheck = this.captchaCheck.bind(this);

        let self = this;
        this.toRegister = debounce(function(data) {
            // let path = getQueryString(this.props.location.search, "path");
            let path = this.getPath();
            // console.log("getQueryString###path####",path);
            if(this.mounted) {
                this.setState({
                    path: path
                })
            }

            let markcode = getQueryString(this.props.location.search, "markcode");

            this.props.registerPost(data,path,this.state.qd,markcode).then(() => {

                if(this.props.user_error) {
                    notification.error({
                        message: intl.get("error_message_title"),
                        description: this.props.user_error.message
                    })
                }else {
                    
                    this.toShowGotoContract();
                }
                //解锁提交按钮
                if (this.mounted) {
                    this.setState({
                        canSubmit: true,
                        inSubmission: false
                    });
                }
            });
            
        },500);
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

        // let path = getQueryString(this.props.location.search, "path");
        let path = this.getPath();
        // console.log("getQueryString###path####",path);
        if (this.mounted) {
          this.setState({ path: path });
        }
    }
    componentWillUnmount() {
        this.mounted = false;
    }
    componentDidMount() {
        //如果url上有，就用url上的inviter, 否则如果localStorage里有，则用localStorage里的
        let invite_code = getQueryString(location.search,"inviter");
        let local_inviter = localStorage.getItem("inviter");
        if(!invite_code && local_inviter) {
            invite_code = local_inviter;
        }

        if(invite_code && this.mounted) {
            this.setState({
                form: {
                    ...this.state.form,
                    invite_code: {
                        ...this.state.form.invite_code,
                        value: invite_code
                    }
                }
            })
        }


        this.initCaptcha();

        
    }
    //获取登录成功后要跳转的地址
    getPath() {
        let url = this.props.location.search;
        let arr = [];
        if (url.indexOf('path') > 0) {
            arr = url.split('path=');
        }
        if (arr[1]) {
            return arr[1];
        }
        return "";
    }

    getCode(validate) {
        if (this.state.currentTab === 0) {
            let phone = this.state.form.phone_code.value + " " + this.state.form.phone.value;
            this.props.getVerifyCode(phone, 0, 'RegisterVerifyCode', validate).then((res) => {
                if (res.data.errno === 'OK') {
                    this.countDown();
                } else {
                    notification.error({
                        message: intl.get("error_message_title"),
                        description: res.data.message
                    })
                }
            })
        } else {
            this.props.getVerifyCode(this.state.form.email.value, 1, "RegisterVerifyCode", validate).then((res) => {
                if (res.data.errno === 'OK') {
                    this.countDown();
                } else {
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
        // this.initCaptcha();
        // this.captchaIns && this.captchaIns.popUp();

        this.props.getCaptchCheck("RegisterVerifyCode").then(res => {
          if (res.data.errno === "OK") {
            if (res.data.data && !res.data.data.need) {
              this.getCode();
            } else {
              this.initCaptcha();
              this.captchaIns && this.captchaIns.popUp();
            }
          } else {
            notification.error({
              message: intl.get("error_message_title"),
              description: res.data.message
            });
          }
        });
    }

    countDown() { //倒计时

        //发出获取邀请码请求

        //this.state.code = 60;
        //禁用获取验证码按钮
        if(this.mounted) {
            this.setState({
                canGetCode: false,
                code: 60
            })
        }
        this.state.timmer = setInterval(()=> {
            if(this.mounted) {
                this.setState({
                    code: this.state.code - 1
                })
            }
            if(this.state.code==0) {
                clearInterval(this.state.timmer);
                if(this.mounted) {
                    this.setState({
                        code: intl.get("register_get_verify_code"),
                        canGetCode: true
                    })
                }
            }
        },1000);
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
                    pwd: {
                        ...this.state.form.pwd,
                        value: '',
                        error: ''
                    },
                    qr_pwd: {
                        ...this.state.form.qr_pwd,
                        value: '',
                        error: ''
                    },
                    verify_code: {
                        ...this.state.form.verify_code,
                        value: '',
                        error: ''
                    }
                }
            })
        }
    }

    changePhoneCode(code) {
        //console.log("changePhoneCode###code是什么###", code);
        this.handleValueChange('phone_code',code);
    }

    changePhone(phone) {
        //console.log("changePhone####phone是什么###", phone);
        this.handleValueChange('phone', phone);
    }

    //监听表单项变化
    handleValueChange(field, value) {
        const { form } = this.state;
        const newFieldObj = {value, valid: true, error: ''};

        switch (field) {
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
                }else if(value.length===0) {
                    newFieldObj.error = intl.get("register_pwd");
                    newFieldObj.valid = false;
                }
                // if(this.mounted) {
                //     this.setState({
                //         pwdType: 'password'
                //     })
                // }
                break;
            }
            case 'qr_pwd': {
                if(value.length === 0) {
                    newFieldObj.error = intl.get("register_pwd2_error1");
                    newFieldObj.valid = false;
                }else if (value != form.pwd.value) {
                    newFieldObj.error = intl.get("register_pwd2_error2");
                    newFieldObj.valid = false;
                }
                // if(this.mounted) {
                //     this.setState({
                //         qr_pwdType: 'password'
                //     })
                // }
                break;
            }
            case 'agree': {
                if(!value) {
                    newFieldObj.valid = false;
                }
            }
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

    registerSubmit() {

        let data = {};
        let form = this.state.form;
        if(this.state.currentTab===0) {
            data["phone"] = form.phone_code.value + " " + form.phone.value;
            data["account_type"] = 2;
        }
        if(this.state.currentTab===1) {
            data["email"] = form.email.value;
            data["account_type"] = 1;
        }
        //data["password"] = form.pwd.value;
        if(form.invite_code.value) {
            data["inviter_id"] = Number(form.invite_code.value);
        }

        let qd = this.state.qd ? this.state.qd : localStorage.getItem("qd");
        if (qd && qd !== 'null' && qd !== 'undefined') {
            data["inviter_id"] = 0;
        }else {
            data["inviter_id"] = data["inviter_id"];
        }
        
        data["code"] = String(form.verify_code.value);

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
                pwdType: 'text',
                qr_pwdType: 'text',
                inSubmission: true
            })
        }
        //console.log('registerSubmit####',data);
        //console.log("md5###", new MD5.hash('aaaaa'));
        //return;
        this.toRegister(data);
    }

    gotoRigister(link) {
        this.props.history.push(link)
    }

    removeReadOnly(ref) {
        //this.refs[ref].removeAttribute("readonly");
        if (this.mounted && ref==="password") {
            this.setState({
                pwdType: 'password'
            })
        }
        if (this.mounted && ref === "qrpwd") {
            this.setState({
                qr_pwdType: 'password'
            })
        }
    }
    setReadOnly(ref) {
        this.refs[ref].setAttribute("readonly", true);
    }

    toShowGotoContract() {
        if(this.mounted) {
            this.setState({
                showGotoContract: true
            })
        }
    }
    closeGotoContract() {
        if(this.mounted) {
            this.setState({
                showGotoContract: false
            })
        }
        if (this.state.path) {
            window.location.href = unescape(this.props.register_success);
        } else {
            this.props.history.push(this.props.register_success);
        }
    }

    back() {
        history.go(-1); //后退1页  
    }  

    render() {
        let state = this.state
        let tabList = this.state.tabList.map((item,index) => {
            return <a key={index} className={state.currentTab===index?'active':''} onClick={()=>this.switchTab(index)}>
                {item.name}
            </a>
        })
        const {form: {email,phone,phone_code,pwd,qr_pwd,verify_code,invite_code,agree}} = this.state;
        const currentTab = this.state.currentTab;
        const canSubmit = this.state.canSubmit;
        const valid = !canSubmit || (currentTab===1 && !email.valid) || (currentTab===0 && !phone.valid) || (currentTab===0 && !phone_code.valid) || !verify_code.valid || !pwd.valid || !qr_pwd.valid || !agree.valid;
        
        const canGetCode = this.state.canGetCode;

        const codeValid = (currentTab===1 && !email.valid) || (currentTab===0 && !phone.valid) || (currentTab===0 && !phone_code.valid) || !canGetCode;

        let inviteCode = getQueryString(this.props.location.search,"inviter");
        inviteCode = inviteCode?inviteCode:"";

        let  search = '';
        if (this.props.default && this.props.default.value) {
            search = `?lang=${this.props.default.value}`;
        }
        let qd = this.state.qd?this.state.qd:localStorage.getItem("qd");
        if (qd && qd!=="null" && qd!=="undefine") {
            search = search?search + `&qd=${this.state.qd}`:`?qd=${qd}`;
            inviteCode = "";
        }

        let loginSearch = this.state.path?(search?search + "&path=" +this.state.path:"?path=" +this.state.path):search; 


        return <div className="bbx-container">
            {/* {this.props.user?<Redirect to={{pathname:"/",search:`${langSearch}`}} /> : null} */}
            {/* {this.props.register_success ? <Redirect to={this.props.register_success} /> : null} */}
            {this.state.token ? <Redirect to="/" /> : null}
            <MediaQuery minWidth={700}>
                <div className="login-box">
                <div className="login">
                    <p className="left-bottom-desc">{intl.get("BANNERTITLE")}</p>
                    <h3 className="login-tit">{intl.get("register_title")}</h3>
                    <div className="login-tab" style={{marginTop: "20px"}}>{tabList}</div>
                    <div className="login-form">
                    <div className="form-control">
                        {state.currentTab === 1 ? (
                        <input
                            type="text"
                            placeholder={intl.get("login_please_enter_email")}
                            autoComplete="off"
                            onChange={e =>
                            this.handleValueChange(
                                "email",
                                e.target.value
                            )
                            }
                        />
                        ) : (
                        <TELInput
                            changePhoneCode={this.changePhoneCode.bind(
                            this
                            )}
                            changePhone={this.changePhone.bind(this)}
                        />
                        )}
                    </div>
                    <p className="error">
                        {this.state.currentTab === 1 && !email.valid && <span
                            >
                            {email.error}
                            </span>}
                        {this.state.currentTab === 0 && !phone.valid && <span
                            >
                            {phone.error}
                            </span>}
                        {this.state.currentTab === 0 && !phone_code.valid && <span
                            >
                            {phone_code.error}
                            </span>}
                    </p>
                    {/* <div className="form-control">
                                    
                                </div> */}
                    <div className="form-control">
                        <input type="text" autoComplete="off" placeholder={intl.get("register_verify_code_placeholder")} value={this.state.form.verify_code.value || ""} onChange={e => this.handleValueChange("verify_code", e.target.value)} />
                        <button className="get-code" onClick={this.captchaCheck} disabled={codeValid}>
                        {this.state.code}
                        </button>
                    </div>
                    <p className="error">
                        {!verify_code.valid && (
                        <span>{verify_code.error}</span>
                        )}
                    </p>
                    <div className="form-control">
                        <input autoComplete="new-password"
                            type={this.state.pwdType}
                            placeholder={intl.get("register_pwd_placeholder")} 
                            value={this.state.form.pwd.value || ""} 
                            onChange={e => this.handleValueChange("pwd", e.target.value)} 
                            onFocus={()=>this.removeReadOnly("password")}
                            //onBlur={()=>this.setReadOnly("password")}
                            ref="password"
                        />
                    </div>
                    <p className="error">
                        {!pwd.valid && <span>{pwd.error}</span>}
                    </p>
                    <div className="form-control">
                        <input autoComplete="new-password" 
                            type={this.state.qr_pwdType}
                            placeholder={intl.get("register_pwd2_error1")} 
                            value={this.state.form.qr_pwd.value || ""} 
                            onChange={e => this.handleValueChange("qr_pwd", e.target.value)} 
                            onFocus={()=>this.removeReadOnly("qrpwd")}
                            //onBlur={()=>this.setReadOnly("qrpwd")}
                            ref="qrpwd"
                        />
                    </div>
                    <p className="error">
                        {!qr_pwd.valid && <span>{qr_pwd.error}</span>}
                    </p>
                    <div className="form-control">
                        <input type="text" placeholder={`${intl.get("register_invite_code")} ( ${intl.get("register_invite_code_tips")} ) `} 
                            value={this.state.form.invite_code.value || inviteCode} 
                            onChange={e => this.handleValueChange("invite_code", e.target.value)} 
                            disabled = {qd && qd!=='null' && qd!=='undefined'?true:false}
                        />
                        {/* <span className="prompt">{intl.get("register_invite_code_tips")}</span> */}
                    </div>
                    {/* <p className="error">错误提示</p> */}
                    {/* <p className="error-text">错误提示</p> */}
                    <div id="captcha"></div>
                    <p className="agree">
                        {/* <input type="checkbox" defaultChecked="true" onChange={e => this.handleValueChange("agree", e.target.checked)} />   */}
                        <span className="agree-input">
                            <input type="checkbox" id="hide" defaultChecked="true" onChange={e => this.handleValueChange("agree", e.target.checked)} />
                            <label htmlFor="hide"></label>
                        </span>
                        {intl.get("register_agreement")}
                        {/* <Link to={{pathname:"/terms",search:`${search}`}}>{intl.get("register_agreement_txt1")}</Link> 
                        <Link to={{pathname:"/risk", search:`${search}`}}>{intl.get("register_agreement_txt2")}</Link> */}
                    </p>
                    {!this.state.inSubmission?<button className="submit" onClick={this.registerSubmit} disabled={valid}>{intl.get("register_btn")}</button>:
                    <button className="ms-submission submit" disabled="disabled">{intl.get("in_the_register_btn")}<span>...</span></button>}
                    <p className="goto-prompt">
                        <span>{intl.get("register_have_account")}，</span> <Link to={{pathname:"/login",search:`${loginSearch}`}}>{intl.get("register_to_login")} </Link> <img src={nextIcon} />
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
                            {state.currentTab === 0 ? <span onClick={() => this.switchTab(1)}>{intl.get("login_type_email")}</span> : null}
                            {state.currentTab === 1 ? <span onClick={() => this.switchTab(0)}>{intl.get("login_type_phone")}</span> : null}
                        </div>
                        <div className="login-h5-body">
                            <h3 className="title">{intl.get("register_title")}</h3>
                            <div className="form-block-h5">
                                <label>
                                    {
                                        state.currentTab === 1 ? intl.get("login_type_email") : intl.get("login_type_phone")
                                    }
                                </label>
                                <div className="form-control-h5">
                                    {state.currentTab === 1 ? (
                                        <input
                                            type="text"
                                            placeholder={intl.get("login_please_enter_email")}
                                            autoComplete="off"
                                            onChange={e =>
                                                this.handleValueChange(
                                                    "email",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    ) : (
                                            <TELInput
                                                changePhoneCode={this.changePhoneCode.bind(
                                                    this
                                                )}
                                                changePhone={this.changePhone.bind(this)}
                                            />
                                        )}
                                </div>
                                <p className="error">
                                    {this.state.currentTab === 1 && !email.valid && <span
                                    >
                                        {email.error}
                                    </span>}
                                    {this.state.currentTab === 0 && !phone.valid && <span
                                    >
                                        {phone.error}
                                    </span>}
                                    {this.state.currentTab === 0 && !phone_code.valid && <span
                                    >
                                        {phone_code.error}
                                    </span>}
                                </p>
                            </div>
                            <div className="form-block-h5">
                                <label>{intl.get("register_code")}</label>
                                <div className="form-control-h5">
                                    <input type="text" autoComplete="off" placeholder={intl.get("register_verify_code_placeholder")} value={this.state.form.verify_code.value || ""} onChange={e => this.handleValueChange("verify_code", e.target.value)} />
                                    <button className="get-code" onClick={this.captchaCheck} disabled={codeValid}>
                                        {this.state.code}
                                    </button>
                                </div>
                                <p className="error">
                                    {!verify_code.valid && (
                                        <span>{verify_code.error}</span>
                                    )}
                                </p>
                            </div>
                            <div className="form-block-h5">
                                <label>{intl.get("usercenter_set_password")}<span>（{intl.get("register_pwd_info")}）</span></label>
                                <div className="form-control-h5">
                                    <input autoComplete="new-password"
                                        type={this.state.pwdType}
                                        placeholder={intl.get("register_pwd")}
                                        value={this.state.form.pwd.value || ""}
                                        onChange={e => this.handleValueChange("pwd", e.target.value)}
                                        onFocus={() => this.removeReadOnly("password")}
                                        //onBlur={()=>this.setReadOnly("password")}
                                        ref="password"
                                    />
                                </div>
                                <p className="error">{!pwd.valid && <span>{pwd.error}</span>}</p>
                            </div>
                            <div className="form-block-h5">
                                <label>{intl.get("usercenter_repeat_password")}</label>
                                <div className="form-control-h5">
                                    <input autoComplete="new-password"
                                        type={this.state.qr_pwdType}
                                        placeholder={intl.get("register_pwd2_placeholder")}
                                        value={this.state.form.qr_pwd.value || ""}
                                        onChange={e => this.handleValueChange("qr_pwd", e.target.value)}
                                        onFocus={() => this.removeReadOnly("qrpwd")}
                                        //onBlur={()=>this.setReadOnly("qrpwd")}
                                        ref="qrpwd"
                                    />
                                </div>
                                <p className="error">{!qr_pwd.valid && <span>{qr_pwd.error}</span>}</p>
                            </div>
                            <div className="form-block-h5">
                                <label>{`${intl.get("register_invite_code")} ( ${intl.get("register_invite_code_tips")} ) `}</label>
                                <div className="form-control-h5">
                                    <input type="text" placeholder={intl.get("register_invite_code_placeholder")} 
                                        value={this.state.form.invite_code.value || inviteCode} 
                                        onChange={e => this.handleValueChange("invite_code", e.target.value)} 
                                        disabled={qd && qd !== 'null' && qd !== 'undefined' ? true : false}
                                    />
                                </div>
                                <p className="error"></p>
                            </div>
                            <div className="captcha-box">
                                <div id="captcha"></div>
                            </div>
                            <p className="agree">
                                {/* <input type="checkbox" defaultChecked="true" onChange={e => this.handleValueChange("agree", e.target.checked)} />   */}
                                <span className="agree-input">
                                    <input type="checkbox" id="hide" defaultChecked="true" onChange={e => this.handleValueChange("agree", e.target.checked)} />
                                    <label htmlFor="hide"></label>
                                </span>
                                {intl.get("register_agreement")}
                                {/* <Link to={{ pathname: "/terms", search: `${search}` }}>{intl.get("register_agreement_txt1")}</Link> 
                                <Link to={{ pathname: "/risk", search: `${search}` }}>{intl.get("register_agreement_txt2")}</Link> */}
                            </p>
                            {!this.state.inSubmission ? <button className="submit" onClick={this.registerSubmit} disabled={valid}>{intl.get("register_btn")}</button> :
                                <button className="ms-submission submit" disabled="disabled">{intl.get("in_the_register_btn")}<span>...</span></button>}
                        </div>
                        
                        <div className="login-h5-bottom">
                            <hr />
                            <div>
                                {intl.get("register_have_account")}？<Link to={{ pathname: "/login", search: `${loginSearch}` }}>{intl.get("register_to_login")}</Link>
                            </div>
                            <hr />
                        </div>
                    </div>
                </div>
            </MediaQuery>

            {this.state.showGotoContract ? <GotoContract close={this.closeGotoContract}></GotoContract> : null}
          </div>;
    }
}

export default Register;