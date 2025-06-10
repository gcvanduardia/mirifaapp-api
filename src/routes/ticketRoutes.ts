import { Router } from 'express';
import { getAllTickets, sellTicket, getSoldTickets, getTicketByNumber } from '../controllers/ticketController';

const router = Router();

router.get('/', getAllTickets);
router.put('/:number/sell', sellTicket);
router.get('/sold', getSoldTickets); 
router.get('/:number', getTicketByNumber);

export default router;