require("dotenv").config();

const DatabaseCreds = {}

    DatabaseCreds.endpoint = process.env.DB_END_POINT
    DatabaseCreds.key = process.env.COSMO_DB_KEY
    DatabaseCreds.userAgentSuffix = 'CosmosDBhomealarm'
    DatabaseCreds.database = 'homealarm'


DatabaseCreds.container = {
  user:{
    id: 'users'
  },
  actions:{
  id: 'actions'
  }
}


module.exports = DatabaseCreds