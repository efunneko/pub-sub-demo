// publisher.js

import {jst}                   from "jayesstee";
import {Matter}                from "./matter.js";

export class Publisher extends jst.Component {
  constructor() {
    super();

    this.resize();

    this.matter = new Matter();
  }


  cssLocal() {
    return {
      main$c: {
        height: '100%'
      }
    };
  }

  render() {
    return jst.$div({class: '-main'},
      this.matter
    );
  }

  postRender() {
    this.createMatterWorld();
  }

  resize() {
    this.scale = Math.min(window.innerWidth, window.innerHeight)/100;
  }

  createMatterWorld() {
    this.matter.addElements([
      this.adjust(0, 0, 5, 100).concat({isStatic: true}),
      this.adjust(95, 0, 5, 100).concat({isStatic: true}),
    ]
    );
  }

  adjust(...items) {
    return items.map(num => num * this.scale)
  }

}