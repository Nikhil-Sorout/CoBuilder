import { Router } from "express";
import { generateCourse } from "../controllers/generation";
const router =  Router();

router.post('/generateCourse', generateCourse);

export default router;