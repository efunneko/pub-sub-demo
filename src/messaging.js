// messaging.js

import solace from 'solclientjs';

export class Messaging {
  constructor(opts) {
    this.host     = opts.host;
    this.vpn      = opts.vpn || "default";
    this.username = opts.username;
    this.password = opts.password;
  }

  initSolace() {
    let properties = new solace.SolclientFactoryProperties();
    properties.profile = solace.SolclientFactoryProfiles.version10;
    solace.SolclientFactory.init(properties);
    solace.SolclientFactory.setLogLevel(solace.LogLevel.TRACE);
  }

  connect() {
    this.session = solace.SolclientFactory.createSession({
      // solace.SessionProperties
      url:      this.host,
      vpnName:  this.vpn,
      userName: this.username,
      password: this.password,
    });
    // define session event listeners
        /*...see section Session Events...*/
    // define message event listener
        /*...see section Receiving a message...*/
    // connect the session
    try {
        this.session.connect();
    } catch (error) {
        console.log(error.toString());
    }    
  }

}

