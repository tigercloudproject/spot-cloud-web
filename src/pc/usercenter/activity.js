import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, Redirect, withRouter } from "react-router-dom";
import { getVerifyCode, activePost, getCaptchCheck } from "../../redux/user.redux.js";
import { notification } from "antd";
import { debounce } from "../../utils/debounce.js";
import intl from "react-intl-universal";

@withRouter
@connect(
  state => ({ ...state.user, ...state.assets }),
  {
    getVerifyCode,
    activePost,
    getCaptchCheck
  }
)
class Activity extends Component {
  constructor(props) {
    super(props);

    this.state = {
      form: {
        email: {
          valid: true,
          // value: this.props.user.email ? this.props.user.email : "",
          value: "",
          error: ""
        },
        code: {
          valid: false,
          value: "",
          error: ""
        }
      },
      code_email: intl.get("usercenter_get_code"), //邮箱验证码按钮
      canGetCodeEmail: true,
      timmer_email: null,
      canSubmit: true, //提交按钮是否可用
      need_captcha: 2
    };

    this.activeSubmit = this.activeSubmit.bind(this);

    let self = this;
    this.toActiveEmail = debounce(function(data) {
      self.props.activePost(data).then(() => {
        //解锁提交按钮
        if (this.mounted) {
          this.setState({
            canSubmit: true
          });
        }

        if (this.props.user_error) {
          notification.error({
            message: intl.get("error_message_title"),
            description: this.props.user_error.message
          });
        }
      });
    }, 1000);
  }

  componentWillMount() {
    this.mounted = true;

    //设置邮箱
    if (!this.state.form.email.value && this.props.propety_info) {
      if (this.mounted) {
        this.setState({
          form: {
            ...this.state.form,
            email: {
              ...this.state.form.email,
              value: this.props.propety_info.email
            }
          }
        })
      }
    }
    if (!this.state.form.email.value && this.props.user) {
      if (this.mounted) {
        this.setState({
          form: {
            ...this.state.form,
            email: {
              ...this.state.form.email,
              value: this.props.user.email
            }
          }
        });
      }
    }
  }

  componentDidMount() {
    this.initCaptcha();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentWillReceiveProps(nextProps) {
    //设置邮箱
    if (!this.state.form.email.value && nextProps.propety_info) {
      if(this.mounted) {
        this.setState({
          form: {
            ...this.state.form,
            email: {
              ...this.state.form.email,
              value: nextProps.propety_info.email
            }
          }
        })
      }
    }
    if (!this.state.form.email.value && nextProps.user) {
      if(this.mounted) {
        this.setState({
          form: {
            ...this.state.form,
            email: {
              ...this.state.form.email,
              value: nextProps.user.email
            }
          }
        });
      }
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
      //判断是否需要图片验证码
      this.props.getCaptchCheck("ActiveVerifyCode").then(res => {
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
          });
        }
      });

  }

  getCode(validate) {
      this.props.getVerifyCode(this.state.form.email.value, 1, "ActiveVerifyCode", validate).then((res) => {
        if (res.data.errno === 'OK') {
          this.countDownEmail();
        } else {
          notification.error({
            message: intl.get("error_message_title"),
            description: res.data.message
          })
        }
      })
  }

  //获取邮箱验证码
  countDownEmail() {
    //倒计时
    //发出获取邀请码请求
    // this.props.getVerifyCode(
    //   this.state.form.email.value,
    //   1,
    //   "ActiveVerifyCode"
    // );

    //this.state.code_email = 60;
    //禁用获取验证码按钮
    if (this.mounted) {
      this.setState({
        canGetCodeEmail: false,
        code_email: 60
      });
    }
    this.state.timmer_email = setInterval(() => {
      if (this.mounted) {
        this.setState({
          code_email: this.state.code_email - 1
        });
      }
      if (this.state.code_email == 0) {
        clearInterval(this.state.timmer_email);
        if (this.mounted) {
          this.setState({
            code_email: intl.get("usercenter_get_code"),
            canGetCodeEmail: true
          });
        }
      }
    }, 1000);
  }

  //监听表单项变化
  handleValueChange(field, value) {
    const { form } = this.state;
    const newFieldObj = { value, valid: true, error: "" };

    switch (field) {
      case "email": {
        let emailReg = /^([a-zA-Z0-9._-])+@([a-zA-Z0-9._-])+(.[a-zA-Z0-9_-])+/;
        // if (!emailReg.test(value)) {
        // newFieldObj.error = "邮箱格式错误!";
        // newFieldObj.valid = false;
        // } else if (value.length === 0) {
        // newFieldObj.error = "请输入邮箱!";
        // newFieldObj.valid = false;
        // }
        break;
      }
      case "code": {
        //console.log('verify_code###',value);
        if (value.length === 0) {
          newFieldObj.error = intl.get("usercenter_verification_placeholder");
          newFieldObj.valid = false;
        }
        break;
      }
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

  activeSubmit() {
    let data = {};
    let form = this.state.form;

    data["email"] = form.email.value;
    data["code"] = form.code.value;

    //解锁提交按钮
    if (this.mounted) {
      this.setState({
        canSubmit: false
      });
    }

    this.toActiveEmail(data);
  }

  render() {
    let tabBoxStyle = {
      paddingTop: "20px",
      paddingBottom: "20px",
      minHeight: "300px",
      width: "100%"
    };

    const {
      form: { email, code }
    } = this.state;
    const canGetCodeEmail = this.state.canGetCodeEmail;
    const codeValid = canGetCodeEmail && email.valid;

    const canSubmit = this.state.canSubmit;
    const vaild = !canSubmit || !email.valid || !code.valid;
    return (
      <div className="activety-email">
        {this.props.active_success ? (
          <Redirect to={this.props.active_success} />
        ) : null}
        <div className="security-top">
          <Link
            to={{
              pathname: "/usercenter/account_information/list",
              search: `${location.search}`
            }}
            style={{ color: "#2b93f6", cursor: "pointer" }}
          >
            {intl.get("usercenter_menu1")}
          </Link>{" "}
          > {intl.get("usercenter_activate_email")}
        </div>
        <div style={tabBoxStyle}>
          <div className="modify-password">
            <div className="form-control">
              <input
                type="text"
                readOnly
                placeholder={intl.get("usercenter_email_placeholder")}
                name="email"
                value={this.state.form.email.value || ""}
                onChange={e => this.handleValueChange("email", e.target.value)}
              />
              <p className="error">
                {!email.valid && <span>{email.error}</span>}
              </p>
            </div>
            <div className="form-have-btn">
              <div className="input-have-btn">
                <input
                  type="text"
                  placeholder={intl.get("usercenter_verification_placeholder")}
                  onChange={e => this.handleValueChange("code", e.target.value)}
                />
                <button
                  disabled={!codeValid}
                  onClick={this.captchaCheck.bind(this)}
                >
                  {this.state.code_email}
                </button>
              </div>
              <p className="error">
                {!code.valid && <span>{code.error}</span>}
              </p>
            </div>

            <div id="captcha"></div>

            <button
              onClick={this.activeSubmit}
              disabled={vaild}
              className="modify-pwd-btn"
            >
              {intl.get("usercenter_confirm")}
            </button>
            <p className="binding-tip">
              {intl.get("usercenter_activate_tips")}
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default Activity;