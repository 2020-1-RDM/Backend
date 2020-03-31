import admin from '../../database/connection';

const db = admin.firestore();
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
        let data = null
        try {
            let { user, password } = request.body;
            if(user === null || password === null){
                return response.status(404).json({"error": "Não foram enviados os dados.Favor, preencher com dados."});
            }
            await db.collection('user').where("usuario","==",user).where("password", "==", password).get().then((snapshot) => {
                snapshot.forEach(
                    (res) => {data = res.data()}
                )
            });
            if(data === null){
                return response.status(401).json({"error": "Usuário inexistente/Senha inválida!"});
            }
            return response.status(200).json(data);
        }
        catch{
            return response.status(500).json({"error": "Erro durante o processamento do login. Espere um momento e tente novamente!"});
        }
    }
}