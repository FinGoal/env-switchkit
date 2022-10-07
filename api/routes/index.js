import express from 'express';
import {
  createLinkToken,
  getAccounts,
  exchangeForPublicToken,
  getTransactions,
  createLinkMoneyToken
} from '../methods';
import fs from "fs";
import path from "path";

// Declaration of API endpoints.

const router = express.Router();

router.post('/create-link-token', createLinkToken);
router.post('/exchange-public-token', exchangeForPublicToken);
router.post('/accounts', getAccounts);
router.post("/transactions", getTransactions);
router.post("/link-money-token", createLinkMoneyToken);

router.get("/link-money/transactions", (req, res, next) => {
  try {
    const jsonFile = fs.readFileSync(path.join(__dirname, "../../assets/config.json"));
    res.send(jsonFile);
  } catch(error) {
    console.log(error);
  }
});

module.exports = router;
