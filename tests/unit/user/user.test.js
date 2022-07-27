const {User} =  require('../../../models/user');
const jwt = require('jsonwebtoken');
const config = require('config');
const mongoose  = require('mongoose');



describe('JWT',()=>{

    it('should return a valid token',()=>{

        const payLoad = {_id:mongoose.Types.ObjectId().toHexString(),isAdmin:true};
        const user = new User(payLoad);
            
        const token = user.generateAuthToken();
        const decoded = jwt.verify(token,config.get('jwtPrivateKey'));
        expect(decoded).toMatchObject(payLoad);
    });


    it('wrong jwt',()=>{
        expect(()=>{
            const token = '1234';
            jwt.verify(token);

        }).toThrow();
    })
})