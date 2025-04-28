/**
 * Função principal que orquestra todo o processo
 */
function mainProcess() {
  try {
    // Passo 1: Ler e marcar linhas não processadas
    const unprocessedData = readAndMarkProcessedRows();
    
    if (unprocessedData.length === 0) {
      console.log("Nenhum dado novo para processar");
      return;
    }
    
    // Passo 2: Processar e transpor os dados
    const transposedData = processAndTransposeData(unprocessedData);
    
    // Passo 3: Escrever os dados transpostos
    writeTransposedData(transposedData);
    
    console.log("Processamento concluído com sucesso!");
  } catch (error) {
    console.error("Erro no processamento: " + error.message);
  }
}

/**
 * Função 1: Lê e retorna linhas não marcadas da sheet "rdstation_leads_custom_fields",
 * marcando-as como TRUE na coluna "checked" após a leitura.
 * @return {Array} Array de arrays com os dados lidos
 */
function readAndMarkProcessedRows() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("rdstation_leads_custom_fields");
  if (!sheet) {
    throw new Error("Sheet 'rdstation_leads_custom_fields' não encontrada");
  }
  
  // Obtém todos os dados da sheet
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Encontra o índice da coluna "checked"
  const checkedColIndex = headers.indexOf("checked");
  if (checkedColIndex === -1) {
    throw new Error("Coluna 'checked' não encontrada");
  }
  
  // Filtra linhas onde checked não é TRUE (considerando que pode ser string "TRUE" ou booleano true)
  const unprocessedRows = data.filter((row, index) => {
    // Pula o cabeçalho
    if (index === 0) return false;
    
    const checkedValue = row[checkedColIndex];
    return checkedValue !== true && checkedValue !== "TRUE";
  });
  
  // Marca as linhas processadas como TRUE
  if (unprocessedRows.length > 0) {
    const sheetLastRow = sheet.getLastRow();
    const checkedRange = sheet.getRange(2, checkedColIndex + 1, sheetLastRow - 1);
    const checkedValues = checkedRange.getValues();
    
    const rowsToMark = unprocessedRows.map(row => data.findIndex(r => r.join() === row.join()) - 1);
    
    rowsToMark.forEach(rowIndex => {
      checkedValues[rowIndex][0] = true;
    });
    
    checkedRange.setValues(checkedValues);
  }
  
  return unprocessedRows;
}

/**
 * Função 2: Remove cabeçalhos e coluna "checked", depois transpõe os dados
 * @param {Array} data - Dados retornados pela função 1
 * @return {Array} Dados transpostos e tratados
 */
function processAndTransposeData(data) {
  if (!data || data.length === 0) return [];
  
  const headers = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName("rdstation_leads_custom_fields")
    .getDataRange()
    .getValues()[0];
  
  const checkedColIndex = headers.indexOf("checked");
  
  // Remove cabeçalhos (já deve estar removido, mas garantindo) e coluna checked
  const processedData = data.map(row => {
    const newRow = [...row];
    if (checkedColIndex !== -1) {
      newRow.splice(checkedColIndex, 1);
    }
    return newRow;
  });
  
  // Transpõe a matriz
  const transposedData = processedData[0].map((_, colIndex) => 
    processedData.map(row => row[colIndex])
  );
  
  return transposedData;
}

/**
 * Função 3: Escreve os dados transpostos à direita do último dado na sheet "tranposed_rdstation_leads_custom_fields"
 * @param {Array} transposedData - Dados transpostos retornados pela função 2
 */
function writeTransposedData(transposedData) {
  if (!transposedData || transposedData.length === 0) return;
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const targetSheet = ss.getSheetByName("tranposed_rdstation_leads_custom_fields");
  
  if (!targetSheet) {
    throw new Error("Sheet 'tranposed_rdstation_leads_custom_fields' não encontrada");
  }
  
  // Encontra a última coluna com dados
  const lastRow = targetSheet.getLastRow();
  let lastColumn = 0;
  
  if (lastRow > 0) {
    const lastRowData = targetSheet.getRange(lastRow, 1, 1, targetSheet.getLastColumn()).getValues()[0];
    lastColumn = lastRowData.filter(cell => cell !== "").length;
  }
  
  // Se não há dados, começa na coluna A (1), senão na próxima coluna vazia
  const startColumn = lastColumn === 0 ? 1 : lastColumn + 1;
  
  // Escreve os dados transpostos
  if (lastRow === 0) {
    // Se a sheet está vazia, começa na primeira linha
    targetSheet.getRange(1, startColumn, transposedData.length, transposedData[0].length)
      .setValues(transposedData);
  } else {
    // Se já tem dados, escreve a partir da primeira linha mas na próxima coluna vazia
    targetSheet.getRange(1, startColumn, transposedData.length, transposedData[0].length)
      .setValues(transposedData);
  }
}
