const db = require('./connect_db');


const recomendation = async (detectedName) => {

  const foodsRef = db.collection('foods');
  const detectedDocs = (await foodsRef.where('name', '==', detectedName).get()).docs

  if(detectedDocs.length === 0){
    const error = new Error("Classes Detected Meals Not Found");
    error.status = 404;
    throw error;
  }

  const detectedData = detectedDocs[0].data();
  const tags = detectedData.tags;

  const allRecomendationBasedTags = [];

  if (detectedData.type === 'unhealthy') {
    for (const tag of tags) {
      const recomendationDocs = (await foodsRef.where('tags', 'array-contains', tag).where('type', "==", 'healthy').get()).docs;
      
      recomendationDocs.forEach((docs) => {
        const data = docs.data();

        const nutrition_fact = {
          GL: data.GL,
          GL_Level: data.GL_Level,
          GI: data.GI,
          GI_Level: data.GI_Level,
          Proteins: data.Proteins,
          Carbohydrates: data.Carbohydrates,
          Fats: data.Fats,
          Calories: data.Calories,
        }

        const modifiedData = {
          name: data.name,
          type: data.type,
          nutrition_fact,
          tags: data.tags,
          serving: data.serving,
          imageUrl: data.imageUrl,
        }

        allRecomendationBasedTags.push(modifiedData);
      })
    }
  }

  const nutrition_fact = {
    GL: detectedData.GL,
    GL_Level: detectedData.GL_Level,
    GI: detectedData.GI,
    GI_Level: detectedData.GI_Level,
    Proteins: detectedData.Proteins,
    Carbohydrates: detectedData.Carbohydrates,
    Fats: detectedData.Fats,
    Calories: detectedData.Calories,
  }

  return {
    name: detectedData.name,
    type: detectedData.type,
    nutrition_fact,
    tags,
    serving: detectedData.serving,
    ...(allRecomendationBasedTags.length > 0 ? { recomendation: allRecomendationBasedTags } : {})
  }
  
}

module.exports = recomendation;