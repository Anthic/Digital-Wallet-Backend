import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { userRole } from "../users/user.interface";
import {
  addMoneySchema,
  agentCashSchema,
  sendMoneySchema,
  transactionDetailsSchema,
  transactionHistorySchema,
  withdrawMoneySchema,
} from "./transaction.zodValidation";
import { zodValidatorTransaction } from "../../middlewares/zodValidatorTransaction";
import { TransactionController } from "./transaction.controller";

const router = Router();

router.post(
  "/add-money",
  checkAuth(userRole.USER, userRole.AGENT),
  zodValidatorTransaction(addMoneySchema),
  TransactionController.addMoney
);
router.post(
  "/withdraw",
  checkAuth(userRole.USER, userRole.AGENT),
  zodValidatorTransaction(withdrawMoneySchema),
  TransactionController.withdrawMoney
);

router.post(
  "/send-money",
  checkAuth(userRole.USER), 
  zodValidatorTransaction(sendMoneySchema),
  TransactionController.sendMoney
);


router.get(
  "/history",
  checkAuth(userRole.USER, userRole.AGENT),
  zodValidatorTransaction(transactionHistorySchema),
  TransactionController.getMyTransactions
);

router.get(
  "/all",
  checkAuth(userRole.ADMIN),
  zodValidatorTransaction(transactionHistorySchema),
  TransactionController.getAllTransactions
);

router.get(
  "/:transactionId",
  checkAuth(userRole.USER, userRole.AGENT, userRole.ADMIN),
  zodValidatorTransaction(transactionDetailsSchema),
  TransactionController.getTransactionDetails
);

router.post(
  "/cash-in",
  checkAuth(userRole.AGENT),
  zodValidatorTransaction(agentCashSchema),
  TransactionController.agentCashIn
);

router.post(
  "/cash-out",
  checkAuth(userRole.AGENT),
  zodValidatorTransaction(agentCashSchema), 
  TransactionController.agentCashOut
);


export const TransactionsRouter = router;
