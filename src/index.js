// index.js

import {jst}            from "jayesstee";
import {MainApp}        from "./app";

let app = new MainApp();

jst("body").appendChild(app);
