let form = document.querySelector('#fetchForm');
let input = document.querySelector('#urlInput');
let result1 = document.querySelector("#fetchResult");

let runForm = document.getElementById('runForm');
let problemNameInput = document.getElementById('nameInput');
let result2 = document.querySelector("#runResult");

const vscode = acquireVsCodeApi();

form.addEventListener('submit',async (e)=>{
    e.preventDefault();
    const problemURL = input.value.trim();
    console.log(problemURL);
    
    if(!problemURL){
        result1.textContent = "URL field cannot be empty";
        return;
    }
    if(problemURL.substring(0,30)!="https://leetcode.com/problems/"){
        result1.textContent = "Enter valid Leetcode URL";
        return;
    }
    await vscode.postMessage({ type: 'fetchTests', value: problemURL });
})

runForm.addEventListener('submit',async (e)=>{
    e.preventDefault();
    await vscode.postMessage({type:'runTests',value:problemNameInput.value});
})