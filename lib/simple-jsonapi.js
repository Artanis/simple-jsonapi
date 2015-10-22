// jshint esnext:true

function resolve(resources, identifier) {
  return resources.find(resource => {
    return (
      resource._type === identifier.type &&
      resource._id === identifier.id);
  });
}


class ResourceObject {
  constructor(record) {
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
  derefRelationships(resources) {
    // ResourceObjects with no relationships tend to have the relationships
    // member omitted, and thus undefined.
    if(this._relationships !== undefined) {
      for(let name of Object.keys(this._relationships)) {
        let related = this._relationships[name];

        let result;
        if(Array.isArray(related.data)) {
          result = related.data.map(resolve.bind(undefined, resources)).filter(n => {
            return n !== undefined;
          });
        } else {
          result = resolve(resources, related.data);
        }
        this[name] = result;
      }
    }
  }
}


function deserialize(document) {
  if(document.data === undefined) {
    return undefined;
  }


  // Deserialize primary data.
  let data;
  if(Array.isArray(document.data)) {
    data = document.data.map(record => {
      return new ResourceObject(record);
    });
  } else {
    data = new ResourceObject(document.data);
  }

  // Deserialize included data seperately. Primary data will be returned,
  // but included data will only be accessible through their relationships.
  let included = document.included.map(record => {
    return new ResourceObject(record);
  });

  // Dereferencing relationships is in a second pass to avoid
  // complications with cyclic relationships. Single-pass solutions that
  // don't break Polymer are very much welcome!
  if(document.included !== undefined) {
    let resources = [].concat(data, included);
    resources.forEach(resourceObject => {
      resourceObject.derefRelationships(resources);
    });
  }

  return data;
}

export {ResourceObject, deserialize, resolve};
