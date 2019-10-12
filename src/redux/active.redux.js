import axios from "../http.js";
import { activeAjax } from "../ajax.js";

const GET_RANK_LIST = "GET_RANK_LIST";
const GET_ACTIVE_INFO = "GET_ACTIVE_INFO";

const initStatus = {
  rank_list: [],
  active_info: null
};

export function active(state = initStatus, action) {
    switch (action.type) {
      case GET_RANK_LIST:
        return { ...state, rank_list: action.payload };
      case GET_ACTIVE_INFO:
        return {...state, active_info: action.payload};
      default:
        return state;
    }
}

export function getRankList(data) {
    return (dispatch, getState) => {
        return axios.post(activeAjax.rank, data).then((response) => {
            return response;
        }, (err) => {
            console.log("getRankList###", err);
        })
    }
}

function activeInfo(data) {
    return { type: GET_ACTIVE_INFO , payload: data };
}

let feeList = [
    {
        id: 1,
        level: "Lv1",
        amount: 0, //小于500万
        maker_fee: "-0.05%",
        taker_fee: "0.15%"
    },
    {
        id: 2,
        level: "Lv2",
        amount: 5000000, //大于500万
        maker_fee: "-0.05%",
        taker_fee: "0.14%",
    },
    {
        id: 3,
        level: "Lv3",
        amount: 10000000, //大于1000万
        maker_fee: "-0.05%",
        taker_fee: "0.13%"
    },
    {
        id: 4,
        level: "Lv4",
        amount: 50000000, //大于5000万
        maker_fee: "-0.05%",
        taker_fee: "0.124%"

    },
    {
        id: 5,
        level: "Lv5",
        amount: 100000000, //大于1亿
        maker_fee: "-0.05%",
        taker_fee: "0.116%"

    },
    {
        id: 6,
        level: "Lv6",
        amount: 200000000, //大于2亿
        maker_fee: "-0.05%",
        taker_fee: "0.106%"

    },
    {
        id: 7,
        level: "Lv7",
        amount: 500000000, //大于5亿
        maker_fee: "-0.05%",
        taker_fee: "0.090%"

    },
    {
        id: 8,
        level: "Lv8",
        amount: 1000000000, //大于10亿
        maker_fee: "-0.05%",
        taker_fee: "0.084%"

    }
];
export function getActiveInfo() {
    return (dispatch, getState) => {
        return axios.get(activeAjax.active_info).then((response) => {
            if (response && response.data && response.data.errno == "OK") {
                let info = response.data.data;
                if(!info.user_level) {
                    info.user_level = 1;
                }
                for (let i = 0; i < feeList.length; i++) {
                    if (Number(info.user_level) === Number(feeList[i].id)) {
                        dispatch(activeInfo(feeList[i]));
                    }
                }
                dispatch(activeInfo(null));
            } else {
                dispatch(activeInfo(null));
            }
        },
            (err) => {
                console.log('激活邮箱失败了###', err);
            })
    }
}
