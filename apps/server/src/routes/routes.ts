import { Router } from "express";
import signInController from "../controllers/signInController";
import userAuthMiddleware from "../middleware/userAuthMiddleware";
import getUserDataController from "../controllers/getUserDataController";

const router = Router();

router.post('/sign-in', signInController);
router.get('/get-user-data/:userId', userAuthMiddleware, getUserDataController);

export default router;