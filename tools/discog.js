var request = require('request');

function Discog(key, secret) {
  var self = this;

  var apiRoot = "https://api.discogs.com";

  function collectSearchResult(searchUrl, results, resultKey, callback) {
    request.get(searchUrl, {
      json: true,
      headers: {
        "User-Agent": "My lyrics analyzer",
        "Authorization": "Discogs key=" + key + ", secret=" + secret
      }
    }, function (err, response, body) {
      if (err) {
        callback(err, null);
      } else {
        results = results.concat(body[resultKey]);
        if (body.pagination.urls.next) {
          console.log("Next result page", body.pagination.urls.next);
          collectSearchResult(body.pagination.urls.next, results, resultKey, callback);
        } else {
          console.log("Final results");
          callback(null, results);
        }
      }
    });
  }

  self.search = function (query, callback) {
    collectSearchResult(query, [], "results", callback);
  }

  self.getArtist = function (name, callback) {
    request.get(apiRoot + "/database/search?type=artist&q=" + encodeURIComponent(name), {
      json: true,
      headers: {
        "User-Agent": "My lyrics analyzer",
        "Authorization": "Discogs key=" + key + ", secret=" + secret
      }
    }, function (err, response, body) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, body.results);
      }
    });
  }

  self.getAlbums = function (artistName, callback) {
    collectSearchResult(apiRoot + "/database/search?artist=" + encodeURIComponent(artistName) + "&type=master&format=Album", [], "results", callback);
  }

  self.getAlbum = function (albumId, callback) {
    request.get(apiRoot + "/masters/" + albumId, {
      json: true,
      headers: {
        "User-Agent": "My lyrics analyzer",
        "Authorization": "Discogs key=" + key + ", secret=" + secret
      }
    }, function (err, response, body) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, body);
      }
    });
  }
}

module.exports = function (key, secret) {
  return new Discog(key, secret);
}
