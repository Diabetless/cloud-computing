const tf = require('@tensorflow/tfjs-node');
const classes = require('../model/foodClassification.json');

let model;

const loadModel = async () => {
  try {
    const modelFile = tf.io.fileSystem('./model/food_detection_model/model.json');
    model = await tf.loadGraphModel(modelFile);
    return model; 
  } catch (error) {
    console.log(error.message);
  }
};

const preProcess = async (buffer) => {
  try {
    const preprocessedData = tf.tidy(() => {
      const data = tf.node.decodeImage(buffer);
      const resizedData = tf.image.resizeBilinear(data, [512, 512]);
      const normalizedData = tf.div(resizedData, 255.0);
      return normalizedData.expandDims(0).transpose([0, 3, 1, 2]);
    });

    return new Promise((resolve) => {
      resolve(preprocessedData);
    });
  } catch (err) {
    console.error(err);
  }

  return null;
};

const postProcess = async (res) => {
  const boxes = tf.tidy(() => {
    const h = res.slice([0, 3, 0], [1, 1, -1]);
    const w = res.slice([0, 2, 0], [1, 1, -1]);
    const y1 = res.slice([0, 1, 0], [1, 1, -1]).sub(tf.div(h, 2));
    const x1 = res.slice([0, 0, 0], [1, 1, -1]).sub(tf.div(w, 2));

    return tf
      .concat([y1, x1, y1.add(h), x1.add(w)])
      .transpose()
      .squeeze();
  });

  const [scores, labels] = tf.tidy(() => {
    const confClasses = res.slice([0, 4, 0], [1, classes.length, -1]).transpose().squeeze();
    return [confClasses.max(1), confClasses.argMax(1)];
  });

  const nonMaxSupression = await tf.image.nonMaxSuppressionAsync(boxes, scores, 5, 0.7, 0.5);
  const detectedObject = tf.tidy(() => {
    const uniques = tf.unique(labels.gather(nonMaxSupression));
    return uniques.values.arraySync();
  });
  const stringClasses = detectedObject.map((idx) => classes[idx]);


  console.log(
    `------ Hasil Prediksi ------\nTerdapat ${detectedObject.length} objek diantaranya : ${stringClasses.join(', ')}`
  );

  tf.dispose([boxes, scores, labels, nonMaxSupression]);
  return stringClasses;
};

const predict = async (buffer) => {
  const gambar = await preProcess(buffer);

  if (gambar === null) {
    console.log('Gambar Tidak ditemukan');

    // error code or something
    return;
  }

  const res = await model.predict(gambar);
  const temp = await postProcess(res);
  tf.dispose([res, gambar]);

  return temp;

};

(async () => {
  try {
    await loadModel();
    module.exports = predict;
  } catch (err) {
    console.error('Error during model loading:', err);
  }
})();

