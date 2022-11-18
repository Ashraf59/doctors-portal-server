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
    const usersCollection = client.db('doctorsPortal').collection('users');

    app.get('/appointmentOptions', async(req, res) => {
      const date = req.query.date;
      // console.log(date);
      const query = {}
      const options = await appointmentOptionCollection.find(query).toArray();
      const bookingQuery = {appointmentDate: date}
      const alreadyBooked = await bookingsCollection.find(bookingQuery).toArray();
      //Code carefully D:
      options.forEach(option => {
        const optionBooked = alreadyBooked.filter(book => book.treatment === option.name)
        const bookedSlots = optionBooked.map(book => book.slot)
        const remainingSlots = option.slots.filter(slot => !bookedSlots.includes(slot))
        option.slots = remainingSlots;
        console.log(date, option.name, bookedSlots);
      })
      res.send(options);
    })

    app.get('/bookings', async (req, res) =>{
      const email = req.query.email;
      // console.log(email);
      const query = {email: email};
      // console.log(query);
      const bookings = await bookingsCollection.find(query).toArray();
      res.send(bookings)
    })

    app.post('/bookings', async(req, res) => {
      const booking = req.body;
      console.log(booking);
      const query = {
        appointmentDate: booking.appointmentDate,
        email: booking.email,
        treatment: booking.treatment
      }

      const alreadyBooked = await bookingsCollection.find(query).toArray();
      if(alreadyBooked.length){
        const message = `You have booked on ${booking.appointmentDate}`
        return res.send({acknowledge: false, message})
      }
      const result = await bookingsCollection.insertOne(booking);
      res.send(result)
      console.log(result);
    });

    app.post('/users', async(req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user).toArray();
      res.send(result)
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