const NodeCache = require('node-cache')

// stdTTL: time to live in seconds for every generated cache element.
const cache = new NodeCache({ stdTTL: 5 * 60 })

/**
 * function to get the URL from the current request
 * the url will be the key value for every request saved in the cache
 * @param {*} req the Request
 * @author https://dev.to/vigzmv/a-simple-caching-strategy-for-node-rest-apis-part-1-72a 
 */
function getUrlFromRequest(req) {
  const url = req.protocol + '://' + req.headers.host + req.originalUrl
  return url
}

/**
 * function to save a request in the cache with key value the url
 * @param {*} req
 * @param {*} res 
 * @param {*} next 
 * @author https://dev.to/vigzmv/a-simple-caching-strategy-for-node-rest-apis-part-1-72a
 */
function set(req, res, next) {
  const url = getUrlFromRequest(req)
  cache.set(url, res.locals.data)
  return next()
}

/**
 * function to get the previously stored cached response
 * if it finds the data, it sends it back as the response
 * else the request is forwarded to the next middleware.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @author https://dev.to/vigzmv/a-simple-caching-strategy-for-node-rest-apis-part-1-72a
 */
function get(req, res, next) {
  const url = getUrlFromRequest(req)
  const content = cache.get(url)
  if (content) {
    return res.status(200).send(content)
  }
  return next()
}

module.exports = { get, set }