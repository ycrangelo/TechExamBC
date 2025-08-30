import { Router } from 'express';
import { getInfo } from '../controller/addrInfoController.mjs';

const router = Router()


router.get('/get/addrInfo/:address',getInfo)

export default router
