const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
dns.setDefaultResultOrder("ipv4first");

require("dotenv").config()

const app = require("./src/app")

const connectToDB = require("./src/config/database")
 

connectToDB()
 

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})