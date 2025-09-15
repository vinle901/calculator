const display = document.getElementById("display");
const history = document.getElementById("history");
const buttons = document.querySelectorAll(".btn");
const dotButton = document.querySelector('button[data-value="."]');

let currentInput = "";
let lastResult = "";
let lastOperator = "";
let lastOperand = "";

buttons.forEach(button => {
  button.addEventListener("click", () => {
    const value = button.dataset.value;

    if (value === "C") {
      currentInput = "";
      display.value = "";
      history.textContent = "";
      lastOperator = "";
      lastOperand = "";
      dotButton.disabled = false;
    } 
    else if (value === "del") {
      // Check if last character is '.' before deleting
      const wasDot = currentInput.slice(-1) === ".";
      currentInput = currentInput.slice(0, -1);
      display.value = currentInput;
      // Enable dotButton if '.' was deleted or no '.' remains in current last number
      if (wasDot || !currentInput.split(/\+|\-|\*|\//).pop().includes(".")) {
        dotButton.disabled = false;
      }
    } 
    else if (value === "+/-") {
      // If currentInput is empty but lastResult exists, toggle sign of lastResult
      if (!currentInput && lastResult) {
        if (lastResult.startsWith("-")) lastResult = lastResult.slice(1);
        else lastResult = "-" + lastResult;
        display.value = lastResult;
        currentInput = lastResult;
      } else if (currentInput) {
        if (currentInput.startsWith("-")) currentInput = currentInput.slice(1);
        else currentInput = "-" + currentInput;
        display.value = currentInput;
      }
    } 
    else if (value === "=") {
      if (currentInput) {
        // If user just typed new expression
        try {
          let result = eval(currentInput);
          if (typeof result === 'number' && !Number.isInteger(result)) {
            result = Math.round(result * 100) / 100;
          }
          lastResult = result.toString();

          // Extract last operator and operand
          const match = currentInput.match(/([+\-*/])\s*([0-9.]+)$/);
          if (match) {
            lastOperator = match[1];
            lastOperand = match[2];
          }

          history.textContent = currentInput + " =";
          display.value = lastResult;
          currentInput = ""; 
          dotButton.disabled = lastResult.includes(".");
        } catch {
          display.value = "Error";
          currentInput = "";
          lastOperator = "";
          lastOperand = "";
          dotButton.disabled = false;
        }
      } 
      else if (lastOperator && lastOperand) {
        // Repeat last operation
        currentInput = `${lastResult}${lastOperator}${lastOperand}`;
        try {
          let result = eval(currentInput);
          if (typeof result === 'number' && !Number.isInteger(result)) {
            result = Math.round(result * 100) / 100;
          }
          lastResult = result.toString();
          history.textContent = currentInput + " =";
          display.value = lastResult;
          currentInput = ""; 
          dotButton.disabled = lastResult.includes(".");
        } catch {
          display.value = "Error";
          currentInput = "";
          dotButton.disabled = false;
        }
      }
    } 
    else if (value === ".") {
      currentInput += value;
      display.value = currentInput;
      dotButton.disabled = true;
    } 
    else {
      const isOperator = ["+", "-", "*", "/"].includes(value);
      if (isOperator) dotButton.disabled = false;
      // If result is shown and user enters operator, start new calculation
      if (isOperator && currentInput === "" && lastResult !== "") {
        currentInput = lastResult + value;
        display.value = currentInput;
      } else {
        //catch number after result without operator
        currentInput += value;
        display.value = currentInput;
      }
    }
  });
});
