// matter.js

import decomp from 'poly-decomp';
window.decomp = decomp;
import { Engine, World, Body, Bodies, Constraint, Render, Events } from 'matter-js';
import {jst}                                       from 'jayesstee';


export class Matter extends jst.Component {
  constructor() {
    super();
  }

  cssLocal() {
    return {
      matterDiv$c: {
        position: 'relative',
        display: 'inline-block',
        width: '100%',
        height: '100%',
        backgroundColor: '#aaa'
      },
      matter$c: {
        display: 'inline-block',
        width: '100%',
        height: '100%',
        backgroundColor: '#aaa'
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
      jst.$div({cn: "-matter", ref: "div"}),
      jst.$div({cn: "-addButton", events: {click: e => this.add(e)}}, "Add")
    );
  }

  postRender() {

  
    var engine = Engine.create();
    this.engine = engine;
    Events.on(engine, "collisionStart", (e) => console.log("collision", e))
    // create a renderer
    console.log(this.div.el, this.div.el.innerHeight)
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

// create two boxes and a ground
var boxA = Bodies.rectangle(400, 200, 80, 80, {
  friction: 0,
  render: {
    fillStyle: 'red',
    //strokeStyle: 'blue',
    lineWidth: 0
  }
  });
var boxB = Bodies.rectangle(450, 50, 80, 80);
Body.setVelocity( boxB, {x: 1, y: 0});
var ground = Bodies.rectangle(400, 410, 810, 60, { isStatic: true });
var ground2 = Bodies.rectangle(1200, 350, 810, 320, { isStatic: true });
Body.rotate(ground, Math.PI/8)
// add all of the bodies to the world
World.add(engine.world, [boxA, boxB, ground,ground2]);

// run the engine
Engine.run(engine);

// run the renderer
Render.run(render);

  }

  addElements(list) {
    list.forEach(item => {
      let opts = item[4];
      let box = Bodies.rectangle(item[0], item[1], item[2], item[3], opts);
      if (opts.velocity) {
        Body.setVelocity(box, opts.velocity);
      }
      World.add(this.engine.world, [box]);
    });
  }

  add(e) {
    let box = Bodies.rectangle(450, 50, 80, 80, {friction: 0, frictionStatic:0});
    console.log("Created box", box.id)
    Body.setVelocity( box, {x: Math.random(), y: 0});
    

    // add all of the bodies to the world
    World.add(this.engine.world, [box]);
    
  }

}