(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.SimpleJsonApi = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// jshint esnext:true

/**
 * Find an object in `store` by the information given in `identifier`.
 * The returned object may be a placeholder.
 *
 * WARNING: The reference is important for making and keeping relationships
 * between deserializeResponsed objects. Losing this reference will result in broken
 * relationships.
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
function lookup(store, identifier) {
  return store.find(function (record) {
    return record.__raw__.type === identifier.type && record.__raw__.id === identifier.id;
  });
}

/**
 * DeserializeResponses a JSON-API Resource Object into a flat, easy to use object.
 *
 *
 */
function deserialize(object, store) {
  // Try to find any placeholder object
  // Otherwise make a new object and insert it into the array.
  var obj;
  var placeholder = lookup(store, object);
  if (placeholder === undefined) {
    obj = {};
    store.push(obj);
  } else {
    obj = placeholder;
  }

  // Copy frozen original object data and rouch schema into immutable
  // containers.
  Object.defineProperty(obj, "__raw__", {
    value: Object.freeze(object)
  });

  Object.defineProperty(obj, "__schema__", {
    value: Object.freeze({
      attributes: object.attributes !== undefined ? Object.keys(object.attributes) : [],
      relationships: object.relationships !== undefined ? Object.keys(object.relationships) : []
    })
  });

  // Top-level members are not writable or configurable.
  // For `type` and `id`, this means they cannot be changed or removed,
  // however, the `links` and `meta` objects contents may be altered.
  Object.defineProperty(obj, "type", {
    value: obj.__raw__.type,
    enumerable: true
  });

  // A new object won't have an id.
  Object.defineProperty(obj, "id", {
    value: obj.__raw__.id || undefined,
    enumerable: true
  });

  Object.defineProperty(obj, "meta", {
    value: Object.assign({}, obj.__raw__.meta),
    enumerable: true
  });

  Object.defineProperty(obj, "links", {
    value: Object.assign({}, obj.__raw__.links),
    enumerable: true
  });

  Object.assign(obj, obj.__raw__.attributes);

  if (obj.__raw__.relationships !== undefined) {
    for (var _name in obj.__schema__.relationships) {
      _name = obj.__schema__.relationships[_name];

      var related = undefined;
      var relationship = obj.__raw__.relationships[_name];
      if (Array.isArray(relationship.data)) {
        related = relationship.data.map(function (identifier) {
          var result = lookup(store, identifier);
          if (result === undefined) {
            result = { __raw__: Object.freeze(identifier) };
            store.push(result);
          }
          return result;
        });
      } else {
        related = lookup(store, relationship.data);
        if (related === undefined) {
          related = { __raw__: Object.freeze(relationship.data) };
          store.push(related);
        }
      }

      obj[_name] = related;
    }
  }

  return obj;
}

/**
 * Deserialize a full JSON-API response.
 *
 * Optionally provide an array `store` to preserve object references for
 * later relationship dereferencing.
 */
deserialize.document = function (response, store) {
  store = store || [];

  var data;
  if (Array.isArray(response.data)) {
    data = response.data.map(function (record) {
      return deserialize(record, store);
    });
  } else {
    data = deserialize(response.data, store);
  }

  if (response.included !== undefined) {
    response.included.map(function (record) {
      return deserialize(record, store);
    });
  }

  return data;
};

/**
 * Serialize a single object into a JSON-API document.
 */
function serialize(object) {
  var resobj = {};

  resobj.type = object.type;

  // A new object might not have an id yet.
  if (object.id !== undefined) {
    resobj.id = object.id;
  }

  if (object.__schema__.attributes.length > 0) {
    resobj.attributes = object.__schema__.attributes.map(function (name) {
      return object[name];
    });
  }

  if (object.__schema__.relationships.length > 0) {
    resobj.relationships = {};

    object.__schema__.relationships.map(function (name) {
      var relationship = object[name];

      if (Array.isArray(relationship)) {
        resobj.relationships[name] = { data: relationship.map(function (related) {
            return { type: related.type, id: related.id };
          }) };
      } else {
        resobj.relationships[name] = { data: { type: relationship.type, id: relationship.id } };
      }
    });
  }

  if (Object.keys(object.meta).length > 0) {
    resobj.meta = Object.assign({}, object.meta);
  }

  if (Object.keys(object.links).length > 0) {
    resobj.links = Object.assign({}, object.links);
  }

  return { data: resobj };
}

exports.serialize = serialize;
exports.deserialize = deserialize;

},{}]},{},[1])(1)
});