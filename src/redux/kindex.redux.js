import axios from 'axios';

const  CHART_DATA = 'CHART_DATA';

const initState = {
    list: []
}

//reducer
export function kindex(state = initState, action) {
    switch(action.type) {
        case CHART_DATA:
            return { ...state, list: action.payload };
        default:
            return state
    }
}

function chartData(list) {
    //console.log('list是什么###',list);
    return {type:CHART_DATA, payload: list};
}


export function getChartData() {
    return (dispatch, getState) => {
        return axios
          .get("https://api.bbx.com/v1/ifmarket/spot?stockCode=EOS/ETH&startTime=1524991112&endTime=1525595912")
          .then(
            response => {
                //console.log('redux#####',response);
              if (response.status == 200 && response.data.errno == "OK") {
                  //console.log("redux222#####", response);
                dispatch(chartData(response.data.data));
              }
            },
            err => {
              console.log("err###", err);
            }
          );
    }
}