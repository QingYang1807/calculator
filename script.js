class Calculator {
    constructor() {
        this.previousOperandElement = document.querySelector('.previous-operand');
        this.currentOperandElement = document.querySelector('.current-operand');
        this.buttons = document.querySelectorAll('button');
        
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetScreen = false;
        
        this.initEventListeners();
        this.updateDisplay();
    }
    
    initEventListeners() {
        // 数字按钮事件
        document.querySelectorAll('.number').forEach(button => {
            button.addEventListener('click', () => {
                this.appendNumber(button.textContent);
                this.playClickSound();
                this.animateButton(button);
            });
        });
        
        // 操作符按钮事件
        document.querySelectorAll('.operator').forEach(button => {
            button.addEventListener('click', () => {
                const action = button.dataset.action;
                switch (action) {
                    case 'add':
                        this.chooseOperation('+');
                        break;
                    case 'subtract':
                        this.chooseOperation('-');
                        break;
                    case 'multiply':
                        this.chooseOperation('*');
                        break;
                    case 'divide':
                        this.chooseOperation('/');
                        break;
                    case 'equals':
                        this.compute();
                        break;
                }
                this.playClickSound();
                this.animateButton(button);
            });
        });
        
        // 特殊按钮事件
        document.querySelectorAll('.special').forEach(button => {
            button.addEventListener('click', () => {
                const action = button.dataset.action;
                switch (action) {
                    case 'clear':
                        this.clear();
                        break;
                    case 'toggle':
                        this.toggleSign();
                        break;
                    case 'percent':
                        this.percentage();
                        break;
                }
                this.playClickSound();
                this.animateButton(button);
            });
        });
        
        // 键盘支持
        document.addEventListener('keydown', this.handleKeyboardInput.bind(this));
    }
    
    appendNumber(number) {
        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }
        
        // 如果当前是0且输入不是小数点，则替换
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number;
            this.updateDisplay();
            return;
        }
        
        // 如果已经有小数点且输入是小数点，则忽略
        if (number === '.' && this.currentOperand.includes('.')) return;
        
        // 限制输入长度，防止溢出
        if (this.currentOperand.length >= 9) return;
        
        this.currentOperand += number;
        this.updateDisplay();
    }
    
    chooseOperation(operation) {
        if (this.currentOperand === '') return;
        
        if (this.previousOperand !== '') {
            this.compute();
        }
        
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
        this.updateDisplay();
    }
    
    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return;
        
        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '*':
                computation = prev * current;
                break;
            case '/':
                if (current === 0) {
                    this.currentOperand = '错误';
                    this.previousOperand = '';
                    this.operation = undefined;
                    this.updateDisplay();
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }
        
        // 处理结果，保留合适的小数位数
        this.currentOperand = this.formatDisplayNumber(computation);
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetScreen = true;
        this.updateDisplay();
    }
    
    formatDisplayNumber(number) {
        const stringNumber = number.toString();
        
        // 如果是整数
        if (Number.isInteger(number)) {
            return stringNumber;
        }
        
        // 如果是小数，限制小数位数
        const [integerDigits, decimalDigits] = stringNumber.split('.');
        
        // 如果小数部分太长，截断它
        if (decimalDigits && decimalDigits.length > 6) {
            return parseFloat(number.toFixed(6)).toString();
        }
        
        return stringNumber;
    }
    
    updateDisplay() {
        this.currentOperandElement.textContent = this.currentOperand;
        
        if (this.operation != null) {
            let operationSymbol;
            switch (this.operation) {
                case '+': operationSymbol = '+'; break;
                case '-': operationSymbol = '−'; break;
                case '*': operationSymbol = '×'; break;
                case '/': operationSymbol = '÷'; break;
            }
            this.previousOperandElement.textContent = `${this.previousOperand} ${operationSymbol}`;
        } else {
            this.previousOperandElement.textContent = '';
        }
    }
    
    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.updateDisplay();
    }
    
    toggleSign() {
        if (this.currentOperand === '0' || this.currentOperand === '') return;
        this.currentOperand = (parseFloat(this.currentOperand) * -1).toString();
        this.updateDisplay();
    }
    
    percentage() {
        if (this.currentOperand === '0' || this.currentOperand === '') return;
        this.currentOperand = (parseFloat(this.currentOperand) / 100).toString();
        this.updateDisplay();
    }
    
    handleKeyboardInput(e) {
        // 数字键 0-9
        if (/^\d$/.test(e.key)) {
            this.appendNumber(e.key);
            this.animateButtonByText(e.key);
        }
        
        // 小数点
        if (e.key === '.') {
            this.appendNumber('.');
            this.animateButtonByText('.');
        }
        
        // 运算符
        if (e.key === '+') {
            this.chooseOperation('+');
            this.animateButtonByAction('add');
        }
        if (e.key === '-') {
            this.chooseOperation('-');
            this.animateButtonByAction('subtract');
        }
        if (e.key === '*') {
            this.chooseOperation('*');
            this.animateButtonByAction('multiply');
        }
        if (e.key === '/') {
            this.chooseOperation('/');
            this.animateButtonByAction('divide');
        }
        
        // 等号和回车
        if (e.key === '=' || e.key === 'Enter') {
            e.preventDefault();
            this.compute();
            this.animateButtonByAction('equals');
        }
        
        // 退格键
        if (e.key === 'Backspace') {
            this.handleBackspace();
        }
        
        // Escape 键清除
        if (e.key === 'Escape') {
            this.clear();
            this.animateButtonByAction('clear');
        }
    }
    
    handleBackspace() {
        if (this.currentOperand === '0' || this.shouldResetScreen) return;
        
        if (this.currentOperand.length === 1) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.slice(0, -1);
        }
        
        this.updateDisplay();
    }
    
    // 按钮动画效果
    animateButton(button) {
        button.classList.add('pressed');
        setTimeout(() => {
            button.classList.remove('pressed');
        }, 100);
    }
    
    // 通过文本内容查找并动画按钮
    animateButtonByText(text) {
        const button = Array.from(document.querySelectorAll('button')).find(
            btn => btn.textContent === text
        );
        if (button) this.animateButton(button);
    }
    
    // 通过操作类型查找并动画按钮
    animateButtonByAction(action) {
        const button = document.querySelector(`[data-action="${action}"]`);
        if (button) this.animateButton(button);
    }
    
    // 按钮点击音效
    playClickSound() {
        // 如果需要添加音效，可以在这里实现
    }
}

// 页面加载完成后初始化计算器
document.addEventListener('DOMContentLoaded', () => {
    const calculator = new Calculator();
    
    // 添加一些视觉效果
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('mousedown', () => {
            button.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('mouseup', () => {
            button.style.transform = 'scale(1)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
        });
    });
}); 