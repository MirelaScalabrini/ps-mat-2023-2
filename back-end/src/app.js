import express, { json, urlencoded } from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";

import indexRouter from "./routes/index.js";
import usersRouter from "./routes/users.js";

// importa o client do prisma para fazer a conexão com o Banco de dados
import prisma from "./database/client.js";

const app = express();

app.use(logger("dev"));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/", indexRouter);
app.use("/users", usersRouter);

/////////////////////////////////////////////////
import carRouter from './routes/car.js'
app.use('/car', carRouter)

export default app;
