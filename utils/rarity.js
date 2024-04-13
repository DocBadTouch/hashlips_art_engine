const basePath = process.cwd();
const fs = require("fs");
const layersDir = `${basePath}/layers`;

const {
  layerConfigurations,
  layerConfigurationsWithVariants,
} = require(`${basePath}/src/config.js`);

const { getElements } = require("../src/main.js");

// read json data
let rawdata = fs.readFileSync(`${basePath}/build/json/_metadata.json`);
let data = JSON.parse(rawdata);
let editionSize = data.length;

let rarityData = {};

// intialize layers to chart
const AddToRarityData = (configuration, hasVariants) => {
  configuration.forEach((config) => {
    let layers = config.layersOrder;

    layers.forEach((layer) => {
      // get elements for each layer
      let elementsForLayer = [];
      let elements = hasVariants
        ? layer.elements
        : getElements(`${layersDir}/${layer.name}/`);
      elements.forEach((element) => {
        //console.log(layer.name, element.name, element.weight);
        // just get name and weight for each element
        let rarityDataElement = {
          trait: element.name,
          variant: element.variant,
          weight: +element.weight, //.toFixed(0),
          occurrence: 0, // initialize at 0
        };
        elementsForLayer.push(rarityDataElement);
      });
      let layerName =
        layer.options?.["displayName"] != undefined
          ? layer.options?.["displayName"]
          : layer.name;
      // don't include duplicate layers
      if (!rarityData[layerName]) {
        // add elements for each layer to chart
        rarityData[layerName] = elementsForLayer;
        //console.log(layerName, rarityData[layerName]);
      } else {
        elementsForLayer.forEach((element) => {
          const index = rarityData[layerName].findIndex(
            (el) => el.trait === element.trait && el.variant === element.variant
          );
          if (index !== -1) {
            rarityData[layerName][index].weight += +element.weight;
          } else {
            rarityData[layerName].push(element);
          }
        });
      }
    });
  });
};
AddToRarityData(layerConfigurationsWithVariants, true);
//console.log("RarityData", rarityData);
// fill up rarity chart with occurrences from metadata
data.forEach((element) => {
  let attributes = element.attributes;
  attributes.forEach((attribute) => {
    let traitType = attribute.trait_type;
    let value = attribute.value;

    let rarityDataTraits = rarityData[traitType];
    rarityDataTraits.forEach((rarityDataTrait) => {
      if (rarityDataTrait.trait == value) {
        // keep track of occurrences
        rarityDataTrait.occurrence++;
      }
    });
  });
});

// convert occurrences to occurence string
for (var layer in rarityData) {
  for (var attribute in rarityData[layer]) {
    // get chance
    let chance = (
      (rarityData[layer][attribute].occurrence / editionSize) *
      100
    ).toFixed(2);

    // show two decimal places in percent
    rarityData[layer][
      attribute
    ].occurrence = `${rarityData[layer][attribute].occurrence} in ${editionSize} editions (${chance} %)`;
  }
}

// print out rarity data
for (var layer in rarityData) {
  console.log(`Trait type: ${layer}`);
  for (var trait in rarityData[layer]) {
    console.log(rarityData[layer][trait]);
  }
  console.log();
}
