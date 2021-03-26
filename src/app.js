// app.js

import {jst}                   from "jayesstee";
import {Messaging}             from "./messaging.js";
import {Header}                from "./header.js";
import {World}                 from "./world.js";

export class MainApp extends jst.Component {
  constructor() {
    super();
    this.header   = new Header(this);
    this.currPage = new World(this);
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

}
