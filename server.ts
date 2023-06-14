const ap = require("./app");
const dotenv = require("dotenv");

dotenv.config({ path: "./config/config.env" });

ap.listen(4000, () => {
  console.log(`app listening on port ${4000}`);
});
