// fixed-body.js - handles a moveable fixed body

import {jst} from 'jayesstee';

const START_WIDTH           = 10;

export class FixedBody extends jst.Component {
  constructor(world, scale, offsetX, offsetY, opts) {
    super();

    this.world = world;

    this.x = opts.x || 50;
    this.y = opts.y || 50;

    this.width = opts.width || 20;
    this.height = opts.height || 20;

    this.cx = this.x + this.width/2;
    this.cy = this.y + this.height/2;

    this.rotation    = opts.rotation || 0;
    this.rotationRad = this.rotation/180 * Math.PI;

    this.showControls = false;

    this.resize(scale, offsetX, offsetY);

    this.addMatterBlock();

  }

  cssInstance() {
    return {
      body$c: {
        top$px: this.y * this.scale + this.offsetY,
        left$px: this.x * this.scale + this.offsetX,
        width$px: this.width * this.scale,
        height$px: this.height * this.scale,
        //boxShadow$px: [0, 0, 1 * this.scale, 2 * this.scale, this.ringColor],
        backgroundColor: '#888',
        transform: jst.rotate(jst.deg(this.rotation))
      },
      rotateKnob$c: {
        top$px: this.height/2 * this.scale,
        left$px: 0 * this.scale,
      },
      gripKnob$c: {
        top$px: this.height/2 * this.scale,
        left$px: this.width/2 * this.scale,
      },
    }
  }

  cssLocal() {
    return {
      body$c: {
        position: 'absolute',
        //zIndex: -1
      },
      knob$c: {
        position: 'absolute',
        width$px: 3 * this.scale,
        height$px: 3 * this.scale,
        borderRadius$px: '50%',
        backgroundColor: 'white',
        border$px: [1, 'solid', 'black']
      },
      knob$c$hover: {
        backgroundColor: "#ff8",
        cursor: "pointer"
      }
    }
  }

  render() {
    return jst.$div({cn: '-body --body', events: {pointerdown: e => this.select(e)}},
      jst.if(this.showControls) &&
      jst.$div({cn: '-controls --controls'},
        jst.$div({cn: '--rotateKnob -knob', events: {pointerdown: e => this.rotateDown(e)}}),
        jst.$div({cn: '--gripKnob -knob', events: {pointerdown: e => this.gripDown(e)}})
      )
    );
  }

  resize(scale, offsetX, offsetY) {
    this.scale = scale;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
  }

  addMatterBlock() {
    this.matterBlocks = [];
    let opts = {
      isStatic: true, 
      cornerRadius: 0, 
      rotate: this.rotationRad, 
      noRender: true,
    };

    // Single rectangle
    this.matterBlocks.push(this.world.add(...this.rotateCoords(this.x + this.width/2, this.y + this.height/2), this.width, this.height, opts));
  }

  rotateCoords(x, y) {
    let ax = x - this.cx;
    let ay = y - this.cy;

    let sr = Math.sin(this.rotationRad);
    let cr = Math.cos(this.rotationRad);

    let rx =  cr * ax - sr * ay;
    let ry =  sr * ax + cr * ay;

    return [rx + this.cx, ry + this.cy];
  }

  rotate(deltaDeg) {
    this.rotation    += deltaDeg;
    this.rotationRad  = this.rotation/180 * Math.PI;
    this.matterBlocks.forEach(block => this.world.remove(block));
    this.addMatterBlock();   
    this.refresh();
  }

  rotateTo(angle, moveMatter) {
    this.rotation     = angle;
    this.rotationRad  = this.rotation/180 * Math.PI;
    this.matterBlocks.forEach(block => this.world.remove(block));
    this.matterBlocks = [];
    if (moveMatter) {
      this.addMatterBlock();   
    }
    this.refresh();
  }

  moveTo(x, y, moveMatter) {
    this.x = x;
    this.y = y;

    this.cx = this.x + this.width/2;
    this.cy = this.y + this.height/2;

    this.matterBlocks.forEach(block => this.world.remove(block));
    this.matterBlocks = [];
    if (moveMatter) {
      this.addMatterBlock();   
    }
    this.refresh();
  }

  enterPortal(selfBody, otherBody) {
    this.world.remove(otherBody);
  }

  pointerMove(e) {
    if (this.controlMove) {
      this.controlMove(e)
    }
  }

  pointerUp(e) {
    if (this.controlUp) {
      this.controlUp(e)
    }
  }

  gripMove(e) {
    let dx = (e.clientX - this.clickStart.ex)/this.scale;
    let dy = (e.clientY - this.clickStart.ey)/this.scale;
    this.moveTo(this.clickStart.x + dx, this.clickStart.y + dy, false);
  }

  gripUp(e) {
    this.controlUp   = null;
    this.controlMove = null;
    let dx = (e.clientX - this.clickStart.ex)/this.scale;
    let dy = (e.clientY - this.clickStart.ey)/this.scale;
    this.moveTo(this.clickStart.x + dx, this.clickStart.y + dy, true);
  }

  gripDown(e) {
    e.preventDefault();
    e.stopPropagation();
    this.controlMove = e => this.gripMove(e);
    this.controlUp   = e => this.gripUp(e);
    this.clickStart = {
      ex: e.clientX,
      ey: e.clientY,
      x: this.x,
      y: this.y
    };
  }

  rotateMove(e, final) {
    // Find the angle from the pointer location to the center point
    let dx = this.cx*this.scale+this.offsetX - e.clientX;
    let dy = this.cy*this.scale+this.offsetY - e.clientY;
    let angle = Math.atan(dy/dx)/Math.PI*180;
    if (dx < 0) {
      angle += 180;
    }
    this.rotateTo(angle, final)
  }

  rotateUp(e) {
    this.controlUp   = null;
    this.controlMove = null;
    this.rotateMove(e, true);
  }

  rotateDown(e) {
    e.preventDefault();
    e.stopPropagation();
    this.controlMove = e => this.rotateMove(e);
    this.controlUp   = e => this.rotateUp(e);
  }

  select(e) {
    e.preventDefault();
    e.stopPropagation();
    this.world.entitySelected(this);
    this.showControls = true;
    this.refresh();
  }

  unselect() {
    this.showControls = false;
    this.refresh();
  }

}