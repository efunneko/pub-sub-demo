// entity.js - base class for moveable entities

import {jst}                   from "jayesstee";

const KNOB_WIDTH            = 12;

export class Entity extends jst.Component {
  constructor(world, scale, offsetX, offsetY) {
    super();
    this.world        = world;
    this.deleteActive = true;
    this.resize(scale, offsetX, offsetY);

    this.matterBlocks = [];
  }

  cssLocal() {
    return {
      knob$c: {
        position: 'absolute',
        width$px: KNOB_WIDTH * this.scale,
        height$px: KNOB_WIDTH * this.scale,
        borderRadius$px: '50%',
        backgroundColor: 'white',
        border$px: [1, 'solid', 'black']
      },
      knob$c$hover: {
        backgroundColor: "#ff8",
      },
    };
  }

  cssInstance() {
    return {};
  }


  resize(scale, offsetX, offsetY) {
    console.log("offsetX:", offsetX)

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

  isDeleteActive() {
    return this.deleteActive;
  }

  moveTo(x, y, moveMatter) {
    this.x = x;
    this.y = y;

    this.cx = this.x + this.width/2;
    this.cy = this.y + this.height/2;

    if (this.matterBlocks) {
      this.matterBlocks.forEach(block => this.world.remove(block));
      this.matterBlocks = [];
      if (moveMatter) {
        this.addMatterBlocks();   
      }
    }
    this.refresh();
  }

  pointerUp(e) {
    if (this.controlUp) {
      this.controlUp(e)
      this.world.save();
    }
  }

  pointerMove(e) {
    if (this.controlMove) {
      this.controlMove(e)
    }
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

