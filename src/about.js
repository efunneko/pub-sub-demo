// header.js

import {jst}                   from "jayesstee";

export class About extends jst.Component {
  constructor() {
    super();
  }

  cssLocal() {
    return {
      about$c: {
      }
    };
  }

  render() {
    return jst.$div({class: '-about'},
      "This is about this page"
    );
  }
}