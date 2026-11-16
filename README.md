# DefectIQ — Software Defect Analysis Dashboard

DefectIQ is a web-based software defect analysis dashboard designed to help visualize defect patterns, identify major problem areas, and understand potential root causes through interactive data visualization.

## Overview

Software defects can affect application quality, reliability, and user experience. DefectIQ helps organize defect records and analyze them using visual techniques such as Pareto analysis and Ishikawa (Fishbone) diagrams.

The dashboard provides an overview of defect severity, categories, root causes, and quality improvement recommendations.

## Features

- **Interactive Dashboard:** Displays key defect statistics through KPI cards.
- **Pareto Analysis:** Identifies defect categories contributing most to the total defects.
- **Ishikawa Diagram:** Visualizes potential root causes using the 4M categories — Methods, Machines, Materials, and Manpower.
- **Defect Filtering:** Filter records by date range, severity, and category.
- **Quality Insights:** Displays insights and recommendations based on defect distribution.
- **Data Import:** Supports importing defect records through CSV and JSON files.
- **Responsive Interface:** Designed to work across different screen sizes.

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Chart.js
- Google Fonts

## Project Structure

```text
DefectIQ/
│
├── index.html
│
├── css/
│   └── style.css
│
├── js/
│   └── app.js
│
└── data/
    └── defect-data.js
```

## Getting Started

### Run Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/dev-bhoomi17/DefectIQ.git
   ```

2. Navigate to the project directory:

   ```bash
   cd DefectIQ
   ```

3. Open `index.html` in your browser.

No backend installation is required.

## Defect Analysis Methodologies

### 1. Pareto Analysis

Uses the Pareto principle (80/20 rule) to highlight defect categories that contribute significantly to the overall number of defects.

### 2. Ishikawa Diagram

Also known as a Fishbone Diagram, this technique helps categorize potential root causes into:

- Methods
- Machines
- Materials
- Manpower

## Data Information

The project includes sample defect records for demonstrating dashboard functionality.

Users can also import their own defect data using supported CSV and JSON formats.

## Future Enhancements

- Backend integration for persistent defect storage.
- Advanced defect trend analysis.
- User authentication and role-based access.
- Exportable analytical reports.

## Live Demo

Explore DefectIQ: https://dev-bhoomi17.github.io/DefectIQ/

## Author

**Bhoomi Chetan Gujar**

GitHub: [@dev-bhoomi17](https://github.com/dev-bhoomi17)

---

If you find this project useful, consider giving the repository a star!