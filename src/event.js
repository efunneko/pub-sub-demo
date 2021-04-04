// events.js - handle the events themselves

import {jst}            from 'jayesstee';

// Names to color codes
export const EventColors = {
  red: '#ff7777',
  green: '#00c895',
  blue: '#9f9ff4',
  orange: 'orange'
};

export class Event extends jst.Component {
  constructor(world, scale, offsetX, offsetY, opts) {
    super();

    this.world        = world;

    this.width        = (opts.width  || 20);
    this.height       = (opts.height || 20);

    this.halfWidth    = this.width/2;
    this.halfHeight   = this.height/2;

    this.x            = ((opts.x - this.halfWidth)  || 50);
    this.y            = ((opts.y - this.halfHeight) || 50);

    this.cx           = this.x;// + this.halfWidth;
    this.cy           = this.y;// + this.halfHeight;

    this.angle        = opts.rotate;
    this.color        = opts.color || "lightblue";
    this.text         = opts.text;
    this.id           = opts.eventId;
    this.guid         = opts.guid;
    this.cornerRadius = opts.cornerRadius;
    this.topic        = opts.topic;

    this.isEvent      = true;
    this.type         = "square";      

    this.resize(scale, offsetX, offsetY);

   //this.addMatterBlock();

  }

  // CSS shared with all Event components
  cssLocal() {
    return {
      body$c: {
        display: 'table-cell',
        position: 'fixed',
        textAlign: 'center',
        verticalAlign: 'middle',
        zIndex: 2,
        fontWeight: 'bold',
        fontSize$px: 4 * this.scale
      }
    };
  }

  // CSS specific to each instance
  cssInstance() {
    return {
      body$c: {
        width$px: this.width * this.scale,
        height$px: this.height * this.scale,
        lineHeight$px: this.height,
        transform: jst.rotate(jst.rad(this.angle)),
        left$px: this.x * this.scale + this.offsetX,
        top$px: this.y * this.scale + this.offsetY,
        borderRadius$px: this.cornerRadius || 0,
        backgroundColor:  EventColors[this.color],
      },
    }
  }

  render() {
    console.log("Rendering:", this.display)
    return this.display && 
      jst.$div({cn: '-body --body', 
                ref: 'myDiv',
                events: {click: () => this.showTopic()},
                // Note that we are using style for the things that are changing very frequently
                // This will let us more efficiently move the div around
                style: `left: ${this.x * this.scale + this.offsetX}px; top: ${this.y * this.scale + this.offsetY}px; transform: rotate(${this.angle}rad)`}, this.text);
  }

  resize(scale, offsetX, offsetY) {
    this.scale = scale;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.refresh();
  }

  publish(messaging, topicPrefix, myBody, portalInfo) {

    // Called from a portal to let this event know that it has entered the portal and should
    // be published to the broker
    this.body = myBody;

    let vx, vy;
    if (!this.body.velocity) {
      vx = -1;
      vy = 0;
    }
    else {
      [vx, vy] = this.rotateCoords(this.body.velocity.x, this.body.velocity.y, true, [0,0], portalInfo.rotation);
    }
    let msg = {
      friction:        this.body.friction,
      frictionStatic:  this.body.frictionStatic,
      frictionAir:     this.body.frictionAir,
      angle:           this.body.angle,
      angularVelocity: this.body.angularVelocity,
      velocity:        {x: (vx/this.scale).toFixed(4), y: (vy/this.scale).toFixed(4)},
      color:           this.color,
      width:           this.width/this.scale,
      height:          this.height/this.scale,
      cornerRadius:    this.cornerRadius,
      id:              this.id,
      guid:            this.guid
    }

    this.lastTopic = topicPrefix + `${this.type}/${this.color}/${this.id.toString().padStart(5, "0")}/${Math.ceil(this.body.area).toString().padStart(6, "0")}`;
    messaging.publish(this.lastTopic, msg, {qos: 1});

    // Remove ourselves
    this.world.removeEvent(this);
  }

  // This shows the topic used when transiting the last portal
  // It will be undefined if it has not yet gone through a portal
  showTopic() {
    if (this.topic) {
      alert(`Topic: ${this.topic}`);
    }
    else {
      alert("Topic not set until it has gone through a portal");
    }
  }

  // TODO - not currently used - the world creates its own right now
  addMatterBlock() {
    // Create a matter block that is the same size as this
    this.matterBlocks = [];
    let opts = {
      rotate: this.rotationRad, 
      noRender: true,
    };

    // Single rectangle
    this.matterBlocks.push(this.world.add(...this.rotateCoords(this.x + this.width/2, this.y + this.height/2), this.width, this.height, opts));

  }

  // Called from Matter to update to new location and orientation
  update(body) {
    this.body = body;
    let needsRefresh = false;
    if (body.anglePrev != body.angle) {
      this.angle = body.angle;
      needsRefresh = true;
    }
    if (body.position.x != body.positionPrev.x || body.position.y != body.positionPrev.y) {
      this.x = body.position.x - this.halfWidth;
      this.y = body.position.y - this.halfHeight;
      needsRefresh = true;
    }

    if (!this.display) {
      this.display = true;
      this.refresh({skipCss: true});
    }

    if (needsRefresh) {
      // This will just change the local style on the object - this is more efficient than 
      // re-rendering the whole thing again
      this.myDiv.el.style = `left: ${this.x}px; top: ${this.y}px; transform: rotate(${this.angle}rad)`;
    }

  }

  rotateCoords(x, y, reverse, center, angle) {
    let cx, cy;
    let rot = typeof(angle) != undefined ? angle : this.rotationRad;

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

    let sr = Math.sin(dir * rot);
    let cr = Math.cos(dir * rot);

    let rx =  cr * ax - sr * ay;
    let ry =  sr * ax + cr * ay;

    return [rx + cx, ry + cy];
  }

}