import { Router } from 'express';
import { AuthController, upload } from '../controllers/auth.controller';

const authRouter = Router();

// POST /api/v1/auth/submit-offer
// Body: multipart/form-data，字段：offer(file) + userAddress(string)
authRouter.post('/submit-offer', upload.single('offer'), AuthController.submitOffer);

export default authRouter;
