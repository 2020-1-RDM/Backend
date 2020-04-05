import admin from '../../database/connection';
require('dotenv').config();

const db = admin.firestore();
const jwt = require("jsonwebtoken");
module.exports = {

    async get(request, response) {
        try{
            let {user} = request.body;
            if(!user){
             
                return response.status(404).json({ "error": "Não foram enviados os dados." });

            }
        let userCollection = db.collection('user');
        let result = null
        await userCollection.where("usuario", "==", user).get().then(
            (snapshot) => {
                return snapshot.forEach(
                    (res) => { result = res.data() }
                )
            });
            if(!result){
                return response.status(404).json({ "error": "Não foi encontrado." });
            }
        return response.status(200).json(res);

        }
        catch(e){
            return response.status(500).json({ "error": `Erro durante o processamento do login. Espere um momento e tente novamente! Erro : ${e}` });
                
        }
    },
    async insert(request, response) {
        try{
            let {user, cpf, mentorFlag, email, password, name, linkedin, phone} = request.body;

        let userCollection = db.collection('user');

        let dbVerification = null;
        await userCollection.where("user", "==", user).get().then(
            (snapshot) => {
                return snapshot.forEach(
                    (res) => { dbVerification = res.data() }
                )
            });
            if(dbVerification){
                return response.status(400).send({"error" : "Usuário já existe."});
            }

        await userCollection.add({
                                    'user': user,
                                    'password': password,
                                    'name': name,
                                    'cpf': cpf,
                                    'phone' : phone,
                                    'linkedin': linkedin,
                                    'email' : email,
                                    'mentorFlag' : mentorFlag
                                })
            return response.status(201).send();

        }
        catch(e){
            return response.status(500).json({ "error": `Erro durante o processamento do login. Espere um momento e tente novamente! Erro : ${e}` });
                
        }
    },

    async update(request, response) {
        try{
            let {user, cpf, mentorFlag, email, password, name, linkedin, phone} = request.body;

        let userCollection = db.collection('user');

        let dbVerification = null;
        await userCollection.where("user", "==", user).get().then(
            (snapshot) => {
                return snapshot.forEach(
                    (res) => { dbVerification = res.id }
                )
            });
            if(!dbVerification){
                return response.status(400).send({"error" : "Usuário não existe."});
            }

        await userCollection.doc(dbVerification).set({
                                    'user': user,
                                    'password': password,
                                    'name': name,
                                    'cpf': cpf,
                                    'phone' : phone,
                                    'linkedin': linkedin,
                                    'email' : email,
                                    'mentorFlag' : mentorFlag
                                })
            return response.status(200).send();

        }
        catch(e){
            return response.status(500).json({ "error": `Erro durante o processamento do login. Espere um momento e tente novamente! Erro : ${e}` });
                
        }
    },

    async delete(request, response) {
        try{
            let {user} = request.body;

        let userCollection = db.collection('user');

        let dbVerification = null;
        await userCollection.where("user", "==", user).get().then(
            (snapshot) => {
                return snapshot.forEach(
                    (res) => { dbVerification = res.id }
                )
            });
            if(!dbVerification){
                return response.status(400).send({"error" : "Usuário não existe."});
            }

        await userCollection.doc(dbVerification).delete();
            return response.status(200).send();

        }
        catch(e){
            return response.status(500).json({ "error": `Erro durante o processamento do login. Espere um momento e tente novamente! Erro : ${e}` });
                
        }
    },


    async login(request, response) {
        try {

            let { user, password } = request.body;

            if (!user || !password) {

                return response.status(404).json({ "error": "Não foram enviados os dados." });

            }
            let userCollection = db.collection('user')
            let result = null
            await userCollection.where("usuario", "==", user).where("password", "==", password).get().then(
                (snapshot) => {
                    return snapshot.forEach(
                        (res) => { result = res.data() }
                    )
                });

            if (!result) {
                return response.status(401).json({ "error": "Erro de autenticação!" });
            }
            let token = jwt.sign({
                'cpf': result['cpf'],
                'email': result['email']

            }, process.env.JWT_KEY, {
                expiresIn: '1h'
            });

            return response.status(200).json({ 'token': token });

        }
        catch (e) {
            return response.status(500).json({ "error": `Erro durante o processamento do login. Espere um momento e tente novamente! Erro : ${e}` });
        }
    }
}