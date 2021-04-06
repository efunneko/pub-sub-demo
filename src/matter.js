// matter.js

import decomp         from 'poly-decomp';
import {jst}          from 'jayesstee';
import {Engine, 
        World, 
        Body, 
        Bodies, 
        Composite, 
        Events }      from 'matter-js';

window.decomp = decomp;

export class Matter extends jst.Component {
  constructor(world, opts = {}) {
    super();
    this.collisionHandlers = {};
    this.renderBodies      = {};

    this.events            = opts.events || {};
    this.world             = world;

    this.initEngine();
  }

  cssLocal() {
    return {
      matterDiv$c: {
        position: 'relative',
        display: 'inline-block',
      },
      matter$c: {
        display: 'inline-block',
      },
    }
  }

  render() {
    return jst.$div({cn: "-matterDiv"},
      jst.$div({cn: "-matter", ref: "div"},
        // TODO - at the moment, this class is responsibile for rendering
        // some of the objects in the scene. This should be changed so that
        // this class is not a JST component at all and all objects are 
        // rendered under the world component
        Object.values(this.renderBodies)
      ),
    );
  }

  initEngine() {
  
    this.engine  = Engine.create();
    Events.on(this.engine, "collisionStart", (e) => this.collision(e));

    // Start the renderer
    requestAnimationFrame((time) => this.renderMatter(time));

  }

  addElements(list) {
    let blocks = [];
    list.forEach(item => {
      let opts = item[4];
      let renderOpts = {
        x: item[0], 
        y: item[1], 
        width: item[2], 
        height: item[3], 
        angle: opts.rotate,
        cornerRadius: opts.cornerRadius,
        id: opts.eventId
      };
      if (opts.cornerRadius) {
        opts.chamfer = {radius: opts.cornerRadius};
      }
      console.log("Adding block:", item[0], item[1], opts.chamfer)
      let box = Bodies.rectangle(item[0], item[1], item[2], item[3], opts);
      if (opts.renderObj) {
        this.renderBodies[box.id] = opts.renderObj;
      }
      blocks.push(box);
      if (opts.velocity) {
        Body.setVelocity(box, opts.velocity);
      }
      if (opts.rotate) {
        Body.rotate(box, opts.rotate);
      }
      if (opts.events && opts.events.collision) {
        this.collisionHandlers[box.id] = opts.events.collision;
      }
      World.add(this.engine.world, [box]);
    });
    this.refresh();
    return blocks;
  }

  add(e) {
    let box = Bodies.rectangle(750, 10, 80, 80, {friction: 0, frictionStatic:0, chamfer: {radius: 10}});
    this.renderBodies[box.id] = new RenderBody(box.id, {width: 80, height: 80, cornerRadius: 10, text: "Hi"});
    this.refresh();
    
    Body.setVelocity( box, {x: Math.random(), y: 0});
    
    // add all of the bodies to the world
    World.add(this.engine.world, [box]);
    
  }

  remove(body) {
    if (this.renderBodies[body.id]) {
      delete(this.renderBodies[body.id]);
      this.refresh();
    }
    if (this.collisionHandlers[body.id]) {
      delete(this.collisionHandlers[body.id]);
    }
    World.remove(this.engine.world, body);
  }

  collision(e) {
    e.pairs.forEach(pair => {
      ['bodyA', 'bodyB'].forEach(body => {
        if (this.collisionHandlers[pair[body].id]) {
          if (body === 'bodyA') {
            this.collisionHandlers[pair[body].id](pair[body], pair.bodyB, this.renderBodies[pair.bodyB.id]);
          }
          else {
            this.collisionHandlers[pair[body].id](pair[body], pair.bodyA, this.renderBodies[pair.bodyA.id]);
          }
        }
      })
    })
  }

  renderMatter(time) {
    if (this.rendering) {
      return;
    }
    this.rendering = true;
    //let t = (new Date()).getTime();
    let delta = time - this.lastTime || 16;
    //console.log("delta", t, delta)
    delta = 16;
    if (delta > 200) {
      delta = 16;
    }
    try {      
      Engine.update(this.engine, delta);
      let bodies = Composite.allBodies(this.engine.world);
      bodies.forEach(body => {
        let renderBody = this.renderBodies[body.id];
        if (Math.abs(body.position.x) > 10000 || Math.abs(body.position.y) > 10000) {
          if (renderBody && renderBody.isEvent) {
            this.world.removeEvent(renderBody);
          }
          else {
            this.world.remove(body);
          }
        }
        else {
          if (renderBody) {
            renderBody.update(body);
          }
        }
      });

      if (this.events.tick) {
        this.events.tick();
      }
    }
    catch(e) {
      console.log("Error:", e)
    }

    this.lastTime = time;
    window.requestAnimationFrame((time) => this.renderMatter(time));
    this.rendering = false;
  }

}