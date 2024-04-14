const {
  AllBackgroundElements,
  AllHairElements,
  AllGlassesElements,
  AllEyeElements,
  AllBaseElements,
  AllHeadphoneElements,
  AllClothesElements,
} = require("./layerConfig");

const basePath = process.cwd();
const { MODE } = require(`${basePath}/constants/blend_mode.js`);
const { NETWORK } = require(`${basePath}/constants/network.js`);

const network = NETWORK.eth;

// General metadata for Ethereum
const namePrefix = "GURS";
const description =
  "Hand drawn limited series of Gurs living on the Avalanche blockchain.";
const baseUri = "ipfs://NewUriToReplace";

const solanaMetadata = {
  symbol: "YC",
  seller_fee_basis_points: 1000, // Define how much % you want from secondary market sales 1000 = 10%
  external_url: "https://www.youtube.com/c/hashlipsnft",
  creators: [
    {
      address: "7fXNuer5sbZtaTEPhtJ5g5gNtuyRoKkvxdjEjEnPN4mC",
      share: 100,
    },
  ],
};
/* I apologize for taking so long, I wanted to check everything. 
A small instruction, the model in some clothes stands differently for example T-shirts, for this was created separate folders, where there are as well as in normal clothes skin hair. They have to be generated separately. 
In the folders are all ready models just have to generate separately. 
Also two huge hairstyles are mamba and curly ponytail, they are put behind the clothes. And only the simple background background. */
// If you have selected Solana then the collection starts from 0 automatically
const layerConfigurations = [
  {
    growEditionSizeTo: 5,
    layersOrder: [{ name: "Background" }],
  },
];

const getBackgroundElements = (ctx) => {
  return {
    name: "Background",
    hasVariants: false,
    elements: AllBackgroundElements.filter(
      (element) => element.name === ctx.name
    ).map((element) => ({ ...element })),
    decisionOrder: 0,
    layerOrder: 0,
  };
};
const getBaseElements = (ctx) => {
  return {
    name: "Base",
    hasVariants: false,
    elements: AllBaseElements.filter(
      (element) => element.variant === ctx.variant && element.name === ctx.name
    ).map((element) => ({ ...element })),
    decisionOrder: 1,
    layerOrder: 1,
  };
};
const getClothesElements = (ctx) => {
  const elements = AllClothesElements.filter(
    (element) => element.variant === ctx.variant && element.name === ctx.name
  ).map((element) => ({ ...element }));
  return {
    name: "Clothes",
    hasVariants: false,
    elements: elements,
    decisionOrder: 2,
    layerOrder: 2,
  };
};
const getEyeElements = (ctx) => {
  return {
    name: "Eyes",
    hasVariants: false,
    elements: AllEyeElements.filter((element) => element.name === ctx.name).map(
      (element) => ({ ...element })
    ),
    decisionOrder: 3,
    layerOrder: 3,
  };
};
const getGlassesElements = (ctx) => {
  return {
    name: "Glasses",
    hasVariants: false,
    elements: AllGlassesElements.filter(
      (element) => element.name === ctx.name
    ).map((element) => ({ ...element })),
    decisionOrder: 4,
    layerOrder: 4,
  };
};
const getHairElements = (ctx) => {
  return {
    name: "Hair",
    hasVariants: false,
    elements: AllHairElements.filter(
      (element) => element.name === ctx.name
    ).map((element) => ({ ...element })),
    decisionOrder: 5,
    layerOrder: 5,
  };
};
const getHeadphoneElements = (ctx) => {
  return {
    name: "Headphones",
    hasVariants: false,
    elements: AllHeadphoneElements.filter(
      (element) => element.name === ctx.name
    ).map((element) => ({ ...element })),
    decisionOrder: 6,
    layerOrder: 6,
  };
};

const getSingleVariant = (ctxs, growTo) => {
  const layersOrder = [
    getBackgroundElements(ctxs[0]),
    getBaseElements(ctxs[1]),
    getClothesElements(ctxs[2]),
    getEyeElements(ctxs[3]),
    getHairElements(ctxs[4]),
    getGlassesElements(ctxs[5]),
    getHeadphoneElements(ctxs[6]),
  ];
  //set each element to have a weight of 1
  layersOrder.forEach((layer) => {
    layer.elements.forEach((element) => {
      element.weight = 1;
    });
  });
  return {
    growEditionSizeTo: growTo,
    layersOrder,
  };
};
const SingleVariants = [
  [
    { name: "Arcade" },
    { variant: "TSHIRTS", name: "Mocha" },
    { variant: "TSHIRTS", name: "Walkman T-Shirt" },
    { name: "Green" },
    { name: "Pop Brown" },
    { name: "None" },
    { name: "Headphones" },
  ],
  [
    { name: "Arcade" },
    { variant: "GURS", name: "Light" },
    { variant: "GURS", name: "Backpack" },
    { name: "Blue" },
    { name: "Blonde Long Curly" },
    { name: "None" },
    { name: "None" },
  ],
  [
    { name: "Arcade" },
    { variant: "GURS", name: "Light" },
    { variant: "GURS", name: "69 Bomber" },
    { name: "Blue" },
    { name: "Madonna Blonde" },
    { name: "None" },
    { name: "None" },
  ],
  [
    { name: "Arcade" },
    { variant: "TSHIRTS", name: "Olive" },
    { variant: "TSHIRTS", name: "Atari T-Shirt" },
    { name: "Blue" },
    { name: "Blonde Ponytails" },
    { name: "None" },
    { name: "None" },
  ],
  [
    { name: "Arcade" },
    { variant: "TSHIRTS", name: "Olive" },
    { variant: "TSHIRTS", name: "SEGA T-Shirt" },
    { name: "Brown" },
    { name: "Scarface" },
    { name: "None" },
    { name: "None" },
  ],
  [
    { name: "Palm" },
    { variant: "SCARFACE SUIT", name: "Light" },
    { variant: "SCARFACE SUIT", name: "Scarface Suit" },
    { name: "Blue" },
    { name: "Scarface" },
    { name: "None" },
    { name: "None" },
  ],
  [
    { name: "Day" },
    { variant: "JEANS PINK + BOMBER", name: "Light" },
    { variant: "JEANS PINK + BOMBER", name: "Red Carrot Bomber" },
    { name: "Blue" },
    { name: "Pop Red" },
    { name: "None" },
    { name: "None" },
  ],
  [
    { name: "School" },
    { variant: "GURS", name: "Light" },
    { variant: "GURS", name: "Gold Bomber" },
    { name: "Blue" },
    { name: "Madonna Red" },
    { name: "Polaroid Gold" },
    { name: "None" },
  ],
  [
    { name: "New City" },
    { variant: "GURS", name: "Light" },
    { variant: "GURS", name: "69 Bomber" },
    { name: "Green" },
    { name: "Red Short Curly" },
    { name: "None" },
    { name: "None" },
  ],
];
const growTo = 1;
const AllSingleVariants = SingleVariants.map((variant, index) =>
  getSingleVariant(variant, growTo + index)
);
//console.log(AllSingleVariants);
const getAdjustedWeightElememtsDueToSingleVariants = (
  singleVariants,
  layerName,
  elements
) => {
  //console.log("LayerName \n", layerName);
  const singleVariantsLayerToCheck = singleVariants.map((variant) => {
    const variantLayerToCheck = variant.layersOrder.find(
      (layer) => layer.name === layerName
    );
    return variantLayerToCheck;
  });
  return elements.map((element) => {
    const elementCopy = { ...element };

    let numberOfVariants = 0;
    singleVariantsLayerToCheck.forEach((layer) => {
      const variantElemnt = layer.elements.find(
        (variantElement) =>
          variantElement.name === element.name &&
          variantElement.variant === element.variant
      );
      if (variantElemnt) {
        numberOfVariants++;
        /* console.log({
          variantName: variantElemnt.name,
          variantElement: variantElemnt.variant,
          numberOfVariants,
        }); */
      }
    });
    /* console.log(
      "Element Variant: ",
      elementCopy.variant,
      "ElementName: ",
      elementCopy.name,
      "OriginalWeight: ",
      elementCopy.weight,
      "NumVariants: ",
      numberOfVariants
    ); */
    elementCopy.weight = +elementCopy.weight - numberOfVariants;

    return elementCopy;
  });
};
const AllBackgroundElementsAdjusted =
  getAdjustedWeightElememtsDueToSingleVariants(
    AllSingleVariants,
    "Background",
    AllBackgroundElements
  );
const layerConfigurationsWithVariants = [
  ...AllSingleVariants,
  {
    growEditionSizeTo: 1163,
    layersOrder: [
      {
        name: "Background",
        hasVariants: false,
        elements: AllBackgroundElementsAdjusted,

        decisionOrder: 0,
        layerOrder: 0,
      },
      {
        name: "Base",
        hasVariants: true,
        elements: getAdjustedWeightElememtsDueToSingleVariants(
          AllSingleVariants,
          "Base",
          AllBaseElements
        ),
        decisionOrder: 1,
        layerOrder: 1,
      },
      {
        name: "Clothes",
        hasVariants: true,
        elements: getAdjustedWeightElememtsDueToSingleVariants(
          AllSingleVariants,
          "Clothes",
          AllClothesElements
        ),
        decisionOrder: 2,
        layerOrder: 2,
      },
      {
        name: "Eyes",
        hasVariants: false,
        elements: getAdjustedWeightElememtsDueToSingleVariants(
          AllSingleVariants,
          "Eyes",
          AllEyeElements
        ),
        decisionOrder: 3,
        layerOrder: 3,
      },

      {
        name: "Hair",
        hasVariants: false,
        elements: getAdjustedWeightElememtsDueToSingleVariants(
          AllSingleVariants,
          "Hair",
          AllHairElements
        ),
        decisionOrder: 4,
        layerOrder: 4,
      },
      {
        name: "Glasses",
        hasVariants: false,
        elements: getAdjustedWeightElememtsDueToSingleVariants(
          AllSingleVariants,
          "Glasses",
          AllGlassesElements
        ),
        decisionOrder: 5,
        layerOrder: 5,
      },
      {
        name: "Headphones",
        hasVariants: false,
        elements: getAdjustedWeightElememtsDueToSingleVariants(
          AllSingleVariants,
          "Headphones",
          AllHeadphoneElements
        ),
        decisionOrder: 6,
        layerOrder: 6,
      },
    ],
  },
];
//print out rarity data from layerConfigurationsWithVariants
const afterConfigLayersRarity = layerConfigurationsWithVariants.reduce(
  (acc, layerConfig) => {
    const layersOrder = layerConfig.layersOrder;
    layersOrder.forEach((layer) => {
      const elements = layer.elements;
      elements.forEach((element) => {
        const key = `${element.variant}-${element.name}`;
        if (!acc[layer.name]) {
          acc[layer.name] = {};
        }
        if (!acc[layer.name][key]) {
          acc[layer.name][key] = element.weight;
        } else {
          acc[layer.name][key] += element.weight;
        }
        /* console.log(
          "LayerName: ",
          layer.name,
          "ElementName: ",
          element.name,
          "ElementVariant: ",
          element.variant,
          "ElementWeight: ",
          element.weight
        ); */
      });
    });
    return acc;
  },
  {}
);
console.log("AfterConfigLayersRarity \n", afterConfigLayersRarity);

/* {
    growEditionSizeTo: 1,
    layersOrder: [
      {
        name: "Background",
        hasVariants: false,
        elements: AllBackgroundElements.filter(
          (element) => element.name === "Arcade"
        ),
        decisionOrder: 0,
        layerOrder: 0,
      },
      {
        name: "Base",
        hasVariants: false,
        elements: AllBaseElements.filter(
          (element) => element.variant === "TSHIRTS" && element.name === "Mocha"
        ),
        decisionOrder: 1,
        layerOrder: 1,
      },
      {
        name: "Clothes",
        hasVariants: false,
        elements: AllClothesElements.filter(
          (element) =>
            element.variant === "TSHIRTS" && element.name === "Walkman T-Shirt"
        ),
        decisionOrder: 2,
        layerOrder: 2,
      },
      {
        name: "Eyes",
        hasVariants: false,
        elements: AllEyeElements.filter((element) => element.name === "Blue"),
        decisionOrder: 3,
        layerOrder: 3,
      },
      {
        name: "Glasses",
        hasVariants: false,
        elements: AllGlassesElements.filter(
          (element) => element.name === "None"
        ),
        decisionOrder: 4,
        layerOrder: 4,
      },
      {
        name: "Hair",
        hasVariants: false,
        elements: AllHairElements.filter(
          (element) => element.name === "Pop Brown"
        ),
        decisionOrder: 5,
        layerOrder: 5,
      },
      {
        name: "Headphones",
        hasVariants: false,
        elements: AllHeadphoneElements.filter(
          (element) => element.name === "HeadPhones"
        ),
        decisionOrder: 6,
        layerOrder: 6,
      },
    ],
  }, */

/* 
const clothesGetElements = (ctx) => { 
 */

/* const layerConfigurationsWithGroups = [
  {
    growEditionSizeTo: 5,
    layersOrderGroups: [
      {
        layersOrder: [
          { name: "Background", nextLayer: (selector) => "Base" },
          { name: "Base", nextLayer: (prevLayer) => "Clothes" }, { name: "Clothes", nextLayer: (name) => "Hair" }, { name: "Hair", nextLayer: (name) => "Eyeball" }],
      }
    ]

  }
] */

const shuffleLayerConfigurations = true;

const debugLogs = false;

const format = {
  width: 1088,
  height: 1088,
  smoothing: false,
};

const gif = {
  export: false,
  repeat: 0,
  quality: 100,
  delay: 500,
};

const text = {
  only: false,
  color: "#ffffff",
  size: 20,
  xGap: 40,
  yGap: 40,
  align: "left",
  baseline: "top",
  weight: "regular",
  family: "Courier",
  spacer: " => ",
};

const pixelFormat = {
  ratio: 2 / 128,
};

const background = {
  generate: true,
  brightness: "80%",
  static: false,
  default: "#000000",
};

const extraMetadata = {};

const rarityDelimiter = "#";

const uniqueDnaTorrance = 10000;

const preview = {
  thumbPerRow: 27,
  thumbWidth: 150,
  imageRatio: format.height / format.width,
  imageName: "preview.PNG",
};

const preview_gif = {
  numberOfImages: 50,
  order: "MIXED", // ASC, DESC, MIXED
  repeat: 0,
  quality: 100,
  delay: 200,
  imageName: "preview.gif",
};

module.exports = {
  format,
  baseUri,
  description,
  background,
  uniqueDnaTorrance,
  layerConfigurations,
  layerConfigurationsWithVariants,
  rarityDelimiter,
  preview,
  shuffleLayerConfigurations,
  debugLogs,
  extraMetadata,
  pixelFormat,
  text,
  namePrefix,
  network,
  solanaMetadata,
  gif,
  preview_gif,
};
