
// POST  /api/returns {customerId, movieId}

// Return 401 if client is not logged in.
// Return 400 if customerId is not provided.
// Return 400 if movieId is not provided.
// Return 404 if no rental found for this customer.
// Return 400 if rental already processed.
// Return 200 if valid request
// Set the return date
// Calculate the rental fee
// Increase the stock
// Return the rental

const { default: mongoose } = require('mongoose');
const request = require('supertest');
const {Rental} = require('../../models/rental');
const{User} = require('../../models/user');
const moment = require('moment');
const {Movie} = require('../../models/movie');


describe('/api/returns',()=>{

    let server;
    let customerId;
    let movieId;
    let rental;
    let token;
    let movie;

    const exec = ()=>{
        return request(server)
                .post('/api/returns')
                .set('x-auth-token',token)
                .send({customerId,movieId});
    }
    beforeEach(async()=>{ 
        server = require('../../index');
        customerId = mongoose.Types.ObjectId();
        movieId = mongoose.Types.ObjectId();

        movie = Movie({
            _id:movieId,
            title:'12345',
            dailyRentalRate:2,
            genre:{
                name:'comedy'
            },
            numberInStock:10
        });
        await movie.save();

        token = new User().generateAuthToken();

         rental = Rental({
            customer:{
                _id: customerId,
                name:'12345',
                phone:'12345'
            },
            movie:{
                _id:movieId,
                title:'12345',
                dailyRentalRate:2
            }
        });
        await rental.save();
    });
    afterEach(async()=>{ 
        server.close();
        await Rental.remove({});
        await Movie.remove({});
    });

    it('should return 401 if client is not logged in',async()=>{
        token = '';
        const result = await exec();
        expect(result.status).toBe(401);
    });

    it('should return 400 if customerId is not provided',async()=>{
        customerId ='';
        const res = await exec()
        expect(res.status).toBe(400);
    });

    it('should return 400 if movieId is not provided',async()=>{
        movieId ='';
        const res = await exec();
        expect(res.status).toBe(400);
    });

    it('should return 404 if no rental found for this customer',async ()=>{
        await Rental.remove({});
        const res = await exec();
        expect(res.status).toBe(404);
    });

    it('should return 400 if rental already processed',async()=>{
        rental.dateReturn = Date.now();
        await rental.save();
        const res = await exec();
        expect(res.status).toBe(400);
    });

    it('return 200 if a valid request is passed.',async()=>{
        const res = await exec();
        expect(res.status).toBe(200);
    });

    it('set the return date',async()=>{
        const res = await exec();
        const rentalInDb = await Rental.findById(rental._id);
        const diff = new Date() - rentalInDb.dateReturn;
        expect(diff).toBeLessThan(10 * 1000);
    });

    it('calculate the rental fee',async()=>{
        rental.dateOut = moment().add(-7,'days').toDate();
        await rental.save();
        const res = await exec();

        const rentalInDb = await Rental.findById(rental._id);
        expect(rentalInDb.rentalFee).toBe(14);
    });

    it('Increase the stock if a valid request passed.',async()=>{
        
        const res = await exec();

        const movieInDb = await Movie.findById(movieId);
        expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);

    });

    it('return the rental',async()=>{
        const res = await exec();
        const rentalInDb = await Rental.findById(rental._id);
        expect(Object.keys(res.body)).toEqual(
            expect.arrayContaining(['dateOut','dateReturn','rentalFee',
        'customer','movie']));
    });
});