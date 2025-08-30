import app from './app.mjs'
const PORT = 3000;

app.get("/",(req,res)=>{
  res.send("running locally")
});

app.listen(PORT,()=>{
  console.log(`server is running in ${PORT}`)
})
