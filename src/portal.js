// portal.js - one end of an event portal

import {jst} from 'jayesstee';

const RING_WIDTH            = 1;
const PORTAL_WIDTH          = 40;
const PORTAL_SQUISH         = 3;
const PORTAL_SQUISH2        = PORTAL_SQUISH * 2;
const PORTAL_SQUISH_INNER   = PORTAL_SQUISH + 0.1;
const PORTAL_SQUISH_INNER2  = PORTAL_SQUISH_INNER * 2;

const orientationToRotation = {
  top:    -90,
  left:   180,
  bottom: 90,
  right:  0,
}

export class Portal extends jst.Component {
  constructor(world, scale, offsetX, offsetY, opts) {
    super();

    this.world = world;

    this.x = opts.x || 50;
    this.y = opts.y || 50;

    this.cx = this.x + PORTAL_WIDTH/PORTAL_SQUISH2;
    this.cy = this.y + PORTAL_WIDTH/2;

    this.rotation    = opts.rotation || 0;
    this.rotationRad = this.rotation/180 * Math.PI;

    this.ringColor = opts.ringColor || "orange";
    this.portalColor = opts.portalColor || '#999';

    this.showControls = false;

    this.resize(scale, offsetX, offsetY);

    this.addMatterBlocks();

  }

  cssInstance() {
    return {
      portalDiv$c: {
        top$px: this.y * this.scale + this.offsetY,
        left$px: this.x * this.scale + this.offsetX,
        transform: jst.rotate(jst.deg(this.rotation)),
      },
      portal$c: {
        top$px: this.y * this.scale + this.offsetY,
        left$px: this.x * this.scale + this.offsetX,
        transform: jst.rotate(jst.deg(this.rotation)),
        boxShadow$px: [0, 0, 1 * this.scale, 2 * this.scale, this.ringColor],
        backgroundColor: this.ringColor,
        clipPath: 'polygon(-250% -50%, 31% -50%, 31% 150%, -250% 150%)'
      },
      inner$c: {
        background: `radial-gradient(closest-side, black 0%, black 70%, ${this.ringColor} 100%)`,
      },
      inset$c: {
        boxShadow$px: [0, 0, 1 * this.scale, 2 * this.scale, this.ringColor, 'inset'],
      },
      frontPortal$c: {
        top$px: this.y * this.scale + this.offsetY,
        left$px: this.x * this.scale + this.offsetX,
        transform: jst.rotate(jst.deg(this.rotation)),
        boxShadow$px: [0, 0, 1 * this.scale, 2 * this.scale, this.ringColor],
        backgroundColor: this.ringColor,
        clipPath: 'polygon(150% -50%, 30% -50%, 30% 150%, 150% 150%)'
      },
      frontInner$c: {
        background: `radial-gradient(closest-side, black 0%, black 70%, ${this.ringColor} 100%)`,
      },
      frontInset$c: {
        boxShadow$px: [0, 0, 1 * this.scale, 2 * this.scale, this.ringColor, 'inset'],
      },
    }
  }

  cssLocal() {
    return {
      portalDiv$c: {
        position: 'absolute',
        left$px: 0,
        width$px: PORTAL_WIDTH/PORTAL_SQUISH * this.scale,
        height$px: PORTAL_WIDTH * this.scale,
        //zIndex: -1
      },
      portal$c: {
        position: 'absolute',
        left$px: 0,
        borderRadius$px: '45% 55% 55% 45% / 50% 50% 50% 50%',
        width$px: PORTAL_WIDTH/PORTAL_SQUISH * this.scale,
        height$px: PORTAL_WIDTH * this.scale,
        //zIndex: -1
      },
      inner$c: {
        marginLeft$px: -1.1 * this.scale,
        borderRadius$px: '47% 53% 53% 47% / 50% 50% 50% 50%',
        width$px: PORTAL_WIDTH/PORTAL_SQUISH_INNER * this.scale,
        height$px: PORTAL_WIDTH * this.scale,
      },
      inset$c: {
        padding$px: 0,
        width$px: PORTAL_WIDTH/PORTAL_SQUISH_INNER * this.scale,
        height$px: PORTAL_WIDTH * this.scale,
        borderRadius$px: '47% 53% 53% 47% / 50% 50% 50% 50%',
      },
      frontPortal$c: {
        position: 'absolute',
        left$px: 0,
        position: 'absolute',
        //left$px: PORTAL_WIDTH/PORTAL_SQUISH2 * this.scale,
        borderRadius$px: '45% 55% 55% 45% / 50% 50% 50% 50%',
        width$px: PORTAL_WIDTH/PORTAL_SQUISH * this.scale,
        height$px: PORTAL_WIDTH * this.scale,
        opacity: 0.99,
        zIndex: 2
      },
      frontInner$c: {
        marginLeft$px: -1.1 * this.scale,
        borderRadius$px: '47% 53% 53% 47% / 50% 50% 50% 50%',
        width$px: PORTAL_WIDTH/PORTAL_SQUISH_INNER * this.scale,
        height$px: PORTAL_WIDTH * this.scale,
      },
      frontInset$c: {
        padding$px: 0,
        width$px: PORTAL_WIDTH/PORTAL_SQUISH_INNER * this.scale,
        height$px: PORTAL_WIDTH * this.scale,
        borderRadius$px: '47% 53% 53% 47% / 50% 50% 50% 50%',
      },
      rotateKnob$c: {
        top$px: (PORTAL_WIDTH/2 - PORTAL_WIDTH/20) * this.scale,
        left$px: - (PORTAL_WIDTH/2 - PORTAL_WIDTH/20) * this.scale,
        zIndex: 1
      },
      gripKnob$c: {
        top$px: (PORTAL_WIDTH/2 - PORTAL_WIDTH/20) * this.scale,
        left$px: (PORTAL_WIDTH/3 - PORTAL_WIDTH/20) * this.scale,
      },
      knob$c: {
        position: 'absolute',
        width$px: PORTAL_WIDTH/10 * this.scale,
        height$px: PORTAL_WIDTH/10 * this.scale,
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
    return [
      jst.$div({cn: '-portal --portal', events: {pointerdown: e => this.select(e)}},
        jst.$div({cn: '-inner --inner'},
          jst.$div({cn: '-inset --inset'})
        ),
        jst.if(this.showControls) &&
        jst.$div({cn: '-controls --controls'},
          jst.$div({cn: '-rotateKnob -knob', events: {pointerdown: e => this.rotateDown(e)}}),
        )
      ),
      jst.$div({cn: '-frontPortal --frontPortal', events: {pointerdown: e => this.select(e)}},
        jst.$div({cn: '-frontInner --frontInner'},
          jst.$div({cn: '-frontInset --frontInset'})
        ),
        jst.if(this.showControls) &&
          jst.$div({cn: '-controls --controls'},
            jst.$div({cn: '-gripKnob -knob', events: {pointerdown: e => this.gripDown(e)}})
          )
    ),
      
    ]
  }

  resize(scale, offsetX, offsetY) {
    this.scale = scale;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
  }

  addMatterBlocks() {
    let opts = {
      isStatic: true, 
      cornerRadius: 5, 
      rotate: this.rotationRad, 
      noRender: true,
    };
    this.matterBlocks = [];

    // Two side blocks to prevent things going through the edges of the portal
    this.matterBlocks.push(this.world.add(...this.rotateCoords(this.x + PORTAL_WIDTH/6.2-1, this.y+1), 2, 6.5, opts));
    this.matterBlocks.push(this.world.add(...this.rotateCoords(this.x + PORTAL_WIDTH/6.2-1, this.y + PORTAL_WIDTH-1), 2, 6.5, opts));

    // The far back part to prevent entering from the wrong side
    this.matterBlocks.push(this.world.add(...this.rotateCoords(this.x + PORTAL_WIDTH/4+6, this.y + PORTAL_WIDTH/2), 2, PORTAL_WIDTH, opts));

    // Add a callback for hitting the back of the portal
    opts.events = {
      collision: (a, b) => this.enterPortal(a, b)
    }

    // The part that represents the interior of the portal, which includes a callback to do something with the block when it happens
    this.matterBlocks.push(this.world.add(...this.rotateCoords(this.x + PORTAL_WIDTH/4+4, this.y + PORTAL_WIDTH/2), 2, PORTAL_WIDTH, opts));
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
    this.addMatterBlocks();   
    this.refresh();
  }

  rotateTo(angle, moveMatter) {
    this.rotation     = angle;
    this.rotationRad  = this.rotation/180 * Math.PI;
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

    this.cx = this.x + PORTAL_WIDTH/PORTAL_SQUISH2;
    this.cy = this.y + PORTAL_WIDTH/2;

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