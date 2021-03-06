
/**
  Listens for Dock connections from Newton Devices, starts Dock Sessions for
  new connections
@class NcuServer
 */

(function() {
  var DockSession, EventEmitter, NcuServer, _, net,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  net = require('net');

  EventEmitter = require('events').EventEmitter;

  _ = require('lodash');

  DockSession = require('./dock-session');

  module.exports = NcuServer = (function() {
    _.extend(NcuServer.prototype, EventEmitter.prototype);


    /**
    @property newtonPort
     */

    NcuServer.prototype.newtonPort = 3679;


    /**
    @property netServer
     */

    NcuServer.prototype._netServer = null;


    /**
    @property connections
     */

    NcuServer.prototype._connections = null;


    /**
    @class NcuServer
    @constructor
     */

    function NcuServer() {
      this._newConnection = bind(this._newConnection, this);
      this._initialize();
    }


    /**
      all init method go here
    @method initialize
     */

    NcuServer.prototype._initialize = function() {
      return this._initNetServer();
    };


    /**
      init TCP server listening for connections
    @method initNetServer
     */

    NcuServer.prototype._initNetServer = function() {
      this._connections = {};
      this._netServer = net.createServer(this._newConnection);
      this._netServer.listen(this.newtonPort, '0.0.0.0');
      return console.log("NCU server listening connections at port " + this.newtonPort);
    };


    /**
      new client connection handler. Creates a new session object. all session
      logic is handled inside
    @method newConnection
     */

    NcuServer.prototype._newConnection = function(socket) {
      var connId, sessionObj;
      connId = socket.remoteAddress + "_" + (new Date().getTime());
      console.log("new connection " + connId);
      sessionObj = new DockSession({
        socket: socket
      });
      this._connections[connId] = sessionObj;
      return socket.on('close', (function(_this) {
        return function() {
          var ref;
          console.log("connection " + connId + " closed");
          return (ref = _this._connections) != null ? delete ref[connId] : void 0;
        };
      })(this));
    };

    NcuServer.prototype.connectionsCount = function() {
      return _.size(this._connections);
    };


    /**
    @method dispose
     */

    NcuServer.prototype.dispose = function() {
      var i, j, len, len1, prop, properties, ref, session;
      if (this.disposed) {
        return;
      }
      this.emit('dispose', this);
      this.removeAllListeners();
      ref = this._connections;
      for (i = 0, len = ref.length; i < len; i++) {
        session = ref[i];
        session.dispose();
      }
      this._netServer.close();
      properties = ['_connections', '_netServer'];
      for (j = 0, len1 = properties.length; j < len1; j++) {
        prop = properties[j];
        delete this[prop];
      }
      this.disposed = true;
      return typeof Object.freeze === "function" ? Object.freeze(this) : void 0;
    };

    return NcuServer;

  })();

}).call(this);
