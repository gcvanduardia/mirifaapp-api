import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ticketRoutes from '../routes/ticketRoutes';
import authRoutes from "../routes/authRoutes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);

export default app;