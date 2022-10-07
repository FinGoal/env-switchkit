import express from 'express';
import {
  createLinkToken,
  getAccounts,
  exchangeForPublicToken,
  getTransactions,
} from '../methods';
import fs from "fs";
import path from "path";

// Declaration of API endpoints.

const router = express.Router();

router.post('/create-link-token', createLinkToken);
router.post('/exchange-public-token', exchangeForPublicToken);
router.post('/accounts', getAccounts);
router.post("/transactions", getTransactions);

module.exports = router;
