const express = require('express');
const auth = require('../middleware/auth');
const { Movie } = require('../models/movie');
const router = express.Router();
const {Rental} = require('../models/rental');
const { User } = require('../models/user');
const Joi = require('joi');
const validate = require('../middleware/validate');


router.post('/',[auth,validate(validateRental)],async(req,res) => {

    const rental = await Rental.lookup(req.body.customerId,req.body.movieId);
  
    if(!rental) return res.status(404).send('No rental found with provided credentials');
    if(rental.dateReturn) return res.status(400).send('Rental already processed.');
    
    rental.return();
    await rental.save();

    await Movie.update({_id:rental.movie._id},{
        $inc:{
            numberInStock:1
        }
    });
    return res.send(rental);
  });

  function validateRental(req) {
    const schema = {
      customerId: Joi.objectId().required(),
      movieId: Joi.objectId().required()
    };
  
    return Joi.validate(req, schema);
  };

module.exports = router;