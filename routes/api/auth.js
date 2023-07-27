const express = require("express");
const cntl = require("../../controllers/auth");
const validateBody = require("../../middlewares/validateBody");
const authenticate = require("../../middlewares/authenticate");

const { schemasAuth } = require("../../schemas/schemas");

const router = express.Router();
router.post(
  "/register",
  validateBody(schemasAuth.registerSchema),
  cntl.register
);
router.post(
  "/verify",
  validateBody(schemasAuth.emailShemas),
  cntl.resendVerifyEmail
);
router.get("/verify/:verificationToken", cntl.verificationToken);
router.post("/login", validateBody(schemasAuth.loginSchema), cntl.login);
router.post("/logout", authenticate, cntl.logout);

module.exports = router;
