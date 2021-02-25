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
        right$px: 0,
        //border$px: [1, 'solid', '#888']
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
        jst.$div({cn: '-button', events: {click: e => this.click('emitter')}}, "Event Emitter"),
        jst.$div({cn: '-button', events: {click: e => this.click('portal')}}, "Event Portal"),
        jst.$div({cn: '-button', events: {click: e => this.click('fixed-body')}}, "Rectangle"),
        jst.$div({cn: '-button', events: {click: e => this.click('text')}}, "Text Block"),
      )
    )
  }

  resize(scale) {
    this.scale = scale;
    this.refresh();
  }

  click(type) {
    this.world.addItem(type)
  }

}