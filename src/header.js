// header.js

import {jst}                   from "jayesstee";

export class Header extends jst.Component {
  constructor() {
    super();
  }

  cssLocal() {
    return {
      header$c: {
        fontFamily: "'Times New Roman', 'Times', serif",
        fontSize: "200%",
        color: "white",
        backgroundColor: "#00c895",
        padding$pt: 7,
        height$pt: 20
      },
      logo$c: {
        objectFit: "contain",
        width: "auto",
        height: "100%"
      }
    };
  }

  render() {
    return jst.$div({class: '-header'},
    jst.$img({cn: '-logo', src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAXwAAABgCAMAAAApWjmsAAAAsVBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+3mHKcAAAAOnRSTlMAipb78wUC98vEmXVjTUPmq1QLkAju3TAjEurh19GFXiqie6e6bEhZMxkWvyc6ryBntR2cfz5xQQ83z5YMRgAADe1JREFUeNrs0DEKgDAQRcGooFam0CKNSAoLSS0E738wTxDYJnxY3hxhgsDcEtDbU9aGO6CztHwNQ0BnaSJfpu4n+TrHmxfydbZIvs5Fvk6N5OsU8nUy+Toj+Wbke0K+HfmekG9Hvifk25HvCfl25HtCvh35npBvR/7PvpltpwoEUbQUUFCRoCCCqETRiOIQjVP9/4fdYSWhq5tB0ftyV/ajsIDafarqyf+JH/m38yP/f+JHvkhnu2jr+nwdu8Bi9fsR5FOLFvp4t9u1zHN8+TfyO/tgPdf/fJ6zvdSgFLVl0DZbv79zrC+iO56hRMFR1/Vj4MI/wTp+hD0Z/1I3tMY4UOCTiSyHkEO/9ap6En5SH6xGc/ep8i2nVV317K9XSPJAffnQt3AfceugGt+fKXlq9S26Rbwzmw4/y5MMrasv4clEzSFy1NXK/O97HA9RgyzcViijwKBxfJZ85dgdSpiCrH0sbk7v9qTVUcCbtguesG+q/MuN6vWpqT8NMBVvVWk2PMyWv5wMMB0p1J8h392pmI2kzW7KoXOwMYPVPO/IKl7qazfP0x+vMJdM+bVWj0TR8Ei6Ns6j8pWdz9Zcl1BgMCmcw/uqzAbX9z1i8nWflckme6Nt2MxY6D5p+q8HbJQqLdPcVUL7BvnxO2v+oPeXy2DM/mafag/Jv2r4Ra8xPgZ9Z21+CFPONyGXMVOfV7m6ihKNyZDtpYff0Zjqqu29G10nSdj881PcM8cbrr/TMhsWyTcNTFAXqT+/LB+QP5O/nc0u8E3QlZAyyhnclwMmvPe/pllI1tsYRN6Y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'}),
    );
  }
}