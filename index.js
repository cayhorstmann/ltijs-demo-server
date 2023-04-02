require('dotenv').config()
const path = require('path')
const routes = require('./src/routes')

const lti = require('ltijs').Provider

// Setup
lti.setup(process.env.LTI_KEY,
  {
    url: 'mongodb+srv://' + process.env.DB_HOST + '/' + process.env.DB_NAME + '?authSource=admin',
    connection: { user: process.env.DB_USER, pass: process.env.DB_PASS }
  }, {
    staticPath: path.join(__dirname, './public'), // Path to static files
    cookies: {
      secure: true, // Set secure to true if the testing platform is in a different domain and https is being used
      sameSite: 'None' // Set sameSite to 'None' if the testing platform is in a different domain and https is being used
    },
    devMode: false, // Set DevMode to true if the testing platform is in a different domain and https is not being used
    dynReg: {
      url: 'https://ltijs-demo-service.onrender.com', // Tool Provider URL. Required field.
      name: 'ltijs Demo Tool Provider', // Tool Provider name. Required field.
      autoActivate: true // Whether or not dynamically registered Platforms should be automatically activated. Defaults to false.
    }
  })

// When receiving successful LTI launch redirects to app
lti.onConnect(async (token, req, res) => {
  return res.sendFile(path.join(__dirname, './public/index.html'))
})

// When receiving deep linking request redirects to deep screen
lti.onDeepLinking(async (token, req, res) => {
  return lti.redirect(res, '/deeplink', { newResource: true })
})

// Setting up routes
lti.app.use(routes)

// Setup function
const setup = async () => {
  await lti.deploy({ port: process.env.PORT })

  /**
   * Register platform
   */
   await lti.registerPlatform({
    url: 'https://horstmann.com/moodle',
    name: 'horstmann.com Moodle',
    clientId: 'f3zOgmWzJobqEOf',
    authenticationEndpoint: 'https://horstmann.com/moodle/mod/lti/auth.php',
    accesstokenEndpoint: 'https://horstmann.com/moodle/mod/lti/token.php',
    authConfig: { method: 'JWK_SET', key: 'https://horstmann.com/moodle/mod/lti/certs.php' }
  }) 
  
   await lti.registerPlatform({
    url: 'https://saltire.lti.app/tool',
    name: 'Saltire Test Platform',
    clientId: 'cLWwj9cbmkSrCNsckEFBmA',
    authenticationEndpoint: 'https://saltire.lti.app/platform/auth',
    accesstokenEndpoint: 'https://saltire.lti.app/platform/token/991709afb9ba2aece901f7d0d6ff31cf',
    authConfig: { method: 'RSA_KEY', key: {
    "kty": "RSA",
    "n": "sH8_-uavYxkWoEXm0QHDrZbfWByo0pEQdpy-EEdiQU_LVxlS4Et-ArUVq28hf1PRgGxRGEMzVXddyUgrrYuPV_17okqZZshfJnjqUpcN5d-mkyIs3XO-DLqI2UIoNXtEP5zlWvJTkqzUUlXg9y3QIHM_-1j8G3KeJKxIhezuLIUMJLSfJv3CgKF6CHPCT0JLPbOEStDCzzqQwIulDhU3Ts6N4CPttOoG8w9FS0Z6fJjYWeeztAtstBggXw4_Hgq7_-TaxV8tct5rWighV50Z5SJA1xi7w4GlfvV4EpwixUfSOZzAN_RAzFoiq6MgBCl-rtb7mCAxuSfkD5xSoMe0rw",
    "e": "AQAB",
    "alg": "RS256",
    "use": "sig",
    "kid": "6ox0b5ag4w"
} }
  }) 
  
}

setup()
