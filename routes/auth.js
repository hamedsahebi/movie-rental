const express = require('express');
const router = express.Router();
const{User} = require('../models/user');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash')




router.post('/', async (req, res) => {
    const { error } = validate(req.body); 
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({email: req.body.email});
    if(!user) return res.status(400).send('Invalid username or password.');
  
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    
    if(!validPassword) return res.status(400).send('Invalid username or password.');

    const token = user.generateAuthToken(); 

    res.header('x-auth-token',token).send(_.pick(user,['_id','username','email']));

  
  });

  function validate(user) {
    const schema = {
      password: Joi.string().min(5).max(1024).required(),
      email: Joi.string().email().required().min(5).max(50)
    };
  
    return Joi.validate(user, schema);
  }


module.exports = router;


