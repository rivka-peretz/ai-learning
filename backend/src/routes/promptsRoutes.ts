import { Router } from 'express';
import { createPrompt, getPrompt, listPrompts, listAllPromptsWithDetails } from '../controllers/promptsController';

const router = Router();

router.post('/', createPrompt);
router.get('/', listPrompts);
router.get('/all-with-details', listAllPromptsWithDetails);
router.get('/:id', getPrompt);

export default router;
