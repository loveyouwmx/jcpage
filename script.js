// 获取DOM元素
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const colorInput = document.getElementById('color');
const opacityInput = document.getElementById('opacity');
const opacityValue = document.getElementById('opacity-value');
const textItemsContainer = document.getElementById('textItems');
const downloadBtn = document.getElementById('download');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// 文案数据
let textItems = [];
let currentTextIndex = 0;

// 拖拽相关变量
let isDragging = false;
let dragIndex = -1;
let dragOffset = { x: 0, y: 0 };

// 初始化
function init() {
    // 添加默认文案
    addTextItem();
    // 初始化画布
    initCanvas();
    // 绑定事件
    bindEvents();
}

// 初始化画布
function initCanvas() {
    const width = parseInt(widthInput.value);
    const height = parseInt(heightInput.value);
    canvas.width = width;
    canvas.height = height;
    drawCanvas();
}

// 绘制画布
function drawCanvas() {
    const width = parseInt(widthInput.value);
    const height = parseInt(heightInput.value);
    const color = colorInput.value;
    const opacity = parseInt(opacityInput.value) / 100;
    
    // 更新画布尺寸
    canvas.width = width;
    canvas.height = height;
    
    // 清除画布
    ctx.clearRect(0, 0, width, height);
    
    // 设置背景为白色（用于透明效果）
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    
    // 绘制自定义颜色和透明度的矩形
    ctx.fillStyle = hexToRgba(color, opacity);
    ctx.fillRect(0, 0, width, height);
    
    // 绘制所有文案
    textItems.forEach((textItem, index) => {
        if (textItem.content) {
            // 绘制文案
            ctx.font = `${textItem.fontSize}px Arial`;
            ctx.fillStyle = textItem.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(textItem.content, textItem.x, textItem.y);
            
            // 绘制选中状态的边框
            if (index === currentTextIndex) {
                ctx.strokeStyle = '#3498db';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                const textMetrics = ctx.measureText(textItem.content);
                const textWidth = textMetrics.width;
                const textHeight = textItem.fontSize * 1.2;
                ctx.strokeRect(
                    textItem.x - textWidth / 2 - 5,
                    textItem.y - textHeight / 2 - 5,
                    textWidth + 10,
                    textHeight + 10
                );
                ctx.setLineDash([]);
            }
        }
    });
}

// 将十六进制颜色转换为RGBA
function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// 下载图片
function downloadImage() {
    const link = document.createElement('a');
    link.download = `custom-image-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// 添加文案项
function addTextItem() {
    const width = parseInt(widthInput.value);
    const height = parseInt(heightInput.value);
    
    const newTextItem = {
        id: Date.now(),
        content: '',
        fontSize: 24,
        color: '#000000',
        x: width / 2,
        y: height / 2
    };
    
    textItems.push(newTextItem);
    currentTextIndex = textItems.length - 1;
    renderTextItems();
    drawCanvas();
}

// 删除文案项
function removeTextItem(id) {
    textItems = textItems.filter(item => item.id !== id);
    if (currentTextIndex >= textItems.length) {
        currentTextIndex = Math.max(0, textItems.length - 1);
    }
    renderTextItems();
    drawCanvas();
}

// 更新文案项
function updateTextItem(id, updates) {
    const index = textItems.findIndex(item => item.id === id);
    if (index !== -1) {
        textItems[index] = { ...textItems[index], ...updates };
        drawCanvas();
    }
}

// 渲染文案项
function renderTextItems() {
    textItemsContainer.innerHTML = '';
    
    textItems.forEach((item, index) => {
        const textItemElement = document.createElement('div');
        textItemElement.className = `text-item ${index === currentTextIndex ? 'active' : ''}`;
        
        // 只在点击非输入区域时切换选中状态
        textItemElement.addEventListener('click', (e) => {
            // 如果点击的是输入元素或按钮，不切换选中状态
            if (!e.target.matches('input') && !e.target.matches('button')) {
                currentTextIndex = index;
                renderTextItems();
            }
        });
        
        // 创建文案项内容
        const h4 = document.createElement('h4');
        h4.innerHTML = `
            文案 ${index + 1}
            <button class="remove-text">删除</button>
        `;
        
        // 创建布局行
        const row1 = document.createElement('div');
        row1.className = 'row';
        
        const row2 = document.createElement('div');
        row2.className = 'row';
        
        const row3 = document.createElement('div');
        row3.className = 'row';
        
        // 创建内容输入框
        const contentGroup = document.createElement('div');
        contentGroup.className = 'control-group';
        contentGroup.innerHTML = `
            <label>内容:</label>
            <input type="text" value="${item.content}" placeholder="请输入文字">
        `;
        
        // 创建字体大小输入框
        const fontSizeGroup = document.createElement('div');
        fontSizeGroup.className = 'control-group';
        fontSizeGroup.innerHTML = `
            <label>字体大小 (px):</label>
            <input type="number" min="1" value="${item.fontSize}">
        `;
        
        // 创建颜色选择器
        const colorGroup = document.createElement('div');
        colorGroup.className = 'control-group';
        colorGroup.innerHTML = `
            <label>颜色:</label>
            <input type="color" value="${item.color}">
        `;
        
        // 创建X坐标输入框
        const xGroup = document.createElement('div');
        xGroup.className = 'control-group';
        xGroup.innerHTML = `
            <label>X坐标 (px):</label>
            <input type="number" min="0" value="${item.x}">
        `;
        
        // 创建Y坐标输入框
        const yGroup = document.createElement('div');
        yGroup.className = 'control-group';
        yGroup.innerHTML = `
            <label>Y坐标 (px):</label>
            <input type="number" min="0" value="${item.y}">
        `;
        
        // 组装元素 - 内容与字体大小一行
        row1.appendChild(contentGroup);
        row1.appendChild(fontSizeGroup);
        
        // 颜色单独一行
        row2.appendChild(colorGroup);
        
        // XY坐标一行
        row3.appendChild(xGroup);
        row3.appendChild(yGroup);
        
        // 组装到文案项
        textItemElement.appendChild(h4);
        textItemElement.appendChild(row1);
        textItemElement.appendChild(row2);
        textItemElement.appendChild(row3);
        
        // 绑定删除按钮事件
        const removeBtn = textItemElement.querySelector('.remove-text');
        removeBtn.onclick = (e) => {
            removeTextItem(item.id);
            e.stopPropagation();
        };
        
        // 绑定内容输入事件
        const contentInput = textItemElement.querySelector('input[type="text"]');
        contentInput.oninput = () => {
            updateTextItem(item.id, { content: contentInput.value });
        };
        
        // 获取所有数字输入框
        const numberInputs = textItemElement.querySelectorAll('input[type="number"]');
        
        // 绑定字体大小输入事件
        if (numberInputs[0]) {
            const fontSizeInput = numberInputs[0];
            fontSizeInput.oninput = () => {
                updateTextItem(item.id, { fontSize: parseInt(fontSizeInput.value) || 1 });
            };
            fontSizeInput.onchange = drawCanvas;
        }
        
        // 绑定颜色选择事件
        const colorInput = textItemElement.querySelector('input[type="color"]');
        if (colorInput) {
            colorInput.oninput = () => {
                updateTextItem(item.id, { color: colorInput.value });
            };
            colorInput.onchange = drawCanvas;
        }
        
        // 绑定X坐标输入事件
        if (numberInputs[1]) {
            const xInput = numberInputs[1];
            xInput.oninput = () => {
                updateTextItem(item.id, { x: parseInt(xInput.value) || 0 });
            };
            xInput.onchange = drawCanvas;
        }
        
        // 绑定Y坐标输入事件
        if (numberInputs[2]) {
            const yInput = numberInputs[2];
            yInput.oninput = () => {
                updateTextItem(item.id, { y: parseInt(yInput.value) || 0 });
            };
            yInput.onchange = drawCanvas;
        }
        
        textItemsContainer.appendChild(textItemElement);
    });
}

// 绑定事件
function bindEvents() {
    // 透明度滑块
    opacityInput.addEventListener('input', function() {
        opacityValue.textContent = this.value;
        drawCanvas();
    });
    
    // 颜色选择
    colorInput.addEventListener('input', drawCanvas);
    
    // 尺寸调整
    widthInput.addEventListener('input', function() {
        // 更新所有文案的默认位置
        textItems.forEach(item => {
            item.x = parseInt(this.value) / 2;
        });
        renderTextItems();
        drawCanvas();
    });
    
    heightInput.addEventListener('input', function() {
        // 更新所有文案的默认位置
        textItems.forEach(item => {
            item.y = parseInt(this.value) / 2;
        });
        renderTextItems();
        drawCanvas();
    });
    
    // 添加文案 - 直接在DOM中查找元素并绑定事件
    document.getElementById('addText').addEventListener('click', addTextItem);
    
    // 下载图片
    downloadBtn.addEventListener('click', downloadImage);
    
    // 画布鼠标事件 - 开始拖拽
    canvas.addEventListener('mousedown', function(e) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // 检测是否点击在文案上
        for (let i = textItems.length - 1; i >= 0; i--) {
            const item = textItems[i];
            if (item.content) {
                ctx.font = `${item.fontSize}px Arial`;
                const textMetrics = ctx.measureText(item.content);
                const textWidth = textMetrics.width;
                const textHeight = item.fontSize * 1.2;
                
                if (mouseX >= item.x - textWidth / 2 - 5 && 
                    mouseX <= item.x + textWidth / 2 + 5 && 
                    mouseY >= item.y - textHeight / 2 - 5 && 
                    mouseY <= item.y + textHeight / 2 + 5) {
                    isDragging = true;
                    dragIndex = i;
                    dragOffset.x = mouseX - item.x;
                    dragOffset.y = mouseY - item.y;
                    currentTextIndex = i;
                    renderTextItems();
                    drawCanvas();
                    return;
                }
            }
        }
    });
    
    // 画布鼠标事件 - 拖拽中
    canvas.addEventListener('mousemove', function(e) {
        if (isDragging && dragIndex !== -1) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // 更新文案位置
            textItems[dragIndex].x = mouseX - dragOffset.x;
            textItems[dragIndex].y = mouseY - dragOffset.y;
            
            // 确保位置在画布范围内
            textItems[dragIndex].x = Math.max(0, Math.min(textItems[dragIndex].x, canvas.width));
            textItems[dragIndex].y = Math.max(0, Math.min(textItems[dragIndex].y, canvas.height));
            
            // 更新当前拖拽的文案项的坐标输入框的值
            const textItemsElements = textItemsContainer.querySelectorAll('.text-item');
            if (textItemsElements[dragIndex]) {
                const numberInputs = textItemsElements[dragIndex].querySelectorAll('input[type="number"]');
                if (numberInputs[1]) {
                    numberInputs[1].value = Math.round(textItems[dragIndex].x);
                }
                if (numberInputs[2]) {
                    numberInputs[2].value = Math.round(textItems[dragIndex].y);
                }
            }
            
            drawCanvas();
        }
    });
    
    // 画布鼠标事件 - 结束拖拽
    canvas.addEventListener('mouseup', function() {
        isDragging = false;
        dragIndex = -1;
    });
    
    // 画布鼠标事件 - 鼠标离开
    canvas.addEventListener('mouseleave', function() {
        isDragging = false;
        dragIndex = -1;
    });
}

// 初始化应用
init();