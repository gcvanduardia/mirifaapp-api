import { Router } from 'express';
import { getAllTickets, sellTicket, getSoldTickets } from '../controllers/ticketController';

const router = Router();

router.get('/', getAllTickets);
router.put('/:number/sell', sellTicket);
router.get('/sold', getSoldTickets); 

export default router;