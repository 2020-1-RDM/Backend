import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import admin from '../../configs/database/connection';

const db = admin.firestore();

async function insert(request, response) {
  try {
    const {
      title,
      description,
      knowledgeArea,
      mentoringOption,
      dateTime
    } = request.body;

    const image = await resizeImage(request.file);

    const cpf = request.cpf;

    const userCollection = db.collection('mentoria');//agurdando criação da tabela de mentor

    await userCollection.add({
      image,
      cpf,
      title,
      description,
      knowledgeArea,
      mentoringOption,
      dateTime
    });

    return response.status(200).send({ success: true });
  } catch (e) {
    return response.status(500).json({
      error: `Erro ao inserir mentoria : ${e}`,
    });
  }
}

//imagem
async function resizeImage(imageOptions) {
  const [nameFile] = imageOptions.filename.split('.');
  const fileName = `${nameFile}-resized.jpg`;

  await sharp(imageOptions.path)
    .resize(500)
    .jpeg({ quality: 70 })
    .toFile(path.resolve(imageOptions.destination, fileName));

  fs.unlinkSync(imageOptions.path);

  return fileName;
}
