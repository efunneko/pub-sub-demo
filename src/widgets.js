// widgets.js - a few helpful components

import {jst} from 'jayesstee';

export class ClickableRange extends jst.Component {
  constructor(opts) {
    super();

    this.numButtons  = opts.numButtons || 10;
    this.value       = opts.value || 1;
    this.color       = opts.color || 'blue';
    this.width       = opts.width || 11;
    this.height      = opts.height || 1.7;
    this.borderWidth = opts.borderWidth || 0.25;
    this.events      = opts.events;
    console.log("CR:", this. height)
    //this.icon        = opts.icon;

  }

  cssLocal() {
    return {
      range$c: {

      },
      first$c: {
        borderRadius$px: [0.05 * this.height, 0, 0, 0.05 * this.height]
      },
      last$c: {
        borderRadius$px: [0, 0.05 * this.height, 0.5 * this.height, 0]
      }
    }
  }

  cssInstance() {
    return {
      full$c: {
        display: 'inline-block',
        //width$px: this.width * this.scale,
        width$px: this.width,
        height$px: this.height,
        lineHeight$px: 0,
      },
      range$c: {
        width: '100%',
        height: '100%',
        padding: '3%',
        borderRadius$px: 0.05 * this.height,
        backgroundColor: 'white'
      },
      button$c: {
        display: 'inline-block',
        width: `${100/this.numButtons}%`,
        height: '100%',
      },
      on$c: {
        backgroundColor: this.color
      },
      off$c: {
        backgroundColor: jst.rgba(0,0,0,0)
      },
    }
  }

  render() {
    console.log("clickrange", this.scale, this.width)
    return jst.$div({cn: '--full -full'},
      jst.$div({cn: '--range -range'},
        new Array(this.numButtons).fill(0).map((item, i) => 
          jst.$div({
            cn: `--button ${this.value >= i ? '--on' : '--off'} ${i==0 ? '-first' : i == this.numButtons-1 ? '-last' : ''}`, 
            style: `opacity: ${0.5 + 0.5* i/this.numButtons}`,
            events: {click: e => this.select(e, i)}
          }))
      )
    );
  }

  resize(width, height) {
    this.width  = width;
    this.height = height;
    this.refresh();
  }

  select(e, index) {
    e.stopPropagation();
    e.preventDefault();
    this.value = index;

    if (this.events && this.events.change) {
      this.events.change(index);
    }

    this.refresh();
  }

}