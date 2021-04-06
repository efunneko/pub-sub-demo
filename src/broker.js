// broker.js - contains stuff to draw and configure brokers

import {jst}                   from "jayesstee";
import {Entity}                from "./entity.js";
import {Images}                from "./images.js";

const BROKER_SIZE = 100;

export class Broker extends Entity {
  constructor(world, scale, offsetX, offsetY, opts) {
    super(world, scale, offsetX, offsetY);

    this.x = opts.x || 50;
    this.y = opts.y || 50;

    this.showControls = false;

    this.connectOpts = {
      hostname: 'vmr-134-44'
    };

    this.type = 'mqtt';

    this.baseSize = BROKER_SIZE;

    this.addMatterBlocks();

  }

  cssLocal() {
    return Object.assign({
      body$c: {
        position: 'fixed',
        fontFamily: "'Arial', 'sans'",
        fontWeight: 'bold',
        fontSize$px: this.ss(0.13),
        backgroundColor: "#ccc",
        background: 'linear-gradient(180deg, rgba(235,235,235,1) 0%, rgba(195,195,195,1) 45%, rgba(175,175,175,1) 75%, rgba(210,210,210,1) 100%)',
        padding$pt: this.ss(0.06),
        border$px: [this.ss(0.06), 'solid', '#888'],
        borderRadius$px: this.ss(0.1),
        boxShadow$px: [0, 0, this.ss(0.08), jst.rgba(0,0,0,0.8), 'inset']
      },
      logo$c: {
        textAlign: 'center'
      },
      solaceLogo$c: {
        backgroundColor: "#00c895",
        background: 'linear-gradient(180deg, #70eacb 0%, #00c895 45%, #00c895 75%, #35cba5 100%)',
        width$px: this.ss(0.8),
        height$px: this.ss(0.4),
        margin$px: [this.ss(0.1), 0],
        padding$px: [this.ss(0.1), this.ss(0.1), this.ss(0.03), this.ss(0.1)],
        borderRadius$px: this.ss(0.05),
      },
      solaceLogoImg$c: {
        objectFit: "contain",
        width$px: this.ss(0.8),
        height$px: this.ss(0.3)
      },
      mqttLogoImg$c: {
        objectFit: "contain",
        width$px: this.ss(0.8),
        height$px: this.ss(0.8)
      },
      title$c: {
        color: 'black',
        textAlign: 'center'
      },
      host$c: {
        textAlign: 'center',
        background: jst.rgba(255,255,255,0.2),
        padding$px: this.ss(0.04),
        borderRadius$px: this.ss(0.04),
        boxShadow$px: [0, 0, this.ss(0.04), jst.rgba(0,0,0,0.6), 'inset']
      }
    }, super.cssLocal());
  }

  cssInstance() {
    return Object.assign({
      body$c: {
        top$px: this.y * this.scale + this.offsetY,
        left$px: this.x * this.scale + this.offsetX,
      },
    }, super.cssInstance());
  }

  renderSolaceLogo() {
    return jst.$div({cn: '-logo -solaceLogo'}, jst.$img({cn: '-solaceLogoImg', src: Images.solaceLogo}));
  }

  renderMqttLogo() {
    return jst.$div({cn: '-logo -mqttLogo'}, jst.$img({cn: '-mqttLogoImg', src: Images.mqttLogo}));
  }

  render() {
    return jst.$div({class: '-body --body'},
      jst.$div({cn: '-title'}, "Event Broker"),
      this.type == 'mqtt' ? this.renderMqttLogo() : this.renderSolaceLogo(),
      jst.$div({cn: '-host'}, this.connectOpts.hostname),
      jst.if(this.showControls) &&
        jst.$div({cn: '-controls --controls'},
          jst.$div({cn: '--gripKnob -knob', events: {pointerdown: e => this.gripDown(e)}})
        )
    );
  }

  remove() {
    this.matterBlocks.forEach(block => this.world.remove(block));
  }

  addMatterBlocks() {
    /*
    this.matterBlocks = [];
    let opts = {
      isStatic: true, 
      cornerRadius: 0, 
      rotate: this.rotationRad, 
      noRender: true,
    };

    // Single rectangle
    this.matterBlocks.push(this.world.add(...this.rotateCoords(this.x + this.width/2, this.y + this.height/2), this.width, this.height, opts));
    */
  }

  serialize() {
    return {
      type: 'broker',
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

}