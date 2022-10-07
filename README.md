# Basic Plaid Application
This repository contains a web application meant to demonstrate the basics of Plaid client-side code. Using the application, you can: 
1. Link a financial account to Plaid 
2. View the accounts you linked 
3. View transactions associated with those accounts. 

FinGoal uses this repository as a good starting point for the Switch Kit. By replacing this repository's Plaid dependency using the [Link Money Quickstart Documentation](https://www.notion.so/fingoal/Quickstart-Guide-bf1cf060267a43bbbde0f29f16b26bb9), you can move a functional production Plaid application over to Link Money in a matter of minutes. 

## Build Setup

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate
```

### Required Environment Variables
```.env
PLAID_CLIENT_ID=""
PLAID_SECRET=""
PLAID_REDIRECT_URI="http://localhost:3000" # unless deployed to a port other than default
PLAID_ACCESS_TOKEN=""

LINK_MONEY_API_BASE_URL="https://linkmoney.fingoal.com"
LINK_MONEY_GATEWAY_BASE_URL="https://linkmoney-gateway.fingoal.com"
LINK_MONEY_CLIENT_ID=""
LINK_MONEY_CLIENT_SECRET=""
LINK_MONEY_AUTHENTICATION_URL="https://dev-jhhgu9vc.auth0.com/oauth/token"
```

## Plaid Setup
This template's Plaid dependency requires additional configuration. [See the Plaid Fastlink documentation](https://plaid.com/docs/quickstart/) for more details. 

For detailed explanation on how things work, check out the [Nuxt documentation](https://nuxtjs.org).

## Special Directories

You can create the following extra directories, some of which have special behaviors. Only `pages` is required; you can delete them if you don't want to use their functionality.

### `assets`

The assets directory contains your uncompiled assets such as Stylus or Sass files, images, or fonts.

More information about the usage of this directory in [the Nuxt documentation](https://nuxtjs.org/docs/2.x/directory-structure/assets).

### `components`

The components directory contains your Vue.js components. Components make up the different parts of your page and can be reused and imported into your pages, layouts and even other components.

More information about the usage of this directory in [the Nuxt documentation](https://nuxtjs.org/docs/2.x/directory-structure/components).

### `layouts`

Layouts are a great help when you want to change the look and feel of your Nuxt app, whether you want to include a sidebar or have distinct layouts for mobile and desktop.

More information about the usage of this directory in [the Nuxt documentation](https://nuxtjs.org/docs/2.x/directory-structure/layouts).

### `pages`

This directory contains your application views and routes. Nuxt will read all the `*.vue` files inside this directory and setup Vue Router automatically.

More information about the usage of this directory in [the Nuxt documentation](https://nuxtjs.org/docs/2.x/get-started/routing).

### `plugins`

The plugins directory contains JavaScript plugins that you want to run before instantiating the root Vue.js Application. This is the place to add Vue plugins and to inject functions or constants. Every time you need to use `Vue.use()`, you should create a file in `plugins/` and add its path to plugins in `nuxt.config.js`.

More information about the usage of this directory in [the Nuxt documentation](https://nuxtjs.org/docs/2.x/directory-structure/plugins).

### `static`

This directory contains your static files. Each file inside this directory is mapped to `/`.

Example: `/static/robots.txt` is mapped as `/robots.txt`.

More information about the usage of this directory in [the Nuxt documentation](https://nuxtjs.org/docs/2.x/directory-structure/static).

### `store`

This directory contains your Vuex store files. Creating a file in this directory automatically activates Vuex.

More information about the usage of this directory in [the Nuxt documentation](https://nuxtjs.org/docs/2.x/directory-structure/store).
