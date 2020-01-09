//Testet die Webapp
// jshint esversion: 6
// jshint node: true

//TODO raus mit den Dingern?
/**
const mongoose = require('mongoose');
const http = require("http");
const https = require("https");
*/
//Test Packages
var chai = require('chai');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
//Assertions
var should = chai.should();
var expect = chai.expect;
var assert = require('assert');
// needed files for testing
var app = require('../app');

const token = require('../config/token.js').token;

describe('Tests', function () {

  before(function (done) {

  });
});
//tests
describe('GET /ROUTE to test the single routes', function (done) {
  it('should render the index page of the app', function (done) {
    request(app).get('/')
      .expect('Location', '/')
      .expect(302, done);
  });
  it('should render the index page of the app with the given parameters', function (done) {
      //TODO hier noch mindestens vier weitere Test einfügen
      request(app).get('/?centerpoint=[0,0]&zoomlevel=10&dwd=true&weatherlevel="blalblalba"&twitter=true&instagram=false')
        .expect('Location', '/')
        .expect(302, done);
    });
  it('should get an error but render anyway', function (done) {
      //TODO hier noch mindestens vier weitere Test einfügen
      request(app).get('/?centerpoint=[0,wronginput]&zoomlevel=10&dwd=true&weatherlevel="blalblalba"&twitter=true&instagram=banane')
        .expect('Location', '/')
        .expect(404, done);
    });
  it('should render the index page of the app', function (done) {
      //TODO hier noch mindestens vier weitere Test einfügen
      request(app).get('/')
        .expect('Location', '/')
        .expect(302, done);
    });
  it('should render the index page of the app', function (done) {
      //TODO hier noch mindestens vier weitere Test einfügen
      request(app).get('/')
        .expect('Location', '/')
        .expect(302, done);
    });
});


after(function (done) {

});
describe('Test of APIs', function () {

  describe('DWD API', function () {
    it('should connect to DWD API', (done) => {
      var endpointDWD = "https://";
      var request = https.get(endpointDWD, (httpResponse) => {
        // concatenate updates from datastream
        var body = "";
        httpResponse.on("data", (chunk) => {
          body += chunk;
        });
        httpResponse.on("end", () => {
          try {
            // if the response is not json, than the URL was wrong (catch-block)
            var DWD = JSON.parse(body);
            expect(typeof DWD).to.equal('object');
            expect(DWD.cod).to.equal(200);
            done();
          }
          catch (err) {
            //creates a wrong equation to fail the test
            expect(true).to.equal(false);
            done();
          }
        });
      });
      request.on("error", (error) => {
        //creates a wrong equation to fail the test
        expect(true).to.equal(false);
        done();
      });
    });
  });
  describe('Twitter API', function () {
      it('should connect to Twitter API', (done) => {
        var endpointTwitter = "https://";
        var request = https.get(endpointTwitter, (httpResponse) => {
          // concatenate updates from datastream
          var body = "";
          httpResponse.on("data", (chunk) => {
            body += chunk;
          });
          httpResponse.on("end", () => {
            try {
              // if the response is not json, than the URL was wrong (catch-block)
              var Twitter = JSON.parse(body);
              expect(typeof Twitter).to.equal('object');
              expect(Twitter.cod).to.equal(200);
              done();
            }
            catch (err) {
              //creates a wrong equation to fail the test
              expect(true).to.equal(false);
              done();
            }
          });
        });
        request.on("error", (error) => {
          //creates a wrong equation to fail the test
          expect(true).to.equal(false);
          done();
        });
      });
   });
});


