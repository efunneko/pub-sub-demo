// world.js - represent the physics world

import {jst}                   from "jayesstee";
import {Matter}                from "./matter.js";
import {Portal}                from "./portal.js";
import {FixedBody}             from "./fixed-body.js";

export class World extends jst.Component {
  constructor() {
    super();

    this.resize();

    this.matter = new Matter();

    this.portal = new Portal(this, this.scale, this.offsetX, this.offsetY,
      {ringColor: "orange", x: 30, y: 7});
    this.portal2 = new Portal(this, this.scale, this.offsetX, this.offsetY,
      {ringColor: "lightblue", x: 20, y: 50, rotation: 50});
    this.fixedBody = new FixedBody(this, this.scale, this.offsetX, this.offsetY,
      {ringColor: "lightblue", x: 0, y: 10, width: 100, height: 10, rotation: 10}); 
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
    return jst.$div({class: '-main', 
                     events: {
                       pointermove: e => this.pointerMove(e), 
                       pointerup:   e => this.pointerUp(e),
                       pointerdown: e => this.pointerDown(e)
                      }
                    },
      this.matter,
      this.portal,
      this.portal2,
      this.fixedBody
    );
  }

  resize() {
    this.scale   = Math.min(window.innerWidth, window.innerHeight)/100;
    this.offsetX = (window.innerWidth  - 100 * this.scale)/2;
    this.offsetY = (window.innerHeight - 100 * this.scale)/2;
  }

  add(x, y, w, h, opts) {
    return (this.matter.addElements([
      this.adjust(x, y, w, h).concat(opts),
    ]))[0];
  }

  remove(block) {
    this.matter.remove(block);
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

  entitySelected(entity) {
    if (this.selectedEntity) {
      this.selectedEntity.unselect();
    }

    this.selectedEntity = entity;
  }
 
  pointerMove(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.selectedEntity && this.selectedEntity.pointerMove) {
      this.selectedEntity.pointerMove(e);
    }
  }

  pointerUp(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.selectedEntity && this.selectedEntity.pointerUp) {
      this.selectedEntity.pointerUp(e);
    }
  }

  pointerDown(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.selectedEntity) {
      this.selectedEntity.unselect();
    }
  }

}