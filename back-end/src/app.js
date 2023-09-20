import express, { json, urlencoded } from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";

import cors from 'cors'

import indexRouter from "./routes/index.js";
import usersRouter from "./routes/users.js";

// importa o client do prisma para fazer a conexão com o Banco de dados
import prisma from "./database/client.js";

const app = express();

app.use(cors())
app.use(logger("dev"));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/", indexRouter);
app.use("/users", usersRouter);

/////////////////////////////////////////////////
import carRouter from './routes/car.js'
app.use('/car', carRouter)

import customerRouter from './routes/customer.js'
app.use('/customer', customerRouter)

import userRouter from './routes/User.js'
app.use('/user', userRouter)

export default app;
