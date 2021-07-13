const admin = require("firebase-admin");
const keys = require("./keys");

// Initialize firebase admin SDK
admin.initializeApp({
  credential: admin.credential.cert({
    type: keys.FB_TYPE,
    project_id: keys.FB_PROJECT_ID,
    private_key_id: keys.FB_PRIVATE_KEY_ID,
    private_key: keys.FB_PRIVATE_KEY,
    client_email: keys.FB_CLIENT_EMAIL,
    client_id: keys.FB_CLIENT_ID,
    auth_uri: keys.FB_AUTH_URI,
    token_uri: keys.FB_TOKEN_URI,
    auth_provider_x509_cert_url: keys.FB_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: keys.FB_CLIENT_IX509_CERT_URL,
  }),
  storageBucket: keys.STORAGE_BUCKET,
});

// Cloud storage
const bucket = admin.storage().bucket();

module.exports = {
  bucket,
};
