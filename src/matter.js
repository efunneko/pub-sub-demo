// matter.js

import decomp         from 'poly-decomp';
import {jst}          from 'jayesstee';
import {RenderBody}   from './render-body';
import {Engine, 
        World, 
        Body, 
        Bodies, 
        Composite, 
        Constraint, 
        Render, 
        Events }      from 'matter-js';

window.decomp = decomp;

export class Matter extends jst.Component {
  constructor() {
    super();
    this.collisionHandlers = {};
    this.renderBodies      = {};

    this.initEngine();
  }

  cssLocal() {
    return {
      matterDiv$c: {
        position: 'relative',
        display: 'inline-block',
        //width: '100%',
        //height: '100%',
      },
      matter$c: {
        display: 'inline-block',
        //width: '100%',
        //height: '100%'
      },
      addButton$c: {
        position: 'absolute',
        top$pt: 10,
        left$pt: 10,
        padding$px: 5,
        border$px: [1, "solid", "black"]
      }
    }
  }

  render() {
    return jst.$div({cn: "-matterDiv"},
      jst.$div({cn: "-matter", ref: "div"},
        Object.values(this.renderBodies)
      ),
      jst.$div({cn: "-addButton", events: {click: e => this.add(e)}}, "Add")
    );
  }

  postRender() {
  }

  initEngine() {
  
    var engine = Engine.create();
    this.engine = engine;
    Events.on(engine, "collisionStart", (e) => this.collision(e));
    // create a renderer
    // console.log(this.div.el, this.div.el.innerHeight)
    /*
    var render = Render.create({
      element: this.div.el,
      engine: engine,
      options: {
        height: this.div.el.offsetHeight,
        width: this.div.el.offsetWidth,
        wireframes: false,
        background: "white"
      }
    });
    */

  // create two boxes and a ground
  var boxA = Bodies.rectangle(650, 100, 80, 80, {
  friction: 0,
  render: {
    fillStyle: 'red',
    //strokeStyle: 'blue',
    lineWidth: 0
  }
  });
  this.renderBodies[boxA.id] = new RenderBody(boxA.id, {width: 80, height: 80});
  // add all of the bodies to the world
  World.add(engine.world, [boxA]);

  // run the engine
  Engine.run(engine);

  // run the renderer
  // Render.run(render); - do our own custom rendering
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
        cornerRadius: opts.cornerRadius
      };
      if (opts.cornerRadius) {
        opts.chamfer = {radius: opts.cornerRadius};
        //delete(opts.cornerRadius);
      }
      let box = Bodies.rectangle(item[0], item[1], item[2], item[3], opts);
      if (!opts.noRender) {
        this.renderBodies[box.id] = new RenderBody(box.id, renderOpts);
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
    console.log("Created box", box.id)
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
    console.log("bodies:", Composite.allBodies(this.engine.world));
    e.pairs.forEach(pair => {
      console.log("checking", pair, this.collisionHandlers);
      ['bodyA', 'bodyB'].forEach(body => {
        if (this.collisionHandlers[pair[body].id]) {
          if (body === 'bodyA') {
            this.collisionHandlers[pair[body].id](pair[body], pair.bodyB);
          }
          else {
            this.collisionHandlers[pair[body].id](pair[body], pair.bodyA);
          }
        }
      })
    })
  }

  renderMatter(time) {
    //let t = (new Date()).getTime();
    let delta = time - this.lastTime || 16;
    //console.log("delta", t, delta)
    if (delta > 100) {
      delta = 16;
    }
    Engine.update(this.engine, delta/2);
    let bodies = Composite.allBodies(this.engine.world);
    bodies.forEach(body => {
      let renderBody = this.renderBodies[body.id];
      if (renderBody) {
        renderBody.update(body);
      }
    });

    this.lastTime = time;
    window.requestAnimationFrame((time) => this.renderMatter(time));
  }

}