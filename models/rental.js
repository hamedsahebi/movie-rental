const mongoose = require('mongoose');
const Joi = require('joi');

const rentalSchema = new mongoose.Schema({
    customer: new mongoose.Schema({
        name:{
            type:String,
            requied:true,
            minlength:5,
            maxlength:50
        },
        phone:{
            type:String,
            required:true
        }
    }),

    movie: new mongoose.Schema({
        
        title:{
            type:String,
            required:true,
            minlength:2,
            maxlength:255
        },
        dailyRentalRate:{
            type:Number,
            required:true
        }
    }),
    dateOut:{
        type:Date,
        required:true,
        default: Date.now()
    },
    dateReturn:{
        type:Date
    },
    rentalFee:{
        type:Number,
        min:0
    }
  });
  
  const Rental = mongoose.model('rentals', rentalSchema);

  function validateRental(rental) {
    const schema = {
        movieId: Joi.objectId().required(),
        customerId: Joi.objectId().required()
    };
  
    return Joi.validate(rental, schema);
  }

exports.Rental = Rental;
exports.validate = validateRental;