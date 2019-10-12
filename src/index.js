import "babel-polyfill";
import React from 'react';
import ReactDOM from 'react-dom';
//import registerServiceWorker from './registerServiceWorker';
import App from './App.js';
import './assets/scss/bbx-style.css';
import './assets/scss/base.css';
import './assets/font/iconfont.css';
import "./assets/scss/pc/component/bbx_loading.css";
import { Provider } from "react-redux";
import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import reducers from "./reducer";

const store = createStore(
  reducers,
  compose(
    applyMiddleware(thunk),
    // window.devToolsExtension ? window.devToolsExtension() : f => f
  )
);


ReactDOM.render(
  <Provider store={store}>
    <App></App>
  </Provider>,
  document.getElementById("root")
);
//registerServiceWorker();
