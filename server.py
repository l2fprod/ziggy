# Copyright 2015 IBM Corp. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import os
import json
import requests
from flask import Flask, jsonify
from watson_developer_cloud import PersonalityInsightsV2 as PersonalityInsights
from twitter import *
from scipy.spatial import distance

import sys
reload(sys)
sys.setdefaultencoding('utf8')

if 'VCAP_SERVICES' not in os.environ:
    raise RuntimeError("VCAP_SERVICES not found.")
VCAP_SERVICES = json.loads(os.environ['VCAP_SERVICES'])

TWITTER = VCAP_SERVICES['user-provided'][0]["credentials"]
twitter = Twitter(auth = OAuth(TWITTER["access_key"], TWITTER["access_secret"], TWITTER["consumer_key"], TWITTER["consumer_secret"]))

WATSON = VCAP_SERVICES['personality_insights'][0]
if 'credentials' not in WATSON:
    raise RuntimeError("Cannot connect to Watson.  Credentials not found for personality insights.")
else:
    personality_insights = PersonalityInsights(username=WATSON['credentials']['username'], password=WATSON['credentials']['password'])

cached_persona_insights = {}
with open('./static/generated/combined.json') as json_file:
    json_data = json.load(json_file)        
    for p in json_data:
        cached_persona_insights[p['data']['id']] = p['data']                                              

def pull_tweets_by_screenname(screenname):
    print "Calling twitter"
    tweets = response = twitter.statuses.user_timeline(screen_name = screenname, count = 200)
    while len(response) > 0:
        print 'fetching more tweets for ' + screenname
        response = twitter.statuses.user_timeline(screen_name = screenname, count = 200, max_id = tweets[-1]['id'] - 1)
        tweets.extend(response)
    print 'total of ' + str(len(tweets)) + ' found for user ' + screenname
    return tweets

def aggregate_tweet_string(tweets):
    aggregate_text = ''
    for tweet in tweets:
        aggregate_text += tweet['text'] + "\n"
    return aggregate_text

# returns an object like {'Openness': 0.5235988, 'Extraversion': 0.511561636, ... etc ... }
def extract_big5_scores(insights_response):
    traits = {}
    # pull out the "big5" personality traits from the profile
    for trait in insights_response['tree']['children'][0]['children'][0]['children']:
        traits[trait['name']] = trait['percentage']
    return traits

# build ordered tuples from the values of the big5 traits
def build_comparison_tuple(traits):
    tuple = ()
    for trait in sorted(traits.keys()):
        tuple = tuple + (traits[trait],)
    return tuple

def calculate_personality_distance(twitter_profile):
    output = {'twitter': extract_big5_scores(twitter_profile)}
    twitter_tuple = build_comparison_tuple(output['twitter'])

    # run through all the personas and calculate Euclidean distance from the twitter profile
    for persona in cached_persona_insights:
        if cached_persona_insights[persona] is not None:
            output[persona] = extract_big5_scores(cached_persona_insights[persona]) # store the raw data to be returned alone with similarity metrics
            persona_tuple = build_comparison_tuple(output[persona])
            output[persona]['distance'] = distance.euclidean(twitter_tuple, persona_tuple)

    return output

## Begin Flask server
app = Flask(__name__, static_url_path="")
if 'FLASK_DEBUG' in os.environ:
    app.debug = True
      
@app.route('/')
def Welcome():
  return app.send_static_file('index.html')

@app.route('/api/twitter/<screenname>')
def InsightsFromTwitter(screenname):
    tweets = pull_tweets_by_screenname(screenname)
    insight = personality_insights.profile(json.dumps({'text': aggregate_tweet_string(tweets)}, indent=2))
    return jsonify(results=calculate_personality_distance(insight))

port = os.getenv('PORT', '5000')
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=int(port))
