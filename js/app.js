
// ============================================
// DEFECTIQ - DEFECT CAUSAL ANALYSIS DASHBOARD
// ============================================

const COLORS = {
    purple: "#8172dc",
    blue: "#55a5e8",
    orange: "#e9a45e",
    coral: "#e77e92",
    teal: "#42b8a8",
    muted: "#8589a5"
};

const CAUSE_GROUPS = {
    Methods: {
        color: COLORS.purple,
        label: "Methods"
    },
    Machines: {
        color: COLORS.blue,
        label: "Machines"
    },
    Materials: {
        color: COLORS.orange,
        label: "Materials"
    },
    Manpower: {
        color: COLORS.coral,
        label: "Manpower"
    }
};

const categoryRecommendations = {
    "UI / Layout": "Introduce shared design guidelines, reusable UI components, and responsive testing across supported browsers.",
    "Performance": "Optimize database queries, compress assets, review caching, and establish regular performance monitoring.",
    "Authentication": "Strengthen token validation, review access policies, and expand authentication test coverage.",
    "Database": "Review indexing strategies, validate migrations, and introduce automated database integrity checks.",
    "API Integration": "Standardize API contracts, validate responses, and implement integration tests with timeout handling.",
    "Validation": "Add boundary-value test cases, clarify input requirements, and improve validation coverage.",
    "Security": "Review access controls, update dependencies, and introduce regular security testing."
};

let allDefects = [...defectData];
let filteredDefects = [...allDefects];
let paretoChart = null;

// ============================================
// DOM ELEMENTS
// ============================================

const elements = {
    totalDefects: document.getElementById("totalDefects"),
    criticalDefects: document.getElementById("criticalDefects"),
    totalCategories: document.getElementById("totalCategories"),
    topCategory: document.getElementById("topCategory"),

    dateFilter: document.getElementById("dateFilter"),
    severityFilter: document.getElementById("severityFilter"),
    categoryFilter: document.getElementById("categoryFilter"),

    resetFilters: document.getElementById("resetFilters"),
    topCategoriesList: document.getElementById("topCategoriesList"),
    fishboneCategory: document.getElementById("fishboneCategory"),
    fishboneContainer: document.getElementById("fishboneContainer"),
    insightsList: document.getElementById("insightsList"),

    uploadBtn: document.getElementById("uploadBtn"),
    fileInput: document.getElementById("fileInput")
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function countByCategory(data) {
    const counts = {};

    data.forEach(defect => {
        counts[defect.category] = (counts[defect.category] || 0) + 1;
    });

    return Object.entries(counts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);
}

function getPercentage(value, total) {
    return total ? (value / total) * 100 : 0;
}

function getISODate(date) {
    return date.toISOString().slice(0, 10);
}

// ============================================
// FILTER OPTIONS
// ============================================

function populateCategoryFilters() {
    const categories = [...new Set(allDefects.map(d => d.category))]
        .sort();

    const options = categories.map(category =>
        `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`
    ).join("");

    elements.categoryFilter.innerHTML =
        '<option value="all">All categories</option>' + options;

    elements.fishboneCategory.innerHTML = options;
}

// ============================================
// FILTERING
// ============================================

function applyFilters() {
    const severity = elements.severityFilter.value;
    const category = elements.categoryFilter.value;
    const days = elements.dateFilter.value;

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    let startDate = null;

    if (days !== "all") {
        startDate = new Date(today);
        startDate.setDate(today.getDate() - Number(days) + 1);
        startDate.setHours(0, 0, 0, 0);
    }

    filteredDefects = allDefects.filter(defect => {
        const defectDate = new Date(`${defect.date}T00:00:00`);

        const matchesSeverity =
            severity === "all" || defect.severity === severity;

        const matchesCategory =
            category === "all" || defect.category === category;

        const matchesDate =
            !startDate ||
            (!Number.isNaN(defectDate.getTime()) &&
             defectDate >= startDate &&
             defectDate <= today);

        return matchesSeverity && matchesCategory && matchesDate;
    });

    updateDashboard();
}

function resetAllFilters() {
    elements.dateFilter.value = "30";
    elements.severityFilter.value = "all";
    elements.categoryFilter.value = "all";

    applyFilters();
}

// ============================================
// KPI CARDS
// ============================================

function updateKPIs() {
    const total = filteredDefects.length;

    const critical = filteredDefects.filter(
        defect => defect.severity === "Critical"
    ).length;

    const categories = countByCategory(filteredDefects);

    elements.totalDefects.textContent = total;
    elements.criticalDefects.textContent = critical;
    elements.totalCategories.textContent = categories.length;

    elements.topCategory.textContent =
        categories.length ? categories[0].category : "—";
}

// ============================================
// PARETO CHART
// ============================================

function updateParetoChart() {
    const categories = countByCategory(filteredDefects);

    const total = filteredDefects.length;
    let cumulative = 0;

    const cumulativePercentages = categories.map(item => {
        cumulative += item.count;
        return total ? Number(((cumulative / total) * 100).toFixed(1)) : 0;
    });

    const chartElement = document.getElementById("paretoChart");

    if (paretoChart) {
        paretoChart.destroy();
    }

    paretoChart = new Chart(chartElement, {
        type: "bar",

        data: {
            labels: categories.map(item => item.category),

            datasets: [
                {
                    type: "bar",
                    label: "Defect Count",
                    data: categories.map(item => item.count),
                    backgroundColor: categories.map((item, index) =>
                        index === 0 ? COLORS.purple : "#b6b0ed"
                    ),
                    borderRadius: 6,
                    borderSkipped: false,
                    yAxisID: "y",
                    order: 2
                },
                {
                    type: "line",
                    label: "Cumulative %",
                    data: cumulativePercentages,
                    borderColor: COLORS.teal,
                    backgroundColor: COLORS.teal,
                    borderWidth: 2.5,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: "#ffffff",
                    pointBorderWidth: 2,
                    tension: 0.25,
                    yAxisID: "y1",
                    order: 1
                },
                {
                    type: "line",
                    label: "80% Reference",
                    data: categories.map(() => 80),
                    borderColor: COLORS.orange,
                    borderWidth: 1.5,
                    borderDash: [6, 5],
                    pointRadius: 0,
                    yAxisID: "y1",
                    order: 0
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            interaction: {
                mode: "index",
                intersect: false
            },

            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        usePointStyle: true,
                        boxWidth: 7,
                        boxHeight: 7,
                        padding: 17,
                        font: {
                            family: "DM Sans",
                            size: 10
                        }
                    }
                },

                tooltip: {
                    backgroundColor: "#292944",
                    padding: 11,
                    titleFont: {
                        family: "DM Sans"
                    },
                    bodyFont: {
                        family: "DM Sans"
                    }
                }
            },

            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: COLORS.muted,
                        font: {
                            family: "DM Sans",
                            size: 9
                        },
                        maxRotation: 35,
                        minRotation: 0
                    }
                },

                y: {
                    beginAtZero: true,
                    grid: {
                        color: "#f0f0f6"
                    },
                    ticks: {
                        precision: 0,
                        color: COLORS.muted,
                        font: {
                            family: "DM Sans",
                            size: 9
                        }
                    },
                    title: {
                        display: true,
                        text: "Number of defects",
                        color: COLORS.muted,
                        font: {
                            family: "DM Sans",
                            size: 10
                        }
                    }
                },

                y1: {
                    position: "right",
                    beginAtZero: true,
                    min: 0,
                    max: 100,
                    grid: {
                        display: false
                    },
                    ticks: {
                        callback: value => value + "%",
                        color: COLORS.muted,
                        font: {
                            family: "DM Sans",
                            size: 9
                        }
                    }
                }
            }
        }
    });
}

// ============================================
// TOP CATEGORY RANKING
// ============================================

function updateTopCategories() {
    const categories = countByCategory(filteredDefects);
    const total = filteredDefects.length;

    if (!categories.length) {
        elements.topCategoriesList.innerHTML =
            '<p class="empty-message">No defects match the selected filters.</p>';
        return;
    }

    const palette = [
        COLORS.purple,
        COLORS.blue,
        COLORS.teal,
        COLORS.orange,
        COLORS.coral
    ];

    elements.topCategoriesList.innerHTML = categories
        .slice(0, 5)
        .map((item, index) => {
            const percentage = getPercentage(item.count, total);

            return `
                <div class="category-item">
                    <div class="category-info">
                        <strong>${index + 1}. ${escapeHTML(item.category)}</strong>
                        <span>${item.count} defects · ${percentage.toFixed(1)}%</span>
                    </div>
                    <div class="progress-track">
                        <div class="progress-fill"
                             style="width:${percentage}%;background:${palette[index % palette.length]}">
                        </div>
                    </div>
                </div>
            `;
        }).join("");
}

// ============================================
// ISHIKAWA FISHBONE DIAGRAM
// ============================================

function getCausesForCategory(category) {
    const matchingDefects = filteredDefects.filter(
        defect => defect.category === category
    );

    const groups = {
        Methods: [],
        Machines: [],
        Materials: [],
        Manpower: []
    };

    matchingDefects.forEach(defect => {
        if (groups[defect.causeType]) {
            groups[defect.causeType].push(defect.rootCause);
        }
    });

    Object.keys(groups).forEach(group => {
        groups[group] = [...new Set(groups[group])];
    });

    return groups;
}


function updateFishbone() {
    const category = elements.fishboneCategory.value;

    if (!category) {
        elements.fishboneContainer.innerHTML =
            '<div class="fishbone-placeholder">No category available for analysis.</div>';
        return;
    }

    const groups = getCausesForCategory(category);

    const branchSettings = [
        {
            name: "Methods",
            key: "Methods",
            x: 170,
            y: 130,
            direction: -1
        },
        {
            name: "Machines",
            key: "Machines",
            x: 390,
            y: 130,
            direction: -1
        },
        {
            name: "Materials",
            key: "Materials",
            x: 170,
            y: 300,
            direction: 1
        },
        {
            name: "Manpower",
            key: "Manpower",
            x: 390,
            y: 300,
            direction: 1
        }
    ];

    const branchElements = branchSettings.map(setting => {
        const causes = groups[setting.key];
        const endY = setting.y + (setting.direction * 75);
        const color = CAUSE_GROUPS[setting.key].color;

        const labelY = setting.direction === -1
            ? setting.y - 82
            : setting.y + 90;

        const causeElements = causes.length
            ? causes.slice(0, 3).map((cause, index) => {
                const textY = setting.direction === -1
                    ? setting.y - 49 + index * 16
                    : setting.y + 30 + index * 16;

                return `
                    <text x="${setting.x - 5}"
                          y="${textY}"
                          text-anchor="end"
                          class="cause-text">${escapeHTML(cause)}</text>
                `;
            }).join("")
            : `
                <text x="${setting.x - 5}"
                      y="${labelY}"
                      text-anchor="end"
                      class="cause-text">No recorded causes</text>
            `;

        return `
            <g>
                <line x1="${setting.x}"
                      y1="${setting.y}"
                      x2="${setting.x - 62}"
                      y2="${endY}"
                      stroke="${color}"
                      stroke-width="2.5"
                      stroke-linecap="round"/>

                <circle cx="${setting.x}"
                        cy="${setting.y}"
                        r="4"
                        fill="${color}"/>

                ${causeElements}

                <text x="${setting.x - 67}"
                      y="${setting.direction === -1 ? endY - 9 : endY + 18}"
                      text-anchor="middle"
                      fill="${color}"
                      class="branch-label">${setting.name}</text>
            </g>
        `;
    }).join("");

    elements.fishboneContainer.innerHTML = `
        <svg viewBox="0 0 650 430"
             xmlns="http://www.w3.org/2000/svg"
             role="img"
             aria-label="Ishikawa fishbone diagram for ${escapeHTML(category)}">

            <line x1="55" y1="215"
                  x2="525" y2="215"
                  stroke="#a4a2c9"
                  stroke-width="4"
                  stroke-linecap="round"/>

            <path d="M 525 215 L 505 203 L 505 227 Z"
                  fill="#a4a2c9"/>

            ${branchElements}

            <rect x="525" y="173"
                  width="118" height="84"
                  rx="12"
                  fill="#eeecff"
                  stroke="#dcd7ff"/>

            <text x="584" y="196"
                  text-anchor="middle"
                  fill="#7065d8"
                  class="effect-small">DEFECT EFFECT</text>

            <text x="584" y="217"
                  text-anchor="middle"
                  fill="#39365e"
                  class="effect-label">
                <tspan x="584" dy="0">${escapeHTML(category).length > 17 ? escapeHTML(category).slice(0, 17) + "…" : escapeHTML(category)}</tspan>
            </text>

            <text x="584" y="235"
                  text-anchor="middle"
                  fill="#77749a"
                  class="effect-small">Root cause analysis</text>
        </svg>
    `;

    const svg = elements.fishboneContainer.querySelector("svg");

    const style = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "style"
    );

    style.textContent = `
        .cause-text {
            font-family: 'DM Sans', sans-serif;
            font-size: 9px;
            fill: #747792;
        }
        .branch-label {
            font-family: 'DM Sans', sans-serif;
            font-size: 10px;
            font-weight: 700;
        }
        .effect-small {
            font-family: 'DM Sans', sans-serif;
            font-size: 7px;
            font-weight: 700;
            letter-spacing: 0.6px;
        }
        .effect-label {
            font-family: 'DM Sans', sans-serif;
            font-size: 10px;
            font-weight: 800;
        }
    `;

    svg.prepend(style);
}


// ============================================
// QUALITY INSIGHTS
// ============================================

function updateInsights() {
    const categories = countByCategory(filteredDefects);
    const total = filteredDefects.length;

    if (!total) {
        elements.insightsList.innerHTML = `
            <div class="insight-card empty">
                <div>
                    <h4>No data available</h4>
                    <p>Try changing your filters or importing another defect dataset.</p>
                </div>
            </div>
        `;
        return;
    }

    let cumulative = 0;
    let priorityCount = 0;

    for (const item of categories) {
        cumulative += item.count;
        priorityCount++;

        if (cumulative / total >= 0.8) {
            break;
        }
    }

    const priorityCategories = categories.slice(0, priorityCount);

    const priorityPercentage = getPercentage(
        priorityCategories.reduce((sum, item) => sum + item.count, 0),
        total
    );

    const recommendations = priorityCategories.slice(0, 4).map(item => ({
        title: `Improve ${item.category}`,
        description: categoryRecommendations[item.category] ||
            "Review recurring defects, identify their root causes, and strengthen testing and review procedures."
    }));

    const priorityInsight = {
        title: "80/20 Priority Analysis",
        description: `${priorityCategories.length} categories account for ${priorityPercentage.toFixed(1)}% of the currently filtered defects. Prioritize these areas for improvement.`
    };

    const allInsights = [priorityInsight, ...recommendations];

    elements.insightsList.innerHTML = allInsights.map((item, index) => `
        <article class="insight-card">
            <div class="insight-number">${String(index + 1).padStart(2, "0")}</div>
            <div>
                <h4>${escapeHTML(item.title)}</h4>
                <p>${escapeHTML(item.description)}</p>
            </div>
        </article>
    `).join("");
}

// ============================================
// DASHBOARD REFRESH
// ============================================

function updateDashboard() {
    updateKPIs();
    updateParetoChart();
    updateTopCategories();
    updateFishbone();
    updateInsights();
}

// ============================================
// CSV IMPORT
// ============================================

function parseCSVLine(line) {
    const values = [];
    let current = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const character = line[i];

        if (character === '"') {
            if (insideQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                insideQuotes = !insideQuotes;
            }
        } else if (character === "," && !insideQuotes) {
            values.push(current.trim());
            current = "";
        } else {
            current += character;
        }
    }

    values.push(current.trim());

    return values;
}

function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);

    if (lines.length < 2) {
        throw new Error("CSV file must contain a header and at least one record.");
    }

    const headers = parseCSVLine(lines[0]).map(header =>
        header.trim().toLowerCase().replace(/[\s_-]/g, "")
    );

    const requiredFields = [
        "category",
        "severity",
        "rootcause",
        "date"
    ];

    const missingFields = requiredFields.filter(
        field => !headers.includes(field)
    );

    if (missingFields.length) {
        throw new Error(`Missing CSV columns: ${missingFields.join(", ")}`);
    }

    return lines.slice(1)
        .filter(line => line.trim())
        .map((line, index) => {
            const values = parseCSVLine(line);
            const record = {};

            headers.forEach((header, i) => {
                record[header] = values[i] ?? "";
            });

            return {
                id: index + 1,
                category: record.category.trim(),
                severity: normalizeSeverity(record.severity),
                rootCause: record.rootcause.trim(),
                causeType: normalizeCauseType(record.causetype),
                date: record.date.trim()
            };
        });
}

// ============================================
// DATA VALIDATION
// ============================================

function normalizeSeverity(value) {
    const severity = String(value || "").trim().toLowerCase();

    const valid = {
        critical: "Critical",
        high: "High",
        medium: "Medium",
        low: "Low"
    };

    return valid[severity] || null;
}

function normalizeCauseType(value) {
    const cause = String(value || "").trim().toLowerCase();

    const valid = {
        methods: "Methods",
        machines: "Machines",
        materials: "Materials",
        manpower: "Manpower"
    };

    return valid[cause] || "Methods";
}

function validateDefects(records) {
    if (!Array.isArray(records) || !records.length) {
        throw new Error("The imported file contains no defect records.");
    }

    return records.map((record, index) => {
        const category = String(record.category || "").trim();
        const rootCause = String(
            record.rootCause ?? record.rootcause ?? ""
        ).trim();

        const severity = normalizeSeverity(record.severity);
        const date = String(record.date || "").trim();

        if (!category || !rootCause || !severity || !date) {
            throw new Error(`Invalid or missing data in record ${index + 1}.`);
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            throw new Error(`Invalid date format in record ${index + 1}. Use YYYY-MM-DD.`);
        }

        const parsedDate = new Date(`${date}T00:00:00`);

        if (
            Number.isNaN(parsedDate.getTime()) ||
            getISODate(parsedDate) !== date
        ) {
            throw new Error(`Invalid calendar date in record ${index + 1}.`);
        }

        return {
            id: index + 1,
            category,
            severity,
            rootCause,
            causeType: normalizeCauseType(
                record.causeType ?? record.cause_type
            ),
            date
        };
    });
}

// ============================================
// FILE IMPORT
// ============================================

function handleFileImport(file) {
    if (!file) return;

    const extension = file.name.split(".").pop().toLowerCase();

    if (!["csv", "json"].includes(extension)) {
        alert("Please select a CSV or JSON file.");
        return;
    }

    const reader = new FileReader();

    reader.onload = event => {
        try {
            const content = event.target.result;

            const importedRecords = extension === "csv"
                ? parseCSV(content)
                : JSON.parse(content);

            const validatedRecords = validateDefects(importedRecords);

            allDefects = validatedRecords;

            populateCategoryFilters();

            resetAllFilters();

            alert(`Successfully imported ${allDefects.length} defect records.`);
        } catch (error) {
            alert(`Import failed: ${error.message}`);
        }

        elements.fileInput.value = "";
    };

    reader.onerror = () => {
        alert("Unable to read the selected file.");
        elements.fileInput.value = "";
    };

    reader.readAsText(file);
}

// ============================================
// EVENT LISTENERS
// ============================================

elements.dateFilter.addEventListener("change", applyFilters);
elements.severityFilter.addEventListener("change", applyFilters);
elements.categoryFilter.addEventListener("change", applyFilters);

elements.resetFilters.addEventListener("click", resetAllFilters);

elements.fishboneCategory.addEventListener("change", updateFishbone);

elements.uploadBtn.addEventListener("click", () => {
    elements.fileInput.click();
});

elements.fileInput.addEventListener("change", event => {
    handleFileImport(event.target.files[0]);
});

// ============================================
// INITIALIZATION
// ============================================

function initializeDashboard() {
    populateCategoryFilters();

    elements.dateFilter.value = "30";
    elements.severityFilter.value = "all";
    elements.categoryFilter.value = "all";

    applyFilters();
}

initializeDashboard();

console.log("DefectIQ dashboard initialized successfully.");
console.log(`Loaded ${allDefects.length} defect records.`);
