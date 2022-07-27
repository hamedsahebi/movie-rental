const mongoose = require('mongoose');
const Joi = require('joi');
const {genreSchema}=require('./genre');

const movieSchema = new mongoose.Schema({
    title: {
      type:String, 
      required:true,
      minlength:5,
      maxlength:50},
      genre:{
          type: genreSchema,
          required:true
      },
      numberInStock: {
          type:Number, 
          required:true
          },
      dailyRentalRate:{
        type:Number,
        required:true
      }
  });
  
  const Movie = mongoose.model('Movie', movieSchema);

  function validateMovie(movie) {
    const schema = {
        title: Joi.string().min(5).max(50).required(),
        genreId: Joi.objectId().required(),
        numberInStock:Joi.number().integer().min(0),
        dailyRentalRate:Joi.number().required()
    };
  
    return Joi.validate(movie, schema);
  }

exports.Movie = Movie;
exports.validate = validateMovie;