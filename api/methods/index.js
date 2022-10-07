const { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } = require("plaid");
const moment = require("moment");
const axios = require("axios");

const client = createPlaidClient();

// Configures and Creates a Plaid API client using environment variables. 
// Hard-coded to Plaid Version 2020-09-14. 
function createPlaidClient() {
  try {
    const configuration = new Configuration({
      basePath: PlaidEnvironments["development"],
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
          'PLAID-SECRET': process.env.PLAID_SECRET, 
          'Plaid-Version': '2020-09-14',
        }
      }
    });
    const client = new PlaidApi(configuration);
    return client;
  } catch(error) {
    return error;
  }
}

// creates a Plaid link token using a user-specific access token. This runs when we need a token to authenticate the frontend Plaid Link.
export const createLinkToken = async (req, res, next) => {
  const { headers } = req;
  const { userid: userId } = headers;
  if (!userId) {
    res.status(400).send({ 
      message: "MISSING_REQUIRED_HEADER",
      missingHeaders: ["userid"]
    });
  } else {
    const request = {
      user: {
        client_user_id: userId,
      },
      client_name: "PlaidLinkDev",
      products: [Products.Auth, Products.Transactions],
      language: "en",
      country_codes: [CountryCode.Us]
    }

    try {
      const createTokenResponse = await client.linkTokenCreate(request);
      res.status(200).send(createTokenResponse.data);
    } catch (error) {
      res.status(500).send({ error });
    }
  }
}

// exchanges a public token for a item-specific access_token. This runs after the Plaid Link successfully connects an account.
export const exchangeForPublicToken = async (req, res, next) => {
  const { body } = req;
  const { public_token } = body;
  if (!public_token) {
    res.status(400).send({ error: "`public_token` field missing." });
  } else {

    try {
      const response = await client.itemPublicTokenExchange({
        public_token,
      });

      const { data } = response;
      const { item_id, access_token } = data; 
      res.status(200).send({ item_id, access_token });

    } catch(error) {
      res.status(500).send({ error });
    }
  }
}

// gets accounts manually from Plaid using an item-specific access token.
export const getAccounts = async (req, res, next) => {
  try {
    const { body } = req;
    const { access_token } = body; 
    const accountsResponse = await client.accountsGet({
      access_token
    });

    res.status(200).send(accountsResponse.data);
    
  } catch (error) {
    res.status(500).send({ error });
  }
}

// Retrieves a max of 250 transactions within a 30 days from call time, using an item-specific access token.
export const getTransactions = async (req, res, next) => {
  try {
    const { body } = req;
    const { access_token } = body;
    const { start_date, end_date } = getThirtyDayTimeBracket();
    const transactionsResponse = await client.transactionsGet({
      access_token,
      start_date,
      end_date,     
      options: {
        count: 250,
        offset: 0,
      }
    
    });
    res.status(200).send(transactionsResponse.data);
  } catch (error) {
    res.status(500).send({ error });
  }
}

// Helper function: Gets YYYY-MM-DD formatted date brackets for the last 30 days.
function getThirtyDayTimeBracket() {
  const now = moment();
  const today = now.format("YYYY-MM-DD");
  const thirtyDaysAgo = now.subtract(30, 'days').format("YYYY-MM-DD");

  return { start_date: thirtyDaysAgo, end_date: today };
}

export const createLinkMoneyToken = async (req, res, next) => {

}