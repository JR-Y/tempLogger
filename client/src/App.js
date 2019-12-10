import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import Home from './components/Home';
import History from './components/History';

export default class App extends Component {

  constructor(props) {
    super(props);

    let user = JSON.parse(localStorage.getItem("user") || "{}");
    let token = JSON.parse(localStorage.getItem("token") || "{}");
    let lang = localStorage.getItem("lang");
    this.state = {
      session: {
        user: user ? user : {},
        token: token ? token : "",
        lang: lang ? lang : "fi"
      },
      setLang: this.setlang,
      setToken: this.setToken,
      setUser: this.setUser,
      logOut: this.logout
    }
  }
  setlang = (lang) => {
    console.log(`Set lang: ${lang}`)
    this.setState(oldState => {
      let state = oldState;
      state.session.lang = lang;
      return state;
    });
    localStorage.setItem("lang", lang);
  }
  logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    this.setState(oldState => {
      let state = oldState;
      state.session.user = {};
      state.session.token = "";
      return state;
    });
  }

  setUser = (user) => {
    console.log(`Set user: ${user}`)
    this.setState(oldState => {
      let state = oldState;
      state.session.user = user;
      return state;
    });
  }

  setToken = (token) => {
    console.log(`Set token: ${token}`)
    this.setState(oldState => {
      let state = oldState;
      state.session.token = token || "";
      return state;
    });
  }

  render() {
    const { session } = this.state;
    return (
      <Router>
        <Route path={"/"} exact render={() => <Home session={session} />} />
        <Route path={"/history"} exact render={() => <History session={session} />} />
      </Router>
    );

  }

}
