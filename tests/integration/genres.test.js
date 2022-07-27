const { default: mongoose } = require('mongoose');
const request = require('supertest');
const{Genre} = require('../../models/genre');
const{User} = require('../../models/user');

let server;

describe('/api/genres',()=>{

    beforeEach(()=>{ 
        server = require('../../index');
    });
    afterEach(async()=>{ 
        await Genre.remove({});
        server.close()
    });

    describe('GET /',()=>{

        it('Should return all genres',async()=>{
            await Genre.collection.insertMany([
                {name:'genre1'},
                {name:'genre2'},
            ]);
            const res =  await request(server).get('/api/genres');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some(g => g.name === 'genre1')).toBeTruthy();
            expect(res.body.some(g => g.name === 'genre2')).toBeTruthy();

        });
    });

    describe('Get /:id',()=>{
        it('Should return one genre if valid id is passed',async()=>{
           const genre = new Genre({name:'genre1'});
           await genre.save();
           const res = await request(server).get(`/api/genres/`+ genre._id);
           expect(res.status).toBe(200);
           expect(res.body).toHaveProperty('name','genre1');

        });

        it('Should return 404 if invalid id is passed',async()=>{
            
            const res = await request(server)
                .get(`/api/genres/${123}`);
            expect(res.status).toBe(404);
 
         });

         it('Should return 404 if genre with given id not exists',async()=>{
            
            const id = mongoose.Types.ObjectId();
            const res = await request(server)
                .get(`/api/genres/`+id);
            expect(res.status).toBe(404);
 
         });

    });

    describe('POST /',()=>{

        let token;
        let name = 'genre1';

        const exec = async() =>{
        return await request(server)
            .post('/api/genres')
            .set('x-auth-token', token)
            .send({name});
        };

        beforeEach(()=>{
            token = new User().generateAuthToken();
            name='genre1';
        });

        it('should return 401 if client is not authorized!',async()=>{

            token='';
            const res = await exec();
            expect(res.status).toBe(401);
        });

        it('should return 400 if genre is less than 5 characters.',async()=>{

            name='drm';
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should return 400 if genre is more than 50 characters',async()=>{

            name = new Array(52).join('a');
            const res = await exec();
            expect(res.status).toBe(400);
            
        });

        it('should save the  genre if it is valid.',async()=>{
           
            await exec();
            const genre = await Genre.findOne({name:'genre1'});
            expect(genre).not.toBeNull();
        });

        it('should return the genre if it is valid.',async()=>{
           
            const res = await exec();
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name','genre1');

        });

        



    });

    describe('PUT /',()=>{

        let token;
        let name = 'genre1';
        let updated_name;
        let id;

        const exec = async() =>{
            return await request(server)
                .post('/api/genres')
                .set('x-auth-token', token)
                .send({name});
            };

        const execPut= async ()=>{

            const result = await exec();
            const res = await request(server)
                               .put('/api/genres/'+id)
                               .set('x-auth-token',token)
                               .send({name:updated_name});
            return res;

        };

        beforeEach(()=>{
            token = new User().generateAuthToken();

        });

        it('Should update a genre if a valid id is passed.',async()=>{

            name = 'genre1';
            updated_name='genre_updated';
            const result  = await exec();
            id = result.body._id;
            const res = await execPut();
            expect(res.status).toBe(200);
        });

        it('should return 400 if invalid name is passed',async()=>{
            name='genre1';
            updated_name = 'sd';
            const result = await exec();
            id = result.body._id;
            const res = await execPut();
            expect(res.status).toBe(400);
        });

        it('should return 404 if genre with given id not exists.',async()=>{

            updated_name = 'updated genre';
            const id = mongoose.Types.ObjectId();
            const res = await execPut()
            expect(res.status).toBe(404);
        });
        
    });

    describe('DELETE /',()=>{

        let name='genre1';
        let token;
        let id;
            const exec = async() =>{
                return await request(server)
                    .post('/api/genres')
                    .set('x-auth-token', token)
                    .send({name});
                };

            const del = async()=>{
                return await request(server)
                    .delete('/api/genres/'+ id)
                    .set('x-auth-token',token);
                };

        beforeEach(()=>{
            token = User().generateAuthToken();
        });

        it('should delete a genre if a valid id is passed.',async()=>{

            token = User({_id:mongoose.Types.ObjectId(), isAdmin:true})
                        .generateAuthToken();
            name='genre1';
            const result = await exec();
            id = result.body._id;
            const res = await del();
            expect(res.status).toBe(200);

            const genre = await Genre.findById(result.body._id);
            expect(genre).toBeNull();
        });

        it('should return 404 if unauthorized user delete a genre',async()=>{
            name='genre1';
            const result = await exec();
            id = result.body._id;
            const res = await del();
            expect(res.status).toBe(404);
        });

        it('should return 404 if genre with the given id not exists.',async()=>{
            id = mongoose.Types.ObjectId();
            const res = await del();
            expect(res.status).toBe(404);
        })
    });
});


