// world.js - represent the physics world

import {jst}                   from "jayesstee";
import {Matter}                from "./matter.js";
import {Portal}                from "./portal.js";
import {FixedBody}             from "./fixed-body.js";
import {Emitter}               from "./emitter.js";
import {Event}                 from './event';
import {Messaging}             from './messaging';
import {ToolBar}               from './tool-bar';

export class World extends jst.Component {
  constructor(app) {
    super();

    this.resize();

    this.app            = app;
    this.animTicks      = 0;
    this.timeoutSeq     = 0;
    this.timeouts       = {};

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
      host: 'ws://192.168.134.44:8000',
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
                       click:       e => this.pointerDown(e),
                       keydown:     e => this.keyDown(e)
                      }
                    },
      this.toolBar,
      this.matter,
      this.objects
    );
  }

  resize() {
    this.scale   = Math.min(window.innerWidth, window.innerHeight)/120;
    this.scale   = 4;
    this.offsetX = (window.innerWidth  - 100 * this.scale)/2;
    this.offsetY = (window.innerHeight - 100 * this.scale)/2;
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
      this.objects.push(new FixedBody(this, this.scale, this.offsetX, this.offsetY, {x: 10, y: 10, width: 10, height: 10}));
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
    return (this.matter.addElements([
      this.adjust(x, y, w, h).concat(opts),
    ]))[0];
  }

  addEvent(x, y, w, h, opts) {
    if (this.events[opts.guid]) {
      // Don't allow dups
      return;
    }

    opts.cornerRadius = 5;
    let event      = new Event(this, this.scale, this.offsetY, this.offsetY, Object.assign({x: x, y: y, width: w, height: h}, opts));
    let matterOpts = Object.assign({renderObj: event}, opts);

    this.events[opts.guid] = event;
    opts.restitution = 0.01;

    return (this.matter.addElements([
      this.adjust(x, y, w, h).concat(matterOpts),
    ]))[0];

  }

  removeEvent(event) {
    if (event.body) {
      this.remove(event.body);
    }
    delete(this.events[event.guid]);
  }

  removeAllEvents() {
    Object.values(this.events).forEach(event => this.removeEvent(event));

    // Also clear out all the queued events in the portals
    this.objects.forEach(obj => {
      if (obj.type == "portal") {
        obj.clearEventQueue();
      }
    });

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
  }

  pointerUp(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.selectedEntity && this.selectedEntity.pointerUp) {
      this.selectedEntity.pointerUp(e);
    }
  }

  pointerDown(e) {
    //e.preventDefault();
    //e.stopPropagation();
    if (this.selectedEntity) {
      this.selectedEntity.unselect();
    }
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