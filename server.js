/* eslint-env node */

'use strict';

const express = require('express');
const fetch = require('node-fetch');
const redirectToHTTPS = require('express-http-to-https').redirectToHTTPS;

// CODELAB: Change this to add a delay (ms) before the server responds.
const FORECAST_DELAY = 0;
// CODELAB: If running locally, set your DarkSky API key here
const API_KEY = process.env.DARKSKY_API_KEY;
const BASE_URL = `https://api.darksky.net/forecast`;

const fakeForecast = {
  fakeData: true,
  latitude: 0,
  longitude: 0,
  timezone: 'America/New_York',
  currently: {
    time: 0,
    summary: 'Clear',
    icon: 'clear-day',
    temperature: 43.4,
    humidity: 0.62,
    windSpeed: 3.74,
    windBearing: 208,
  },
  daily: {
    data: [
      {
        time: 0,
        icon: 'partly-cloudy-night',
        sunriseTime: 1553079633,
        sunsetTime: 1553123320,
        temperatureHigh: 52.91,
        temperatureLow: 41.35,
      },
      {
        time: 0,
        icon: 'rain',
        sunriseTime: 1553165933,
        sunsetTime: 1553209784,
        temperatureHigh: 48.01,
        temperatureLow: 44.17,
      },
      {
        time: 0,
        icon: 'rain',
        sunriseTime: 1553252232,
        sunsetTime: 1553296247,
        temperatureHigh: 50.31,
        temperatureLow: 33.61,
      },
      {
        time: 0,
        icon: 'partly-cloudy-night',
        sunriseTime: 1553338532,
        sunsetTime: 1553382710,
        temperatureHigh: 46.44,
        temperatureLow: 33.82,
      },
      {
        time: 0,
        icon: 'partly-cloudy-night',
        sunriseTime: 1553424831,
        sunsetTime: 1553469172,
        temperatureHigh: 60.5,
        temperatureLow: 43.82,
      },
      {
        time: 0,
        icon: 'rain',
        sunriseTime: 1553511130,
        sunsetTime: 1553555635,
        temperatureHigh: 61.79,
        temperatureLow: 32.8,
      },
      {
        time: 0,
        icon: 'rain',
        sunriseTime: 1553597430,
        sunsetTime: 1553642098,
        temperatureHigh: 48.28,
        temperatureLow: 33.49,
      },
      {
        time: 0,
        icon: 'snow',
        sunriseTime: 1553683730,
        sunsetTime: 1553728560,
        temperatureHigh: 43.58,
        temperatureLow: 33.68,
      },
    ],
  },
};

/**
 * Generates a fake forecast in case the weather API is not available.
 *
 * @param {String} location GPS location to use.
 * @return {Object} forecast object.
 */
function generateFakeForecast(location) {
  location = location || '40.7720232,-73.9732319';
  const commaAt = location.indexOf(',');

  const result = Object.assign({}, fakeForecast);
  result.latitude = parseFloat(location.substr(0, commaAt));
  result.longitude = parseFloat(location.substr(commaAt + 1));

  const now = Math.floor(Date.now() / 1000);
  result.currently.time = now;
  result.daily.data.forEach((day) => {
    day.time = now + 60 * 60 * 24;
  });
  return result;
}


/**
 * Gets the weather forecast from the DarkSky API for the given location.
 *
 * @param {Request} req request object from Express.
 * @param {Response} resp response object from Express.
 */
function getForecast(req, resp) {
  // getFakeForecast(req, resp);
  const location = req.params.location || '40.7720232,-73.9732319';
  const url = `${BASE_URL}/${API_KEY}/${location}`;
  const start = Date.now();
  fetch(url).then((resp) => {
    return resp.json();
  }).then((data) => {
    setTimeout(() => {
      resp.json(data);
    }, FORECAST_DELAY);
  }).catch((err) => {
    console.error('DarkSky API Error:', err.message);
    resp.json(generateFakeForecast(location));
  });
}

/**
 * Starts the Express server.
 *
 * @return {ExpressServer} instance of the Express server.
 */
function startServer() {
  const app = express();

  // Redirect HTTP to HTTPS,
  app.use(redirectToHTTPS([/localhost:(\d{4})/], [], 301));

  app.use((req, resp, next) => {
    const now = new Date();
    const time = `${now.toLocaleDateString()} - ${now.toLocaleTimeString()}`;
    const path = `"${req.method} ${req.path}"`;
    const m = `${req.ip} - ${time} - ${path}`;
    // eslint-disable-next-line no-console
    console.log(m);
    next();
  });

  app.get('/forecast/:location', getForecast);
  app.get('/forecast/', getForecast);
  app.get('/forecast', getForecast);
  app.use(express.static('public'));

  const server = app.listen('8000', () => {
    // eslint-disable-next-line no-console
    console.log('Local DevServer Started on port 8000...');
  });
  return server;
}

startServer();
