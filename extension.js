const assert = require('assert');
const vscode = require('vscode');
const { runPythonScript } = require('./run.js');
const fs = require('fs');
const path = require('path');
const { Name } = require('./Frontend/fetchName.js');
const { executeCppCode, executePythonCode } = require('./codeExec.js');
const { generateHTML } = require('./Frontend/frontend.js');

/**
 * Format the problem name into a specific format (lowercase with hyphens)
 * @param {string} problemName - Name of the problem
 * @returns {string} - Formatted name
 */
function formatProblemName(problemName) {
  return problemName.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Determine the programming language based on file extension
 * @param {string} filePath - Path to the file
 * @returns {string} - Language (cpp, python, or unknown)
 */
function detectLanguage(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === '.cpp') {
    return 'cpp';
  } else if (extension === '.py') {
    return 'python';
  } else {
    return 'unknown';
  }
}

/**
 * Fetch and write test cases from a given URL
 * @param {string} url - Problem URL
 */
async function fetchTestCasesFromURL(url) {
  await vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: 'Extracting Test Cases...',
    cancellable: false
  }, async (progress) => {
    const [inputData, outputData] = await runPythonScript(url);

    const problemName = formatProblemName(Name(url));
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      vscode.window.showErrorMessage('No folder or workspace is open.');
      return;
    }

    const folderPath = workspaceFolders[0].uri.fsPath;
    const testDataFolder = path.join(folderPath, 'TestData');

    if (!fs.existsSync(testDataFolder)) {
      fs.mkdirSync(testDataFolder, { recursive: true });
      console.log('TestData folder created.');
    }

    const problemDir = path.join(testDataFolder, problemName);

    if (!fs.existsSync(problemDir)) {
      fs.mkdirSync(problemDir);
      console.log(`Folder for problem "${problemName}" created.`);
    }

    let testNumber = 1;
    // Create input files
    for (let input of inputData) {
      const filePath = path.join(problemDir, `ip${testNumber}.txt`);
      fs.writeFileSync(filePath, input);
      progress.report({ increment: Math.floor((testNumber / inputData.length) * 100), message: `Writing input file ${testNumber++}...` });
    }

    testNumber = 1;
    // Create output files
    for (let output of outputData) {
      const filePath = path.join(problemDir, `op${testNumber}.txt`);
      fs.writeFileSync(filePath, output);
      progress.report({ increment: Math.floor((testNumber / outputData.length) * 100), message: `Writing output file ${testNumber++}...` });
    }

    vscode.window.showInformationMessage('Test Cases in TestData folder 🎉');
  });
}

/**
 * Webview View Provider for handling communication with the webview
 */
class WebviewViewHandler {
  constructor(context) {
    this._context = context;
  }

  resolveWebviewView(webviewView) {
    console.log('resolveWebviewView called');
    webviewView.webview.options = {
      enableScripts: true
    };

    webviewView.webview.html = generateHTML(webviewView.webview);

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(async (message) => {
      if (message.type === 'fetchTests') {
        const url = message.value;
        await fetchTestCasesFromURL(url);
      } else if (message.type === 'runTests') {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
          vscode.window.showErrorMessage('No folder or workspace is open.');
          return;
        }

        const editor = vscode.window.activeTextEditor;
        let problemName = message.value;

        if (!editor) {
          vscode.window.showErrorMessage('No active editor found! Open your solution file.');
          return;
        }

        const userCode = editor.document.getText();
        if (!userCode || userCode.trim() === '') {
          vscode.window.showErrorMessage('Solution code is empty!');
          return;
        }

        if (!problemName) {
          vscode.window.showErrorMessage('Enter Problem Name');
          return;
        }

        problemName = formatProblemName(problemName);
        let problemFolderPath;

        let flag = 0;
        for (let folder of workspaceFolders) {
          const workspaceFolderPath = folder.uri.fsPath;
          const testDataFolderPath = path.join(workspaceFolderPath, 'TestData');
          if (!fs.existsSync(testDataFolderPath)) continue;

          flag = 1;
          problemFolderPath = path.join(testDataFolderPath, problemName);

          if (!fs.existsSync(problemFolderPath)) {
            vscode.window.showErrorMessage(`The folder '${problemName}' does not exist inside 'TestData'.`);
            return;
          } else {
            flag = 2;
            break;
          }
        }

        if (flag === 0) {
          vscode.window.showErrorMessage(`'TestData' folder not found`);
          return;
        }

        assert(flag === 2);

        const filePath = editor.document.uri.fsPath;
        const lang = detectLanguage(filePath);

        if (lang === 'cpp') {
          const userSolutionFile = path.join(problemFolderPath, 'temp_solution.cpp');
          const executableFile = path.join(problemFolderPath, 'solution_exec.exe');
          fs.writeFileSync(userSolutionFile, userCode, 'utf8');
          await executeCppCode(userSolutionFile, executableFile, problemFolderPath);
        } else if (lang === 'python') {
          await executePythonCode(filePath, problemFolderPath);
        }
      }
    });
  }
}

async function activate(context) {
  console.log('Congratulations, your extension "cph" is now active!');

  const fetchTestCases = vscode.commands.registerCommand('cph-lc.FetchTestCases', async function () {
    const url = await vscode.window.showInputBox({
      prompt: 'Enter the problem URL',
      placeHolder: 'https://example.com/problem/123'
    });
    await fetchTestCasesFromURL(url);
  });

  const executeTestCases = vscode.commands.registerCommand('cph-lc.RunTestCases', async function () {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      vscode.window.showErrorMessage('No folder or workspace is open.');
      return;
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor found! Open your solution file.');
      return;
    }

    const userCode = editor.document.getText();
    if (!userCode || userCode.trim() === '') {
      vscode.window.showErrorMessage('Solution code is empty!');
      return;
    }

    let problemName = await vscode.window.showInputBox({
      prompt: "Enter the problem name"
    });

    if (!problemName) {
      vscode.window.showErrorMessage('Problem name is required!');
      return;
    }

    problemName = formatProblemName(problemName);
    let problemFolderPath;

    let flag = 0;
    for (let folder of workspaceFolders) {
      const workspaceFolderPath = folder.uri.fsPath;
      const testDataFolderPath = path.join(workspaceFolderPath, 'TestData');
      if (!fs.existsSync(testDataFolderPath)) continue;

      flag = 1;
      problemFolderPath = path.join(testDataFolderPath, problemName);

      if (!fs.existsSync(problemFolderPath)) {
        vscode.window.showErrorMessage(`The folder '${problemName}' does not exist inside 'TestData'.`);
        return;
      } else {
        flag = 2;
        break;
      }
    }

    if (flag === 0) {
      vscode.window.showErrorMessage(`'TestData' folder not found`);
      return;
    }

    assert(flag === 2);

    const filePath = editor.document.uri.fsPath;
    const lang = detectLanguage(filePath);

    if (lang === 'cpp') {
      const userSolutionFile = path.join(problemFolderPath, 'temp_solution.cpp');
      const executableFile = path.join(problemFolderPath, 'solution_exec.exe');
      fs.writeFileSync(userSolutionFile, userCode, 'utf8');
      await executeCppCode(userSolutionFile, executableFile, problemFolderPath);
    } else if (lang === 'python') {
      await executePythonCode(filePath, problemFolderPath);
    }
  });

  const webviewHandler = new WebviewViewHandler(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('explorerView', webviewHandler)
  );

  context.subscriptions.push(fetchTestCases, executeTestCases);
}

function deactivate() {}

module.exports = { activate, deactivate };
