Adapted from [this project](https://github.com/IBM-Bluemix/ziggy).

* Use [Discogs API](https://www.discogs.com/developers/) to retrieve artist albums and songs.
* Use [ChartLyrics API](http://www.chartlyrics.com/api.aspx) to retrieve lyrics.

### API Keys

1. Get a Discogs API key and secret

1. Get a Personality Insights service in Bluemix

### Create artist personas

1. Create an artist and personas file using [this template](tools/artist-template.json)

### Grab albums, songs and lyrics

1. In *tools*, run

  ```
  npm install
  node grab.js myartist.json
  ```

  It generates *name-albums.json* and *name-songs.json*

### Generate web site

1. In *tools*, run

  ```
  node generate.js myartist.json name-albums.json name-songs.json
  ```
  
  It generates files under *../static/generated*
  
### Push

1. Deploy to Bluemix

  ```
  cf push
  ```