import express from "express";
import {
  createInvoice,
  getAllInvoices,
  getMyInvoices,
  getInvoice,
  updateInvoice,
  payInvoice,
  voidInvoice,
} from "../controllers/billingController.js";

import { protect, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

// patient
router.get("/mine", allowRoles("patient"), getMyInvoices);
router.patch("/:id/pay", allowRoles("admin", "patient"), payInvoice);

// admin
router.post("/", allowRoles("admin"), createInvoice);
router.get("/", allowRoles("admin"), getAllInvoices);
router.get("/:id", allowRoles("admin", "patient"), getInvoice);
router.patch("/:id", allowRoles("admin"), updateInvoice);
router.patch("/:id/void", allowRoles("admin"), voidInvoice);

export default router;
