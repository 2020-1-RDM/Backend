import admin from '../../database/connection';
require('dotenv').config();

const db = admin.firestore();
const jwt = require("jsonwebtoken");
module.exports = {

    async get(request, response) {
        let res = new Map;
        await db.collection('user').get().then((snapshot) => {
            snapshot.forEach((doc) => {
                res[doc.id] = doc.data();
            });
        })
            .catch((err) => {
                console.log('Error getting documents', err);
            });

        return response.json(res);
    },


    async login(request, response) {
        try {

            let { user, password } = request.body;

            if(!user || !password){

                return response.status(404).json({"error": "Não foram enviados os dados."});
                
            }
            let userCollection = db.collection('user')
            let result = null
            await userCollection.where("usuario","==",user).where("password", "==", password).get().then(
                (snapshot) => {
                    return snapshot.forEach(
                        (res) => {  result = res.data()}
                    )
            });

            if(!result){
                return response.status(401).json({"error": "Erro de autenticação!"});
            }
            let token = jwt.sign({
                'cpf' : result['cpf'],
                'email' : result['email']

            }, process.env.JWT_KEY, {
                expiresIn : '1h'
            });

            return response.status(200).json({'token' : token});

        }
        catch(e){
            return response.status(500).json({"error": `Erro durante o processamento do login. Espere um momento e tente novamente! Erro : ${e}`});
        }
    }
}