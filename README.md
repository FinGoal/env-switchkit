This documentation provides a step-by-step guide to migrating from Plaid Link to LinkMoney. It is intended to be used with the FinGoal SwitchKit template, [which you can find here.](https://www.notion.so/Amended-SwitchKit-Doc-b12b8ce0c87047b990053d17d051b4d7) 

There are two prerequisites to working with this guide: 

1.  [Register for Link Money credentials via the FinGoal developer dashboard.](https://dashboard.fingoal.com/)
2. [Register for a Plaid account and get Plaid credentials](https://dashboard.plaid.com/signin).

These two sets of credentials are required for the SwitchKit example to work as expected. 

On this Page

---

# 1. Clone the Repository and Add Your Credentials.

Before we start our switch, we need to clone the SwitchKit repository and add our Plaid and LinkMoney credentials to the repo. If you are not familiar with cloning repositories from GitHub, you can [follow their documentation here.](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository) 

Once the repository is downloaded onto your machine, navigate to the folder and open it. Within, you will find a file tree like the one to the left. At the root of this file tree, within the repository folder, create a new file called `.env` and insert the following text: 

```
PLAID_CLIENT_ID=""
PLAID_SECRET=""

LINK_MONEY_CLIENT_ID=""
LINK_MONEY_CLIENT_SECRET=""

```

Plug in your client IDs and client secrets for Plaid and Link Money from their respective portals. Note that you can use a Plaid sandbox or a Plaid development key pair. 

## Running the Plaid Application

If you’re interested to see how this application runs with Plaid Link, open a terminal at the repository level and run the commands listed here:

```bash
npm install --save 
npm run dev
```

 This will run the application on `[http://localhost:3000](http://localhost:3000)`. Navigate there to see how the demo application is running with your Plaid instance!

# 2. Generate an Authentication Token

Our first step to switch this demo app from Plaid to Link Money is to generate some user authentication. Unlike Plaid, Link Money does not use an SDK. However, requesting an authorization token for Link Money's Plaid-type endpoints is not very different from obtaining a Plaid token. 

To authenticate with Plaid, the developer must: 

1. Initialize a new Plaid `Client` and pass it an object with a `clientID` and `secret` specific to the developer. 
2. Create a **Link Token** by calling the `linkCreateToken` method and passing it an object that includes further details, including an optional `user` property and a `webhook` property for receiving updates. 

After making these calls, a Plaid developer receives an authentication token, which they can use to authenticate and launch Plaid Link. 

Rather than going through an SDK, Link Money exposes an endpoint (`POST` https://dev-jhhgu9vc.auth0.com/oauth/token) that replicates Plaid token generation. All of the fields that Plaid uses for authentication should be included in the Link Money token request.

```jsx
try {
    const { userId, itemId } = options;
    const data = {
      client_id: '{YOUR_CLIENT_ID}',
      client_secret: '{YOUR_CLIENT_SECRET}',
      audience: 'https://link-money-api/',
      grant_type: 'client_credentials',
      organization: '{YOUR_ORGANIZATION_ID}',
    };

		// use a userId string if you require a user token.
    if (userId) {
      data.userId = userId;
    
		// use an item_id string if you require an item token. 
    } else if (itemId) {
      data.item_id = itemId; 
    }
    
    const config = {
      method: 'post',
      url: 'https://dev-jhhgu9vc.auth0.com/oauth/token',
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    }

    const createTokenResponse = await axios(config);
    const { data: tokenData } = createTokenResponse;
		const { access_token } = tokenData;
  } catch (error) {
    // any http errors will be surfaced here. 
  }
```

In the demo application, it makes the most sense to add this code to a backend route, as Link Money’s token signer does not allow calls from frontend-facing codebases. In the demo application, this code lives in `/api/methods/index.js`. Open that file, and add the following code:

- Replace `(const { userId, itemId } = options;)`

```jsx
export const createLinkMoneyToken = async (req, res, next) => {
	try {
			const { body } = req;
	    const { userId, itemId } = body;
	    const data = {
	      client_id: process.env.LINK_MONEY_CLIENT_ID,
	      client_secret: process.env.LINK_MONEY_CLIENT_SECRET,
	      audience: 'https://link-money-api/',
	      grant_type: 'client_credentials',
	      organization: 'switchkit',
	    };
	
			// use a userId string if you require a user token.
	    if (userId) {
	      data.userId = userId;
	    
			// use an item_id string if you require an item token. 
	    } else if (itemId) {
	      data.item_id = itemId; 
	    }
	    
	    const config = {
	      method: 'post',
	      url: 'https://dev-jhhgu9vc.auth0.com/oauth/token',
	      headers: {
	        'Content-Type': 'application/json',
	      },
	      data: data,
	    }
	
	    const createTokenResponse = await axios(config);
	    const { data: tokenData } = createTokenResponse;
			const { access_token } = tokenData;
			res.status(200).send({ access_token });
	  } catch (error) {
	    // any http errors will be surfaced here. 
			res.status(500).send({ message: error.message });
	  }
}
```

The code above adapts the original token function into an Express.js controller, which will be accessible from the front end demo application. The above code also adds the credentials from our `env` file, so that they can be accessed securely from the backend. 

Now we only need to add a route to access this method, by altering `/api/routes/index.js`. Add `createLinkMoneyToken` to the import list from `../methods`:  

```jsx
import {
  createLinkToken,
  getAccounts,
  exchangeForPublicToken,
  getTransactions,
	createLinkMoneyToken
} from '../methods';
```

And in the same file, create the route: 

```jsx
router.post("/link-money-token", createLinkMoneyToken);
```

This is all we need to do to make the Link Money authentication token available to the frontend of the demo application!

# 3. Replace the Plaid Link with the LinkMoney Gateway.

Now we turn our attention to the frontend. Our Plaid Link code is generated by the file `/pages/index.vue`. Navigate there now. A large amount of the code in this file - like the `createPlaidInstance` method and the `handler` data property, will no longer be needed since we are removing the Plaid Link. 

Our first step is to generate a Link Money token, using the backend code we just wrote. Fortunately, there’s a method in this file, `generateToken`, which is Plaid-specific. We can replace its contents and make it work with Link Money. Replace the function code for `generateToken` with the following code: 

```jsx
try {
    const request = await axios.post("/api/link-money-token", { userId: "your_user_id" });
    const { data } = request;
    const { access_token } = data;
    return access_token;
  } catch (error) {
    console.log(error);
    return null;
  }
```

Now let’s alter the contents of the `openLink` method. This method was opening the Plaid Link, but now we want it to open Link Money’s account linking application. Let’s change its contents:

```jsx
async openLink() {
	const token = await this.generateToken();
	const linkMoneyGatewayUri = `https://linkmoney-gateway.fingoal.com/api/authenticate?token=${token}`;
	const redirectUri = 'http://localhost:3000/success';
	window.open(`${linkMoneyGatewayUri}&redirectUri=${redirectUri}`);
}
```

Make sure to mark the `openLink` function as async, otherwise the token will not generate in time. 

We pass the token and a redirect URI for the demo application’s success page to the Link Money Gateway’s URL, and open the page. Follow the account linking process to link an account with Link Money! After you finish, you will redirect to the demo application’s success page. 

For Link Money, the developer does not need to maintain the link accounts application - Link Money offers an out-of-the-box link accounts solution that requires only an access token from the call made in the previous step.

By linking users to [linkmoney.fingoal.com](https://linkmoney.fingoal.com) with an  `access_token` header, the Link Money Gateway will handle user authentication with their banking application, closing the Gateway when the user exits the process.

# 4. Get Data from the API.

Now that we’ve linked an account, we can fetch data synchronously from Link Money in two ways: 

1. The Link Money portal inserts some account data in the callback to the demo application’s `/success` page. 
2. We can use API calls to get transactions and accounts.

Let’s start by looking at the account data in the callback URI. We can add methods to our `success.vue` file to process the return data: 

```jsx
async digestEvents() {
  const eventsString = this.$route.query.events;
  const events = JSON.parse(eventsString);

	if (!events || events.length === 0) {
    console.log("EVENTS_DATA_NOT_FOUND");
  }
  
  events.forEach((linkEvent) => { 
    const { user_id, item_id, institution, accounts } = linkEvent;
    this.items.push(item_id); 
    this.accounts.push(...accounts)
  });
},
```

Within the `mounted` method (which runs when the page loads), add some code to invoke the `digestEvents` function: 

```jsx
if (this.$route.query.events) {
  this.digestEvents();
}
```

Doing so, reload the page. If there’s events in the URI for the success page, you will see them load into the accounts table. 

Now we can add further methods to fetch transactions from Link Money API. First, we need to create a new token. Notice that this token, unlike the last one, is item-specific. At this point in the flow, both Link Money’s Plaid and Plaid require that all authentication go through items, not users.

```jsx
async generateToken(itemId) {
  try {
    const request = await axios.post("/api/link-money-token", { itemId: itemId });
    const { data } = request;
    const { access_token } = data;
    return access_token;
  } catch (error) {
    console.log(error);
    return null;
  }
},
```

With the item token ready, we can fetch transactions from Link Money API: 

```jsx
async getLinkMoneyTransactions(itemToken) {
	// note that you can use the same parameters here that you can for the Plaid request.
  const startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
  const endDate = moment().format('YYYY-MM-DD');

  const data = {
    start_date: startDate,
    end_date: endDate,
    options: {
      count: 250,
      offset: 0,
    },
  }

  const callConfig = { 
    method: "POST",
    url: `{YOUR_LINK_MONEY_API_URL}/v1/plaid/transactions/get`,
    headers: {
      'Content-Type': "application/json",
      Authorization: "Bearer " + itemToken
    },
    data
  }

  try {
    const transactionsResponse = await axios(callConfig);
    const { data: transactionData } = transactionsResponse;
		const { transactions } = transactionData;
		if (transactions.length === 0) {
      await this.handleError(error);
    } 
    return transactions;
  } catch(error) {
    await this.handleError(error);
  }
},
```

If you review the code above and compare it with the Plaid GET transactions code in `/api/methods/index.js`, you will see that the two code snippets are almost exactly identical. Substitute `{YOUR_LINK_MONEY_API_URL}` in the above snippet with the production Link Money API base URL: 

```jsx
https://linkmoney.fingoal.com
```

And then add the following iterative function to pull all the transactions for all items in the callback data into the demo application.

```jsx
async getAllTransactions() {
  for (let i = 0; i < this.items.length; i++) {
    const itemId = this.items[i];
    const token = await this.generateToken(itemId);
    try {
      const transactions = await this.getLinkMoneyTransactions(token);
      this.transactions.unshift(...transactions)
    } catch (error) {
      console.log(error);
    }
  }
},
```

Finally, invoke the `getAllTransactions` method in the mounted function for the demo application,

```jsx
await this.getAllTransactions()
```

And Link Money transactions associated with all linked accounts will appear in the website’s transactions table! 

To review: While the base URL needed to be substituted, the `/transactions/get` endpoint remains the same, the method (`POST`) remains the same, the authentication scheme remains the same, and the response data scheme remains the same. The data that returns from this transactions endpoint conforms to the Plaid transaction model, so database and service changes to support Link Money data are not required. For a full roster of Plaid endpoints that Link Money offers, see [Plaid Endpoints](https://www.notion.so/Plaid-Endpoints-b321a63bf81b404d9df437c1fe1d05f8).

# 5. Process your First Webhook.

We have now completed the basics, and the SwitchKit demo application is now linking through Link Money and pulling data from both Plaid and Link Money! As a final additional caveat, though, let’s look at webhooks. 

Since Link Money replicates the Plaid methodology, developers configure all webhooks by passing a callback URL of their choice as the `webhook` property of their call to generate an access token. ***Note that whatever value is passed into the `webhook` field on the `POST` token request will be interpreted as the desired callback URL and will rewrite previous values.*** This is in accord with Plaid's webhook methodology. 

When a user links accounts for the first time, webhooks will trigger and send to all developers who are registered for webhooks on a particular user or item. The webhooks always signal that there's updated financial data available to be fetched from the APIs. These webhooks can contain any of the data updates described in [Plaid Webhooks](https://www.notion.so/Plaid-Webhooks-ef366aa4b84340b2882073e8d34b8fe4), but one of the first hooks to trigger off a new account linkage will contain this `INITIAL_UPDATE` webhook payload:

```json
{
  "webhook_type": "TRANSACTIONS",
  "webhook_code": "INITIAL_UPDATE",
  "item_id": "wz666MBjYWTp2PDzzggYhM6oWWmBb",
  "error": null,
  "new_transactions": 19
}
```

These webhooks are *exactly the same* as those that Plaid sends. Both the fields and values from Plaid can be reliably expected from Link Money. In this case, the webhook notifies a developer that 19 new transactions are available for an Item of ID `wz666MBjYWTp2PDzzggYhM6oWWmBb`.

---

# Summary

To migrate from Plaid to Link Money, some changes are necessary: 

1. Authentication tokens must be generated with HTTP requests in place of Plaid's node package. 
2. Code for the Plaid Link frontend can be deleted and delegated to Link Money's web application.
3. Webview redirects must be added to open the Link Money Gateway. 
4. The Plaid base URL must be swapped out in favor of a Link Money base URL.

And that's enough to get started with Link Money for Plaid development! We encourage you to dig into the links below for further, deeper documentation on the wider variety of things you can do with Link Money API. 

## Further Information

- [Plaid Endpoints](https://www.notion.so/Plaid-Endpoints-b321a63bf81b404d9df437c1fe1d05f8)
- [Plaid Webhooks](https://www.notion.so/Plaid-Webhooks-ef366aa4b84340b2882073e8d34b8fe4)
- [LinkMoney Web Gateway](https://www.notion.so/LinkMoney-Web-Gateway-43e728fc7b6a43fa924b987588e10d98)
