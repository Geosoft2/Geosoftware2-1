# Geosoftware 2 Project
Project development of the course Geosoftware 2 by Lukas, Christin, Constantin and Max

## GitHub Repository
[GeosoftwareProject](https://github.com/Leverkusen/Geosoftware2)

## Getting Started

1. [Download](https://github.com/Leverkusen/Geosoftware2/archive/master.zip) or clone the GitHub Repository
``git clone https://github.com/Leverkusen/Geosoftware2``

2. Create your own API-Tokens by getting registered on the websites below
   * Beispiel OpenWeatherMap (https://openweathermap.org)

3. Create the file ``token.js`` with the following content in the ``config`` folder:

```
GeosoftwareProject
└─┬ config
  └── token.js
```

```// hack to make "exports" available in the browser as globals
if(typeof exports == "undefined"){
  var exports = window;
}

// tokens tokens tokens...
exports.token = {
   secretSession: "your individual string", //for example "abc"
   OPENWEATHERMAP_TOKEN: "your openweathermap token"
};
```

## Starting with Docker:

1. install Docker on your local machine
2. ensure that the data folder is shared
3. open shell and navigate to folder ``Geosoftware2``
4. run ``docker-compose up``


## Starting without Docker:
1. install [Node.js v10.xx](https://nodejs.org/en/) and [MongoDB v4.xx](https://www.mongodb.com/download-center/community?) on your local machine
2. open shell and create MongoDB
   * on Windows: ``"C:\Program Files\MongoDB\Server\4.2\bin\mongod.exe" --dbpath="C:\path_to_GeosoftwareProject\data"``
   * possible troubleshoot: use the downloaded ``data`` folder instead of the cloned folder
3. open another shell and navigate to folder ``GeosoftwareProject``
4. run ``npm install``
5. run ``npm start``

## Running tests
1. ensure that steps 1 - 4 of [Starting without Docker](../master/README.md#starting-without-docker) are completed
2. run ``npm test``


## JSDoc
the generated HTML pages of the JSDoc documentation are located in [``JSDoc``](../master/out)


## Annotations


## Task


## Authors

   * Lukas B.
   * Constantin
   * Christin
   * Max
