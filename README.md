# CRM Coolant Carryover Detection Simulator (SWIR + Capacitive Edge-AI)

An interactive, non-contact industrial digital-twin and telemetry simulation designed for **High-Speed Cold Rolling Mills (up to 1200 m/min)** to detect residual rolling emulsion carryover before it impacts downstream coating and finishing lines.

---

## 1. Executive Summary & Problem Statement
In high-speed Cold Rolling Mills (CRM) operating at strip speeds up to **1200 m/min (20 m/s)**, residual coolant bypassing exit air knives causes downstream surface contamination, coating defects, rework, and coil scrap. Conventional RGB cameras fail in this environment due to motion blur, steam/mist occlusion, and specular glare from reflective steel strips.

This repository hosts a **100% Non-Contact, Dual-Layer Sensing & Edge-AI Monitoring Prototype** designed for rapid bolt-on installation downstream of exit air knives—detecting micro-droplets and thin liquid films in under **5 milliseconds** without touching the steel strip or disturbing strip flatness with extra air pressure.

---

## 2. Core Technical Architecture
1. **SWIR Line-Scan Optical Bridge (`1450 nm` / `1940 nm`):**
   - Leverages strong water/emulsion optical absorption bands at 1450 nm and 1940 nm against high-reflectance cold-rolled steel.
   - High-speed line-scan sensing (`>20 kHz`) penetrates mill vapor/mist and eliminates motion blur at 1200 m/min.
2. **Non-Contact Capacitive Fringe-Field Array (7 Transverse Zones):**
   - Mounted 12–15 mm above the passline across 7 transverse zones (specifically monitoring strip edges where coolant pooling occurs).
   - Detects instantaneous dielectric shifts (\(\varepsilon_r \approx 80\) for water/emulsion vs. \(\varepsilon_r \approx 1\) for air), producing real-time oscilloscope/ECG-style signal spikes.
3. **Sub-5ms Edge-AI Inference & Coil-Mapping Engine:**
   - Fuses both sensor streams in `< 5 ms` (less than 10 cm of strip travel at 1200 m/min) to classify carryover severity and log exact coil meter-marks.
4. **Three-Tier Automated PLC Alert Workflow (`OPC-UA` / `Modbus-TCP`):**
   - **Green (Optimal):** Dry strip confirmed; normal line operation.
   - **Amber (Early Warning):** Micro-carryover detected; alerts pulpit operator to inspect specific exit air-knife zones.
   - **Red (Critical Carryover):** Logs exact coil meter-mark into Level-2 MES/Quality database and alerts downstream lines before coating/annealing defects occur.

---

## 3. Pilot PoC Cost Breakdown (Single Mill Line)

| Sr. No. | Component / Activity | Technical Specification | Estimated Cost (INR ₹) |
| :--- | :--- | :--- | :--- |
| **1** | **SWIR Line-Scan Optical Sensor & IR Illuminator** | 1450 nm / 1940 nm industrial line-scan unit (`>20 kHz`) | ₹4,50,000 |
| **2** | **Non-Contact Capacitive Fringe-Field Array (7-Zone)** | High-sensitivity dielectric sensors with IP67 housing | ₹1,80,000 |
| **3** | **Industrial Edge-AI Compute Unit & DAQ Card** | Rugged fanless GPU/NPU edge box (`<5 ms` inference) + ADC | ₹1,40,000 |
| **4** | **PLC Integration & HMI Software Module** | OPC-UA / Modbus-TCP interface, SCADA UI & coil-mapping | ₹95,000 |
| **5** | **Modular Mechanical Bridge & Air-Purge Shield** | Stainless steel bolt-on passline frame with lens air-wipe | ₹85,000 |
| **6** | **On-Site Calibration, Testing & Engineering Support** | 4-week mill trial, threshold tuning & safety validation | ₹1,00,000 |
| | **Total Estimated Physical PoC Cost** | **Single Cold Rolling Mill Line Pilot (Excl. Taxes)** | **₹10,50,000 (₹10.5 Lakhs)** |

---

## 4. Live Interactive Simulation
- **Live GitHub Pages Demo:** `[Insert Your GitHub Pages URL Here]`
- Test live strip speeds (`200–1200 m/min`), exit air-knife efficiency drops, edge coolant pooling, and real-time ECG-style telemetry waveforms directly in your browser.

---

## 5. Open-Innovation Collaboration & Reward-Share Model
We invite **Metallurgy Engineers, Rolling Mill Specialists, PLC/Automation Engineers, and Independent Software Developers** to review, validate, and polish this prototype.

### Areas Seeking Technical Contributions
- **Metallurgy & Rolling Mill Operations:** Refining emulsion film thickness thresholds, strip grade sensitivity, and air-knife parameters.
- **PLC / Industrial Automation:** Enhancing `OPC-UA` / `Modbus-TCP` alert logic and Level-2 coil-mapping workflows.
- **Frontend & Telemetry Visualization:** Improving waveform analytics and automated CSV/PDF coil inspection exports.

### Transparent Win-Based Reward Share
- This is a milestone-based open-innovation initiative (not a salaried role).
- Whenever a challenge submission wins cash prize money or a paid PoC pilot contract, **net proceeds are transparently shared** between the Project Lead (`50%–60%`) and verified technical contributors (`40%–50%` split by merged Pull Request impact).
- Please read [`CONTRIBUTING.md`](./CONTRIBUTING.md) before submitting a Pull Request or opening a `Collaborator Intro` Issue.# CRM Coolant Carryover Detection Simulator (SWIR + Capacitive Edge-AI)

An interactive, non-contact industrial digital-twin and telemetry simulation designed for **High-Speed Cold Rolling Mills (up to 1200 m/min)** to detect residual rolling emulsion carryover before it impacts downstream coating and finishing lines.

## Live Demo
- **Interactive Simulation:** https://github.io

## Core Technical Architecture
1. **SWIR Line-Scan Optical Bridge (`1450 nm` / `1940 nm`):** Penetrates mill vapor/mist and eliminates motion blur at 1200 m/min.
2. **Non-Contact Capacitive Fringe-Field Array (7 Transverse Zones):** Mounted 12–15 mm above the passline to detect instantaneous dielectric shifts across strip edges.
3. **Sub-5ms Edge-AI Inference & Coil-Mapping Engine:** Classifies carryover severity and logs exact coil meter-marks.
4. **Three-Tier Automated PLC Alert Workflow:** Green (Optimal), Amber (Micro-Carryover Warning), and Red (Critical Carryover / Downstream Line Alert).

## Pilot PoC Cost Breakdown (Single Mill Line)

| Sr. No. | Component / Activity | Technical Specification | Estimated Cost (INR) |
| :--- | :--- | :--- | :--- |
| **1** | **SWIR Line-Scan Optical Sensor & IR Illuminator** | 1450 nm / 1940 nm industrial line-scan unit (`>20 kHz`) | ₹4,50,000 |
| **2** | **Non-Contact Capacitive Fringe-Field Array (7-Zone)** | High-sensitivity dielectric sensors with IP67 housing | ₹1,80,000 |
| **3** | **Industrial Edge-AI Compute Unit & DAQ Card** | Rugged fanless GPU/NPU edge box (`<5 ms` inference) + ADC | ₹1,40,000 |
| **4** | **PLC Integration & HMI Software Module** | OPC-UA / Modbus-TCP interface, SCADA UI & coil-mapping | ₹95,000 |
| **5** | **Modular Mechanical Bridge & Air-Purge Shield** | Stainless steel bolt-on passline frame with lens air-wipe | ₹85,000 |
| **6** | **On-Site Calibration, Testing & Engineering Support** | 4-week mill trial, threshold tuning & safety validation | ₹1,00,000 |
| | **Total Estimated Physical PoC Cost** | **Single Cold Rolling Mill Line Pilot (Excl. Taxes)** | **₹10,50,000 (₹10.5 Lakhs)** |

## Open-Innovation Collaboration & Reward-Share Model
We invite **Metallurgy Engineers, Rolling Mill Specialists, PLC/Automation Engineers, and Independent Software Developers** to validate and polish this prototype.
- See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for win-based reward-share terms (`50%–60%` Project Lead / `40%–50%` verified contributors).
- Open an **Issue** titled `Collaborator Intro - [Your Domain]` or submit a **Pull Request** to join.

## Project Lead
**Amit Nishanka Bhuyan** — Salipur, Odisha, India


---

## 6. Project Lead & Contact
**Amit Nishanka Bhuyan**  
Lead System Architect & AI Project Coordinator  
Salipur, Odisha, India  
*Connect on LinkedIn or open a GitHub Issue to collaborate.*
