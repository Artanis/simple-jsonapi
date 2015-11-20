// jshint esnext:true

/**
 * Find an object in `store` by the information given in `identifier`.
 * The returned object may be a placeholder.
 *
 * WARNING: The reference is important for making and keeping relationships
 * between deserializeResponsed objects. Losing this reference will result in broken
 * relationships.
 */
function lookup(store, identifier) {
  return store.find(record => {
    return (
      record.__raw__.type === identifier.type &&
      record.__raw__.id   === identifier.id);
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
  if(placeholder === undefined) {
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
      attributes:    object.attributes    !== undefined? Object.keys(object.attributes):    [],
      relationships: object.relationships !== undefined? Object.keys(object.relationships): []
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

  Object.defineProperty(obj, "meta",  {
    value: Object.assign({}, obj.__raw__.meta),
    enumerable: true
  });

  Object.defineProperty(obj, "links", {
    value: Object.assign({}, obj.__raw__.links),
    enumerable: true
  });

  Object.assign(obj, obj.__raw__.attributes);

  if(obj.__raw__.relationships !== undefined) {
    for(let name in obj.__schema__.relationships) {
      name = obj.__schema__.relationships[name];

      let related;
      let relationship = obj.__raw__.relationships[name];
      if(Array.isArray(relationship.data)) {
        related = relationship.data.map(identifier => {
          let result = lookup(store, identifier);
          if(result === undefined) {
            result = {__raw__: Object.freeze(identifier)};
            store.push(result);
          }
          return result;
        });
      } else {
        related = lookup(store, relationship.data);
        if(related === undefined) {
          related = {__raw__: Object.freeze(relationship.data)};
          store.push(related);
        }
      }

      obj[name] = related;
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
  if(Array.isArray(response.data)) {
    data = response.data.map(record => {
      return deserialize(record, store);
    });
  } else {
    data = deserialize(response.data, store);
  }

  if(response.included !== undefined) {
    response.included.map(record => {
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
  if(object.id !== undefined) {
    resobj.id = object.id;
  }

  if(object.__schema__.attributes.length > 0) {
    resobj.attributes = object.__schema__.attributes.map(name => {
      return object[name];
    });
  }

  if(object.__schema__.relationships.length > 0) {
    resobj.relationships = {};

    object.__schema__.relationships.map(name => {
      let relationship = object[name];

      if(Array.isArray(relationship)) {
        resobj.relationships[name] = {data: relationship.map(related => {
          return {type: related.type, id: related.id};
        })};
      } else {
        resobj.relationships[name] = {data: {type: relationship.type, id: relationship.id}};
      }
    });
  }

  if(Object.keys(object.meta).length > 0) {
    resobj.meta = Object.assign({}, object.meta);
  }

  if(Object.keys(object.links).length > 0) {
    resobj.links = Object.assign({}, object.links);
  }

  return {data: resobj};
}

export {serialize, deserialize};
