# Geosoftware 2 Project
Project development of the course Geosoftware 2 by Lukas, Max, Constantin and Christin

## GitHub Repository
[GeosoftwareProject](https://github.com/Leverkusen/Geosoftware2)

## Getting Started

1. [Download](https://github.com/Leverkusen/Geosoftware2/archive/master.zip) or clone the GitHub Repository
``git clone https://github.com/Leverkusen/Geosoftware2``

2. Create your own API-Tokens by getting registered on the websites below
   * For example FlickrAPI (https://www.flickr.com/services/apps/create/)

3. Create the file ``token.js`` with the following content in the ``config`` folder:

```
GeosoftwareProject
└─┬ config
  └── tokens.js
```

```// hack to make "exports" available in the browser as globals
if(typeof exports == "undefined"){
  var exports = window;
}

// tokens tokens tokens...
exports.token = {
    twitter_consumer_key: 'your twitter consumer key',
    twitter_consumer_secret: 'your consumer secret',
    twitter_access_token: 'your twitter access token',
    twitter_access_token_secret: 'your twitter access token secret',
    mapbox_access_token: 'your mapbox token',
    instagram_app_id: 'the instagram app id'    [not needed right now],
    instagram_app_secret: 'the instagram app id'    [not needed right now],
    flickr_app_key:'the flickr app key',
    flickr_app_secret:'3the flickr app secret'
}
```

## Starting with Docker:
1. install Docker on your local machine
2. ensure that the data folder is shared
3. open shell and navigate to folder ``Geosoftware2``
4. run ``docker-compose up``


## Starting without Docker:
1. install [Node.js](https://nodejs.org/en/) and [MongoDB](https://www.mongodb.com/download-center/community?) on your local machine
2. open shell and create MongoDB
   * on Windows: ``"C:\Program Files\MongoDB\Server\4.2\bin\mongod.exe" --dbpath="C:\path_to_GeosoftwareProject\data"``
   * possible troubleshoot: use the downloaded ``data`` folder instead of the cloned folder
3. open another shell and navigate to folder ``GeosoftwareProject``
4. run ``npm install``
5. run ``npm start``

## Running tests
in the [test folder](/test) lays a Postman and a .jmx file. The instagram test will not run because instagram is not yet implemented

## Training data
If there is currently no data and you want to train see our training data in the [data folder](/data). And also for Flickr you can change the period of time in the [flickr Controller](/controllers/flickr.js)

## JSDoc
the generated HTML pages of the JSDoc documentation are located in [``JSDoc``](../master/out)


## Annotations


## Task


## Authors

   * Lukas B.
   * Max
   * Constantin
   
   * Christin
