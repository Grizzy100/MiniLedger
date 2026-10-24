import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/me", authenticate, (req, res) => {
  res.status(200).json({
    message: "Authentication successful",
    userId: req.userId,
  });
});

export default router;