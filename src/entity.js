// entity.js - base class for moveable entities

import {jst}                   from "jayesstee";

export class Entity extends jst.Component {
  constructor(world, scale, offsetX, offsetY) {
    super();
    this.world = world;
    this.resize(scale, offsetX, offsetY);

    this.matterBlocks = [];
  }

  cssLocal() {
    return {};
  }

  cssInstance() {
    return {};
  }


  resize(scale, offsetX, offsetY) {
    this.scale = scale;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.resizeMatterBlocks();
    this.refresh();
  }

  resizeMatterBlocks() {
    if (this.matterBlocks && this.matterBlocks.length) {
      this.matterBlocks.forEach(block => this.world.remove(block));
      this.matterBlocks = [];
      this.addMatterBlocks();   
    }
  }

  remove() {
    this.matterBlocks.forEach(block => this.world.remove(block));
  }

  // Scale size
  ss(val) {
    if (this.baseSize) {
      return val * this.baseSize * this.scale;
    }
    else {
      return val * this.scale;
    }
  }


}

