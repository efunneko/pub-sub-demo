// RenderBody.js - simple jst component to represent a body to be drawn

import {jst} from 'jayesstee';

export class RenderBody extends jst.Component {
  constructor(id, opts) {
    super();
    this.id         = id;

    this.renderOpts = Object.assign({}, opts);

    this.width      = this.renderOpts.width  || 100;
    this.height     = this.renderOpts.height || 100;

    this.halfWidth  = this.width/2;
    this.halfHeight = this.height/2;
    //this.halfWidth  = 0;
    //this.halfHeight = 0;

    this.x          = opts.x ? opts.x - this.halfWidth : 0;
    this.y          = opts.y ? opts.y - this.halfHeight : 0;
    this.angle      = opts.angle || 0;

  }

  cssInstance() {
    console.log("refreshing", this.y)
    return {
      body$c: {
        display: 'table-cell',
        width$px: this.width,
        height$px: this.height,
        lineHeight$px: this.height,
        transform: jst.rotate(jst.rad(this.angle)),
        left$px: this.x,
        top$px: this.y,
        borderRadius$px: this.renderOpts.cornerRadius || 0,
        backgroundColor: this.renderOpts.color || "lightblue"
      }
    };
  }

  cssLocal() {
    return {
      body$c: {
        position: 'fixed',
        textAlign: 'center',
        verticalAlign: 'middle'
      }
    }
  }

  render() {
    return jst.$div({cn: '-body --body'}, this.renderOpts.text)
  }

  update(body) {
    let needsRefresh = false;
    if (body.anglePrev != body.angle) {
      this.angle = body.angle;
      needsRefresh = true;
    }
    if (body.position.x != body.positionPrev.x || body.position.y != body.positionPrev.y) {
      this.x = body.position.x - this.halfWidth;
      this.y = body.position.y - this.halfHeight;
      console.log("new position", body.position.x, this.halfWidth, this.x)
      needsRefresh = true;
    }

    if (needsRefresh) {
      this.refresh();
    }

  }

}