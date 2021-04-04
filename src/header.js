// header.js

import {jst}                   from "jayesstee";
import {Images}                from "./images.js";

export class Header extends jst.Component {
  constructor() {
    super();
  }

  cssLocal() {
    return {
      header$c: {
        fontFamily: "'Times New Roman', 'Times', serif",
        fontSize: "200%",
        color: "white",
        backgroundColor: "#00c895",
        padding$pt: 7,
        height$pt: 20,
        zIndex: 10
      },
      logo$c: {
        objectFit: "contain",
        width: "auto",
        height: "100%"
      }
    };
  }

  render() {
    return jst.$div({class: '-header'},
    jst.$img({cn: '-logo', src: Images.solaceLogo}),
    );
  }
}