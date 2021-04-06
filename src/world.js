// world.js - represent the physics world

import {jst}                   from "jayesstee";
import {Matter}                from "./matter.js";
import {Portal}                from "./portal.js";
import {FixedBody}             from "./fixed-body.js";
import {Emitter}               from "./emitter.js";
import {Event}                 from './event';
import {Broker}                from "./broker";
import {Messaging}             from './messaging';
import {ToolBar}               from './tool-bar';

const MOUSE_WHEEL_SCALE_FACTOR = 1.05;

export class World extends jst.Component {
  constructor(app) {
    super();

    this.objects        = [];

    this.resize();

    this.app            = app;
    this.animTicks      = 0;
    this.timeoutSeq     = 0;
    this.timeouts       = {};

    this.scale          = 1;
    this.offsetX = (window.innerWidth  - 100 * this.scale)/2;
    this.offsetY = (window.innerHeight - 100 * this.scale)/2;
    this.offsetX = 0;
    this.offsetY = 400;


    let state = this.load();
    if (state) {
      this.messagingOpts = state.messagingOpts;      
    }
    else {
      this.messagingOpts = {
        host: 'ws://192.168.134.44:8000',
        username: 'default',
        password: 'default'
      };
    }
    this.messagingOpts = {
      host: 'ws://192.168.134.37:8000',
      username: 'default',
      password: 'default'
    };

    this.toolBar = new ToolBar(this, this.scale);
    this.matter  = new Matter(this, {events: {tick: () => this.animationTick()}});

    this.objects = [];

    if (state) {
      state.objects.forEach(obj => {
        if (obj.type == 'portal') {
          this.objects.push(new Portal(this, this.scale, this.offsetX, this.offsetY, obj));
        }
        else if (obj.type == 'fixed-body') {
          this.objects.push(new FixedBody(this, this.scale, this.offsetX, this.offsetY, obj));
        }
        else if (obj.type == 'emitter') {
          this.objects.push(new Emitter(this, this.scale, this.offsetX, this.offsetY, obj));
        }
      })
    }
    else {
      this.objects.push(new Portal(this, this.scale, this.offsetX, this.offsetY,
        {color: "orange", x: 30, y: 7, id: 1}));
      this.objects.push(new Portal(this, this.scale, this.offsetX, this.offsetY,
        {color: "blue", x: 20, y: 50, rotation: 50, id: 1}));
      this.objects.push(new FixedBody(this, this.scale, this.offsetX, this.offsetY,
        {x: 0, y: 10, width: 100, height: 10, rotation: 0})); 
      this.objects.push(new Emitter(this, this.scale, this.offsetX, this.offsetY,
        {x: 50, y: 50, text: "HI"})); 
    }
    this.events = {};

    this.objects.push(new Broker(this, this.scale, this.offsetX, this.offsetY,
      {x: 50, y: 50, text: "HI"})); 

    document.addEventListener("keydown", e => this.keyDown(e));

  }


  cssLocal() {
    return {
      main$c: {
        position: 'relative',
        height: '100%',
        width:  '100%',
      }
    };
  }

  render() {
    return jst.$div({class: '-main', 
                     events: {
                       pointermove: e => this.pointerMove(e), 
                       pointerup:   e => this.pointerUp(e),
                       pointerdown: e => this.pointerDown(e),
                       click:       e => this.click(e),
                       keydown:     e => this.keyDown(e),
                       DOMMouseScroll: (e) => this.mouseWheel(e),
                       wheel:          (e) => this.mouseWheel(e),
                      }
                    },
      this.toolBar,
      //this.matter,
      this.objects,
      Object.values(this.events)
    );
  }

  resize() {
    /*
    this.scale   = Math.min(window.innerWidth, window.innerHeight)/120;
    this.scale   = 4;
    this.offsetX = (window.innerWidth  - 100 * this.scale)/2;
    this.offsetY = (window.innerHeight - 100 * this.scale)/2;
    */
    this.objects.forEach(obj => {
      if (obj.resize) {
        obj.resize(this.scale, this.offsetX, this.offsetY);
      }
      this.refresh();
    });
    if (this.events) {
      Object.values(this.events).forEach(event => event.resize(this.scale, this.offsetX, this.offsetY));
    }

  }

  createConnection(opts) {
    let combinedOpts = Object.assign(this.messagingOpts, opts);
    let messaging    = new Messaging(combinedOpts);
    messaging.connect();
    return messaging;
  }

  addItem(type) {
    if (type == 'portal') {
      this.objects.push(new Portal(this, this.scale, this.offsetX, this.offsetY, {x: 10, y: 10}));
    }
    else if (type == 'fixed-body') {
      this.objects.push(new FixedBody(this, this.scale, this.offsetX, this.offsetY, {x: 100, y: 100, width: 100, height: 100}));
    }
    else if (type == 'emitter') {
      this.objects.push(new Emitter(this, this.scale, this.offsetX, this.offsetY, {x: 10, y: 10}));
    }
    else if (type == 'text') {
      this.objects.push(new TextBlock(this, this.scale, this.offsetX, this.offsetY, {x: 10, y: 10, text: 'Change me'}));
    }
    this.refresh();
}

  add(x, y, w, h, opts) {
    return this.matter.addElements([[x,y,w,h,opts]]);
    return (this.matter.addElements([
      this.adjust(x, y, w, h).concat(opts),
    ]))[0];
  }

  addEvent(x, y, w, h, opts) {
    if (this.events[opts.guid]) {
      // Don't allow dups - TODO - allow config of this
      return;
    }

    opts.cornerRadius = 5;
    let event      = new Event(this, this.scale, this.offsetX, this.offsetY, Object.assign({x: x, y: y, width: w, height: h}, opts));
    this.events[opts.guid] = event;
    this.refresh();
  }

  removeEvent(event) {
    event.remove();
    delete(this.events[event.guid]);
    this.refresh();
  }

  removeAllEvents() {
    Object.values(this.events).forEach(event => this.removeEvent(event));

    // Also clear out all the queued events in the portals
    this.objects.forEach(obj => {
      if (obj.type == "portal") {
        obj.clearEventQueue();
      }
    });

    this.refresh();

  }

  getEvent(eventGuid) {
    return this.events[eventGuid];
  }

  remove(block) {
    this.matter.remove(block);
  }

  // Return true iff removed
  removeEntity(entity) {
    if (!entity.isDeleteActive ||
      entity.isDeleteActive()) {

      if (entity.remove) {
        entity.remove();
      }

      let idx = this.objects.indexOf(entity);
        if (idx >= 0) {
        this.objects.splice(idx, 1);
      }
      this.refresh();
      this.save();
      return true;
    }
    return false;
  } 

  removeSelectedEntity() {
    if (this.selectedEntity) {
      if (this.removeEntity(this.selectedEntity)) {
        delete(this.selectedEntity);
      }
    }
  }

  hitGround(targetBody, otherBody) {
    this.matter.remove(otherBody);
  }

  entitySelected(entity) {
    if (this.selectedEntity) {
      this.selectedEntity.unselect();
    }

    this.selectedEntity = entity;
  }
 
  setAnimTimeout(func, ticks) {
    this.timeoutSeq++;
    this.timeouts[this.timeoutSeq] = {
      id: this.timeoutSeq,
      ticks: ticks,
      func: func,
      last: this.animTicks
    };
    return this.timeoutSeq;
  }

  clearAnimTimeout(id) {
    if (this.timeouts[id]) {
      delete(this.timeouts[id]);
    }
  }

  save() {
    let data = {
      objects: [],
      messagingOpts: this.messagingOpts
    };
    this.objects.forEach(obj => {
      data.objects.push(obj.serialize());
    });

    if (window.localStorage) {
      window.localStorage.setItem('state', JSON.stringify(data));
    }
  }

  load() {
    if (window.localStorage) {
      let str = window.localStorage.getItem('state');
      if (str) {
        try {
          let state = JSON.parse(str);
          return state;
        }
        catch(e) {
          console.log("Failed to load state from localstorage:", e)
        }
      }
    }
  }


  // Event handling

  pointerMove(e) {
    //e.preventDefault();
    //e.stopPropagation();
    if (this.selectedEntity && this.selectedEntity.pointerMove) {
      this.selectedEntity.pointerMove(e);
    }
    else {
      if (this.panning) {
        this.panState.dx = this.panState.clientX - e.clientX;
        this.panState.dy = this.panState.clientY - e.clientY;
        console.log("sched?", this.panState.scheduled)
        if (!this.panState.scheduled) {
          requestAnimationFrame(() => this.doPan());
        }
      }
    }
  }

  doPan() {
    this.panState.scheduled = false;
    this.offsetX            = this.panState.offsetX - this.panState.dx;
    this.offsetY            = this.panState.offsetY - this.panState.dy;
    this.resize();
  }

  pointerUp(e) {
    console.log("pointerup")
    e.preventDefault();
    e.stopPropagation();
    this.panning = false;
    if (this.selectedEntity && this.selectedEntity.pointerUp) {
      this.selectedEntity.pointerUp(e);
    }
  }

  pointerDown(e) {
    console.log("pointerdown")
    //e.preventDefault();
    //e.stopPropagation();
    if (this.selectedEntity) {
      this.selectedEntity.unselect();
      this.selectedEntity = null;
    }
      if (1 || e.ctrlKey) {
        this.panning = true;
        this.panState = {
          clientX:   e.clientX,
          clientY:   e.clientY,
          offsetX:   this.offsetX,
          offsetY:   this.offsetY,
          scheduled: false,
          dx:        0,
          dy:        0
        }
      }
    }

  click(e) {
    if (this.selectedEntity) {
      this.selectedEntity.unselect();
      this.selectedEntity = null;
    }
  }

  mouseWheel(e) {
    if (e.ctrlKey) {
      // Zoom
      console.log("offsets", this.offsetX, this.offsetY, this.scale)

      if (e.deltaY < 0) {
        this.scale *= MOUSE_WHEEL_SCALE_FACTOR;
        this.offsetX -= (e.offsetX * (MOUSE_WHEEL_SCALE_FACTOR - 1));
        this.offsetY -= (e.offsetY * (MOUSE_WHEEL_SCALE_FACTOR - 1));

      }
      else {
        this.scale /= MOUSE_WHEEL_SCALE_FACTOR;
        this.offsetX -= (e.offsetX * (1/MOUSE_WHEEL_SCALE_FACTOR - 1));
        this.offsetY -= (e.offsetY * (1/MOUSE_WHEEL_SCALE_FACTOR - 1));
      }

    }
    else if (e.shiftKey) {
      this.offsetX -= e.deltaY/5;
    }
    else {
      this.offsetY -= e.deltaY/5;
    }
    
    this.resize();
    e.preventDefault();
    e.stopPropagation();

  }
  
  keyDown(e) {
    if (this.selectedEntity && (e.key == 'Delete' || e.key == 'Backspace')) {
      // remove selected item
      this.removeSelectedEntity();
    }
  }

  animationTick() {
    this.animTicks++;
    Object.values(this.timeouts).forEach(timer => {
      if (this.animTicks - timer.last > timer.ticks) {
        timer.func();
        delete(this.timeouts[timer.id]);
      }
    })
  }

  // Basic Utils
  adjust(...items) {
    return [
      items[0] * this.scale + this.offsetX,
      items[1] * this.scale + this.offsetY,
      items[2] * this.scale,
      items[3] * this.scale,
    ];
  }

  scaleAndMove(coords) {
    return [
      coords[0] * this.scale + this.offsetX,
      coords[1] * this.scale + this.offsetY
    ];
  }

  scaleAndMoveX(x) {
    return x * this.scale + this.offsetX;
  }

  scaleAndMoveY(y) {
    return y * this.scale + this.offsetY;
  }

  scale(v) {
    return v * this.scale;
  }

  reverseScale(v) {
    return v / this.scale;
  }

  // For the accelerometer on mobile devices
  getAccel(){
    if (!DeviceMotionEvent || !DeviceMotionEvent.requestPermission) {
      return;
    }
    DeviceMotionEvent.requestPermission().then(response => {
      this.refresh();
      if (response == 'granted') {
        // Add a listener to get smartphone orientation 
        // in the alpha-beta-gamma axes (units in degrees)
        window.addEventListener('devicemotion',(event) => {
          // Expose each orientation angle in a more readable way
          let gy = event.accelerationIncludingGravity.y / -9.8;
          let gx = event.accelerationIncludingGravity.x / 9.8;
                
          this.matter.engine.world.gravity.x = gx;
          this.matter.engine.world.gravity.y = gy;
                
        });
      }
    });
  }

}