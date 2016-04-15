var request = require('request');

function ChartLyrics(key, secret) {
  var self = this;

  self.getLyrics = function (artist, song, callback) {
    request.get(
      "http://api.chartlyrics.com/apiv1.asmx/SearchLyricDirect?artist=" +
      encodeURIComponent(artist) + "&song=" + encodeURIComponent(song),
      function (err, response, body) {
        if (err) {
          callback(err, null);
        } else {
          callback(null, body.substring(body.indexOf("<Lyric>") + 7, body.indexOf("</Lyric>")));
        }
      });
  }
}

module.exports = function () {
  return new ChartLyrics();
}
