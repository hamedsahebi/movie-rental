const express = require('express');
const router = express.Router();
const{Rental,validate} = require('../models/rental');
const{Customer} = require('../models/customer');
const{Movie} = require('../models/movie');
const Fawn = require('fawn');


Fawn.init("mongodb://localhost/movie");


router.get('/', async (req, res) => {

  const rentals = await Rental.find().sort('-dateOut');
  res.send(rentals);
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findById(req.body.customerId);
  if(!customer) res.status(400).send("Invalid customer");

  const movie = await Movie.findById(req.body.movieId);
  if(!movie) res.status(400).send("Invalid movie");

  if(movie.numberInStock === 0) res.status(400).send("Movie not in stock.");

  const rental = new Rental({
    customer:{
      _id:customer._id,
      name:customer.name,
      phone:customer.phone
    },
    movie:{
      _id: movie._id,
      title:movie.title,
      dailyRentalRate:movie.dailyRentalRate

    }
  });

  try{
    new Fawn.Task()
      .save('rentals',rental)
      .update('movies',{_id:movie._id},{
        $inc:{numberInStock:-1}
      })
      .run();

  res.send(rental);
  }
  catch(ex){
    res.status(500).send('Something failed!');
  }

  });

  module.exports = router;
