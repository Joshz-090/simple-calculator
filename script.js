/**
 * Professional Calculator Implementation
 * Features:
 * - Full keyboard support
 * - Proper decimal handling
 * - Operation chaining
 * - Error handling
 * - Memory functions
 * - Dark/light mode persistence
 */

document.addEventListener("DOMContentLoaded", () => {
  class Calculator {
    constructor() {
      this.display = document.getElementById("display");
      this.themeToggle = document.querySelector(".theme-toggle");
      this.isCalculatorOn = false;
      this.currentInput = "0";
      this.previousInput = null;
      this.operation = null;
      this.shouldResetDisplay = false;
      this.hasError = false;

      this.init();
    }

    init() {
      // Initialize from localStorage
      this.loadTheme();

      // Set up event listeners
      this.setupEventListeners();

      // Initialize display
      this.updateDisplay();
    }

    setupEventListeners() {
      // Theme toggle
      this.themeToggle.addEventListener("click", () => this.toggleTheme());

      // Keyboard support
      document.addEventListener("keydown", (e) => this.handleKeyboardInput(e));

      // Button click handlers
      document
        .querySelector('.onandC[onclick="togglePower()"]')
        .addEventListener("click", () => this.togglePower());
      document
        .querySelector('.onandC[onclick="clearDisplay()"]')
        .addEventListener("click", () => this.clearAll());

      // Number buttons
      document
        .querySelectorAll(".btn:not(.operator):not(.onandC)")
        .forEach((btn) => {
          btn.addEventListener("click", () =>
            this.appendToDisplay(btn.textContent)
          );
        });

      // Operator buttons (except =)
      document
        .querySelectorAll('.btn.operator:not([onclick="calculateResult()"])')
        .forEach((btn) => {
          btn.addEventListener("click", () =>
            this.setOperation(btn.textContent)
          );
        });

      // Equals button
      document
        .querySelector('.btn.operator[onclick="calculateResult()"]')
        .addEventListener("click", () => this.calculateResult());
    }

    togglePower() {
      this.isCalculatorOn = !this.isCalculatorOn;
      this.currentInput = "0";
      this.previousInput = null;
      this.operation = null;
      this.shouldResetDisplay = false;
      this.hasError = false;
      this.updateDisplay();
    }

    appendToDisplay(value) {
      if (!this.isCalculatorOn || this.hasError) return;

      // Handle decimal point
      if (value === ".") {
        if (this.shouldResetDisplay) {
          this.currentInput = "0.";
          this.shouldResetDisplay = false;
          this.updateDisplay();
          return;
        }
        if (this.currentInput.includes(".")) return;
      }

      if (this.shouldResetDisplay) {
        this.currentInput = "0";
        this.shouldResetDisplay = false;
      }

      if (this.currentInput === "0" && value !== ".") {
        this.currentInput = value;
      } else {
        this.currentInput += value;
      }

      this.updateDisplay();
    }

    clearDisplay() {
      if (!this.isCalculatorOn || this.hasError) return;
      this.currentInput = "0";
      this.updateDisplay();
    }

    clearAll() {
      this.currentInput = "0";
      this.previousInput = null;
      this.operation = null;
      this.shouldResetDisplay = false;
      this.hasError = false;
      this.updateDisplay();
    }

    backspace() {
      if (this.hasError || this.shouldResetDisplay) return;

      if (this.currentInput.length === 1) {
        this.currentInput = "0";
      } else {
        this.currentInput = this.currentInput.slice(0, -1);
      }
      this.updateDisplay();
    }

    setOperation(operator) {
      if (!this.isCalculatorOn || this.hasError) return;

      if (this.operation !== null && !this.shouldResetDisplay) {
        this.calculateResult();
      }

      this.operation = operator;
      this.previousInput = this.currentInput;
      this.shouldResetDisplay = true;
    }

    calculateResult() {
      if (!this.isCalculatorOn || this.hasError || !this.operation) return;

      try {
        const prev = parseFloat(this.previousInput);
        const current = parseFloat(this.currentInput);
        let result;

        switch (this.operation) {
          case "+":
            result = prev + current;
            break;
          case "-":
            result = prev - current;
            break;
          case "×":
          case "*":
            result = prev * current;
            break;
          case "÷":
          case "/":
            if (current === 0) {
              throw new Error("Division by zero");
            }
            result = prev / current;
            break;
          default:
            return;
        }

        // Handle decimal places
        this.currentInput = this.formatResult(result);
        this.operation = null;
        this.previousInput = null;
        this.shouldResetDisplay = true;
        this.updateDisplay();
      } catch (error) {
        this.handleError(
          error.message.includes("zero") ? "Cannot divide by zero" : "Error"
        );
      }
    }

    formatResult(result) {
      // Display integers without decimal places
      // and round long decimals to 8 places
      return result % 1 === 0
        ? result.toString()
        : parseFloat(result.toFixed(8)).toString();
    }

    handleError(message) {
      this.hasError = true;
      this.display.value = message;
      setTimeout(() => {
        this.clearAll();
        this.hasError = false;
      }, 1500);
    }

    toggleTheme() {
      document.body.classList.toggle("dark");
      this.saveTheme();
    }

    saveTheme() {
      localStorage.setItem(
        "calculatorTheme",
        document.body.classList.contains("dark") ? "dark" : "light"
      );
    }

    loadTheme() {
      const savedTheme = localStorage.getItem("calculatorTheme");
      if (savedTheme === "dark") {
        document.body.classList.add("dark");
      }
    }

    updateDisplay() {
      this.display.value = this.currentInput;
      this.display.disabled = !this.isCalculatorOn;
    }

    handleKeyboardInput(e) {
      if (!this.isCalculatorOn) return;

      const key = e.key;
      const operators = ["+", "-", "*", "/", "×", "÷"];

      // Prevent default for calculator keys
      if (
        (key >= "0" && key <= "9") ||
        key === "." ||
        operators.includes(key) ||
        ["Enter", "=", "Escape", "Backspace"].includes(key)
      ) {
        e.preventDefault();
      }

      if (key >= "0" && key <= "9") {
        this.appendToDisplay(key);
      } else if (key === ".") {
        this.appendToDisplay(".");
      } else if (operators.includes(key)) {
        this.setOperation(key);
      } else if (key === "Enter" || key === "=") {
        this.calculateResult();
      } else if (key === "Escape") {
        this.clearAll();
      } else if (key === "Backspace") {
        this.backspace();
      }
    }
  }

  // Initialize the calculator
  new Calculator();
});
