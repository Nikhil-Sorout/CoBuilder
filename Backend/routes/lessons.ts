import { Router } from 'express';
import { getLesson, getLessonVersions } from '../controllers/lessons';

const router = Router();

router.get('/:id/versions', getLessonVersions);
router.get('/:id', getLesson);

export default router;
