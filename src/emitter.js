// emitter.js - Event emitter

import {jst}                from 'jayesstee';
import {ClickableRange}     from './widgets';
import {EventColors}        from './event';
import {Entity}             from './entity'

const EMITTER_SIZE          = 65;

export class Emitter extends Entity {
  constructor(world, scale, offsetX, offsetY, opts) {
    super(world, scale, offsetX, offsetY);

    this.world        = world;
       
    this.id           = opts.id;
    this.text         = opts.text;
        
    this.x            = opts.x || 50;
    this.y            = opts.y || 50;

    this.cx           = this.x + EMITTER_SIZE/2;
    this.cy           = this.y + EMITTER_SIZE/2;

    this.rotationRad  = opts.rotation || 0;

    this.eventWidth   = 12;
    this.eventSeq     = 0;

    this.showControls = false;

    this.color        = opts.color || 'green';
    this.size         = 5;
    this.rate         = 2;
    this.speed        = 3;   
    this.isOn         = false;

    this.addMatterBlocks();

    this.resize(scale, offsetX, offsetY);
    
    this.speedRange = new ClickableRange({width: this.ss(0.55), height: this.ss(0.12), value: this.speed, events: {change: val => {this.speed = val; this.world.save()}}});
    this.sizeRange  = new ClickableRange({width: this.ss(0.55), height: this.ss(0.12), value: this.size,  events: {change: val => {this.size  = val; this.world.save()}}});
    this.freqRange  = new ClickableRange({width: this.ss(0.55), height: this.ss(0.12), value: this.rate,  events: {change: val => {this.rate  = val; this.world.save();}}});

  }

  // Specific CSS for each emitter instance
  cssInstance() {
    return {
      emitter$c: {
        top$px:  this.world.scaleAndMoveY(this.y),
        left$px: this.world.scaleAndMoveX(this.x),
        transform: jst.rotate(jst.rad(this.rotationRad)),
        backgroundColor: this.ringColor,
      },
      panel$c: {
        background: this.color == 'random' ? 'linear-gradient(117deg, rgba(200,0,0,1) 0%, rgba(215,181,116,1) 19%, rgba(224,226,158,1) 39%, rgba(132,208,130,1) 55%, rgba(74,161,151,1) 75%, rgba(1,0,200,1) 100%)' : EventColors[this.color],
      }
    }
  }

  // Shared CSS for all emitters
  cssLocal() {
    return {
      emitter$c: {
        position: 'fixed',
        left$px: 0,
        width$px: this.ss(1),
        height$px: this.ss(1),
        borderRadius$px: this.ss(3/20),
        background: '#888',
        zIndex: 2
      },
      back$c: {
        position: 'absolute',
        left: '-10%', 
        top: '10%', 
        background: 'linear-gradient(0deg, rgba(135,135,135,1) 0%, rgba(55,55,55,1) 25%, rgba(45,45,45,1) 75%, rgba(180,180,180,1) 100%)',
        width: '10%', 
        height: '80%', 
      },
      barrel$c: {
        position: 'absolute',
        right$px: '-20%', 
        top$px: '10%', 
        background: 'linear-gradient(0deg, rgba(135,135,135,1) 0%, rgba(55,55,55,1) 25%, rgba(45,45,45,1) 75%, rgba(180,180,180,1) 100%)',
        width$px: '20%', 
        height$px: '80%',
      },
      front$c: {
        position: 'absolute',
        right$px: '-30%',
        top$px: 0,
        background: 'linear-gradient(0deg, rgba(135,135,135,1) 0%, rgba(55,55,55,1) 25%, rgba(45,45,45,1) 75%, rgba(180,180,180,1) 100%)',
        width$px: '10%', 
        height$px: '100%',
        border$px: ['1%', 'solid', '#555']
      },
      rotateKnob$c: {
        position: 'absolute',
        top$px: '40%',
        left$px: '-45%', 
        width$px: '9%', 
        height$px: '20%',
        borderRadius$px: this.ss(0.045),
        lineHeight$px: this.ss(0.22),
        fontSize$px: this.ss(0.13),
        verticalAlign: 'middle',
        textAlign: 'center',
        border$px: [this.ss(0.01), 'solid', 'black'],
        backgroundColor: 'white',
        zIndex: 1
      },
      rotateKnob$c$hover: {
        cursor: "grab",
      },
      gripKnob$c: {
        top$px: '43.5%',
        left$px: '-20%', 
      },
      gripKnob$c$hover: {
        cursor: "move"
      },
      knob$c: {
        position: 'absolute',
        width$px: '13%', 
        height$px: '13%',
        lineHeight$px: this.ss(0.13),
        verticalAlign: 'middle',
        textAlign: 'center',
        borderRadius$px: '50%',
        backgroundColor: 'white',
        border$px: [this.ss(0.01), 'solid', 'black']
      },
      knob$c$hover: {
        backgroundColor: "#ff8",
      },
      panel$c: {
        margin$px: '5%', 
        padding$px: '5%',
        width$px: '80%', 
        height$px: '80%',
        boxShadow$px: [0, 0, this.ss(0.04), jst.rgba(0,0,0,0.8), 'inset'],
        borderRadius$px: this.ss(0.1),
        lineHeight$px: 0
      },
      topButtons$c: {
        whiteSpace: 'nowrap'
      },
      button$c: {
        display: 'inline-block',
        fontSize$px: this.ss(0.15),
        padding$px: [0.5 * this.scale, 0.5 * this.scale, 0 * this.scale, 0.5 * this.scale],
        border$px: [this.ss(0.01), "solid", "#bbb"],
        borderRadius$px: this.ss(0.05),
        backgroundColor: 'white'
      },
      buttonGroup$c: {
        display: 'inline-block',
        marginBottom$px: this.ss(0.01),
        width$px: this.ss(0.36),
        height$px: this.ss(0.1),
      },
      buttonDoubleRow$c: {
        display: 'inline-block',
        backgroundColor: 'white',
        whiteSpace: 'normal',
        marginLeft$px: this.ss(0.01),
        paddingTop$px: this.ss(0.01),
        width$px: this.ss(0.37),
        height$px: this.ss(0.22),
        borderRadius$px: this.ss(0.02),
        verticalAlign: 'bottom',
        lineHeight$px: 0
      },
      colorButton$c: {
        display: 'inline-block',
        marginLeft$px: this.ss(0.01),
        width$px: this.ss(0.08),
        height$px: this.ss(0.1),
        opacity: 0.6,
      },
      randButton$c: {
        display: 'inline-block',
        marginLeft$px: this.ss(0.01),
        width$px: this.ss(0.35),
        background: 'linear-gradient(117deg, rgba(200,0,0,1) 0%, rgba(215,181,116,1) 19%, rgba(224,226,158,1) 39%, rgba(132,208,130,1) 55%, rgba(74,161,151,1) 75%, rgba(1,0,200,1) 100%)'
      },
      colorButton$c$hover: {
        opacity: 1
      },
      selected$c: {
        opacity: 1
      },
      speed$c: {
        fontSize$px: this.ss(0.15),
        lineHeight$px: this.ss(0.15)
      },
      rangeButton$c: {
        display: 'inline-block',
        border$px: [this.ss(0.02), 'solid', '#777']
      },
      rangeSelect$c: {
        position: 'absolute',
        verticalAlign: 'middle',
        lineHeight$px: 0,
        marginTop$px: this.ss(0.7/20)
      },
      rangeIcon$c: {
        verticalAlign: 'middle',
        marginLeft$px: this.ss(0.03),
        width$px: this.ss(0.15),
        fontSize$px: this.ss(0.1),
      },
      rangeSize$c: {
        top: '35%',
        left: '10%'
      },
      rangeSpeed$c: {
        top: '53%',
        left: '10%'
      },
      rangeRate$c: {
        top: '71%',
        left: '10%'
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
          jst.$div({cn: '-topButtons'},
            jst.$div({cn: '-button', events: {click: e => this.toggle(e)}}, jst.$i({cn: `fas fa-${this.isOn ? 'pause' : 'play'}`})),
            jst.$div({cn: '-button', events: {click: e => this.fire(e)}}, jst.$i({cn: 'fas fa-step-forward'})),
            jst.$div({cn: '-buttonDoubleRow'},
             jst.$div({cn: '-buttonGroup'},
               Object.keys(EventColors).map(col => jst.$div({
                 cn: `-colorButton ${col == this.color ? '-selected' : ''}`, 
                 style: `background-color: ${EventColors[col]}`, 
                 events: {click: e => this.setColor(col)}
                })),
             ),
             jst.$div({cn: '-buttonGroup -randButton', events: {click: e => this.setColor('random')}},
               jst.$div({cn: '-randButton', events: {click: e => this.setColor('random')}}),
             ),
            ),
          ),
          jst.$div({cn: '-rangeSelect -rangeSpeed'},
            jst.$i({cn: '-rangeIcon fas fa-angle-double-right', title: "Speed"}),
            this.speedRange
          ),
          jst.$div({cn: '-rangeSelect -rangeSize'},
            jst.$i({cn: '-rangeIcon fas fa-expand-arrows-alt', title: "Size"}),
            this.sizeRange
          ),
          jst.$div({cn: '-rangeSelect -rangeRate'},
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
    super.resize(scale, offsetX, offsetY);
    if (this.speedRange) {
      this.speedRange.resize(this.ss(0.55), this.ss(0.12));
      this.sizeRange.resize(this.ss(0.55), this.ss(0.12));
      this.freqRange.resize(this.ss(0.55), this.ss(0.12));
    }
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

  remove() {
    this.matterBlocks.forEach(block => this.world.remove(block));
  }

  // Scale Size
  ss(size) {
    return EMITTER_SIZE * this.scale * size;
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

    // Add a bunch of blocks to give the emitter a structure in the physics engine
    this.matterBlocks.push(this.world.add(...this.rotateCoords(this.x + EMITTER_SIZE * 0.5,  this.y+1),                    EMITTER_SIZE, 2,  opts));
    this.matterBlocks.push(this.world.add(...this.rotateCoords(this.x + EMITTER_SIZE * 0.5,  this.y+EMITTER_SIZE-1),       EMITTER_SIZE, 2,  opts));
    this.matterBlocks.push(this.world.add(...this.rotateCoords(this.x - EMITTER_SIZE * 0.05, this.y+EMITTER_SIZE/2),       EMITTER_SIZE*0.1, EMITTER_SIZE*0.8,  opts));
    this.matterBlocks.push(this.world.add(...this.rotateCoords(this.x + EMITTER_SIZE * 1.1,  this.y+EMITTER_SIZE*0.1 + 1), EMITTER_SIZE*0.2, 2,  opts));
    this.matterBlocks.push(this.world.add(...this.rotateCoords(this.x + EMITTER_SIZE * 1.1,  this.y+EMITTER_SIZE*0.9 - 1), EMITTER_SIZE*0.2, 2,  opts));
  }

  // Send an event into the world
  fire(e, repeat) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    let v = this.rotateCoords(2 * this.speed, 0, false, [0,0]);
    this.eventSeq++;
    let color = this.color;
    if (color == 'random') {
      color = (['red', 'blue', 'orange', 'green'])[Math.floor(Math.random()*4)];
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
    let size = this.eventWidth/2 + this.eventWidth * this.size/2;
    this.world.addEvent(...this.rotateCoords(this.x + EMITTER_SIZE*1.3 - this.eventWidth/2, this.y + EMITTER_SIZE*0.5), size, size, opts);

    if (repeat && this.isOn) {
      this.world.setAnimTimeout(() => this.fire(undefined, true), (10 - this.rate) * 6);
    }

  }

  setColor(col) {
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

    this.cx = this.x + EMITTER_SIZE/2;
    this.cy = this.y + EMITTER_SIZE/2;

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
    let dx = this.world.reverseScale(e.clientX - this.clickStart.ex);
    let dy = this.world.reverseScale(e.clientY - this.clickStart.ey);
    this.moveTo(this.clickStart.x + dx, this.clickStart.y + dy, false);
  }

  gripUp(e) {
    this.controlUp   = null;
    this.controlMove = null;
    let dx = this.world.reverseScale(e.clientX - this.clickStart.ex);
    let dy = this.world.reverseScale(e.clientY - this.clickStart.ey);
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
    let dx = this.world.scaleAndMoveX(this.cx) - e.clientX;
    let dy = this.world.scaleAndMoveY(this.cy) - e.clientY;
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