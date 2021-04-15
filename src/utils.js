// utils.js - a collection of useful functions

export let utils = {
  stopEvent: function(e) {
    e.stopPropagation();
    e.preventDefault();
    return false;
  },
  noProp: function(e) {
    e.stopPropagation();
    return false;
  }
};