// app.js

import {jst}                   from "jayesstee";
import {Messaging}             from "./messaging.js";
import {Header}                from "./header.js";
import Navigo                  from "navigo";

// The main pages
import {About}                 from "./about.js";
import {Publisher}             from "./publisher.js";
import {World}                 from "./world.js";
//import {Body}                  from "./body";

export class MainApp extends jst.Component {
  constructor() {
    super();
    this.router   = new Navigo();
    this.header   = new Header(this);
    this.currPage = new World(this);

    //this.initRouter();
    //this.router.resolve();
  }

  cssGlobal() {
    return {
      html: {
        height: '100%'
      },
      body: {
        padding$px: 0,
        margin$px: 0,
        height: '100%',
        userSelect: 'none'
      }
    }
  }

  cssLocal() {
    return {
      top$i: {
        padding$px: 0,
        margin$px: 0,
        height: '100%',
        display: 'grid',
        gridTemplateColumns$fr: 1,
        gridTemplateRows: "min-content auto",
        gap$px: [0, 0]
      }
    };
  }

  render() {
    return jst.$div({id: '-top'},
      this.header,
      this.currPage
    );
  }

  initRouter() {
    let self = this;
    this.router.on("/world",      () => {this.currPage = new World(this);      this.refresh()});
    this.router.on("/about",      () => {this.currPage = new About(this);      this.refresh()});
  }

  navigate(opts) {
    let {url, params} = opts;
    let queryParts = [];
  
    for (let paramName of Object.keys(params || {})) {
      queryParts.push(`${encodeURIComponent(paramName)}=${encodeURIComponent(params[paramName])}`);
    }

    if (!url) {
      url = this.router.lastRouteResolved().url;
    }
      
    if (queryParts.length) {
      url += `?${queryParts.join("&")}`;
    }
  
    this.router.navigate(url);
  }

  startMessaging() {
    this.messaging = new Messaging(this.connectOpts);
  }

}
