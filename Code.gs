// ============================================================
//  HOSTEL MESS MANAGER — Google Apps Script Backend
//  Paste this entire file into your Apps Script editor
// ============================================================

const SHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

// Sheet names
const SHEETS = {
  members:  'members',
  meals:    'meals',
  expenses: 'expenses',
  deposits: 'deposits',
  settings: 'settings',
  log:      'log'
};

// ── Initialise all sheets with headers on first run ──────────
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const configs = [
    { name: SHEETS.members,  headers: ['id','name','room','createdAt'] },
    { name: SHEETS.meals,    headers: ['id','memberId','memberName','date','breakfast','lunch','dinner','total','cost'] },
    { name: SHEETS.expenses, headers: ['id','memberId','memberName','amount','description','date'] },
    { name: SHEETS.deposits, headers: ['id','memberId','memberName','amount','date'] },
    { name: SHEETS.settings, headers: ['key','value'] },
    { name: SHEETS.log,      headers: ['timestamp','action','details'] },
  ];

  configs.forEach(cfg => {
    let sheet = ss.getSheetByName(cfg.name);
    if (!sheet) {
      sheet = ss.insertSheet(cfg.name);
    }
    // Write headers only if the sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(cfg.headers);
      sheet.getRange(1, 1, 1, cfg.headers.length)
        .setFontWeight('bold')
        .setBackground('#1a1916')
        .setFontColor('#ffffff');
    }
  });

  // Set default meal rate if not set
  const settingsSheet = ss.getSheetByName(SHEETS.settings);
  if (settingsSheet.getLastRow() <= 1) {
    settingsSheet.appendRow(['mealRate', 60]);
    settingsSheet.appendRow(['nextId', 1]);
  }
}

// ── CORS + routing ───────────────────────────────────────────
function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    const params = e.parameter;
    const action = params.action;
    let result;

    switch (action) {
      case 'setup':        result = setup();              break;
      case 'getAll':       result = getAll();             break;
      case 'addMember':    result = addMember(params);    break;
      case 'removeMember': result = removeMember(params); break;
      case 'addMeal':      result = addMeal(params);      break;
      case 'addExpense':   result = addExpense(params);   break;
      case 'addDeposit':   result = addDeposit(params);   break;
      case 'setMealRate':  result = setMealRate(params);  break;
      default: result = { error: 'Unknown action: ' + action };
    }

    output.setContent(JSON.stringify(result));
  } catch (err) {
    output.setContent(JSON.stringify({ error: err.toString() }));
  }

  return output;
}

// ── Setup ─────────────────────────────────────────────────────
function setup() {
  setupSheets();
  addLog('setup', 'Sheets initialised');
  return { success: true, message: 'Sheets set up successfully' };
}

// ── Get all data ──────────────────────────────────────────────
function getAll() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  return {
    members:  sheetToObjects(ss.getSheetByName(SHEETS.members)),
    meals:    sheetToObjects(ss.getSheetByName(SHEETS.meals)),
    expenses: sheetToObjects(ss.getSheetByName(SHEETS.expenses)),
    deposits: sheetToObjects(ss.getSheetByName(SHEETS.deposits)),
    mealRate: getMealRate(),
    nextId:   getNextId()
  };
}

// ── Members ───────────────────────────────────────────────────
function addMember(params) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.members);
  const id = getNextId();
  const row = [id, params.name, params.room, new Date().toISOString()];
  sheet.appendRow(row);
  incrementNextId();
  addLog('addMember', `Added: ${params.name} (Room ${params.room})`);
  return { success: true, id };
}

function removeMember(params) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.members);
  const id = parseInt(params.id);
  const rowIndex = findRowById(sheet, id);
  if (rowIndex > 0) {
    const name = sheet.getRange(rowIndex, 2).getValue();
    sheet.deleteRow(rowIndex);
    addLog('removeMember', `Removed: ${name} (id=${id})`);
    return { success: true };
  }
  return { error: 'Member not found' };
}

// ── Meals ─────────────────────────────────────────────────────
function addMeal(params) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.meals);
  const id = getNextId();
  const b = parseInt(params.breakfast) || 0;
  const l = parseInt(params.lunch)     || 0;
  const d = parseInt(params.dinner)    || 0;
  const total = b + l + d;
  const cost = total * getMealRate();
  const row = [id, parseInt(params.memberId), params.memberName, params.date, b, l, d, total, cost];
  sheet.appendRow(row);
  incrementNextId();
  addLog('addMeal', `${params.memberName}: ${total} meals on ${params.date}`);
  return { success: true, id, total, cost };
}

// ── Expenses ──────────────────────────────────────────────────
function addExpense(params) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.expenses);
  const id = getNextId();
  const row = [id, parseInt(params.memberId), params.memberName, parseFloat(params.amount), params.description, params.date];
  sheet.appendRow(row);
  incrementNextId();
  addLog('addExpense', `${params.memberName} paid ৳${params.amount} for ${params.description}`);
  return { success: true, id };
}

// ── Deposits ──────────────────────────────────────────────────
function addDeposit(params) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.deposits);
  const id = getNextId();
  const row = [id, parseInt(params.memberId), params.memberName, parseFloat(params.amount), params.date];
  sheet.appendRow(row);
  incrementNextId();
  addLog('addDeposit', `${params.memberName} deposited ৳${params.amount}`);
  return { success: true, id };
}

// ── Meal Rate ─────────────────────────────────────────────────
function setMealRate(params) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.settings);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === 'mealRate') {
      sheet.getRange(i + 1, 2).setValue(parseFloat(params.rate));
      addLog('setMealRate', `Rate updated to ৳${params.rate}`);
      return { success: true };
    }
  }
  return { error: 'mealRate key not found' };
}

// ── Utilities ─────────────────────────────────────────────────
function sheetToObjects(sheet) {
  if (!sheet || sheet.getLastRow() <= 1) return [];
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
}

function findRowById(sheet, id) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (parseInt(data[i][0]) === id) return i + 1;
  }
  return -1;
}

function getMealRate() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.settings);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === 'mealRate') return parseFloat(data[i][1]) || 60;
  }
  return 60;
}

function getNextId() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.settings);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === 'nextId') return parseInt(data[i][1]) || 1;
  }
  return 1;
}

function incrementNextId() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.settings);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === 'nextId') {
      sheet.getRange(i + 1, 2).setValue(parseInt(data[i][1]) + 1);
      return;
    }
  }
}

function addLog(action, details) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.log);
  if (sheet) sheet.appendRow([new Date().toISOString(), action, details]);
}
