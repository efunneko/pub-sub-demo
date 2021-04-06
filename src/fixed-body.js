// fixed-body.js - handles a moveable fixed body

import {jst}        from 'jayesstee';
import {Entity}     from "./entity.js";

const CORNER_SIZE           = 9;
const KNOB_WIDTH            = 12;

export class FixedBody extends Entity {
  constructor(world, scale, offsetX, offsetY, opts) {
    super(world, scale, offsetX, offsetY);

    this.x = opts.x || 50;
    this.y = opts.y || 50;

    this.width  = opts.width || 100;
    this.height = opts.height || 100;

    this.cx = this.x + this.width/2;
    this.cy = this.y + this.height/2;

    this.rotationRad = opts.rotation || 0;

    this.showControls = false;

    this.addMatterBlocks();

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
        transform: jst.rotate(jst.rad(this.rotationRad))
      },
      rotateKnob$c: {
        top$px: (this.height/2 - KNOB_WIDTH/2) * this.scale,
        left$px: -KNOB_WIDTH * 2 * this.scale,
        cursor: "move"
      },
      gripKnob$c: {
        top$px: (this.height/2 - KNOB_WIDTH/2) * this.scale,
        left$px: (this.width/2 - KNOB_WIDTH/2) * this.scale,
        cursor: "move"
      },
    }
  }

  cssLocal() {
    return {
      body$c: {
        position: 'fixed',
        zIndex: 2
      },
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
      corner$c: {
        position: 'absolute',
        width$px: CORNER_SIZE * this.scale,
        height$px: CORNER_SIZE * this.scale,
        backgroundColor: 'white',
        border$px: [1, 'solid', 'black']
      },
      corner$c$hover: {
        backgroundColor: "#ff8",
        cursor: "pointer"
      },
      topLeft$c: {
        top$px: -CORNER_SIZE/2 * this.scale,
        left$px: -CORNER_SIZE/2 * this.scale
      },
      topRight$c: {
        top$px: -CORNER_SIZE/2 * this.scale,
        right$px: -CORNER_SIZE/2 * this.scale
      },
      botLeft$c: {
        bottom$px: -CORNER_SIZE/2 * this.scale,
        left$px: -CORNER_SIZE/2 * this.scale
      },
      botRight$c: {
        bottom$px: -CORNER_SIZE/2 * this.scale,
        right$px: -CORNER_SIZE/2 * this.scale
      },
    }
  }

  render() {
    return jst.$div({cn: '-body --body', events: {click: e => this.select(e)}},
      jst.if(this.showControls) &&
      jst.$div({cn: '-controls --controls'},
        jst.$div({cn: '--rotateKnob -knob', events: {pointerdown: e => this.rotateDown(e)}}),
        jst.$div({cn: '--gripKnob -knob', events: {pointerdown: e => this.gripDown(e)}}),
        jst.$div({cn: '-topLeft -corner',  events: {pointerdown: e => this.cornerDown(e, 0, 0)}}),
        jst.$div({cn: '-topRight -corner', events: {pointerdown: e => this.cornerDown(e, 1, 0)}}),
        jst.$div({cn: '-botLeft -corner',  events: {pointerdown: e => this.cornerDown(e, 0, 1)}}),
        jst.$div({cn: '-botRight -corner', events: {pointerdown: e => this.cornerDown(e, 1, 1)}}),
      )
    );
  }

  addMatterBlocks() {
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

  rotate(delta) {
    this.rotationRad  = this.rotationRad + delta;
    this.matterBlocks.forEach(block => this.world.remove(block));
    this.addMatterBlocks();   
    this.refresh();
  }

  rotateTo(angle, moveMatter) {
    this.rotationRad  = angle;
    this.matterBlocks.forEach(block => this.world.remove(block));
    this.matterBlocks = [];
    if (moveMatter) {
      this.addMatterBlocks();   
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
      this.addMatterBlocks();   
    }
    this.refresh();
  }

  sizeTo(x, y, width, height, moveMatter) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.cx = this.x + this.width/2;
    this.cy = this.y + this.height/2;

    this.matterBlocks.forEach(block => this.world.remove(block));
    this.matterBlocks = [];
    if (moveMatter) {
      this.addMatterBlocks();   
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
      this.world.save();
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
      y: this.y,
    };
  }

  cornerUp(e) {
    this.controlMove = null;
    this.controlUp   = null;
    this.cornerMove(e, true);
  }

  cornerMove(e, matterMove) {

    let dx = (this.clickStart.ex - e.clientX)/this.scale;
    let dy = (this.clickStart.ey - e.clientY)/this.scale;

    // new position of my corner
    let nmx = this.clickStart.mx - dx;
    let nmy = this.clickStart.my - dy;

    // get center of adjusted shape
    let ncx = (nmx + this.clickStart.ox)/2;
    let ncy = (nmy + this.clickStart.oy)/2;

    // get the new height and width
    let [rnmx, rnmy] = this.rotateCoords(nmx, nmy, true, [ncx, ncy]);
    let nw  = Math.abs(ncx-rnmx) * 2;
    let nh  = Math.abs(ncy-rnmy) * 2;

    // and finally the appropriate x and y
    let nx  = rnmx - this.clickStart.cornerX * nw;
    let ny  = rnmy - this.clickStart.cornerY * nh;

    this.sizeTo(nx, ny, nw, nh, matterMove);
  }

  cornerDown(e, cornerX, cornerY) {
    e.preventDefault();
    e.stopPropagation();
    this.controlMove = e => this.cornerMove(e);
    this.controlUp   = e => this.cornerUp(e);

    // Coords of this corner
    let [mx, my] = this.rotateCoords(this.x + this.width*cornerX, this.y + this.height*cornerY);

    // Get the coords of the opposite corner
    let [ox, oy] = this.rotateCoords(this.x + this.width*(1-cornerX), this.y + this.height*(1-cornerY));

    this.clickStart = {
      ex: e.clientX,
      ey: e.clientY,
      x: this.x,
      y: this.y,
      mx: mx,
      my: my,
      ox: ox,
      oy: oy,
      width: this.width,
      height: this.height,
      cornerX: cornerX,
      cornerY: cornerY,
      center: [this.cx, this.cy]
    };

  }

  rotateMove(e, final) {
    // Find the angle from the pointer location to the center point
    let dx = this.cx*this.scale+this.offsetX - e.clientX;
    let dy = this.cy*this.scale+this.offsetY - e.clientY;
    let angle = Math.atan(dy/dx);
    if (dx < 0) {
      angle += Math.PI;
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

  rotateCoords(x, y, reverse, center) {
    let cx, cy;
    if (center) {
      cx = center[0];
      cy = center[1];
    }
    else {
      cx = this.cx;
      cy = this.cy;
    }

    let ax = x - cx;
    let ay = y - cy;

    let dir = reverse ? -1 : 1;

    let sr = Math.sin(dir * this.rotationRad);
    let cr = Math.cos(dir * this.rotationRad);

    let rx =  cr * ax - sr * ay;
    let ry =  sr * ax + cr * ay;

    return [rx + cx, ry + cy];
  }

  serialize() {
    return {
      type: 'fixed-body',
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      rotation: this.rotationRad
     };
  }


}