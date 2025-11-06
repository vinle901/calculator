const display = document.getElementById("display");
const history = document.getElementById("history");
const buttons = document.querySelectorAll(".btn");
const dotButton = document.querySelector('button[data-value="."]');

let currentInput = "";
let lastResult = "";
let lastOperator = "";
let lastOperand = "";

// Safe calculation function to replace eval()
function calculateExpression(expression) {
  // Remove any spaces
  expression = expression.replace(/\s/g, '');

  // Split by operators while keeping them
  const tokens = expression.match(/[+\-]?[0-9.]+|[+\-*/]/g);
  if (!tokens) return null;

  // Convert to numbers and operators
  const values = [];
  const operators = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (['+', '-', '*', '/'].includes(token)) {
      operators.push(token);
    } else {
      values.push(parseFloat(token));
    }
  }

  // Handle multiplication and division first
  for (let i = 0; i < operators.length; i++) {
    if (operators[i] === '*' || operators[i] === '/') {
      const result = operators[i] === '*'
        ? values[i] * values[i + 1]
        : values[i] / values[i + 1];
      values.splice(i, 2, result);
      operators.splice(i, 1);
      i--;
    }
  }

  // Handle addition and subtraction
  let result = values[0];
  for (let i = 0; i < operators.length; i++) {
    if (operators[i] === '+') {
      result += values[i + 1];
    } else if (operators[i] === '-') {
      result -= values[i + 1];
    }
  }

  return result;
}

// Handle button actions
function handleInput(value, button = null) {
  if (value === "C") {
    currentInput = "";
    display.value = "";
    history.textContent = "";
    lastOperator = "";
    lastOperand = "";
    dotButton.disabled = false;
  }
  else if (value === "del" || value === "Backspace") {
    const wasDot = currentInput.slice(-1) === ".";
    currentInput = currentInput.slice(0, -1);
    display.value = currentInput;
    if (wasDot || !currentInput.split(/\+|\-|\*|\//).pop().includes(".")) {
      dotButton.disabled = false;
    }
  }
  else if (value === "+/-") {
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
  else if (value === "=" || value === "Enter") {
    if (currentInput) {
      try {
        let result = calculateExpression(currentInput);
        if (result === null) throw new Error("Invalid expression");
        if (typeof result === 'number' && !Number.isInteger(result)) {
          result = Math.round(result * 100000) / 100000;
        }
        lastResult = result.toString();

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
      currentInput = `${lastResult}${lastOperator}${lastOperand}`;
      try {
        let result = calculateExpression(currentInput);
        if (result === null) throw new Error("Invalid expression");
        if (typeof result === 'number' && !Number.isInteger(result)) {
          result = Math.round(result * 100000) / 100000;
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
    // Check if current number already has a decimal
    const currentNumber = currentInput.split(/[+\-*/]/).pop();
    if (!currentNumber.includes(".")) {
      currentInput += value;
      display.value = currentInput;
      dotButton.disabled = true;
    }
  }
  else {
    const isOperator = ["+", "-", "*", "/"].includes(value);
    if (isOperator) dotButton.disabled = false;

    if (isOperator && currentInput === "" && lastResult !== "") {
      currentInput = lastResult + value;
      display.value = currentInput;
    } else {
      currentInput += value;
      display.value = currentInput;
    }
  }

  // Add visual feedback for button press
  if (button) {
    button.classList.add('active');
    setTimeout(() => button.classList.remove('active'), 100);
  }
}

// Button click handlers
buttons.forEach(button => {
  button.addEventListener("click", () => {
    const value = button.dataset.value;
    handleInput(value, button);
  });
});

// Keyboard support
document.addEventListener("keydown", (e) => {
  e.preventDefault();

  const key = e.key;
  let value = null;
  let button = null;

  // Map keyboard keys to calculator values
  if (key >= "0" && key <= "9") {
    value = key;
    button = document.querySelector(`button[data-value="${key}"]`);
  } else if (key === ".") {
    value = ".";
    button = dotButton;
  } else if (key === "+" || key === "-" || key === "*" || key === "/") {
    value = key;
    button = document.querySelector(`button[data-value="${key}"]`);
  } else if (key === "Enter" || key === "=") {
    value = "=";
    button = document.querySelector(`button[data-value="="]`);
  } else if (key === "Backspace" || key === "Delete") {
    value = "del";
    button = document.querySelector(`button[data-value="del"]`);
  } else if (key === "Escape" || key.toLowerCase() === "c") {
    value = "C";
    button = document.querySelector(`button[data-value="C"]`);
  } else if (key === "%") {
    value = "%";
    button = document.querySelector(`button[data-value="%"]`);
  }

  if (value !== null) {
    handleInput(value, button);
  }
});
