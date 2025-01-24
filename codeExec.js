const fs = require('fs');
const path = require('path');
const vscode = require('vscode');
const { spawn } = require('child_process');

function showTestOutcome(testsPassed) {
    if (testsPassed) {
        vscode.window.showInformationMessage('Hurray! All tests passed! ✅');
    } else {
        vscode.window.showErrorMessage('Oops! Some tests failed. ❌');
    }
}

function updateStatusBarWithTestResults(testsPassed) {
    const statusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusItem.text = testsPassed ? '$(check) All test cases passed!' : '$(x) Some test cases failed.';
    statusItem.tooltip = 'Details';
    statusItem.show();
}

function logTestResults(results, outputs) {
    const outputPanel = vscode.window.createOutputChannel('Test Results');
    outputPanel.clear();
    outputPanel.appendLine('========== Results ==========');
    results.forEach((result, idx) => {
        const { testCase, isPassed } = result;
        const { expected, actual } = outputs[idx];
        if (isPassed) {
            outputPanel.appendLine(`Test Case ${idx + 1}: ✅ Passed`);
        } else {
            outputPanel.appendLine(`Test Case ${idx + 1}: ❌ Failed`);
            outputPanel.appendLine(`Expected: ${expected}`);
            outputPanel.appendLine(` Actual : ${actual}`);
        }
    });
    outputPanel.show();
}

async function executeCppCode(userCodeFile, compiledFile, problemDirectory) {

    // Compile the C++ code
    const compileProcess = spawn('g++', [userCodeFile, '-o', compiledFile]);

    await new Promise((resolve, reject) => {
        compileProcess.on('close', (exitCode) => {
            if (exitCode === 0) {
                console.log('Compiled.');
                resolve();
            } else {
                console.error('Compilation failed.');
                reject(new Error('Compilation error.'));
            }
        });

        compileProcess.stderr.on('data', (data) => {
            console.error(`Compilation Error: ${data.toString()}`);
        });
    });

    const inputFiles = fs.readdirSync(problemDirectory).filter(file => file.startsWith('ip') && file.endsWith('.txt'));
    let allTestsPassed = true;

    const results = [];
    const outputs = [];

    for (const inputFile of inputFiles) {
        const testNumber = inputFile.match(/\d+/)[0]; 
        const expectedOutputFile = `op${testNumber}.txt`;

        const inputPath = path.join(problemDirectory, inputFile);
        const outputPath = path.join(problemDirectory, expectedOutputFile);

        if (!fs.existsSync(outputPath)) {
            console.error(`Expected output file ${expectedOutputFile} not found.`);
            continue;
        }

        const inputData = fs.readFileSync(inputPath, 'utf-8');
        const expectedOutput = fs.readFileSync(outputPath, 'utf-8').trim();

        console.log(`Executing test case ${testNumber}...`);

        const child = spawn(compiledFile);

        let actualOutput = '';
        child.stdout.on('data', (data) => {
            actualOutput += data.toString();
        });

        child.stderr.on('data', (data) => {
            console.error(`Error in test case ${testNumber}: ${data}`);
        });

        child.on('close', (exitCode) => {
            actualOutput = actualOutput.trim();

            const isPassed = (actualOutput === expectedOutput);

            outputs.push({ actual: actualOutput, expected: expectedOutput });

            if (isPassed) {
                console.log(`Test case ${testNumber} passed!`);
            } else {
                console.error(`Test case ${testNumber} failed.`);
                console.error(`Expected: ${expectedOutput}`);
                console.error(`Got: ${actualOutput}`);
                allTestsPassed = false;
            }

            results.push({ testCase: testNumber, isPassed });
        });

        // Send input data to the process
        child.stdin.write(inputData);
        child.stdin.end();

        // Wait for the process to finish before proceeding to the next test case
        await new Promise((resolve) => child.on('close', resolve));
    }

    // Display results
    showTestOutcome(allTestsPassed);
    updateStatusBarWithTestResults(allTestsPassed);
    logTestResults(results, outputs);
}

async function executePythonCode(scriptPath, problemDirectory) {

    const inputFiles = fs.readdirSync(problemDirectory).filter(file => file.startsWith('ip') && file.endsWith('.txt'));
    let allTestsPassed = true;

    const results = [];
    const outputs = [];

    for (const inputFile of inputFiles) {
        const testNumber = inputFile.match(/\d+/)[0]; // Extract test number
        const expectedOutputFile = `op${testNumber}.txt`;

        const inputPath = path.join(problemDirectory, inputFile);
        const outputPath = path.join(problemDirectory, expectedOutputFile);

        if (!fs.existsSync(outputPath)) {
            console.error(`Expected output file ${expectedOutputFile} not found.`);
            continue;
        }

        const inputData = fs.readFileSync(inputPath, 'utf-8');
        const expectedOutput = fs.readFileSync(outputPath, 'utf-8').trim();

        console.log(`Running test case ${testNumber}...`);

        let actualOutput = '';
        let errorOutput = '';

        await new Promise((resolve, reject) => {
            const process = spawn('python', [scriptPath]);

            process.stdout.on('data', (data) => {
                actualOutput += data.toString();
            });

            process.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            process.on('close', (exitCode) => {
                if (errorOutput) {
                    console.error(`stderr: ${errorOutput}`);
                    reject(new Error(`Test case ${testNumber} encountered an error.`));
                } else {
                    actualOutput = actualOutput.trim();

                    const isPassed = (actualOutput === expectedOutput);
                    outputs.push({ expected: expectedOutput, actual: actualOutput });

                    if (isPassed) {
                        console.log(`Test case ${testNumber} passed!`);
                    } else {
                        console.error(`Test case ${testNumber} failed.`);
                        console.error(`Expected: ${expectedOutput}`);
                        console.error(`Got: ${actualOutput}`);
                        allTestsPassed = false;
                    }

                    results.push({ testCase: testNumber, isPassed });
                    resolve();
                }
            });

            // Send input data to the process
            process.stdin.write(inputData);
            process.stdin.end();
        });
    }

    // Display results
    showTestOutcome(allTestsPassed);
    updateStatusBarWithTestResults(allTestsPassed);
    logTestResults(results, outputs);
}

module.exports = { executeCppCode, executePythonCode };
