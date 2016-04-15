var fs = require("fs");

var inputFilename = process.argv[2];
console.log("Loading", inputFilename);
var artist = JSON.parse(fs.readFileSync(inputFilename));
var albums = JSON.parse(fs.readFileSync(process.argv[3]));
var songs = JSON.parse(fs.readFileSync(process.argv[4]));
var watson = require('watson-developer-cloud');
var async = require('async');

var env = JSON.parse(fs.readFileSync("env.json"));

// Create the service wrapper
var personalityInsights = watson.personality_insights({
  version: 'v2',
  username: env.personality_insights[0].credentials.username,
  password: env.personality_insights[0].credentials.password
});

var songsById = {};
songs.docs.forEach(function (song) {
  songsById[song._id] = song;
});

var personas = [];

var combined = [];
var computePersonalityTasks = [];

artist.personas.forEach(function (persona) {
  // attach all albums for this period
  persona.albums = [];

  var personalityText = "";

  albums.docs.forEach(function (album) {
    if (album.songs && album.year >= persona.start && album.year < persona.end) {

      console.log(album._id);
      // grab the lyrics for all songs in this album
      album.songs.forEach(function (songId) {
        personalityText = personalityText + songsById[songId].lyrics;
      });

      delete album.songs;
      persona.albums.push(album);
    }
  });

  computePersonalityTasks.push(function (callback) {
    console.log("PI for", persona._id, personalityText.length);
    personalityInsights.profile({
      text: personalityText
    }, function (err, profile) {
      if (err) {
        callback(err);
      } else {
        profile.id = persona._id;
        combined.push({
          data: profile
        });
        callback(null);
      }
    });
  });

  personas.push(persona);
});

try {
  fs.mkdirSync("../static/generated");
} catch (e) {};

var personasOutput = fs.createWriteStream("../static/generated/personas.js");
personasOutput.once('open', function (fd) {
  personasOutput.write("var generated_personas = " + JSON.stringify(personas, null, 2) + ";");
});

async.waterfall(computePersonalityTasks, function (err, result) {
  if (err) {
    console.log(err);
  } else {
    var combinedOutput = fs.createWriteStream("../static/generated/combined.js");
    combinedOutput.once('open', function (fd) {
      combinedOutput.write("var generated_combined = " + JSON.stringify(combined, null, 2) + ";");
    });
  }
});
