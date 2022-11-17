const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();


//Middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l1ydak8.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
 
async function run(){
  try{
    const appointmentOptionCollection = client.db('doctorsPortal').collection('appointmentOptions');
    // console.log(appointmentOptionCollection);

    const bookingsCollection = client.db('doctorsPortal').collection('bookings');

    app.get('/appointmentOptions', async(req, res) => {
      const query = {}
      const options = await appointmentOptionCollection.find(query).toArray();
      res.send(options);
    })

    app.post('/bookings', async(req, res) => {
      const booking = req.body;
      console.log(booking);
      const result = await bookingsCollection.insertOne(booking);
      res.send(result)
      console.log(result);
    })
  }
  finally{

  }

}

run().catch(console.log);



app.get('/', async(req, res) => {
    res.send('Doctors portal is running')
})

app.listen(port, () => console.log(`Doctore portal is running on port ${port}`))