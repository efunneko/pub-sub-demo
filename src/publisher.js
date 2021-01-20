// publisher.js

import {jst}                   from "jayesstee";
import {Matter}                from "./matter.js";
import { Portal } from "./portal.js";

export class Publisher extends jst.Component {
  constructor() {
    super();

    this.resize();

    this.matter = new Matter();
    this.createMatterWorld();

    this.portal = new Portal(this, this.scale, this.offsetX, this.offsetY,
                             {ringColor: "lightblue", x: 30, y: 77});
  }


  cssLocal() {
    return {
      main$c: {
        height: '100%',
        width:  '100%'
      }
    };
  }

  render() {
    return jst.$div({class: '-main'},
      this.portal,
      this.matter
    );
  }

  resize() {
    this.scale   = Math.min(window.innerWidth, window.innerHeight)/100;
    this.offsetX = (window.innerWidth  - 100 * this.scale)/2;
    this.offsetY = (window.innerHeight - 100 * this.scale)/2;
    console.log("resizing:", window.innerWidth, window.innerHeight, this.scale)
  }

  createMatterWorld() {
    this.matter.addElements([
      this.adjust(15, 60, 5, 80).concat({isStatic: true, rotate: -Math.PI/6}),
      this.adjust(85, 60, 5, 80).concat({isStatic: true, rotate: Math.PI/6}),
      this.adjust(50, 110, 100, 5).concat({isStatic: true, events: {collision: (t, o) => this.hitGround(t, o)}}),
    ]
    );
  }

  add(x, y, w, h, opts) {
    this.matter.addElements([
      this.adjust(x, y, w, h).concat(opts),
    ]);
  }

  adjust(...items) {
    return [
      items[0] * this.scale + this.offsetX,
      items[1] * this.scale + this.offsetY,
      items[2] * this.scale,
      items[3] * this.scale,
    ];
  }

  hitGround(targetBody, otherBody) {
    console.log("collision!", targetBody, otherBody);
    this.matter.remove(otherBody);
  }

}