
var admin = require("firebase-admin");

var serviceAccount = require("dbconfig.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://rede-de-mentores-rdm.firebaseio.com"
});

export default admin;