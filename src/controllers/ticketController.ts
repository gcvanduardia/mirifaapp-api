// src/controllers/ticketController.ts
import { RequestHandler } from 'express';
import { poolPromise } from '../config/db';

export const getWinnerTicket: RequestHandler = async (_req, res) => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT *
    FROM tickets
    WHERE is_winner = 1
  `);
  if (result.recordset.length === 0) {
    res.status(404).json({ error: 'No hay ticket ganador registrado' });
    return;
  }
  res.json(result.recordset[0]);
  return;
};

export const setWinnerTicket: RequestHandler = async (req, res) => {
  const { number } = req.params;
  const pool = await poolPromise;
  const ticketResult = await pool.request()
    .input('number', +number)
    .query('SELECT * FROM tickets WHERE number = @number AND sold_at IS NOT NULL');
  if (ticketResult.recordset.length === 0) {
    res.status(404).json({ error: 'Ticket no encontrado o no ha sido vendido' });
    return;
  }
  await pool.request().query('UPDATE tickets SET is_winner = 0 WHERE is_winner = 1');
  await pool.request()
    .input('number', +number)
    .query('UPDATE tickets SET is_winner = 1 WHERE number = @number');
  res.json({ message: 'Ticket marcado como ganador' });
  return;
};

export const getTicketByNumber: RequestHandler = async (req, res) => {
  const { number } = req.params;
  const pool = await poolPromise;
  const result = await pool.request()
    .input('number', +number)
    .query(`
      SELECT *
      FROM tickets
      WHERE number = @number
    `);
  if (result.recordset.length === 0) {
    res.status(404).json({ error: 'Ticket no encontrado' });
    return;
  }
  res.json(result.recordset[0]);
  return;
};

export const getSoldTickets: RequestHandler = async (_req, res) => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT
      t.number,
      t.buyer_name,
      t.buyer_email,
      t.buyer_cc,
      t.buyer_phone,
      t.payment_method,
      t.sold_at,
      u.name AS seller_name,
      u.email AS seller_email,
      t.ticket_price
    FROM tickets t
    JOIN users u ON t.seller_id = u.id
    WHERE t.sold_at IS NOT NULL
    ORDER BY t.sold_at DESC
  `);
  res.json(result.recordset);
};

export const getAllTickets: RequestHandler = async (_req, res) => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT number, sold_at, is_winner
    FROM tickets
    ORDER BY number
  `);
  res.json(result.recordset);
};

export const sellTicket: RequestHandler = async (req, res) => {
  const { number } = req.params;
  const {
    buyer_name,
    buyer_email,
    buyer_cc,
    buyer_phone,
    payment_method,
    seller_id,
    ticket_price
  } = req.body;

  const pool = await poolPromise;
  const result = await pool.request()
    .input('number', +number)
    .input('buyer_name', buyer_name)
    .input('buyer_email', buyer_email)
    .input('buyer_cc', buyer_cc)
    .input('buyer_phone', buyer_phone)
    .input('payment_method', payment_method)
    .input('seller_id', seller_id)
    .input('ticket_price', ticket_price)
    .query(`
      UPDATE tickets
      SET
        buyer_name    = @buyer_name,
        buyer_email   = @buyer_email,
        buyer_cc      = @buyer_cc,
        buyer_phone   = @buyer_phone,
        payment_method= @payment_method,
        seller_id     = @seller_id,
        sold_at       = GETDATE(),
        ticket_price  = @ticket_price
      WHERE number = @number AND sold_at IS NULL
    `);

  if (result.rowsAffected[0] === 0) {
    res.status(400).json({ error: 'Número ya vendido o no existe' });
    return;
  }
  res.json({ message: 'Boleta vendida correctamente' });
};