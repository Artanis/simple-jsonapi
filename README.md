# `simple-jsonapi`

`simple-jsonapi` is a small [JSON API](https://jsonapi.org) client library. It will transform JSON API compliant response data into easy-to-use objects, with relationships between the records in the response resolved.

## Installation

*This package has not yet been published to bower. Please install from Github directly.*

    bower install https://github.com/Artanis/simple-jsonapi.git#0.1.0

## Usage

Browserify is configured to export `simple-jsonapi`to the global name `SimpleJsonApi`.

### Deserializing a JSON API document

The `deserialize()` function will transform a JSON API response into
`ResourceObject`s. If the response was a single resource object, it will return a representation of that object. If the response was a collection of resource objects, it will return an array of objects.

If the response was a compound document, with related resources included, those relationships will be resolved. Included documents are not returned, and are only available through relationships on objects in
the primary data.

    var data = SimpleJsonApi.deserialize(response);

### Polymer

If you are using Polymer, simply import `simple-jsonapi.html`, which will source the javascript file for you:

    <link rel="import" href="../simple-jsonapi/simple-jsonapi.html">

### `ResourceObject`s

Top-level members are copied into underscore-prefixed names, while attributes and resolved relationships are placed into the object root. For example:

    var response = {
      data: {
        type: "article",
        id: "1",
        attributes: {
          title: "JSON API paints my bikeshed!",
          body: "Shortest article. Ever."
        },
        relationships: {
          author: {
            data: {type: "people", id: "9"}
          }
        }
      },
      included: [
        {type: "people", id: "9", attributes: {name: "Dan Gebhardt"}}
      ]};

    var resobject = SimpleJsonApi.deserialize();

    console.log(resobject);
    // ResourceObject {
    //   _type: "article",
    //   _id: "1",
    //   _attributes: {...},
    //   _relationships: {...},
    //   _meta: undefined,
    //   _links: undefined,
    //   title: "JSON API paints my bikeshed!",
    //   body: "Shortest article. Ever.",
    //   author: ResourceObject {
    //     _type: "people",
    //     _id: "9",
    //     _attributes: {...},
    //     _relationships: {},
    //     _meta: undefined,
    //     _links: undefined,
    //     name: "Dab Gebhardt"
    //   }
    // }

## Development

Clone and install development dependencies:

    git clone https://github.com/Artanis/simple-jsonapi.git
    cd simple-jsonapi
    npm install

After making changes to `./lib/simple-jsonapi.js`, compile the ES6
source to ES5 with:

    npm run build

`npm build` is also run pre-commit. Any changes made directly to the
build target will be lost.
