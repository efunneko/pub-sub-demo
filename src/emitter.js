// emitter.js - Event emitter

import {jst}                from 'jayesstee';
import {ClickableRange}     from './widgets';
import {EventColors}        from './event';

const EMITTER_WIDTH         = 20;
const EMITTER_HEIGHT        = 20;

export class Emitter extends jst.Component {
  constructor(world, scale, offsetX, offsetY, opts) {
    super();

    this.world = world;

    this.id   = opts.id;
    this.text = opts.text;

    this.x    = opts.x || 50;
    this.y    = opts.y || 50;

    this.cx = this.x + EMITTER_WIDTH/2;
    this.cy = this.y + EMITTER_HEIGHT/2;

    this.rotationRad = opts.rotation || 0;

    this.eventWidth  = 12;
    this.eventSeq    = 0;

    this.color       = opts.color || 'green';

    this.showControls = false;

    this.resize(scale, offsetX, offsetY);

    this.addMatterBlocks();

    
    this.size  = 5;
    this.rate  = 2;
    this.speed = 3;

    this.isOn  = false;

    this.speedRange = new ClickableRange({width: EMITTER_WIDTH * 0.55 * this.scale, height: EMITTER_HEIGHT * 0.07 * this.scale, value: this.speed, events: {change: val => {this.speed = val; this.world.save()}}});
    this.sizeRange  = new ClickableRange({width: EMITTER_WIDTH * 0.55 * this.scale, height: EMITTER_HEIGHT * 0.07 * this.scale, value: this.size,  events: {change: val => {this.size  = val; this.world.save()}}});
    this.freqRange  = new ClickableRange({width: EMITTER_WIDTH * 0.55 * this.scale, height: EMITTER_HEIGHT * 0.07 * this.scale, value: this.rate,  events: {change: val => {this.rate  = val; this.world.save();}}});

  }

  cssInstance() {
    return {
      emitter$c: {
        top$px: this.y * this.scale + this.offsetY,
        left$px: this.x * this.scale + this.offsetX,
        transform: jst.rotate(jst.rad(this.rotationRad)),
        // boxShadow$px: [0, 0, 1 * this.scale, 2 * this.scale, this.ringColor],
        backgroundColor: this.ringColor,
      },
      panel$c: {
        background: this.color == 'random' ? 'linear-gradient(117deg, rgba(200,0,0,1) 0%, rgba(215,181,116,1) 19%, rgba(224,226,158,1) 39%, rgba(132,208,130,1) 55%, rgba(74,161,151,1) 75%, rgba(1,0,200,1) 100%)' : EventColors[this.color],
      }
    }
  }

  cssLocal() {
    return {
      emitter$c: {
        position: 'fixed',
        left$px: 0,
        width$px: EMITTER_WIDTH * this.scale,
        height$px: EMITTER_HEIGHT * this.scale,
        borderRadius$px: 3 * this.scale,
        background: '#888',
        zIndex: 2
      },
      back$c: {
        position: 'absolute',
        left$px: -EMITTER_WIDTH*0.1 * this.scale,
        top$px: EMITTER_WIDTH*0.1 * this.scale,
        background: 'linear-gradient(0deg, rgba(135,135,135,1) 0%, rgba(55,55,55,1) 25%, rgba(45,45,45,1) 75%, rgba(180,180,180,1) 100%)',
        width$px: EMITTER_WIDTH*0.1 * this.scale,
        height$px: EMITTER_HEIGHT*0.8 * this.scale,
      },
      barrel$c: {
        position: 'absolute',
        right$px: -EMITTER_WIDTH*0.2 * this.scale,
        top$px: EMITTER_WIDTH*0.1 * this.scale,
        background: 'linear-gradient(0deg, rgba(135,135,135,1) 0%, rgba(55,55,55,1) 25%, rgba(45,45,45,1) 75%, rgba(180,180,180,1) 100%)',
        width$px: EMITTER_WIDTH*0.2 * this.scale,
        height$px: EMITTER_HEIGHT*0.8 * this.scale,
      },
      front$c: {
        position: 'absolute',
        right$px: -EMITTER_WIDTH*0.3 * this.scale,
        top$px: EMITTER_WIDTH*0 * this.scale,
        background: 'linear-gradient(0deg, rgba(135,135,135,1) 0%, rgba(55,55,55,1) 25%, rgba(45,45,45,1) 75%, rgba(180,180,180,1) 100%)',
        width$px: EMITTER_WIDTH*0.1 * this.scale,
        height$px: EMITTER_HEIGHT * this.scale,
        border$px: [1, 'solid', '#555']
      },
      rotateKnob$c: {
        position: 'absolute',
        top$px: (EMITTER_WIDTH/2 - EMITTER_WIDTH * 0.1) * this.scale,
        left$px: - (EMITTER_WIDTH/2 - EMITTER_WIDTH/20) * this.scale,
        width$px: EMITTER_WIDTH * 0.09 * this.scale,
        height$px: EMITTER_WIDTH * 0.2 * this.scale,
        borderRadius$px: EMITTER_WIDTH * 0.045 * this.scale,
        lineHeight$px: EMITTER_WIDTH * 0.22 * this.scale,
        fontSize$px: EMITTER_WIDTH * 0.13 * this.scale,
        verticalAlign: 'middle',
        textAlign: 'center',
        border$px: [1, 'solid', 'black'],
        backgroundColor: 'white',
        zIndex: 1
      },
      rotateKnob$c$hover: {
        cursor: "grab",
      },
      gripKnob$c: {
        top$px: (EMITTER_WIDTH/2 - EMITTER_WIDTH * 0.065) * this.scale,
        left$px: -EMITTER_WIDTH * 0.2 * this.scale,
      },
      gripKnob$c$hover: {
        cursor: "move"
      },
      knob$c: {
        position: 'absolute',
        width$px: EMITTER_WIDTH * 0.13 * this.scale,
        height$px: EMITTER_WIDTH * 0.13 * this.scale,
        lineHeight$px: EMITTER_WIDTH * 0.13 * this.scale,
        verticalAlign: 'middle',
        textAlign: 'center',
        borderRadius$px: '50%',
        backgroundColor: 'white',
        border$px: [1, 'solid', 'black']
      },
      knob$c$hover: {
        backgroundColor: "#ff8",
      },
      panel$c: {
        margin$px: EMITTER_WIDTH*0.05 * this.scale, 
        padding$px: EMITTER_WIDTH*0.05 * this.scale, 
        width$px: EMITTER_WIDTH*0.80 * this.scale,
        height$px: EMITTER_HEIGHT*0.80 * this.scale,
        boxShadow$px: [0, 0, 2, jst.rgba(0,0,0,0.3), 'inset'],
        borderRadius$px: 2 * this.scale,
        //background: 'rgb(0,200,149)',
        //background: 'linear-gradient(117deg, rgba(0,200,149,1) 0%, rgba(116,215,190,1) 11%, rgba(158,226,208,1) 13%, rgba(130,208,188,1) 17%, rgba(116,215,190,1) 19%, rgba(158,226,208,1) 23%, rgba(130,208,188,1) 25%, rgba(0,200,149,1) 100%)',
        //background: 'linear-gradient(117deg, rgba(187,181,181,1) 0%, rgba(213,213,213,1) 11%, rgba(238,230,230,1) 13%, rgba(203,203,203,1) 15%, rgba(180,180,180,1) 100%)'
      },
      button$c: {
        display: 'inline-block',
        fontSize$px: EMITTER_WIDTH * 0.15 * this.scale,
        padding$px: [0.5 * this.scale, 0.5 * this.scale, 0 * this.scale, 0.5 * this.scale],
        border$px: [1, "solid", "#bbb"],
        borderRadius$px: 1 * this.scale,
        backgroundColor: 'white'
      },
      buttonGroup$c: {
        display: 'inline-block',
        //backgroundColor: 'white',
        marginBottom$px: EMITTER_HEIGHT*0.01 * this.scale,
        width$px: EMITTER_HEIGHT*0.36 * this.scale,
        height$px: EMITTER_HEIGHT*0.1 * this.scale,
      },
      buttonDoubleRow$c: {
        display: 'inline-block',
        backgroundColor: 'white',
        marginLeft$px: EMITTER_HEIGHT*0.01 * this.scale,
        paddingTop$px: EMITTER_HEIGHT*0.01 * this.scale,
        width$px: EMITTER_HEIGHT*0.37 * this.scale,
        height$px: EMITTER_HEIGHT*0.22 * this.scale,
        borderRadius$px: EMITTER_HEIGHT*0.02 * this.scale,
        verticalAlign: 'bottom',
        lineHeight$px: 0
      },
      colorButton$c: {
        display: 'inline-block',
        marginLeft$px: EMITTER_HEIGHT*0.01 * this.scale,
        width$px: EMITTER_HEIGHT*0.08 * this.scale,
        height$px: EMITTER_HEIGHT*0.1 * this.scale,
        opacity: 0.6,
      },
      randButton$c: {
        display: 'inline-block',
        //background: 'rgb(200,0,0)';
        background: 'linear-gradient(117deg, rgba(200,0,0,1) 0%, rgba(215,181,116,1) 19%, rgba(224,226,158,1) 39%, rgba(132,208,130,1) 55%, rgba(74,161,151,1) 75%, rgba(1,0,200,1) 100%)'
      },
      colorButton$c$hover: {
        opacity: 1
      },
      selected$c: {
        opacity: 1
      },
      speed$c: {
        fontSize$px: EMITTER_WIDTH * 0.15 * this.scale,
        lineHeight$px: EMITTER_WIDTH * 0.15 * this.scale
      },
      rangeButton$c: {
        display: 'inline-block',
        border$px: [EMITTER_WIDTH * 0.02, 'solid', '#777']
      },
      rangeSelect$c: {
        verticalAlign: 'middle',
        lineHeight$px: 0,
        marginTop$px: 0.7 * this.scale
      },
      rangeIcon$c: {
        verticalAlign: 'middle',
        marginLeft$px: EMITTER_WIDTH * 0.03 * this.scale,
        width$px: EMITTER_WIDTH * 0.15 * this.scale,
        fontSize$px: EMITTER_WIDTH * 0.1 * this.scale,
      }
    }
  }

  render() {
    return jst.$div({cn: '-emitter --emitter', events: {click: e => this.select(e)}},
        jst.$div({cn: '-back --back'}),
        jst.$div({cn: '-mid --mid'}),
        jst.$div({cn: '-barrel --barrel'}),
        jst.$div({cn: '-front --front'}),
        jst.$div({cn: '-panel --panel'},
          jst.$div({cn: '-button', events: {click: e => this.toggle(e)}}, jst.$i({cn: `fas fa-${this.isOn ? 'pause' : 'play'}`})),
          jst.$div({cn: '-button', events: {click: e => this.fire(e)}}, jst.$i({cn: 'fas fa-step-forward'})),
          jst.$div({cn: '-buttonDoubleRow'},
           jst.$div({cn: '-buttonGroup'},
             Object.keys(EventColors).map(col => jst.$div({cn: `-colorButton ${col == this.color ? '-selected' : ''}`, style: `background-color: ${EventColors[col]}`, events: {click: e => this.setColor(col)}})),
           ),
           jst.$div({cn: '-buttonGroup -randButton',    events: {click: e => this.setColor('random')}},
             jst.$div({cn: '-randButton',    events: {click: e => this.setColor('random')}}),
           ),
          ),
          jst.$div({cn: '-rangeSelect'},
            jst.$i({cn: '-rangeIcon fas fa-angle-double-right', title: "Speed"}),
            this.speedRange
          ),
          jst.$div({cn: '-rangeSelect'},
            jst.$i({cn: '-rangeIcon fas fa-expand-arrows-alt', title: "Size"}),
            this.sizeRange
          ),
          jst.$div({cn: '-rangeSelect'},
            jst.$i({cn: '-rangeIcon fas fa-history', title: "Event Rate"}),
            this.freqRange
          ),
        ),
        jst.if(this.showControls) &&
          jst.$div({cn: '-controls --controls'},
            jst.$div({cn: '-gripKnob -knob', events: {pointerdown: e => this.gripDown(e)}}),
            jst.$div({cn: '-rotateKnob', events: {pointerdown: e => this.rotateDown(e)}}, jst.$i({cn: 'fas fa-arrows-alt-v'}))
          )
    );
  }

  resize(scale, offsetX, offsetY) {
    this.scale = scale;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
  }

  toggle(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.isOn) {
      this.isOn = false;
    }
    else {
      this.isOn = true;
      this.fire(undefined, true);
    }

    this.refresh();
  }


  addMatterBlocks() {
    this.matterBlocks = [];
    let opts = {
      isStatic: true, 
      cornerRadius: 5, 
      rotate: this.rotationRad, 
      noRender: true,
    };
    this.matterBlocks = [];

    // Two side blocks to prevent things going through the edges of the portal
    this.matterBlocks.push(this.world.add(...this.rotateCoords(this.x + EMITTER_WIDTH/2, this.y+1), EMITTER_WIDTH, 2,  opts));
    this.matterBlocks.push(this.world.add(...this.rotateCoords(this.x + EMITTER_WIDTH/2, this.y+EMITTER_HEIGHT-1), EMITTER_WIDTH, 2,  opts));
    this.matterBlocks.push(this.world.add(...this.rotateCoords(this.x - EMITTER_WIDTH * 0.05, this.y+EMITTER_HEIGHT/2), EMITTER_WIDTH*0.1, EMITTER_HEIGHT*0.8,  opts));
    this.matterBlocks.push(this.world.add(...this.rotateCoords(this.x + EMITTER_WIDTH * 1.1, this.y+EMITTER_HEIGHT*0.1 + 1), EMITTER_WIDTH*0.2, 2,  opts));
    this.matterBlocks.push(this.world.add(...this.rotateCoords(this.x + EMITTER_WIDTH * 1.1, this.y+EMITTER_HEIGHT*0.9 - 1), EMITTER_WIDTH*0.2, 2,  opts));
  }

  fire(e, repeat) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    let v = this.rotateCoords(2 * this.speed, 0, false, [0,0]);
    this.eventSeq++;
    let color = this.color;
    if (color == 'random') {
      color = "green";
      if (this.eventSeq.toString().match(/^(10|11|16|23|27|39)$/)) {
        color = "orange";
      }
    }
    let opts = {
      rotate: this.rotationRad, 
      friction: 0, 
      text: this.eventSeq,
      eventId: this.eventSeq,
      velocity: {x: v[0], y: v[1]},
      color: color,
      guid: (100000000*Math.random()).toFixed(0) + '-' + (100000000*Math.random()).toFixed(0)
    };
    let size = this.eventWidth/2 + this.eventWidth * this.size/20;
    this.world.addEvent(...this.rotateCoords(this.x + EMITTER_WIDTH*1.3 - this.eventWidth/2, this.y + EMITTER_HEIGHT/2), size, size, opts);

    if (repeat && this.isOn) {
      this.world.setAnimTimeout(() => this.fire(undefined, true), (10 - this.rate) * 6);
    }

  }

  setColor(col) {
    console.log("Setting color:", col)
    this.color = col;
    this.refresh();
    this.world.save();
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
    this.rotationRad += delta;
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

    this.cx = this.x + EMITTER_WIDTH/2;
    this.cy = this.y + EMITTER_HEIGHT/2;

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
    this.world.save();
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
    this.world.save();
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
      type: 'emitter',
      x: this.x,
      y: this.y,
      id: this.id,
      rotation: this.rotationRad,
      size: this.size,
      rate: this.rate,
      speed: this.speed,
      color: this.color
    };
  }

}