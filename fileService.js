const fs = require('fs');
const path = require('path');

function getTasksData(fileName) {
    const filePath = path.join(__dirname, fileName);
    const data = fs.readFileSync(filePath, 'utf8');
    const lines = data.split(/\r?\n/).filter(Boolean);

    const rawHeaders = lines[0];
    const cleanHeaders = rawHeaders.replace(/^\uFEFF/, ''); // убрать BOM, если есть
    const headers = cleanHeaders.split(';');

    const idx = {};
    [
        '#', 'Тема', 'Назначена', 'Модуль', 'Категория ошибки', 'Трудозатраты'
    ].forEach(col => {
        const i = headers.indexOf(col);
        if (i === -1) throw new Error(`Колонка ${col} не найдена!`);
        idx[col] = i;
    });

    let result = [];

    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(';');

        const task = {
            taskNum: cols[idx['#']]?.trim() || '',
            taskTitle: cols[idx['Тема']]?.trim().replace(/^"|"$/g, '') || '',
            executor: cols[idx['Назначена']]?.trim() || '',
            module: cols[idx['Модуль']]?.trim() || '',
            category: cols[idx['Категория ошибки']]?.trim() || '',
            hours: Number(cols[idx['Трудозатраты']]?.replace(',', '.')?.trim()) || 0
        };

        result.push(task);
    }

    return result;
}

module.exports = {
    getTasksData
};