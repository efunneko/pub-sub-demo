// portal.js - one end of an event portal

import {jst} from 'jayesstee';

const RING_WIDTH    = 1;
const PORTAL_WIDTH  = 40;
const PORTAL_SQUISH = 15;

const orientationToTransform = {
  top:    'rotateZ(-90deg) rotateY(70deg)',
  left:   'rotateZ(0deg) rotateY(70deg)',
  bottom: 'rotateZ(90deg) rotateY(70deg)',
  right:  'rotateZ(180deg) rotateY(70deg)',
}

const orientationToMargin = {
  top:    [0,0,-2,0],
  left:   [0,-2,0,0],
  bottom: [-2,0,0,0],
  right:  [0,0,-2,0],
}

export class Portal extends jst.Component {
  constructor(parent, scale, offsetX, offsetY, opts) {
    super();

    this.parent = parent;

    this.x = opts.x || 50;
    this.y = opts.y || 50;

    this.orientation = 'right';

    this.ringColor = opts.ringColor || "orange";
    this.portalColor = opts.portalColor || '#999';

    this.resize(scale, offsetX, offsetY);

    this.addMatterBlocks();
  }

  cssInstance() {
    return {
      portal$c: {
        top$px: this.y * this.scale + this.offsetY,
        left$px: this.x * this.scale + this.offsetX
      }
    }
  }

  cssLocal() {
    return {
      back$c: {
        position: 'absolute',
        paddingLeft$px: 30 * this.scale,
        marginLeft$px: PORTAL_WIDTH/2 * this.scale, 
        borderRadius$px: [0, PORTAL_WIDTH * this.scale, PORTAL_WIDTH * this.scale, 0],
        width$px: PORTAL_WIDTH/2 * this.scale,
        height$px: PORTAL_WIDTH * this.scale,
        //background: `radial-gradient(circle, black 0%, black 50%, ${this.ringColor} 100%)`,
        //transform: orientationToTransform[this.orientation],
        //boxShadow$px: [0, 0, 1 * this.scale, 2 * this.scale, this.ringColor],
        backgroundColor: this.ringColor
      },
      portal$c: {
        position: 'absolute',
        left$px: 0,
        borderRadius$px: PORTAL_WIDTH * this.scale,
        width$px: PORTAL_WIDTH * this.scale,
        height$px: PORTAL_WIDTH * this.scale,
        //background: `radial-gradient(circle, black 0%, black 50%, ${this.ringColor} 100%)`,
        transform: orientationToTransform[this.orientation],
        boxShadow$px: [0, 0, 1 * this.scale, 2 * this.scale, this.ringColor],
        backgroundColor: this.ringColor
      },
      inner$c: {
        margin$px: orientationToMargin[this.orientation].map(n => n * this.scale),
        borderRadius$px: PORTAL_WIDTH * this.scale,
        width$px: PORTAL_WIDTH * this.scale,
        height$px: PORTAL_WIDTH * this.scale,
        background: `radial-gradient(circle, black 0%, black 50%, ${this.ringColor} 100%)`,
      },
      inset$c: {
        padding$px: 0,
        margin$px: 0,
        width$px: PORTAL_WIDTH * this.scale,
        height$px: PORTAL_WIDTH * this.scale,
        boxShadow$px: [0, 0, 1 * this.scale, 2 * this.scale, this.ringColor, 'inset'],
        borderRadius$px: PORTAL_WIDTH * this.scale,
      },
    }
  }

  render() {
    return jst.$div({cn: '-portal --portal'},
        jst.$div({cn: '-inner'},
          jst.$div({cn: '-inset'})
        )
      
    );
  }

  resize(scale, offsetX, offsetY) {
    this.scale = scale;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
  }

  addMatterBlocks() {
    this.parent.add(this.x, this.y, 3, 3, {isStatic: true})
  }

}