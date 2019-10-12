import { setCookie } from "../utils/cookie.js";

const SWITCH_LANG = "SWITCH_LANG";
const SET_DEFAULT_LANG = "SET_DEFAULT_LANG";


const initState = {
  list: [
    {
      name: "简体中文",
      value: "zh-CN",
      index: 1,
      code: "zh-CN"
    },
    {
      name: "繁體中文",
      value: "zh-TW",
      index: 2,
      code: "zh-TW"
    },
    {
      name: "English",
      value: "en-US",
      index: 3,
      code: "en"
    },
    {
      name: "한국어",
      value: "ko-KR",
      index: 4,
      code: "ko"
    },
    {
      name: "русский",
      value: "ru",
      index: 5,
      code: "ru"
    },
    {
      name: "Tiếng việt",
      value: "vi",
      index: 6,
      code: "vi"
    }
  ],
  default: {
    name: "简体中文",
    value: "zh-CN",
    index: 1,
    code: "zh-CN"
  }
};

//reducer
export function lang(state=initState, action) {
    switch(action.type) {
        case SWITCH_LANG:
            return {...state};
        case SET_DEFAULT_LANG:
            return {...state,default: action.payload};
        default:
             return state;
    }
}

//以后可以在打开页面时候判断处在什么语言区，和获取支持语言的列表，然后放到state里
export function changeLang() {
    return { type: SWITCH_LANG };
}

function defaultLanguage(data) {
  let lang = data.value.toLowerCase();
  if(lang=="en-us"){
    lang = "en";
  }
  
  localStorage.setItem("lang",lang);
  setCookie("lang", lang, 1, "bbx.com", "/");
  return { type: SET_DEFAULT_LANG, payload: data };
}

export function setDefaultLanguage(list,lang) {
  //console.log("lang##",lang);
  //let nowLang = _.find(list, { value: lang });
  let nowLang;
  list.forEach((item) => {
    if(item.value == lang) {
      nowLang = item;
    }
  })
  //console.log('nowLang##',nowLang);
  let data = nowLang;

  return (dispatch, getState) => {
    return setTimeout(() => {
      dispatch(defaultLanguage(data));
    }, 500);
  }
  
  // return { type: SET_DEFAULT_LANG, payload: data};
}