import admin from '../../database/connection';

const db = admin.firestore();
module.exports = {

    async get(request,response){
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
    }
    
}