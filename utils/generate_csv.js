const ExcelJS = require("exceljs");
const { AllConfigElements } = require("../src/layerConfig");
const basePath = process.cwd();
const buildDir = `${basePath}/build/csv`;
async function generateExcel(layers) {
  const workbook = new ExcelJS.Workbook();

  for (const [name, elements] of Object.entries(layers)) {
    const sheet = workbook.addWorksheet(name);

    // Create the table headers
    sheet.addRow(["Name", "Variant", "Weights", "Rarity %"]);
    const totalWeights = elements.reduce((acc, item) => acc + item.weight, 0);
    // Populate the table with layer data
    for (const item of elements) {
      sheet.addRow([
        item.name,
        item.variant,
        item.weight,
        (item.weight / totalWeights) * 100,
      ]);
    }
  }

  // Save the workbook as a file
  await workbook.xlsx.writeFile(`${buildDir}/metadata_csv.xlsx`, {
    filename: "metadata.xlsx",
  });
}

generateExcel(AllConfigElements)
  .then(() => {
    console.log("Excel file generated successfully.");
  })
  .catch((error) => {
    console.error("Error generating Excel file:", error);
  });
