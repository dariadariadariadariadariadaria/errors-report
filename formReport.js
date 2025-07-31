const { getTasksData } = require('./fileService');
const fs = require('fs');

// Вместо 'prev_quarter.csv' и 'current_quarter.csv' — ваши реальные пути к файлам
const prevTasks = getTasksData('prev_quarter.csv');
const currTasks = getTasksData('current_quarter.csv');

const categories = [
    'code64', 'modification', 'new', 'not available', 'old', 'patch',
    'postanovka', 'postgre', 'refactoring', 'regressive', 'support', 'zakazchik'
];

// Функция подсчёта общей статистики по задачам
function getSummaryStats(tasks) {
    return {
        totalTasks: tasks.length,
        totalHours: tasks.reduce((sum, t) => sum + t.hours, 0),
    };
}

// Функция фильтрации задач заказчиков (где нет [int] в названии)
function filterZakazchikTasks(tasks) {
    return tasks.filter(t => !/\[int\]/i.test(t.taskTitle));
}

// Подсчёт задач по категориям для заданного списка задач
function countByCategory(tasks) {
    const stats = {};
    categories.forEach(cat => {
        stats[cat] = {
            count: 0,
            hours: 0
        };
    });

    tasks.forEach(t => {
        const cat = t.category.toLowerCase();
        if (categories.includes(cat)) {
            stats[cat].count += 1;
            stats[cat].hours += t.hours;
        }
    });

    return stats;
}

// Собираем итоговый отчёт
const report = {
    total: {
        prev: getSummaryStats(prevTasks),
        current: getSummaryStats(currTasks)
    },
    zakazchik: {
        prev: getSummaryStats(filterZakazchikTasks(prevTasks)),
        current: getSummaryStats(filterZakazchikTasks(currTasks))
    },
    categoryComparison: {}
};

categories.forEach(cat => {
    report.categoryComparison[cat] = {
        prev: {
            count: 0,
            hours: 0
        },
        current: {
            count: 0,
            hours: 0
        }
    };
});

const prevZakazchik = filterZakazchikTasks(prevTasks);
const currZakazchik = filterZakazchikTasks(currTasks);

const prevCatStats = countByCategory(prevZakazchik);
const currCatStats = countByCategory(currZakazchik);

categories.forEach(cat => {
    report.categoryComparison[cat].prev.count = prevCatStats[cat].count;
    report.categoryComparison[cat].prev.hours = prevCatStats[cat].hours;
    report.categoryComparison[cat].current.count = currCatStats[cat].count;
    report.categoryComparison[cat].current.hours = currCatStats[cat].hours;
});

fs.writeFileSync('report.json', JSON.stringify(report, null, 2), 'utf8');
console.log('Отчёт сохранён в report.json');