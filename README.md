# Speeding Fines Australia (2023) 🚗📊  
[![Build](https://img.shields.io/badge/status-live-brightgreen)](../../branches)  
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)  
[![Made with D3](https://img.shields.io/badge/made%20with-D3.js-f06666)](https://d3js.org/)  

> **An interactive web dashboard revealing patterns in speeding fines across Australian states and territories in 2023. Built with D3.js and deployed via AWS.**

---

## 📷 Dashboard Preview

### Left Half – Overview and Key Metrics
<p align="center">
  <img src="images/dashboard-overview.png" width="750" alt="Overview section of the speeding fines dashboard">
</p>

### Right Half – Deep Dive and Charts
<p align="center">
  <img src="images/dashboard-details.png" width="750" alt="Detail view showing charts and interactions">
</p>

---

## 🧼 Data Cleaning & Transformation with KNIME

Before building the dashboard, the raw dataset was cleaned and transformed using **KNIME Analytics Platform**.

### Workflow Example – Initial Preprocessing
<p align="center">
  <img src="images/knime-cleaning-flow.png" width="700" alt="KNIME workflow showing data filtering and cleanup">
</p>

### Workflow Example – Aggregation and Export
<p align="center">
  <img src="images/knime-export-flow.png" width="700" alt="KNIME data aggregation and output logic">
</p>

---

## ✨ Key Insights from the Dashboard

| Insight               | Example                                      |
|-----------------------|----------------------------------------------|
| **Monthly Trends**     | Detect fine spikes in peak periods (e.g., Dec) |
| **By Jurisdiction**    | Compare VIC, NSW, QLD fine patterns           |
| **Detection Methods**  | Explore use of mobile/fixed cameras vs radar |
| **Demographics**       | Analyze patterns by age and driver types      |
| **Location Types**     | Understand trends in urban, rural, or school zones |

---

## 🛠️ Tech Stack

| Layer       | Tools                                           |
|-------------|-------------------------------------------------|
| Front-End   | **HTML · Modular CSS · JavaScript**             |
| Visualization | **D3.js v7**                                 |
| Hosting     | **Amazon S3 (Static Website Hosting)**          |
| ETL / Cleaning | **KNIME Analytics Platform**               |
| Data Source | [BITRE Road Safety Enforcement Data (2024)](https://www.bitre.gov.au/publications/2024/road-safety-enforcement-data) |

---

## 📁 Project Structure

| File / Folder            | Description                                  |
|--------------------------|----------------------------------------------|
| `index.html`             | Main HTML file                                |
| `css/`                   | Layout-specific stylesheets                   |
| `js/`                    | D3 visual logic (bar, map, filters, etc.)     |
| `data/`                  | Cleaned datasets in CSV and JSON formats      |
| `images/`                | Visual assets and screenshots                 |
| `.vscode/`               | Editor configuration (optional)               |

---

## 🚀 Live Demo

📍 **[Launch Dashboard](https://web-dashboard-speeding-fines-2023-australia.s3.ap-southeast-2.amazonaws.com/index.html)**  
> Fully deployed to AWS S3. No build or backend required — just static files.

---

## 🧑‍💻 Run Locally (2 mins)

```bash
# Clone the repository
git clone https://github.com/yourusername/speeding-fines-australia-2023.git

# Open the folder in VS Code
# Run using Live Server (needed for loading local CSV files via XHR)
