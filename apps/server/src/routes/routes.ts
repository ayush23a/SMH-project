import { Router } from "express";
import signInController from "../controllers/signInController";

const router = Router();

router.post('/sign-in', signInController);

export default router;