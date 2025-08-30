import express from "express";
import cors from 'cors';
import addrInfoRoute from './routes/addrInfoRoute.mjs'

const app =express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));

const corsOptions={
  origin: '*',
  methods:['PUT','GET','POST','DELETE']
};

app.use(cors(corsOptions));

app.use('/api', addrInfoRoute)
console.log("hello")



export default app;
