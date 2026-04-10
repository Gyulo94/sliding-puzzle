function buildPack(level, fileNames) {
  return fileNames.map((fileName, index) => {
    const no = index + 1;
    const title = fileName.replace(/\d+\.png$/i, "");

    return {
      id: `${level}-${no}`,
      name: `${title} ${no}`,
      src: `/images/${fileName}`,
    };
  });
}

const beginnerFiles = [
  "animal1.png",
  "animal2.png",
  "animal3.png",
  "animal4.png",
  "animal5.png",
  "flower1.png",
  "flower2.png",
  "flower3.png",
  "flower4.png",
  "flower5.png",
];

const intermediateFiles = [
  "fruit1.png",
  "fruit2.png",
  "fruit3.png",
  "fruit4.png",
  "fruit5.png",
  "mountain1.png",
  "mountain2.png",
  "mountain3.png",
  "mountain4.png",
  "mountain5.png",
];

const advancedFiles = [
  "night1.png",
  "night2.png",
  "night3.png",
  "night4.png",
  "night5.png",
  "universe1.png",
  "universe2.png",
  "universe3.png",
  "universe4.png",
  "universe5.png",
];

export const DEFAULT_IMAGES_BY_DIFFICULTY = {
  3: buildPack(3, beginnerFiles),
  4: buildPack(4, intermediateFiles),
  5: buildPack(5, advancedFiles),
};
