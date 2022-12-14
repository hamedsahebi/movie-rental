const express = require('express');
const router = express.Router();
const{Genre,validate} = require('../models/genre');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validateObjectId = require('../middleware/validateObjectId');
const asyncMiddleware = require('../middleware/async');
const { default: mongoose } = require('mongoose');
 



router.get('/', asyncMiddleware(async (req,res) => {
  const genres = await Genre.find().sort('name');
  res.send(genres);
}));

router.post('/', auth,asyncMiddleware(async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const genre = new Genre({
    name: req.body.name
  });

  const result = await genre.save()
  res.send(result);
  
}));

router.put('/:id', async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findByIdAndUpdate(req.params.id,{
    $set:{
      name:req.body.name
    }
  },{new:true});

  if (!genre) return res.status(404).send('The genre with the given ID was not found.');

  res.send(genre);
});

router.delete('/:id',[auth,admin], async (req, res) => {
  const genre = await Genre.findByIdAndDelete(req.params.id);
  if (!genre) return res.status(404).send('The genre with the given ID was not found.');

  res.send(genre);
});

router.get('/:id',validateObjectId ,async (req, res) => {
  const genre = await Genre.findById(req.params.id);

  if (!genre) return res.status(404).send('The genre with the given ID was not found.');

  res.send(genre);
});

module.exports = router;