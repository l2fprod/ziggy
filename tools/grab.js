var request = require("request"),
  async = require("async"),
  _ = require("underscore"),
  fs = require("fs");

var env = JSON.parse(fs.readFileSync("env.json"));

var inputFilename = process.argv[2];
console.log("Loading", inputFilename);
var artist = JSON.parse(fs.readFileSync(inputFilename));

var ziggyAlbums = [];
var ziggySongs = [];

var discog = require("./discog.js")(env.discog[0].credentials.key,
  env.discog[0].credentials.secret);
var chartlyrics = require("./chartlyrics.js")();

async.waterfall([
  // grab the albums
  function (callback) {
    discog.getAlbums(artist.name, function (err, albums) {
      if (err) {
        callback(err);
      } else {
        console.log("Found", albums.length, "albums");

        albums = albums.filter(function (album) {
          return album.hasOwnProperty("year");
        });

        albums = _.sortBy(albums, function (album) {
          return album.year;
        });

        albums.forEach(function (album) {
          console.log(album.year, album.title);
        });

        callback(null, albums);
      }
    });
  },
  // grab the songs
  function (albums, callback) {
    var tasks = [];
    albums.forEach(function (album) {
      tasks.push(function (callback) {
        discog.getAlbum(album.id, function (err, albumDetails) {
          if (err) {
            console.log(err);
          } else {
            var tracks = albumDetails.tracklist.filter(function (item) {
              return item.type_ == "track";
            });

            console.log("Found", tracks.length, "songs in", albumDetails.title);

            ziggyAlbums.push({
              _id: albumDetails.title,
              cover: albumDetails.images ? albumDetails.images[0].uri : "",
              applemusic: "",
              year: albumDetails.year,
              songs: tracks.map(function (track) {
                return track.title;
              })
            });

            tracks.forEach(function (track) {
              ziggySongs.push({
                _id: track.title,
                name: track.title,
                lyrics: ""
              })
            });
          }
          callback(null);
        });
      });
    });
    async.waterfall(tasks, function (err, result) {
      callback(null);
    });
  },
  // get all lyrics
  function (callback) {
    var tasks = [];
    ziggySongs.forEach(function (song) {
      tasks.push(function (callback) {
        console.log("Getting lyrics for", song.name);
        chartlyrics.getLyrics(artist.name, song.name, function (err, lyrics) {
          if (!err) {
            song.lyrics = lyrics;
          }
          // leave 1s between two songs to not overload the server
          setTimeout(function () {
            callback(null);
          }, 1000);
        });
      });
    });

    async.waterfall(tasks, function (err, result) {
      callback(null);
    });
  }
], function (err, result) {
  if (err) {
    console.log(err);
  } else {
    var songsOutput = fs.createWriteStream(artist.name + "-songs.json");
    songsOutput.once('open', function (fd) {
      songsOutput.write(JSON.stringify({
        docs: ziggySongs
      }, null, 2));
    });

    var albumsOutput = fs.createWriteStream(artist.name + "-albums.json");
    albumsOutput.once('open', function (fd) {
      albumsOutput.write(JSON.stringify({
        docs: ziggyAlbums
      }, null, 2));
    });
    console.log("Done!");
  }
});
