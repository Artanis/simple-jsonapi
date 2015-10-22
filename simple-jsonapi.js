(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.SimpleJsonApi = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// jshint esnext:true

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function resolve(resources, identifier) {
  return resources.find(function (resource) {
    return resource._type === identifier.type && resource._id === identifier.id;
  });
}

var ResourceObject = (function () {
  function ResourceObject(record) {
    _classCallCheck(this, ResourceObject);

    // Preserve data
    this._type = record.type;
    this._id = record.id;
    this._attributes = record.attributes;
    this._relationships = record.relationships;
    this._links = record.links;
    this._meta = record.meta;

    // Copy attributes into object root for easy access.
    // Relationships will also be placed into object root, once they are
    // resolved.
    Object.assign(this, record.attributes);
  }

  /**
   * Resolves any relationships on the resource.
   *
   * Unresolved identifiers are ignored. For example, an response with no
   * included documents will have a series of empty relationship attributes.
   * The original Resource Object Identifiers are available in
   * `ResourceObject._relationships`.
   *
   * TODO: Find a better name?
   *
   * @param resources An array of `ResourceObject`s (searched for matches)
   *
   */

  _createClass(ResourceObject, [{
    key: "derefRelationships",
    value: function derefRelationships(resources) {
      // ResourceObjects with no relationships tend to have the relationships
      // member omitted, and thus undefined.
      if (this._relationships !== undefined) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = Object.keys(this._relationships)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _name = _step.value;

            var related = this._relationships[_name];

            var result = undefined;
            if (Array.isArray(related.data)) {
              result = related.data.map(resolve.bind(undefined, resources)).filter(function (n) {
                return n !== undefined;
              });
            } else {
              result = resolve(resources, related.data);
            }
            this[_name] = result;
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"]) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
    }
  }]);

  return ResourceObject;
})();

function deserialize(document) {
  if (document.data === undefined) {
    return undefined;
  }

  // Deserialize primary data.
  var data = undefined;
  if (Array.isArray(document.data)) {
    data = document.data.map(function (record) {
      return new ResourceObject(record);
    });
  } else {
    data = new ResourceObject(document.data);
  }

  if (document.included !== undefined) {
    (function () {
      // Deserialize included data seperately. Primary data will be returned,
      // but included data will only be accessible through their relationships.
      var included = document.included.map(function (record) {
        return new ResourceObject(record);
      });

      // Dereferencing relationships is in a second pass to avoid
      // complications with cyclic relationships. Single-pass solutions that
      // don't break Polymer are very much welcome!
      var resources = [].concat(data, included);
      resources.forEach(function (resourceObject) {
        resourceObject.derefRelationships(resources);
      });
    })();
  }

  return data;
}

exports.ResourceObject = ResourceObject;
exports.deserialize = deserialize;
exports.resolve = resolve;

},{}]},{},[1])(1)
});