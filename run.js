const { spawn } = require('child_process');
const path = require('path');

async function runPythonScript(url) {
  try {
    const scriptPath = path.join(__dirname, 'webscrap.py');
    
    const process = spawn('python', [scriptPath]);

    // Send data to Python via stdin
    process.stdin.write(url);
    process.stdin.end();

    const result = await new Promise((resolve, reject) => {
      let output = '';
      let error = '';

      process.stdout.on('data', (data) => {
        output += data.toString(); // Capture output
      });

      process.stderr.on('data', (data) => {
        error += data.toString(); // Capture errors
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve(output); // Send back captured output
        } else {
          reject(new Error(`Python process exited with code ${code}: ${error}`));
        }
      });
    });

    // console.log('Just b4 in NodeJS');
    
    const data = JSON.parse(result);
    
    return data.output

  } catch (error) {
    console.error('Error occurred:', error.message);
  }
}

module.exports = {runPythonScript}
