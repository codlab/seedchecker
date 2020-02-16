import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Redirect, Switch } from "react-router-dom";

import "assets/css/bootstrap.min.css";
import "assets/scss/paper-kit.scss";
import "assets/demo/demo.css";
import Index from "views/Index.js";
import DarkMode from "components/DarkMode";

DarkMode.instance.addListener("dark_mode", (isOn) => {
  const color = isOn ? "#0b1011" : "white";
  document.getElementsByTagName("body")[0].style.backgroundColor = color;
});

ReactDOM.render(
  <BrowserRouter>
    <Switch>
      <Route path="/" render={props => <Index {...props} />} />
      <Redirect to="/" />
    </Switch>
  </BrowserRouter>,
  document.getElementById("root")
);
