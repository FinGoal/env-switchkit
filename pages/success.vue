<template>
  <div>
    <v-card>
      <v-card-title>Accounts</v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <v-simple-table>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">ID</th>
                <th class="text-left">Mask</th>
                <th class="text-left">Name</th>
                <th class="text-left">Subtype</th>
                <th class="text-left">Type</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="account in accounts" :key="account.id">
                <td>{{ account.id || account.account_id }}</td>
                <td>{{ account.mask }}</td>
                <td>{{ account.name }}</td>
                <td>{{ account.subtype }}</td>
                <td>{{ account.type }}</td>
              </tr>
            </tbody>
          </template> 
        </v-simple-table>
      </v-card-text>
    </v-card>
    <v-card v-if="transactions">
      <v-card-title>Transactions</v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <v-simple-table>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">Amount</th>
                <th class="text-left">Name</th>
                <th class="text-left">Date</th>
                <th class="text-left">Category</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="transaction in transactions" :key="transaction.id">
                <td>${{ transaction.amount }}</td>
                <td>{{ transaction.name }}</td>
                <td>{{ transaction.date.split("T")[0] }}</td>
                <td>{{ transaction.category.join(", ") }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import moment from "moment";
import axios from "axios";

export default {
  data() {
    return {
      user: null, 
      itemId: null,
      accessToken: null,
      plaidMeta: null,
      items: [],
      accounts: [],
      transactions: [],
    }
  },
  async mounted() {

    this.$store.commit("setTransactionsFromStorage");
    this.$store.commit("setAccountsFromStorage");

    // only mount this page if the store contains both a user, and Plaid metadata.
    if (this.$store.state.transactions && this.$store.state.transactions.length > 0 && this.$store.state.accounts && this.$store.state.accounts.length > 0) {
      this.accounts.push(...this.$store.state.accounts);
      this.transactions.push(...this.$store.state.transactions);
    } else if (this.$store.state.user && this.$store.state.plaidMeta) {
      this.user = this.$store.state.user;
      this.plaidMeta = this.$store.state.plaidMeta;
      this.accounts.push(...this.plaidMeta.accounts);
      this.$store.commit("setAccounts", this.accounts);

      await this.getItem();
      await this.getTransactions();
    } 



  },
  methods: {
    async handleError(error) {
      let fullError = `${error}`;
      try {
        const response = await axios.get("/api/link-money/transactions");
        const { data } = response;
        this.transactions.push(...data.transactions);
        // this.accounts.push(...data.accounts);
      } catch(error) {
        console.log(error);
      }
    },
    async getItem() {
      const { public_token } = this.$store.state.plaidMeta;
      if (!public_token) {
      } else {
        try {
          const exchangeResponse = await axios.post("/api/exchange-public-token", { public_token });
          const { data } = exchangeResponse;
          const { item_id, access_token } = data;
          this.itemId = item_id;
          this.accessToken = access_token;
        } catch(error) {
          console.log(error);
        }
      }
    },
    async getTransactions() {
      try {
        const transactionsResponse = await axios.post("/api/transactions", { access_token: this.accessToken });
        const { data } = transactionsResponse;
        this.transactions = data.transactions;        
        this.$store.commit("setTransactions", data.transactions);
      } catch (error) {
        console.log(error);
      }
    },
    
  }
}
</script>
