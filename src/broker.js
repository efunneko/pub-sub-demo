// broker.js - contains stuff to draw and configure brokers

import {jst}                   from "jayesstee";
import {Entity}                from "./entity.js";
import {Images}                from "./images.js";
import { utils } from "./utils.js";

const BROKER_SIZE = 100;
const SUPPORTED_PROTO = [
  {
    name: "Solace",
    proto: "smf"
  },
  {
    name: "MQTT",
    proto: "mqtt"
  },
  
];

export class Broker extends Entity {
  constructor(world, scale, offsetX, offsetY, opts) {
    super(world, scale, offsetX, offsetY);

    this.type = 'broker';

    this.x = opts.x || 50;
    this.y = opts.y || 50;

    this.showControls = false;

    this.connectOpts = {
      hostname: 'vmr-134-44'
    };

    this.name = opts.name;
    this.url  = opts.url;
    this.username = opts.username;
    this.password = opts.password;

    this.protocol = opts.protocol || 'smf';

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
      },
      gripKnob$c: {
        position: 'absolute',
        top: '45%',
        right: '42%',
        cursor: 'move'
      },
      cog$c: {
        position: 'absolute',
        top: '-9%',
        right: '-9%',
        padding: '2%',
        backgroundColor: 'white',
        color: '#888',
        borderRadius: '20%',
        border$px: [1, 'solid', 'black']

      },
      settingPanel$c: {
        position: 'absolute',
        top: '5%',
        left: '%5',
        fontSize$px: this.ss(0.1),
        padding$px: this.ss(0.05),
        borderRadius$px: '5%',
        backgroundColor: 'white',
        color: '#222',
        border$px: [1, 'solid', 'black'],
        boxShadow$px: [0, this.ss(0.05), this.ss(0.1), jst.rgba(0,0,0,0.3)],
        zIndex: 5
      },
      settingsTitle$c: {
        margin$px: [1 * this.scale, 1 * this.scale, 1.5 * this.scale, 1 * this.scale],
        fontWeight: 'bold',
        textAlign: 'center'
      },
      inputLabel$c: {
        fontWeight: 'bold'
      },
      textInput$c: {
        marginTop$px: this.ss(0.05),
        marginLeft$px: this.ss(0.03),
      },
      selectInput$c: {
        marginTop$px: this.ss(0.05),
        marginLeft$px: this.ss(0.03),
      },

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
    return jst.$div({class: '-body --body', events: {click: e => this.select(e)}},
      jst.$div({cn: '-title'}, "Event Broker"),
      this.protocol == 'mqtt' ? this.renderMqttLogo() : this.renderSolaceLogo(),
      jst.$div({cn: '-host'}, this.name),
      jst.if(this.showControls) &&
        jst.$div({cn: '-controls --controls'},
          jst.$div({cn: '-cog',
                    events: {
                      click: e => this.openSettings(e),
                      pointerDown: utils.stopEvent
                  }}, 
            jst.$i({cn: 'fas fa-cog', events: {
              click: e => console.log("clicked"),
              pointerdown: utils.stopEvent
            }})
          ),
          jst.$div({cn: '-gripKnob -knob', events: {pointerdown: e => this.gripDown(e)}})
        ),
      jst.if(this.showSettings) &&
        jst.$div({cn: '-settingPanel --settingPanel', events: {click: utils.noProp, pointerdown: utils.noProp}},
          jst.$div({cn: '-settingsTop'},
            jst.$div({cn: '-settingsTitle'}, "Broker Configuration"),
            jst.$div({cn: '-textInput'},
              jst.$div({cn: '-inputLabel'}, "Broker Name"),
              jst.$div({cn: '-inputDiv'}, jst.$input({cn: '-input -nameInput', value: this.name, ref: 'nameInput'})),
            ),
            jst.$div({cn: '-selectInput'},
              jst.$div({cn: '-inputLabel'}, "Protocol"),
              jst.$div({cn: '-inputDiv'}, 
                jst.$select({cn: '', ref: 'protoInput'},
                  SUPPORTED_PROTO.map(p => jst.$option(
                    Object.assign({value: p.proto}, this.protocol==p.proto ? {selected: true} : {}),
                    p.name
                  ))              
                )
              )
            ),
            jst.$div({cn: '-textInput'},
              jst.$div({cn: '-inputLabel'}, "Connect URL"),
              jst.$div({cn: '-inputDiv'}, jst.$input({cn: '-input -urlInput', value: this.url, ref: 'urlInput'})),
            ),
            jst.$div({cn: '-textInput'},
              jst.$div({cn: '-inputLabel'}, "Username"),
              jst.$div({cn: '-inputDiv'}, jst.$input({cn: '-input -usernameInput', value: this.username, ref: 'usernameInput'})),
            ),
            jst.$div({cn: '-textInput'},
              jst.$div({cn: '-inputLabel'}, "Password"),
              jst.$div({cn: '-inputDiv'}, jst.$input({cn: '-input -passwordInput', type: 'password', value: this.password, ref: 'passwordInput'})),
            ),
          ),
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

  getConnectionOpts() {
    return {
      protocol: this.protocol,
      host:     this.url,
      username: this.username,
      password: this.password
    }
  }

  changeConfig(name, proto, url, username, password) {
    let oldName   = this.name;
    this.name     = name;
    this.protocol = proto;
    this.url      = url;
    this.username = username;
    this.password = password;
    this.world.handleBrokerConfigChange(oldName, this);
    this.world.save();
    this.refresh();
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
      y: this.y,
    };
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

  select(e) {
    console.log("broker selected")
    e.preventDefault();
    e.stopPropagation();
    this.world.entitySelected(this);
    this.showControls = true;
    this.refresh();
  }

  unselect() {
    if (this.showControls && this.nameInput && this.nameInput.el) {
      let name     = this.nameInput.el.value;
      let proto    = this.protoInput.el.value;
      let url      = this.urlInput.el.value;
      let username = this.usernameInput.el.value;
      let password = this.passwordInput.el.value;
      this.changeConfig(name, proto, url, username, password);
    }

    this.showControls = false;
    this.showSettings = false;
    this.deleteActive = true;
    this.refresh();
  }

  openSettings(e) {
    e.stopPropagation();
    e.preventDefault();
    this.showSettings = true;
    this.deleteActive = false;
    this.refresh();
  }

  serialize() {
    return {
      type: 'broker',
      x: this.x,
      y: this.y,
      name: this.name,
      url: this.url,
      protocol: this.protocol,
      username: this.username,
      password: this.password,
      width: this.width,
      height: this.height,
    };
  }

 
}