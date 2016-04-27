Adapted from [this project](https://github.com/IBM-Bluemix/ziggy).

* Use [Discogs API](https://www.discogs.com/developers/) to retrieve artist albums and songs.
* Use [ChartLyrics API](http://www.chartlyrics.com/api.aspx) to retrieve lyrics.

## Preparing the artist data

### Get a Discogs API key and secret

1. Go to https://www.discogs.com/developers/ to obtain an API key and secret

### Create a Personality Insights service

1. Create a Personality Insights service in Bluemix

  ```
  cf create-service personality_insights tiered ziggy-insights
  ```

### Create artist personas

This is the most important piece. Spend some time reading about the artist,
the biography and identify important phases.

1. Create an artist and personas file using [this template](tools/artist-template.json).

### Grab albums, songs and lyrics

1. In *tools*, create a file named **env.json** containing your Discogs and Personality Insights credentials as follow:

  ```
  {
    "discog": [
      {
        "credentials": {
          "key": "your key here",
          "secret": "your secret here"
        }
      }
    ],
    "personality_insights": [
      {
        "credentials": {
          "password": "your password here",
          "url": "https://gateway.watsonplatform.net/personality-insights/api",
          "username": "your username here"
        },
        "label": "personality_insights",
        "name": "ziggy-insights",
        "plan": "tiered",
      }
    ]
  }
  ```

1. In *tools*, run

  ```
  npm install
  node grab.js myartist.json
  ```

  It generates *name-albums.json*, *name-songs.json*, *name-lyrics.txt*.

### Generate web site

1. In *tools*, run

  ```
  node generate.js myartist.json name-albums.json name-songs.json
  ```
  
  It generates files under *../static/generated*. You can rerun this command if you make changes to *myartist.json*

## Deploying the application

### Create a new Twitter app

This Twitter app will be used when comparing a Twitter profile to the artist personas.

1. Go to https://apps.twitter.com/.

1. Create a new application.

1. Once your application is created, create a new access token under *Keys and Access Tokens*.

1. Keep note of access token, access token secret, consumer key, consumer secret.

### In Bluemix, create a user-provided service with the Twitter credentials

1. Create the service in Bluemix with:

  ```
  cf cups ziggy-twitter -p access_key,access_secret,consumer_key,consumer_secret
  ```

  Note: when prompted, use the values obtained in the previous step.
  
### Push

1. Deploy to Bluemix

  ```
  cf push
  ```