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
        allRecomendationBasedTags.push(data);
      })
    }
  }

  return {
    ...detectedData,
    ...(allRecomendationBasedTags.length > 0 ? { recomendation: allRecomendationBasedTags } : {})
  }
  
}

module.exports = recomendation;