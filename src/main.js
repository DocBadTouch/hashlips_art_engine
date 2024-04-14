const basePath = process.cwd();
const { NETWORK } = require(`${basePath}/constants/network.js`);
const fs = require("fs");
const { totalRarityMap } = require("./layerConfig");
const sha1 = require(`${basePath}/node_modules/sha1`);
const { createCanvas, loadImage } = require(`${basePath}/node_modules/canvas`);
const buildDir = `${basePath}/build`;
const layersDir = `${basePath}/layers`;
const {
  format,
  baseUri,
  description,
  background,
  uniqueDnaTorrance,
  layerConfigurations: layerConfigurationsWithOutVariants,
  layerConfigurationsWithVariants,
  rarityDelimiter,
  shuffleLayerConfigurations,
  debugLogs,
  extraMetadata,
  text,
  namePrefix,
  network,
  solanaMetadata,
  gif,
} = require(`${basePath}/src/config.js`);
const canvas = createCanvas(format.width, format.height);
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = format.smoothing;
var metadataList = [];
var attributesList = [];
var dnaList = new Set();
const DNA_DELIMITER = "-";
const HashlipsGiffer = require(`${basePath}/modules/HashlipsGiffer.js`);

let hashlipsGiffer = null;

const buildSetup = () => {
  if (fs.existsSync(buildDir)) {
    fs.rmdirSync(buildDir, { recursive: true });
  }
  fs.mkdirSync(buildDir);
  fs.mkdirSync(`${buildDir}/json`);
  fs.mkdirSync(`${buildDir}/images`);
  if (gif.export) {
    fs.mkdirSync(`${buildDir}/gifs`);
  }
};

const getRarityWeight = (_str) => {
  let nameWithoutExtension = _str.slice(0, -4);
  var nameWithoutWeight = Number(
    nameWithoutExtension.split(rarityDelimiter).pop()
  );
  if (isNaN(nameWithoutWeight)) {
    nameWithoutWeight = 1;
  }
  return nameWithoutWeight;
};

const cleanDna = (_str) => {
  const withoutOptions = removeQueryStrings(_str);
  var dna = Number(withoutOptions.split(":").shift());
  return dna;
};

const cleanName = (_str) => {
  let nameWithoutExtension = _str.slice(0, -4);
  var nameWithoutWeight = nameWithoutExtension.split(rarityDelimiter).shift();
  return nameWithoutWeight;
};
/**
 *
 * @param {string} path
 * @returns {{
 * id: number,
 * name: string,
 * filename: string,
 * path: string,
 * weight: number
 * }[]}
 */
const getElements = (path) => {
  return fs
    .readdirSync(path)
    .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))
    .map((i, index) => {
      if (i.includes("-")) {
        throw new Error(`layer name can not contain dashes, please fix: ${i}`);
      }
      return {
        id: index,
        name: cleanName(i),
        filename: i,
        path: `${path}${i}`,
        weight: getRarityWeight(i),
      };
    });
};
/**  
 @returns  {{
  id: number,
  elements: {}
  name: string,
  blend: string,
  opacity: number,
  bypassDNA: boolean,}[]
} */
const layersSetup = (layersOrder, hasVariants) => {
  const layers = hasVariants
    ? variantLayersSetup(layersOrder)
    : baseLayersSetup(layersOrder);
  return layers;
};
const baseLayersSetup = (layersOrder) => {
  const layers = layersOrder.map((layerObj, index) => ({
    id: index,
    elements: getElements(`${layersDir}/${layerObj.name}/`),
    name:
      layerObj.options?.["displayName"] != undefined
        ? layerObj.options?.["displayName"]
        : layerObj.name,
    blend:
      layerObj.options?.["blend"] != undefined
        ? layerObj.options?.["blend"]
        : "source-over",
    opacity:
      layerObj.options?.["opacity"] != undefined
        ? layerObj.options?.["opacity"]
        : 1,
    bypassDNA:
      layerObj.options?.["bypassDNA"] !== undefined
        ? layerObj.options?.["bypassDNA"]
        : false,
  }));

  return layers;
};
const variantLayersSetup = (layersOrder) => {
  const layers = layersOrder.map((layerObj, index) => ({
    id: index,
    hasVariants: layerObj.hasVariants,
    elements: layerObj.elements.map((element) => ({
      ...element,
      path: `${layersDir}\\${element.path.replace("/", "\\")}`,
      filename: element.path.split("/").pop(),
    })),
    name:
      layerObj.options?.["displayName"] != undefined
        ? layerObj.options?.["displayName"]
        : layerObj.name,
    blend:
      layerObj.options?.["blend"] != undefined
        ? layerObj.options?.["blend"]
        : "source-over",
    opacity:
      layerObj.options?.["opacity"] != undefined
        ? layerObj.options?.["opacity"]
        : 1,
    bypassDNA:
      layerObj.options?.["bypassDNA"] !== undefined
        ? layerObj.options?.["bypassDNA"]
        : false,
  }));
  return layers;
};
const saveImage = (_editionCount) => {
  fs.writeFileSync(
    `${buildDir}/images/${_editionCount}.png`,
    canvas.toBuffer("image/png")
  );
};

const genColor = () => {
  let hue = Math.floor(Math.random() * 360);
  let pastel = `hsl(${hue}, 100%, ${background.brightness})`;
  return pastel;
};

const drawBackground = () => {
  ctx.fillStyle = background.static ? background.default : genColor();
  ctx.fillRect(0, 0, format.width, format.height);
};

const addMetadata = (_dna, _edition) => {
  let dateTime = Date.now();
  let tempMetadata = {
    name: `${namePrefix} #${_edition}`,
    description: description,
    image: `${baseUri}/${_edition}.png`,
    dna: sha1(_dna),
    edition: _edition,
    date: dateTime,
    ...extraMetadata,
    attributes: attributesList,
    compiler: "HashLips Art Engine",
  };
  if (network == NETWORK.sol) {
    tempMetadata = {
      //Added metadata for solana
      name: tempMetadata.name,
      symbol: solanaMetadata.symbol,
      description: tempMetadata.description,
      //Added metadata for solana
      seller_fee_basis_points: solanaMetadata.seller_fee_basis_points,
      image: `${_edition}.png`,
      //Added metadata for solana
      external_url: solanaMetadata.external_url,
      edition: _edition,
      ...extraMetadata,
      attributes: tempMetadata.attributes,
      properties: {
        files: [
          {
            uri: `${_edition}.png`,
            type: "image/png",
          },
        ],
        category: "image",
        creators: solanaMetadata.creators,
      },
    };
  }
  metadataList.push(tempMetadata);
  attributesList = [];
};

const addAttributes = (_element) => {
  let selectedElement = _element.layer.selectedElement;
  attributesList.push({
    trait_type: _element.layer.name,
    value: selectedElement.name,
  });
};

const loadLayerImg = async (_layer) => {
  try {
    return new Promise(async (resolve) => {
      const image = await loadImage(`${_layer.selectedElement.path}`);
      resolve({ layer: _layer, loadedImage: image });
    });
  } catch (error) {
    console.error("Error loading image:", error);
  }
};

const addText = (_sig, x, y, size) => {
  ctx.fillStyle = text.color;
  ctx.font = `${text.weight} ${size}pt ${text.family}`;
  ctx.textBaseline = text.baseline;
  ctx.textAlign = text.align;
  ctx.fillText(_sig, x, y);
};

const drawElement = (_renderObject, _index, _layersLen) => {
  ctx.globalAlpha = _renderObject.layer.opacity;
  ctx.globalCompositeOperation = _renderObject.layer.blend;
  text.only
    ? addText(
        `${_renderObject.layer.name}${text.spacer}${_renderObject.layer.selectedElement.name}`,
        text.xGap,
        text.yGap * (_index + 1),
        text.size
      )
    : ctx.drawImage(
        _renderObject.loadedImage,
        0,
        0,
        format.width,
        format.height
      );

  addAttributes(_renderObject);
};
const constructLayerToDna = (_dna = "", _layers = []) => {
  let mappedDnaToLayers = _layers.map((layer, index) => {
    let selectedElement = layer.elements.find(
      (e) => e.id == cleanDna(_dna.split(DNA_DELIMITER)[index])
    );
    return {
      name: layer.name,
      blend: layer.blend,
      opacity: layer.opacity,
      selectedElement: selectedElement,
    };
  });
  return mappedDnaToLayers;
};
const constructVariantLayerToDna = (_dna = "", _layers = [], variant) => {
  let mappedDnaToLayers = _layers.map((layer, index) => {
    let layerDna = _dna.split(DNA_DELIMITER)[index];
    let layerElements = layer.hasVariants
      ? layer.elements.filter((e) => e.variant == variant)
      : layer.elements;
    let selectedElement = layerElements.find((e) => {
      let cleanId = cleanDna(layerDna);
      return e.id == cleanId;
    });
    return {
      name: layer.name,
      blend: layer.blend,
      opacity: layer.opacity,
      selectedElement: selectedElement,
    };
  });
  return mappedDnaToLayers;
};

/**
 * In some cases a DNA string may contain optional query parameters for options
 * such as bypassing the DNA isUnique check, this function filters out those
 * items without modifying the stored DNA.
 *
 * @param {String} _dna New DNA string
 * @returns new DNA string with any items that should be filtered, removed.
 */
const filterDNAOptions = (_dna) => {
  const dnaItems = _dna.split(DNA_DELIMITER);
  const filteredDNA = dnaItems.filter((element) => {
    const query = /(\?.*$)/;
    const querystring = query.exec(element);
    if (!querystring) {
      return true;
    }
    const options = querystring[1].split("&").reduce((r, setting) => {
      const keyPairs = setting.split("=");
      return { ...r, [keyPairs[0]]: keyPairs[1] };
    }, []);

    return options.bypassDNA;
  });

  return filteredDNA.join(DNA_DELIMITER);
};

/**
 * Cleaning function for DNA strings. When DNA strings include an option, it
 * is added to the filename with a ?setting=value query string. It needs to be
 * removed to properly access the file name before Drawing.
 *
 * @param {String} _dna The entire newDNA string
 * @returns Cleaned DNA string without querystring parameters.
 */
const removeQueryStrings = (_dna) => {
  const query = /(\?.*$)/;
  return _dna.replace(query, "");
};

const isDnaUnique = (_DnaList = new Set(), _dna = "") => {
  const _filteredDNA = filterDNAOptions(_dna);
  return !_DnaList.has(_filteredDNA);
};
const usedLayerElements = new Map();
const createDnaWithVariants = (_layers) => {
  let randNum = new Array(_layers.length);
  //create a deep copy of the layers array
  let layersCopy = JSON.parse(JSON.stringify(_layers));
  //let actualLayerOrder = new Array(_layers.length);
  let variant;
  const layers = layersCopy.sort((a, b) => a.decisionOrder - b.decisionOrder);
  let isNotValid = true;
  let keysUsed = [];
  while (isNotValid) {
    console.log("Trying to create DNA with variants...");
    for (let k = 0; k < layers.length; k++) {
      const layer = layers[k];

      var totalWeight = 0;
      const layerIndex = layer.layerOrder;
      let elements =
        layer.hasVariants && variant
          ? layer.elements.filter((element) => element.variant == variant)
          : layer.elements;
      elements.forEach((element) => {
        totalWeight += element.weight;
      });
      // number between 0 - totalWeight
      if (elements.length == 0) {
        /* console.log(
          `Layer ${layer.name} has no elements with variant ${variant}. Skipping layer.`
        ); */
        isNotValid = true;
        variant = null;
        keysUsed = [];
        break;
      }
      let random = Math.floor(Math.random() * totalWeight);
      for (var i = 0; i < elements.length; i++) {
        // subtract the current weight from the random weight until we reach a sub zero value.
        random -= elements[i].weight;

        if (random < 0) {
          const elKey = `${elements[i].name}-${elements[i].variant}`;
          const key = `${layer.name}-${elKey}`;
          if (usedLayerElements.has(key)) {
            const usedCount = usedLayerElements.get(key);
            //console.log("LayerName", layer.name);
            const rarityLayer = totalRarityMap[layer.name];
            //console.log("Rarity Layer", rarityLayer);
            //console.log(`Element ${key} has been used ${usedCount} times.`);
            let flexedRarity =
              rarityLayer[elKey] >= 100
                ? rarityLayer[elKey]
                : rarityLayer[elKey];
            if (usedCount == flexedRarity /* give some flex */) {
              /* console.log("LayerName", layer.name, elements);
              console.log("Layers", layers); */
              console.log(
                `Element ${key} has been used ${usedCount} times, which is more than its weight of ${rarityLayer[elKey]}. FlexRarity ${flexedRarity}. Resetting random number and trying again.`
              );
              //remove the element from the layers array
              //find index of element in layer.elements
              const elementIndex = layer.elements.findIndex(
                (element) =>
                  element.name == elements[i].name &&
                  element.variant == elements[i].variant
              );
              //remove element from layer.elements
              layer.elements.splice(elementIndex, 1);

              //console.log("Layer", layer.elements);
              isNotValid = true;
              variant = null;
              keysUsed = [];
              break;
            }
            keysUsed.push(key);
            //usedLayerElements.set(key, usedCount + 1); //THis is getting set on each iteration.. need to keep track internally THEN update the used amoutns
          } else {
            keysUsed.push(key);
            //usedLayerElements.set(key, 1);
          }
          isNotValid = false;
          const id = elements[i].id;
          const filename = elements[i].filename;
          const finalIndex = elements[i].layerIndex ?? layerIndex;
          variant =
            elements[i].variant == "Default" ? variant : elements[i].variant;
          const bypassDNA = layer.bypassDNA ? "?bypassDNA=true" : "";
          const elementString = `${id}:${filename}${bypassDNA}`;
          randNum[finalIndex] = elementString;
          break;
          /// return (randNum[finalIndex] = elementString);
        }
      }
      if (isNotValid) {
        console.log("Trying again...");
        isNotValid = true;
        variant = null;
        keysUsed = [];
        break;
      }
    }
  }
  keysUsed.forEach((key) => {
    if (usedLayerElements.has(key)) {
      const usedCount = usedLayerElements.get(key);
      usedLayerElements.set(key, usedCount + 1);
    } else {
      usedLayerElements.set(key, 1);
    }
  });
  //console.log("Used Layer Elements", usedLayerElements);
  return {
    newDna: randNum.join(DNA_DELIMITER),
    variant,
    keysUsed,
    //layersInDNAOrder: actualLayerOrder,
  };
};

const createDna = (_layers) => {
  let randNum = [];
  _layers.forEach((layer) => {
    var totalWeight = 0;
    layer.elements.forEach((element) => {
      totalWeight += element.weight;
    });
    // number between 0 - totalWeight
    let random = Math.floor(Math.random() * totalWeight);
    for (var i = 0; i < layer.elements.length; i++) {
      // subtract the current weight from the random weight until we reach a sub zero value.
      random -= layer.elements[i].weight;
      if (random < 0) {
        return randNum.push(
          `${layer.elements[i].id}:${layer.elements[i].filename}${
            layer.bypassDNA ? "?bypassDNA=true" : ""
          }`
        );
      }
    }
  });
  return { newDna: randNum.join(DNA_DELIMITER) };
};

const writeMetaData = (_data) => {
  fs.writeFileSync(`${buildDir}/json/_metadata.json`, _data);
};

const saveMetaDataSingleFile = (_editionCount) => {
  let metadata = metadataList.find((meta) => meta.edition == _editionCount);
  debugLogs
    ? console.log(
        `Writing metadata for ${_editionCount}: ${JSON.stringify(metadata)}`
      )
    : null;
  fs.writeFileSync(
    `${buildDir}/json/${_editionCount}.json`,
    JSON.stringify(metadata, null, 2)
  );
};

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

const startCreating = async (hasVariants) => {
  let layerConfigIndex = 0;
  let editionCount = 1;
  let failedCount = 0;
  let abstractedIndexes = [];
  let layerConfigurations = hasVariants
    ? layerConfigurationsWithVariants
    : layerConfigurationsWithOutVariants;
  for (
    let i = network == NETWORK.sol ? 0 : 1;
    i <= layerConfigurations[layerConfigurations.length - 1].growEditionSizeTo;
    i++
  ) {
    abstractedIndexes.push(i);
  }
  if (shuffleLayerConfigurations) {
    abstractedIndexes = shuffle(abstractedIndexes);
  }
  debugLogs
    ? console.log("Editions left to create: ", abstractedIndexes)
    : null;
  while (layerConfigIndex < layerConfigurations.length) {
    const layers = layersSetup(
      layerConfigurations[layerConfigIndex].layersOrder,
      hasVariants
    );

    while (
      editionCount <= layerConfigurations[layerConfigIndex].growEditionSizeTo
    ) {
      let { newDna, variant, keysUsed /* layersInDNAOrder */ } = hasVariants
        ? createDnaWithVariants(layers)
        : createDna(layers);
      console.log("newDna", newDna);
      if (isDnaUnique(dnaList, newDna)) {
        let results = hasVariants
          ? constructVariantLayerToDna(newDna, layers, variant)
          : constructLayerToDna(newDna, layers);
        let loadedElements = [];

        results.forEach((layer) => {
          loadedElements.push(loadLayerImg(layer));
        });

        await Promise.all(loadedElements).then((renderObjectArray) => {
          //renderObjectArray is type of {layer, loadedImage}[]
          debugLogs ? console.log("Clearing canvas") : null;
          ctx.clearRect(0, 0, format.width, format.height);
          if (gif.export) {
            hashlipsGiffer = new HashlipsGiffer(
              canvas,
              ctx,
              `${buildDir}/gifs/${abstractedIndexes[0]}.gif`,
              gif.repeat,
              gif.quality,
              gif.delay
            );
            hashlipsGiffer.start();
          }
          if (background.generate) {
            drawBackground();
          }
          renderObjectArray.forEach((renderObject, index) => {
            //renderObject is type of {layer, loadedImage}
            drawElement(
              renderObject,
              index,
              layerConfigurations[layerConfigIndex].layersOrder.length
            );
            if (gif.export) {
              hashlipsGiffer.add();
            }
          });
          if (gif.export) {
            hashlipsGiffer.stop();
          }
          debugLogs
            ? console.log("Editions left to create: ", abstractedIndexes)
            : null;
          saveImage(abstractedIndexes[0]);
          addMetadata(newDna, abstractedIndexes[0]);
          saveMetaDataSingleFile(abstractedIndexes[0]);
          console.log(
            `Created edition: ${abstractedIndexes[0]}, with DNA: ${sha1(
              newDna
            )}`
          );
        });
        dnaList.add(filterDNAOptions(newDna));
        editionCount++;
        abstractedIndexes.shift();
      } else {
        console.log("DNA exists!");
        keysUsed.forEach((key) => {
          if (usedLayerElements.has(key)) {
            const usedCount = usedLayerElements.get(key);
            usedLayerElements.set(key, usedCount - 1);
          } else {
            usedLayerElements.set(key, 0);
          }
        });
        failedCount++;
        if (failedCount >= uniqueDnaTorrance) {
          console.log(
            `You need more layers or elements to grow your edition to ${layerConfigurations[layerConfigIndex].growEditionSizeTo} artworks!`
          );
          process.exit();
        }
      }
    }
    layerConfigIndex++;
  }
  writeMetaData(JSON.stringify(metadataList, null, 2));
};

module.exports = { startCreating, buildSetup, getElements };
