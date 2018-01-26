# OpenMotics (Gateway) frontend

[![Build Status](https://travis-ci.org/openmotics/gateway-frontend.svg?branch=develop)](https://travis-ci.org/openmotics/gateway-frontend) [![Known Vulnerabilities](https://snyk.io/test/github/openmotics/gateway-frontend/badge.svg)](https://snyk.io/test/github/openmotics/gateway-frontend) [![dependencies Status](https://david-dm.org/openmotics/gateway-frontend/status.svg)](https://david-dm.org/openmotics/gateway-frontend) [![devDependencies Status](https://david-dm.org/openmotics/gateway-frontend/dev-status.svg)](https://david-dm.org/openmotics/gateway-frontend?type=dev) 


This project is the OpenMotics (Gateway) frontend. At this stage, it's designed to run on the OpenMotics gateway, but the goal is to make it a
unified platform allowing users to use the same interface both locally (on the local LAN) as globally (over the internet, using the OpenMotics
Cloud).

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.
See deployment for notes on how to deploy the project on a live system.

### Prerequisities

Make sure you have a recent version of ```nodejs``` and ```npm``` (npm should be at least version 5).

```
$ node --version
v8.3.0
$ npm --version
5.3.0
$
```

### Installing

Check out this repo to some local folder. Let's call it ```openmotics-frontend```. The rest of the commands will assume this is the working directory.

First, start with installing the dependencies

```
$ npm install
...
added 1333 packages in 51.998s
$
```

Now, setup environment configuration.  They are named like: ```env.{target}.{stage}.js```. E.g. ```env.gateway.production.js``` or ```env.cloud.development.js```.
They are all located under the project's root (next to e.g. ```package.json```).

The stage is either ```development``` or ```production```.

```
module.exports = {
    settings: {
        target: 'target',                   # The target at which the site should be build, either 'gateway' or 'cloud'. Defaults to 'gateway'.
        api_root: 'api_root_uri',           # Points to the API endpoint. Defaults to `location.origin`.
        api_path: 'api_path',               # Specifies the API path that needs to be appended to the above URI. Defaults to ''.
        analytics: 'google_analytics_code'  # Specifies the Google Analytics code. Defaults to ''.
    }
};
```

The development file (```env.gateway.development.js```) will most likely need some custom settings, e.g. the endpoint of the Gateway.

```
module.exports = {
    settings: {
        api: 'https://1.2.3.4'
    }
};
```

The ```npm start``` script is either ```debug.{target}```, or ```build.{target}.{stage}```. When debugging, the stage is always development.

After configuratin files are set up, start the webpack development server

```
$ npm start debug.gateway
> openmotics-frontend@1.2.1 start /some/path/openmotics/gateway-frontend
> nps
...
       [2] (webpack)/buildin/global.js 509 bytes {0} [built]
       [3] (webpack)/buildin/module.js 517 bytes {0} [built]
webpack: Compiled successfully.
```

And browse to http://localhost:8080

When making changes, webpack's development server will automatically repackage and reload the browser.

## Deployment

For deploying to a Gateway, make sure to cleanup possible leftovers

```
$ rm -rf dist
$
```

Then generate a production bundle

```
$ npm start build.gateway.production
> openmotics-frontend@1.2.1 start /some/path/openmotics/gateway-frontend
> nps "build"

nps is executing `build` : nps webpack.build
nps is executing `webpack.build` : nps webpack.build.production
...
     fa2772327f55d8198301fdb8bcfc8158.woff  23.4 kB          [emitted]
      e18bbf611f2a2e43afc071aa2f4e1512.ttf  45.4 kB          [emitted]
      89889688147bd7575d6327160d64e760.svg   109 kB          [emitted]
...
$
```

Then, ssh into your Gateway, and clean the web root (only the following snippet is executed on the Gateway)

```
$ cd /opt/openmotics/static/
$ rm -rf *
$
```

And scp the contents of the dist folder to the above folder

```
$ scp dist/* root@1.2.3.4:/opt/openmotics/static/
...
$
```

## Git workflow

We use [git-flow](https://github.com/petervanderdoes/gitflow-avh) which implements [Vincent Driessen](http://nvie.com/posts/a-successful-git-branching-model/)'s
branching model. This means our default branch is ```develop```, and ```master``` contains production releases.

When working on this repository, we advice to use following git-flow config:

```
Branch name for production releases: master
Branch name for "next release" development: develop
Feature branch prefix: feature/
Bugfix branch prefix: bugfix/
Release branch prefix: release/
Hotfix branch prefix: hotfix/
Support branch prefix: support/
Version tag prefix: v
```

To set these configuration parameters:

```
git config gitflow.branch.master master
git config gitflow.branch.develop develop
git config gitflow.prefix.feature feature/
git config gitflow.prefix.bugfix bugfix/
git config gitflow.prefix.release release/
git config gitflow.prefix.hotfix hotfix/
git config gitflow.prefix.support support/
git config gitflow.prefix.versiontag v
```

## Built With

* [Aurelia](http://aurelia.io/) - An awesome and modern web framework
* [Webpack](https://webpack.github.io/) - Javascript bundling
* [BrowserStack](https://www.browserstack.com) - Browser testing

## Special thanks

[<img src="https://www.browserstack.com/images/layout/browserstack-logo-600x315.png" width="200">](https://www.browserstack.com)

BrowserStack - Live, Web-Based Browser Testing - Helping us testing the front-end on all modern browsers and devices.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the tags on this repository

## Authors

* *Kenneth Henderick* - GitHub user: [khenderick](https://github.com/khenderick)

## License

This project is licensed under the AGPLv3 License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Thanks to everybody testing this code and providing feedback.
