require("dotenv").config();

const DatabaseCreds = {}

    DatabaseCreds.endpoint = process.env.AZURE_COSMOS_ENDPOINT
    DatabaseCreds.key = process.env.AZURE_COSMOS_MASTER_KEY
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