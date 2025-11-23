const AppState = {
    sets: new Map(),
    nextSetId: 1,
    universalSets: {
        'ℕ': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        '𝕎': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        'ℤ': [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5],
        'ℚ': [0.5, 1.5, 2.5, 3.5, 1/2, 2/3, 3/4],
        'ℝ': [1, 1.5, 2, 2.5, 3, Math.PI, Math.E],
        'ℚ′': [Math.PI, Math.E, Math.sqrt(2), Math.sqrt(3), Math.sqrt(5)]
    }
};

// مدیریت کیبورد
let currentInput = null;

function toggleKB() {
    const kb = document.getElementById("keyboard");
    const kbBtn = document.getElementById("kbBtn");
    
    kb.classList.toggle("active");
    kbBtn.classList.toggle("active");
    
    if (kb.classList.contains("active")) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
        if (currentInput) {
            currentInput.focus();
        }
    }
}

function setCurrentInput(input) {
    currentInput = input;
}

function insertSymbol(symbol) {
    if (!currentInput) {
        const inputs = document.querySelectorAll('input[type="text"], textarea');
        if (inputs.length > 0) {
            currentInput = inputs[0];
            currentInput.focus();
        } else {
            showMessage('لطفاً ابتدا یک فیلد متنی را انتخاب کنید', 'error');
            return;
        }
    }
    
    const start = currentInput.selectionStart;
    const end = currentInput.selectionEnd;
    const value = currentInput.value;
    
    currentInput.value = value.substring(0, start) + symbol + value.substring(end);
    
    const newPosition = start + symbol.length;
    currentInput.setSelectionRange(newPosition, newPosition);
    currentInput.focus();
}

function backspace() {
    if (!currentInput) return;
    
    const start = currentInput.selectionStart;
    const end = currentInput.selectionEnd;
    const value = currentInput.value;
    
    if (start === end && start > 0) {
        currentInput.value = value.substring(0, start - 1) + value.substring(end);
        currentInput.setSelectionRange(start - 1, start - 1);
    } else if (start !== end) {
        currentInput.value = value.substring(0, start) + value.substring(end);
        currentInput.setSelectionRange(start, start);
    }
    
    currentInput.focus();
}

function insertSpace() {
    insertSymbol(' ');
}

// راه‌اندازی برنامه
document.addEventListener('DOMContentLoaded', function() {
    // دکمه‌های اصلی
    document.getElementById('startBtn').addEventListener('click', start);
    document.getElementById('showSetsBtn').addEventListener('click', showAllSets);
    document.getElementById('addSetBtn').addEventListener('click', addNewSet);
    
    // کیبورد
    document.querySelectorAll('.btn-keyboard[data-symbol]').forEach(btn => {
        btn.addEventListener('click', function() {
            insertSymbol(this.getAttribute('data-symbol'));
        });
    });
    
    document.getElementById('backspaceBtn').addEventListener('click', backspace);
    document.getElementById('spaceBtn').addEventListener('click', insertSpace);
    document.querySelector('.btn-close').addEventListener('click', toggleKB);
    document.getElementById('kbBtn').addEventListener('click', toggleKB);
    
    // مدیریت فوکوس
    document.addEventListener('focusin', function(e) {
        if (e.target.matches('input[type="text"], textarea')) {
            setCurrentInput(e.target);
        }
    });
    
    start();
});

// شروع برنامه
function start() {
    AppState.sets.clear();
    AppState.nextSetId = 1;
    showMainMenu();
}

function showMainMenu() {
    document.getElementById("step").innerHTML = `
        <div class="step-container">
            <h3>منوی اصلی آزمایشگاه مجموعه‌ها</h3>
            <p>لطفاً عملیات مورد نظر را انتخاب کنید:</p>
            <div class="operations-grid">
                <button onclick="addNewSet()" class="btn-operation">➕ ایجاد مجموعه جدید</button>
                <button onclick="showAllSets()" class="btn-operation">📋 نمایش همه مجموعه‌ها</button>
                <button onclick="showSetOperations()" class="btn-operation">🧮 عملیات روی مجموعه‌ها</button>
                <button onclick="checkMembership()" class="btn-operation">🔍 بررسی عضویت</button>
                <button onclick="checkSubsets()" class="btn-operation">📊 بررسی زیرمجموعه‌ها</button>
                <button onclick="showUniversalSets()" class="btn-operation">🌍 مجموعه‌های جهانی</button>
            </div>
        </div>
    `;
}

function addNewSet() {
    document.getElementById("step").innerHTML = `
        <div class="step-container">
            <h3>ایجاد مجموعه جدید</h3>
            <p>لطفاً نوع ورودی مجموعه را انتخاب کنید:</p>
            
            <div class="input-type-selector">
                <button onclick="showSymbolicInput()" class="btn-type">
                    <strong>روش نمادین</strong><br>
                    <small>مثال: { x | x ∈ ℕ , 3 ≤ x ≤ 8 }</small>
                </button>
                
                <button onclick="showVerbalInput()" class="btn-type">
                    <strong>حالت کلامی</strong><br>
                    <small>مثال: اعداد فرد بین ۱ تا ۱۰</small>
                </button>
                
                <button onclick="showNormalInput()" class="btn-type">
                    <strong>حالت عادی</strong><br>
                    <small>مثال: 1,2,3,4,5</small>
                </button>
            </div>
            
            <div class="button-group">
                <button onclick="showMainMenu()" class="btn btn-secondary">🔙 بازگشت</button>
            </div>
        </div>
    `;
}

function showSymbolicInput() {
    document.getElementById("step").innerHTML = `
        <div class="step-container">
            <h3>📐 ایجاد مجموعه با روش نمادین</h3>
            <p>مجموعه را به صورت نمادین ریاضی وارد کنید:</p>
            
            <div class="form-group">
                <label class="form-label">نام مجموعه:</label>
                <input type="text" id="setName" class="form-input" placeholder="مثال: A, B, C, ..." onfocus="setCurrentInput(this)">
            </div>
            
            <div class="form-group">
                <label class="form-label">مجموعه نمادین:</label>
                <input type="text" id="setExpression" class="form-input" placeholder="مثال: { x | x ∈ ℕ , 3 ≤ x ≤ 8 }" onfocus="setCurrentInput(this)">
                <small style="color: #666; display: block; margin-top: 5px;">برای نمادهای ریاضی از کیبورد برنامه استفاده کنید</small>
            </div>
            
            <div class="examples">
                <strong>نمونه‌های روش نمادین:</strong>
                <ul>
                    <li>{ x | x ∈ ℕ , 3 ≤ x ≤ 8 }</li>
                    <li>{ x | x ∈ ℤ , x > 0 , x < 6 }</li>
                    <li>{ x | x = 2k , k ∈ ℕ , k ≤ 5 }</li>
                    <li>{ x | x ∈ ℕ , x فرد }</li>
                </ul>
            </div>
            
            <div class="button-group">
                <button onclick="saveSymbolicSet()" class="btn btn-success">💾 ذخیره مجموعه</button>
                <button onclick="addNewSet()" class="btn btn-secondary">🔙 بازگشت</button>
            </div>
        </div>
    `;
}

function showVerbalInput() {
    document.getElementById("step").innerHTML = `
        <div class="step-container">
            <h3>🗣️ ایجاد مجموعه با حالت کلامی</h3>
            <p>مجموعه را با توصیف کلامی وارد کنید:</p>
            
            <div class="form-group">
                <label class="form-label">نام مجموعه:</label>
                <input type="text" id="setName" class="form-input" placeholder="مثال: اعداد_فرد, اعداد_اول, ..." onfocus="setCurrentInput(this)">
            </div>
            
            <div class="form-group">
                <label class="form-label">توصیف مجموعه:</label>
                <textarea id="setDescription" class="form-input" rows="3" placeholder="مثال: اعداد طبیعی فرد بین ۱ تا ۱۰" onfocus="setCurrentInput(this)"></textarea>
            </div>
            
            <div class="examples">
                <strong>نمونه‌های حالت کلامی:</strong>
                <ul>
                    <li>اعداد طبیعی فرد بین ۱ تا ۱۰</li>
                    <li>اعداد اول کوچکتر از ۲۰</li>
                    <li>مضرب‌های ۳ بین ۱ تا ۳۰</li>
                    <li>اعداد زوج بین ۲ تا ۱۵</li>
                </ul>
            </div>
            
            <div class="button-group">
                <button onclick="saveVerbalSet()" class="btn btn-success">💾 ذخیره مجموعه</button>
                <button onclick="addNewSet()" class="btn btn-secondary">🔙 بازگشت</button>
            </div>
        </div>
    `;
}

function showNormalInput() {
    document.getElementById("step").innerHTML = `
        <div class="step-container">
            <h3>🔢 ایجاد مجموعه با حالت عادی</h3>
            <p>اعضای مجموعه را با کاما جدا کنید:</p>
            
            <div class="form-group">
                <label class="form-label">نام مجموعه:</label>
                <input type="text" id="setName" class="form-input" placeholder="مثال: A, B, C, ..." onfocus="setCurrentInput(this)">
            </div>
            
            <div class="form-group">
                <label class="form-label">اعضای مجموعه (با کاما جدا کنید):</label>
                <input type="text" id="setElements" class="form-input" placeholder="مثال: 1, 2, 3, 4, 5" onfocus="setCurrentInput(this)">
            </div>
            
            <div class="button-group">
                <button onclick="saveNormalSet()" class="btn btn-success">💾 ذخیره مجموعه</button>
                <button onclick="addNewSet()" class="btn btn-secondary">🔙 بازگشت</button>
            </div>
        </div>
    `;
}

// توابع ذخیره‌سازی
function saveSymbolicSet() {
    const name = document.getElementById("setName").value.trim();
    const expression = document.getElementById("setExpression").value.trim();
    
    if (!name) {
        showMessage('لطفاً نام مجموعه را وارد کنید', 'error');
        return;
    }
    
    if (!expression) {
        showMessage('لطفاً عبارت نمادین مجموعه را وارد کنید', 'error');
        return;
    }
    
    if (AppState.sets.has(name)) {
        showMessage(`مجموعه با نام "${name}" از قبل وجود دارد`, 'error');
        return;
    }
    
    AppState.sets.set(name, {
        type: 'symbolic',
        expression: expression,
        elements: parseSymbolicExpression(expression)
    });
    
    showMessage(`مجموعه نمادین "${name}" ذخیره شد`, 'success');
    showMainMenu();
}

function saveVerbalSet() {
    const name = document.getElementById("setName").value.trim();
    const description = document.getElementById("setDescription").value.trim();
    
    if (!name) {
        showMessage('لطفاً نام مجموعه را وارد کنید', 'error');
        return;
    }
    
    if (!description) {
        showMessage('لطفاً توصیف مجموعه را وارد کنید', 'error');
        return;
    }
    
    if (AppState.sets.has(name)) {
        showMessage(`مجموعه با نام "${name}" از قبل وجود دارد`, 'error');
        return;
    }
    
    AppState.sets.set(name, {
        type: 'verbal',
        description: description,
        elements: parseVerbalDescription(description)
    });
    
    showMessage(`مجموعه کلامی "${name}" ذخیره شد`, 'success');
    showMainMenu();
}

function saveNormalSet() {
    const name = document.getElementById("setName").value.trim();
    const elementsText = document.getElementById("setElements").value.trim();
    
    if (!name) {
        showMessage('لطفاً نام مجموعه را وارد کنید', 'error');
        return;
    }
    
    if (!elementsText) {
        showMessage('لطفاً اعضای مجموعه را وارد کنید', 'error');
        return;
    }
    
    if (AppState.sets.has(name)) {
        showMessage(`مجموعه با نام "${name}" از قبل وجود دارد`, 'error');
        return;
    }
    
    const elements = parseNormalSet(elementsText);
    AppState.sets.set(name, {
        type: 'normal',
        elements: elements
    });
    
    showMessage(`مجموعه "${name}" با ${elements.length} عضو ذخیره شد`, 'success');
    showMainMenu();
}

// توابع تجزیه و تحلیل
function parseSymbolicExpression(expression) {
    try {
        // نمونه ساده - در نسخه واقعی کامل‌تر می‌شود
        if (expression.includes('ℕ') && expression.includes('≤')) {
            return [3, 4, 5, 6, 7, 8];
        }
        if (expression.includes('فرد')) {
            return [1, 3, 5, 7, 9];
        }
        return [1, 2, 3, 4, 5];
    } catch (error) {
        return [];
    }
}

function parseVerbalDescription(description) {
    description = description.toLowerCase();
    
    if (description.includes('فرد') && description.includes('طبیعی')) {
        return [1, 3, 5, 7, 9];
    }
    else if (description.includes('زوج')) {
        return [2, 4, 6, 8, 10];
    }
    else if (description.includes('اول')) {
        return [2, 3, 5, 7, 11];
    }
    else if (description.includes('مضرب') && description.includes('۳')) {
        return [3, 6, 9, 12, 15];
    }
    else {
        return [1, 2, 3, 4, 5];
    }
}

function parseNormalSet(input) {
    try {
        return input.split(',').map(item => {
            const num = Number(item.trim());
            return isNaN(num) ? item.trim() : num;
        }).filter(item => item !== '');
    } catch (error) {
        return [];
    }
}

// نمایش مجموعه‌ها
function showAllSets() {
    if (AppState.sets.size === 0) {
        document.getElementById("step").innerHTML = `
            <div class="step-container">
                <h3>مجموعه‌های موجود</h3>
                <p>هنوز هیچ مجموعه‌ای ایجاد نشده است.</p>
                <button onclick="addNewSet()" class="btn btn-primary">➕ ایجاد مجموعه جدید</button>
                <button onclick="showMainMenu()" class="btn btn-secondary">🔙 بازگشت</button>
            </div>
        `;
        return;
    }
    
    let setsHTML = '<div class="step-container"><h3>مجموعه‌های موجود</h3>';
    
    AppState.sets.forEach((setData, name) => {
        let content = '';
        
        if (setData.type === 'symbolic') {
            content = `
                <div class="set-expression">${setData.expression}</div>
                <div class="set-content">مقادیر: ${formatSet(setData.elements)}</div>
            `;
        } else if (setData.type === 'verbal') {
            content = `
                <div class="set-description">${setData.description}</div>
                <div class="set-content">مقادیر: ${formatSet(setData.elements)}</div>
            `;
        } else {
            content = `<div class="set-content">${formatSet(setData.elements)}</div>`;
        }
        
        setsHTML += `
            <div class="set-item">
                <div class="set-name">${name} <small>(${getTypeName(setData.type)})</small></div>
                ${content}
                <div class="set-actions">
                    <button onclick="deleteSet('${name}')" class="btn btn-danger">🗑️ حذف</button>
                </div>
            </div>
        `;
    });
    
    setsHTML += `
        <div class="button-group">
            <button onclick="addNewSet()" class="btn btn-success">➕ مجموعه جدید</button>
            <button onclick="showMainMenu()" class="btn btn-secondary">🔙 بازگشت</button>
        </div>
    </div>`;
    
    document.getElementById("step").innerHTML = setsHTML;
}

function getTypeName(type) {
    const typeNames = {
        'symbolic': 'نمادین',
        'verbal': 'کلامی',
        'normal': 'عادی'
    };
    return typeNames[type] || type;
}

function deleteSet(name) {
    if (confirm(`آیا از حذف مجموعه "${name}" مطمئن هستید؟`)) {
        AppState.sets.delete(name);
        showMessage(`مجموعه "${name}" حذف شد`, 'success');
        showAllSets();
    }
}

// عملیات روی مجموعه‌ها
function showSetOperations() {
    if (AppState.sets.size < 2) {
        showMessage('برای انجام عملیات حداقل به ۲ مجموعه نیاز دارید', 'error');
        return;
    }
    
    let setsHTML = '';
    AppState.sets.forEach((_, name) => {
        setsHTML += `<option value="${name}">${name}</option>`;
    });
    
    document.getElementById("step").innerHTML = `
        <div class="step-container">
            <h3>عملیات روی مجموعه‌ها</h3>
            <div class="form-group">
                <label class="form-label">مجموعه اول:</label>
                <select id="setA" class="form-input">${setsHTML}</select>
            </div>
            <div class="form-group">
                <label class="form-label">عملیات:</label>
                <select id="operation" class="form-input">
                    <option value="union">اتحاد (A ∪ B)</option