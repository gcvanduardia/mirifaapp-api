import { Router } from 'express';
import { getAllTickets, sellTicket, getSoldTickets, getTicketByNumber, setWinnerTicket, getWinnerTicket } from '../controllers/ticketController';

const router = Router();

router.get('/', getAllTickets);
router.put('/:number/sell', sellTicket);
router.get('/sold', getSoldTickets); 
router.get('/winner', getWinnerTicket);
router.get('/:number', getTicketByNumber);
router.post('/:number/winner', setWinnerTicket);

export default router;