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

    this.app        = app;
    this.animTicks  = 0;
    this.timeoutSeq = 0;
    this.timeouts   = {};
    this.debugClientIds = {};

    let state = this.load();
    if (state) {
      console.log("state", state, state.messagingOpts)
      this.messagingOpts = state.messagingOpts;      
    }
    else {
      this.messagingOpts = {
        host: 'wss://mr1js1tiv10w2t.messaging.solace.cloud:8443',
        username: 'solace-cloud-client',
        password: 'md4ra1vj5afebgomknb15rl8t'
      };
    }

    //this.messaging = new Messaging(this.messagingOpts);

    this.toolBar = new ToolBar(this, this.scale);
    this.matter = new Matter(this, {events: {tick: () => this.animationTick()}});

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

    //this.messaging.connect();

    document.addEventListener("keydown", e => this.keyDown(e));

  }


  cssLocal() {
    return {
      main$c: {
        position: 'relative',
        height: '100%',
        width:  '100%',
      },
      status$c: {
        position: 'fixed',
        right$px: 50,
        top$px: 20
      }
    };
  }

  render() {
    return jst.$div({class: '-main', 
                     events: {
                       pointermove: e => this.pointerMove(e), 
                       pointerup:   e => this.pointerUp(e),
                       click: e => this.pointerDown(e),
                       keydown: e => this.keyDown(e)
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
    console.log("Connecting:", opts.clientId, this.debugClientIds)
    if (this.debugClientIds[opts.clientId]) {
      console.error("Dup client ID");
    }
    this.debugClientIds[opts.clientId] = true;

    let combinedOpts = Object.assign(this.messagingOpts, opts);
    let messaging = new Messaging(combinedOpts);
    messaging.connect();
    return messaging;
  }

  publish(topic, msg, opts) {
    this.messaging.publish(topic, msg, opts);
  }

  subscribe(qos, subscription, callback) {
    return this.messaging.subscribe(qos, subscription, callback);
  }

  unsubscribe(subId) {
    return this.messaging.unsubscribe(subId);
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
    console.log("trying to add event", opts)
    if (this.events[opts.guid]) {
      // Don't allow dups
      return;
    }
    opts.cornerRadius = 5;
    let event = new Event(this, this.scale, this.offsetY, this.offsetY, Object.assign({x: x, y: y, width: w, height: h}, opts));
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
    console.log("Removing all events")
    Object.values(this.events).forEach(event => this.removeEvent(event));

    // Also clear out all the queued events in the portals
    this.objects.forEach(obj => {
      console.log("Checking", obj)
      if (obj.type == "portal") {
        console.log("clearing event queue")
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

  removeEntity(entity) {
    if (!entity.isDeleteActive ||
      entity.isDeleteActive()) {

      let idx = this.objects.indexOf(entity);
        if (idx >= 0) {
        this.objects.splice(idx, 1);
      }
      this.refresh();
      this.save();
    }
  } 

  removeSelectedEntity() {
    if (this.selectedEntity) {
      this.removeEntity(this.selectedEntity);
      delete(this.selectedEntity);
    }
  }

  hitGround(targetBody, otherBody) {
    console.log("collision!", targetBody, otherBody);
    this.matter.remove(otherBody);
  }

  entitySelected(entity) {
    if (this.selectedEntity) {
      this.selectedEntity.unselect();
    }

    this.selectedEntity = entity;
  }
 
  setAnimTimeout(func, ticks) {
    console.log("Setting a timer")
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

      if (!this.selectedEntity.isDeleteActive ||
          this.selectedEntity.isDeleteActive()) {

        let idx = this.objects.indexOf(this.selectedEntity);
        if (idx >= 0) {
          this.objects.splice(idx, 1);
          delete(this.selectedEntity);
        }
        this.refresh();
        this.save();
      } 
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