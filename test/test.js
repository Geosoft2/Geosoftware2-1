//Testet die Webapp
// jshint esversion: 6
// jshint node: true

const mongoose = require('mongoose');
const http = require("http");
const https = require("https");
//Test Packages
var chai = require('chai');
var chaiHttp = require('chai-http');
//Assertions
var should = chai.should();
var expect = chai.expect;
var assert = require('assert');
// needed files for testing
var app = require('../app');

const token = require('../config/token.js').token;

chai.use(chaiHttp);


describe('Tests', function () {

  before(function (done) {

  });
});
//tests the function of the login - /route/create has an authorizationCheck
describe('GET /EINEROUTE, um Anmeldung zu testen', function (done) {
  it('Test um eine Abfrager einer ROute zu testen', function (done) {
    request(app).get('/')
      .expect('Location', '/')
      .expect(302, done);
  });
});


after(function (done) {

});
describe('Testen der APIs', function () {

  describe('openweathermap API', function () {
    it('sollte mit der openweathermap API verbinden', (done) => {
      var endpointOpenweather = "https://api.openweathermap.org/data/2.5/weather?lat=7.59624&lon=51.96882&units=metric&appid=" + token.OPENWEATHERMAP_TOKEN;
      var request = https.get(endpointOpenweather, (httpResponse) => {
        // concatenate updates from datastream
        var body = "";
        httpResponse.on("data", (chunk) => {
          body += chunk;
        });
        httpResponse.on("end", () => {
          try {
            // if the response is not json, than the URL was wrong (catch-block)
            var openweathermap = JSON.parse(body);
            expect(typeof openweathermap).to.equal('object');
            expect(openweathermap.cod).to.equal(200);
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


