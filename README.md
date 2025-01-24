# cph-leetcode

# CPH Leetcode Extension for VS Code
CPH Leetcode is a Visual Studio Code extension aimed at enhancing the competitive programming experience. It seamlessly integrates Leetcode functionalities into the editor, enabling users to solve problems, fetch test cases, and execute solutions—all within VS Code. No need to switch between platforms—everything you need is right at your fingertips!

## Features

Test Case Extraction

- Test cases for LeetCode problems are automatically extracted using Beautiful Soup with a Selenium WebDriver.
- The extracted test cases are stored locally in a directory named TestData.
- Each problem will have an individual folder under TestData containing:
- input.txt: The input data for the test cases.
- expected_output.txt: The expected output for the corresponding input.

Command-Controlled Workflow

- The extension features a command-based control panel to simplify the competitive programming workflow:
- Fetch Test Cases: Enter a LeetCode problem URL to extract and save its test cases.
- Run Test Cases: Run your solution against the test cases with a single command.
- During execution, you'll be prompted to enter the problem name.
- The terminal will display whether your code successfully executed all test cases or if there were any errors.

## Environment Setup Done by me to complete this project

To Run my project I :

1) Install Node.js
Download and install Node.js from the official website:
https://nodejs.org/

2) Install npm packages
Once Node.js is installed, open your terminal and run the following command to ensure npm (Node Package Manager) is installed:
```bash
  npm -v
```
3) Install required Python packages:
```bash
  pip install beautifulsoup4 selenium 
```
4)Set Up Web Scraping with Selenium and Beautiful Soup

Configure Selenium WebDriver based on your preferred browser (e.g., Chrome, Firefox).
Download the appropriate WebDriver (e.g., ChromeDriver for Chrome) and add it to your system PATH.
Use Beautiful Soup for parsing and cleaning the extracted data.

5) Create a new project using Yeoman generator for VS Code extensions
Install the Yeoman generator for Visual Studio Code extensions and create a new extension:
```bash
  npm install -g yo generator-code
  yo code
```

## Installation

Since the project is not yet published as a Visual Studio Code extension, you can set it up locally by following these steps:

1) Open the Project in Visual Studio Code:

Clone or download the project repository to your local machine.
Open the project folder in Visual Studio Code.

2) Set Up the Environment:
Ensure all required dependencies are installed as per the information.

3) Run the Extension Locally:
Press F5 in Visual Studio Code to start a debugging session.
A new Visual Studio Code window will open. This window serves as the environment where you will write and test solutions to LeetCode problems.

4) Fetch Test Cases

In the new Visual Studio Code window:
a) Press Ctrl+Shift+P to open the Command Palette.
b) Run the command: CPH: Fetch Test Cases
c) Paste the URL of the desired LeetCode problem when prompted.
d) A folder named TestData will be created in your project directory, containing:
input.txt files with the problem's input test cases.
expected_output.txt files with the corresponding expected outputs.

5) Run Test Cases
a) In the same window: Press Ctrl+Shift+P to open the Command Palette.
b) Run the command:
CPH: Run Test Cases  
c)The terminal will display the results of running your solution against the test cases, indicating whether all test cases passed or if any failed.


## Demo

Insert gif or link to demo


## Multi-Language Support
This project supports solutions written in both Python and C++:

## Optimizations

1) Extensibility to Other Languages:
The project is designed to support multi-language solutions. While it currently supports Python and C++, it can be extended to support other programming languages such as Java, JavaScript, or any other language by implementing appropriate execution and validation logic.

2) Future Availability in VS Code Extensions Marketplace
Once the project is published to the Visual Studio Code Extensions Marketplace, users will be able to directly download and install it from the Extensions section in Visual Studio Code. This will simplify the installation process and make the extension readily available for a wider audience.



## Authors

- [@ravitejajaligama](https://github.com/ravitejajaligama)

>>>>>>> 839a46f (initial commit)
