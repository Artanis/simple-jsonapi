# `simple-jsonapi`

`simple-jsonapi` is a small [JSON API](https://jsonapi.org) client library. It will transform JSON API compliant response data into easy-to-use objects, with relationships between the records in the response resolved.

## Installation

*This package has not yet been published to bower. Please install from Github directly.*

    bower install https://github.com/Artanis/simple-jsonapi.git#0.1.0

## Usage

After you fetch and parse the JSON-API response from the server:

    var result = SimpleJsonApi.deserialize(response);

If the response is a collection (e.g.: `https://jsonapi.example.com/articles`), you will have an array of deserialized objects.

If the response is a single object (`https://jsonapi.example.com/articles/1`), it will be a single object.

In both cases, relationships between all objects in the response document will have been resolved.

The deserialized objects will have attributes and relationships available at the top-level, alongside `type`, `id`, `meta`, and `links`.

### Polymer

If you are using this library with Polymer, simply import `simple-jsonapi.html`, which will source the javascript file for you:

    <link rel="import" href="../simple-jsonapi/simple-jsonapi.html">

If multiple components use the library this way, it will only be loaded once.

Also, consider checking out [jsonapi-resource](https://github.com/Artanis/jsonapi-resource), a Polymer element that provides a declarative interface to `simple-jsonapi`.

## Examples

### Multiple requests

It is possible to dereference relationships between documents made through multiple requests and subsequent deserializations.

    var store = [];
    var result1 = SimpleJsonApi.deserialize(response, store);

 The array `store` contains all the records found in the response, as well as identifiers referenced by relationships that weren't satisfied by the response.

    var result2 = SimpleJsonApi.deserialize(response2, store);

Since store already had objects in it, these are used to dereference relationships in the new response. However, since the relationships of already deserialized objects use references to objects in this array that are merely updated and never replaced, those relationships _also_ become resolved.

## Development

Clone and install development dependencies:

    git clone https://github.com/Artanis/simple-jsonapi.git
    cd simple-jsonapi
    npm install

After making changes to `./lib/simple-jsonapi.js`, compile the ES6
source to ES5 with:

    npm run build

Remember to execute this comment before committing any changes!
