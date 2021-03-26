// tool-bar.js - top tool bar in 'world'

import {jst}                   from "jayesstee";

export class ToolBar extends jst.Component {
  constructor(world, scale) {
    super();

    this.world = world;
    this.resize(scale);

  }

  cssLocal() {
    return {
      toolBar$c: {
        position: 'absolute',
        top$px: 0,
        left$px: 0,
        right$px: 0
      },
      buttonBar$c: {

      },
      button$c: {
        display: 'inline-block',
        fontFamily: "'Arial', 'sans'",
        margin$px: [this.scale * 1, this.scale * 1, 0, this.scale * 1],
        padding$px: this.scale * 1,
        borderRadius$px: 1 * this.scale,
        border$px: [1, 'solid', '#555'],
        boxShadow$px: [0, 0.5*this.scale, 1*this.scale, jst.rgba(0,0,0,0.3)]
      },
      button$c$hover: {
        backgroundColor: '#ffb',
        boxShadow$px: [0, 1*this.scale, 2*this.scale, jst.rgba(0,0,0,0.4)]
      }
    }

  }

  render() {
    return jst.$div({cn: '-toolBar'},
      jst.$div({cn: '-buttonBar'},
        jst.$div({cn: '-button', events: {click: e => this.start()}},               "Start"),
        jst.$div({cn: '-button', events: {click: e => this.addItem('emitter')}},    "Event Emitter"),
        jst.$div({cn: '-button', events: {click: e => this.addItem('portal')}},     "Portal"),
        jst.$div({cn: '-button', events: {click: e => this.addItem('fixed-body')}}, "Rectangle"),
        jst.$div({cn: '-button', events: {click: e => this.removeAllEvents()}},     "Remove All Events"),
        jst.$div({cn: '-button', events: {click: e => this.removeSelected()}},      "Remove Selected"),
      )
    )
  }

  resize(scale) {
    this.scale = scale;
    this.refresh();
  }

  // Button Handlers
  
  addItem(type) {
    this.world.addItem(type)
  }

  removeAllEvents() {
    this.world.removeAllEvents();
  }

  removeSelected() {
    this.world.removeSelectedEntity();
  }

  start() { 
    this.world.getAccel()
  }

}