// portal.js - one end of an event portal

import {jst} from 'jayesstee';

const PORTAL_WIDTH          = 40;
const PORTAL_SQUISH         = 3;
const PORTAL_SQUISH2        = PORTAL_SQUISH * 2;
const PORTAL_SQUISH_INNER   = PORTAL_SQUISH + 0.1;

const colorToCode = {
  orange: 'orange',
  blue: 'lightblue',
  black: '#222'
}

export class Portal extends jst.Component {
  constructor(world, scale, offsetX, offsetY, opts) {
    super();

    this.world = world;

    this.id = opts.id || 1;

    this.x = opts.x || 50;
    this.y = opts.y || 50;

    this.cx = this.x + PORTAL_WIDTH/PORTAL_SQUISH2;
    this.cy = this.y + PORTAL_WIDTH/2;

    this.rotationRad = opts.rotation || 0;

    this.color       = opts.color || "orange"
    this.ringColor   = colorToCode[this.color];
    this.portalColor = opts.portalColor || '#999';

    this.showControls = false;
    this.deleteActive = true;

    this.queuedEvents  = [];
    this.lastSpawnTime = 0;

    this.subIds        = {};
    this.name          = opts.name || "event_portal";
    this.clientId      = opts.clientId || `${this.name}_${(Math.random()*1000000).toFixed(0)}`;

    this.connectOpts   = {
      clientId:  this.clientId
    }

    this.resize(scale, offsetX, offsetY);

    this.addMatterBlocks();

    this.connectToBroker();

    this.addStandardSubscriptions();

  }

  // Items specific to each instance
  cssInstance() {
    return {
      portalDiv$c: {
        top$px: this.y * this.scale + this.offsetY,
        left$px: this.x * this.scale + this.offsetX,
        transform: jst.rotate(jst.rad(this.rotationRad)),
      },
      portal$c: {
        top$px: this.y * this.scale + this.offsetY,
        left$px: this.x * this.scale + this.offsetX,
        transform: jst.rotate(jst.rad(this.rotationRad)),
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
        transform: jst.rotate(jst.rad(this.rotationRad)),
        boxShadow$px: [0, 0, 1 * this.scale, 2 * this.scale, this.ringColor],
        backgroundColor: this.ringColor,
        clipPath: 'polygon(550% -50%, 30% -50%, 30% 550%, 550% 550%)'
      },
      frontInner$c: {
        background: `radial-gradient(closest-side, black 0%, black 70%, ${this.ringColor} 100%)`,
      },
      frontInset$c: {
        boxShadow$px: [0, 0, 1 * this.scale, 2 * this.scale, this.ringColor, 'inset'],
      },
      id$c: {
        transform: jst.rotate(jst.rad(-this.rotationRad))
      },
      name$c: {
        transform: jst.rotate(jst.rad(-this.rotationRad))
      },
      settingPanel$c: {
        top$px: (this.y - PORTAL_WIDTH * 0.4) * this.scale + this.offsetY,
        left$px: (this.x - PORTAL_WIDTH * 0.4) * this.scale + this.offsetX,
      }

    }
  }

  // Items common to all portals
  cssLocal() {
    return {
      portalDiv$c: {
        position: 'fixed',
        left$px: 0,
        width$px: PORTAL_WIDTH/PORTAL_SQUISH * this.scale,
        height$px: PORTAL_WIDTH * this.scale,
        //zIndex: -1
      },
      portal$c: {
        position: 'fixed',
        left$px: 0,
        borderRadius$px: '45% 55% 55% 45% / 50% 50% 50% 50%',
        width$px: PORTAL_WIDTH/PORTAL_SQUISH * this.scale,
        height$px: PORTAL_WIDTH * this.scale,
        zIndex: 1
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
        position: 'fixed',
        left$px: 0,
        //left$px: PORTAL_WIDTH/PORTAL_SQUISH2 * this.scale,
        borderRadius$px: '45% 55% 55% 45% / 50% 50% 50% 50%',
        width$px: PORTAL_WIDTH/PORTAL_SQUISH * this.scale,
        height$px: PORTAL_WIDTH * this.scale,
        opacity: 0.99,
        zIndex: 3
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
        position: 'absolute',
        top$px: (PORTAL_WIDTH/2 - PORTAL_WIDTH*0.1) * this.scale,
        left$px: - (PORTAL_WIDTH/2 - PORTAL_WIDTH/20) * this.scale,
        width$px: PORTAL_WIDTH * 0.09 * this.scale,
        height$px: PORTAL_WIDTH * 0.2 * this.scale,
        borderRadius$px: PORTAL_WIDTH * 0.045 * this.scale,
        lineHeight$px: PORTAL_WIDTH * 0.22 * this.scale,
        fontSize$px: PORTAL_WIDTH * 0.13 * this.scale,
        verticalAlign: 'middle',
        textAlign: 'center',
        border$px: [1, 'solid', 'black'],
        backgroundColor: 'white',
        cursor: "pointer",
        zIndex: 1
      },

      gripKnob$c: {
        top$px: (PORTAL_WIDTH/2 - PORTAL_WIDTH/20) * this.scale,
        left$px: (PORTAL_WIDTH/3 - PORTAL_WIDTH/20) * this.scale,
        cursor: "move"
      },
      settingsTitle$c: {
        margin$px: [1 * this.scale, 1 * this.scale, 1.5 * this.scale, 1 * this.scale],
        fontWeight: 'bold',
        textAlign: 'center'
      },
      settings$c: {
        position: 'absolute',
        top$px: (PORTAL_WIDTH/2 - PORTAL_WIDTH*0.2) * this.scale,
        left$px: (PORTAL_WIDTH/3 - PORTAL_WIDTH/20) * this.scale,
        fontSize$px: PORTAL_WIDTH * 0.1 * this.scale,
        width$px: PORTAL_WIDTH * 0.12 * this.scale,
        height$px: PORTAL_WIDTH * 0.12 * this.scale,
        lineHeight$px: PORTAL_WIDTH * 0.13 * this.scale,
        verticalAlign: 'middle',
        textAlign: 'center',
        borderRadius$px: '15%',
        backgroundColor: 'white',
        color: '#777',
        border$px: [1, 'solid', 'black']
      },
      settingPanel$c: {
        position: 'absolute',
        fontSize$px: PORTAL_WIDTH * 0.08 * this.scale,
        padding$px: 1 * this.scale,
        //width$px: PORTAL_WIDTH * 1.3 * this.scale,
        //height$px: PORTAL_WIDTH * 1.3 * this.scale,
        borderRadius$px: '5%',
        backgroundColor: 'white',
        color: '#222',
        border$px: [1, 'solid', 'black'],
        boxShadow$px: [0, 1 * this.scale, 3 * this.scale, jst.rgba(0,0,0,0.3)],
        zIndex: 5
      },
      subTitle$c: {
        margin$px: [2 * this.scale, 1 * this.scale, 1.5 * this.scale, 1 * this.scale],
        fontWeight: 'bold',
      },
      subAdd$c: {
        marginLeft$px: 2 * this.scale,
        color: '#33f'
      },
      subDelete$c: {
        color: '#666'
      },
      subDelete$c$hover: {
        color: 'red'
      },
      colSelectButton$c: {
        display: 'inline-block',
        margin$px: [1 * this.scale, 2 * this.scale, 1 * this.scale, 0 * this.scale],
        width$px: PORTAL_WIDTH * 0.2 * this.scale,
        height$px: PORTAL_WIDTH * 0.2 * this.scale,
        borderRadius: '15%'
      },
      id$c: {
        display: 'inline-block',
        position: 'absolute',
        top$px: (PORTAL_WIDTH * -0.2) * this.scale,
        left$px: (PORTAL_WIDTH * 0.2) * this.scale,
        fontSize$px: 4 * this.scale,
        fontWeight: 'bold',
        borderRadius$px: 2 * this.scale,
        backgroundColor: 'white',
        border$px: [0.3 * this.scale, 'solid', '#999'],
        padding$px: 1 * this.scale,
      },
      name$c: {
        display: 'inline-block',
        position: 'absolute',
        bottom$px: (PORTAL_WIDTH * -0.2) * this.scale,
        left$px: (PORTAL_WIDTH * 0.2) * this.scale,
        fontSize$px: 4 * this.scale,
        fontWeight: 'bold',
        borderRadius$px: 2 * this.scale,
        backgroundColor: 'white',
        border$px: [0.3 * this.scale, 'solid', '#999'],
        padding$px: 1 * this.scale,
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
      },
      inputLabel$c: {
        fontWeight: 'bold'
      },
      textInput$c: {
        marginTop$px: PORTAL_WIDTH*0.05 * this.scale,
        marginLeft$px: PORTAL_WIDTH*0.03 * this.scale,
      },
      colorSelect$c: {
        marginTop$px: PORTAL_WIDTH*0.08 * this.scale,
        marginLeft$px: PORTAL_WIDTH*0.03 * this.scale,
      }
    }
  }

  render() {
    return [
      jst.$div({cn: '-portal --portal', events: {click: e => this.select(e)}},
        jst.$div({cn: '-inner --inner'},
          jst.$div({cn: '-inset --inset'})
        ),
        jst.if(this.showControls) &&
        jst.$div({cn: '-controls --controls'},
          jst.$div({cn: '-rotateKnob', events: {pointerdown: e => this.rotateDown(e)}}, jst.$i({cn: 'fas fa-arrows-alt-v'})),
        )
      ),
      jst.$div({cn: '-frontPortal --frontPortal', events: {click: e => this.select(e)}},
        jst.$div({cn: '-frontInner --frontInner'},
          jst.$div({cn: '-frontInset --frontInset'})
        ),
        jst.if(this.color !== 'black') && [
          jst.$div({cn: '-id --id'}, this.id),
          jst.$div({cn: '-name --name'}, this.name)
        ],
        jst.if(this.showControls) &&
          jst.$div({cn: '-controls --controls'},
            jst.$div({cn: '-gripKnob -knob', events: {pointerdown: e => this.gripDown(e)}}),
            jst.$div({cn: '-settings', events: {click: e => this.openSettings(e)}}, jst.$i({cn: 'fas fa-cog', events: {click: e => console.log("clicked")}}))
          ),
      ),
      jst.if(this.showSettings) &&
        jst.$div({cn: '-settingPanel --settingPanel', events: {click: e => {e.preventDefault(); e.stopPropagation()}}},
          jst.$div({cn: '-settingsTop'},
            jst.$div({cn: '-settingsTitle'}, "Portal Configuration"),
            jst.$div({cn: '-textInput'},
              jst.$div({cn: '-inputLabel'}, "Portal Id"),
              jst.$div({cn: '-inputDiv'}, jst.$input({cn: '-input -portalIdInput', value: this.id, ref: 'portalIdInput'})),
            ),
            jst.$div({cn: '-textInput'},
              jst.$div({cn: '-inputLabel'}, "Portal Name"),
              jst.$div({cn: '-inputDiv'}, jst.$input({cn: '-input -portalNameInput', value: this.name, ref: 'portalNameInput'})),
            ),
            jst.$div({cn: '-colorSelect'},
              jst.$div({cn: '-inputLabel'}, "Portal Type"),
              Object.keys(colorToCode).map(col => 
                jst.$div({cn: '-colSelectButton', style: `background-color: ${colorToCode[col]}`, events: {click: e => this.selectColor(e,col)}})
              )
            )
          ),
          jst.$div({cn: '-settingsBottom'},
            jst.$div({cn: '-subTitle'}, "Subscriptions", jst.$i({cn: '-subAdd fas fa-plus-circle', events: {click: e => this.addSubscription(e)}})),
            jst.$table(
              Object.keys(this.subIds).map(sub => 
                jst.$tr(
                  jst.$td(jst.$div({cn: '-subscription', events: {click: e => this.editSubscription(e, sub)}}, sub)),
                  jst.$td(jst.$div({cn: '-subDelete'}, jst.$i({cn: 'fas fa-minus-circle', events: {click: e => this.deleteSubscription(e, sub)}})))
                )
              )
            )
          ),
        )
      
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
      collision: (a, b, bObj) => this.enterPortal(a, b, bObj)
    }

    // The part that represents the interior of the portal, which includes a callback to do something with the block when it happens
    this.matterBlocks.push(this.world.add(...this.rotateCoords(this.x + PORTAL_WIDTH/4+4, this.y + PORTAL_WIDTH/2), 2, PORTAL_WIDTH, opts));
  }

  addStandardSubscriptions() {

    let sub = this.getStandardSubscription();

    let subId = this.messaging.subscribe(1, sub, (topic, msg, data) => this.rxMessage(topic, msg, data));

    this.subIds[sub] = subId;

  }

  openSettings(e) {
    e.stopPropagation();
    e.preventDefault();
    console.log("opening settings")
    this.showSettings = true;
    this.deleteActive = false;
    this.refresh();
  }

  connectToBroker() {
    this.messaging = this.world.createConnection(this.connectOpts);
  }

  disconnectFromBroker() {
    this.messaging.dispose();
    this.messaging = null;
  }

  addSubscription(e) {
    e.stopPropagation();
    e.preventDefault();
    let newSub = window.prompt("Enter new subscription:\nSchema: event/portal/{portal-color}/{event-shape}/{event-color}/{event-id}/{event-area}");

    if (!newSub) {
      return;
    }

    // Add the new one
    this.addMessagingSubscription(newSub);

    this.world.save();
    this.refresh();

  }

  deleteSubscription(e, sub) {
    e.stopPropagation();
    e.preventDefault();
    // Remove the old subscription
    this.removeMessagingSubscription(sub);

    this.world.save();
    this.refresh();
  }
  
  editSubscription(e, sub) {
    e.stopPropagation();
    e.preventDefault();
    let newSub = window.prompt("Enter Portal ID:", sub);

    if (!newSub) {
      return;
    }

    // Remove the old subscription
    this.removeMessagingSubscription(sub);

    // Add the new one
    this.addMessagingSubscription(newSub);

    this.world.save();
    this.refresh();

  }

  isDeleteActive() {
    return this.deleteActive;
  }

  selectColor(e, color) {
    e.stopPropagation();
    e.preventDefault();
    if (color == this.color) {
      return;
    }

    // Remove the default subscription if it is there
    let sub = this.getStandardSubscription();
    if (this.color != 'black') {
      if (!this.subIds[sub]) {
        return;
      }
      this.removeMessagingSubscription(sub);
    }

    this.color     = color;
    this.ringColor = colorToCode[color];

    if (color != "black") {
      this.addMessagingSubscription(this.getStandardSubscription());
    }

    this.world.save();
    this.refresh();

  }

  rxMessage(topic, msg, data) {
    console.log("received", data)
    if (this.queuedEvents.length) {
      this.queuedEvents.push(data);
      return;
    }

    let time  = (new Date()).getTime();
    let delta = this.lastSpawnTime - time;
    if (delta < 20) {
      this.queuedEvents.push(data);
      if (!this.eventQueueTimer) {
        this.eventQueueTimer = setTimeout(() => this.serviceEventQueue(), 20);
      }
      return;
    }

    this.spawnEvent(data);
  }

  spawnEvent(data) {
    console.log("Here", data)
    if (this.world.getEvent(data.guid)) {
      // Only allow one instance of an event
      return;
    }

    let v = this.rotateCoords(-Math.min(8, data.velocity.x*this.scale), data.velocity.y*this.scale, [0,0]);
    let opts = {
      rotate: data.angle + this.rotationRad, 
      friction: data.friction, 
      frictionStatic: data.frictionStatic,
      angularVelocity: data.angularVelocity,
      text: data.id,
      eventId: data.id,
      velocity: {x: v[0], y: v[1]},
      color: data.color,
      guid: data.guid
    };
    let size = data.width;
    this.world.addEvent(...this.rotateCoords(this.x + PORTAL_WIDTH*0.1, this.y+PORTAL_WIDTH*0.5), size, size, opts);

  }  

  serviceEventQueue() {
    let event = this.queuedEvents.shift();
    if (event) {
      this.spawnEvent(event);
    }
    if (this.queuedEvents.length) {
      this.eventQueueTimer = setTimeout(() => this.serviceEventQueue(), 20);
    }
    else {
      this.eventQueueTimer = null;
    }
  }

  /*
  startEditId(e) {
    e.preventDefault();
    e.stopPropagation();
    let id = window.prompt("Enter Portal ID:", this.id);
    if (id != undefined && id != null && id != this.id) {
      // Remove the old subscription
      this.removeMessagingSubscription();

      this.id = id;
      let sub = this.getStandardSubscription();

      this.addMessagingSubscription(sub);

      this.world.save();
      this.refresh();
  
    }
  }
  */

  changeId(id) {
    if (id != undefined && id != null && id != this.id) {
      // Remove the old subscription
      this.removeMessagingSubscription();

      this.id = id;
      let sub = this.getStandardSubscription();

      this.addMessagingSubscription(sub);

      this.world.save();
      this.refresh();
  
    }

  }

  changeName(name) {
    // if the name changes, we will simply make a new connection 
    console.log("Changing name to:", name)
    if (name != undefined && name != "" && name != null && name != this.name) {
      this.name = name;
      this.clientId = `${name}_${(Math.random()*1000000).toFixed(0)}`;
      this.disconnectFromBroker();
      this.connectOpts.clientId = this.clientId;
      this.connectToBroker();
      this.readdAllMessagingSubscriptions();

      this.world.save();
      this.refresh();
    }
  }

  removeMessagingSubscription(sub) {
    if (!sub) {
      sub = this.getStandardSubscription();
    }
    let subId = this.subIds[sub];
    if (subId) {
      delete(this.subIds[sub]);
      this.messaging.unsubscribe(subId);
    }
  }

  addMessagingSubscription(sub) {
    let subId = this.messaging.subscribe(1, sub, (topic, msg, data) => this.rxMessage(topic, msg, data));
    this.subIds[sub] = subId;
  }

  readdAllMessagingSubscriptions() {
    Object.keys(this.subIds).forEach(sub => {
      let subId = this.messaging.subscribe(1, sub, (topic, msg, data) => this.rxMessage(topic, msg, data));
      this.subIds[sub] = subId;
    });
  }

  getStandardSubscription() {
    let otherColor = this.color === 'orange' ? 'blue' : 'orange';
    return `event/portal/${otherColor}/${this.id}/#`;
  }

  rotateCoords(x, y, center) {
    let cx, cy;
    
    cx = center ? center[0] : this.cx;
    cy = center ? center[1] : this.cy;

    let ax = x - cx;
    let ay = y - cy;

    let sr = Math.sin(this.rotationRad);
    let cr = Math.cos(this.rotationRad);

    let rx =  cr * ax - sr * ay;
    let ry =  sr * ax + cr * ay;

    return [rx + cx, ry + cy];
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

    this.cx = this.x + PORTAL_WIDTH/PORTAL_SQUISH2;
    this.cy = this.y + PORTAL_WIDTH/2;

    this.matterBlocks.forEach(block => this.world.remove(block));
    this.matterBlocks = [];
    if (moveMatter) {
      this.addMatterBlocks();   
    }
    this.refresh();
  }

  enterPortal(selfBody, otherBody, otherBodyObj) {
    // Portion of the topic specific to the portal
    let topicPrefix = `event/portal/${this.color}/${this.id}/`;
    if (otherBodyObj.isEvent) {
      otherBodyObj.publish(this.messaging, topicPrefix, otherBody, {rotation: this.rotationRad});
    }
    else {
      this.world.remove(otherBody);
    }
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
  }

  rotateDown(e) {
    e.preventDefault();
    e.stopPropagation();
    this.controlMove = e => this.rotateMove(e);
    this.controlUp   = e => this.rotateUp(e);
  }

  select(e) {
    //if (!this.showControls) {
      e.preventDefault();
      e.stopPropagation();
      this.world.entitySelected(this);
      this.showControls = true;
      this.refresh();
    //}
  }

  unselect() {
    if (this.showControls && this.portalIdInput && this.portalIdInput.el) {
      let id   = this.portalIdInput.el.value;
      let name = this.portalNameInput.el.value;
      this.changeId(id);
      this.changeName(name);
    }


    this.showControls = false;
    this.showSettings = false;
    this.deleteActive = true;
    this.refresh();
  }

  serialize() {
    return {
      type: 'portal',
      x: this.x,
      y: this.y,
      rotation: this.rotationRad,
      color: this.color,
      id: this.id,
      subscriptions: this.subscriptions,
      name: this.name,
      clientId: this.clientId
     };
  }

}