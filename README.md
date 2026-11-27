
Part 1: Tata InnoVerse Challenge Submission (Copy-Paste Ready, Under 3,000 Words)


1. Project Title

AeroSense-CRM: Non-Contact Dual-Sensor (SWIR Optical + Capacitive Fringe-Field) & Sub-5ms Edge-AI Coolant Carryover Detection System for High-Speed Cold Rolling Mills

2. Detailed Project Summary & Problem Alignment


A. Industrial Challenge Context

In high-speed Cold Rolling Mills (CRM), cold-rolled steel strips undergo severe thickness reduction at line speeds reaching 1200 m/min (20 meters per second). Rolling emulsions (oil-in-water coolants) are continuously sprayed into the roll bite to provide thermal dissipation and boundary lubrication. Although high-velocity exit air knives are installed immediately downstream of the final stand to strip residual coolant, operational disturbances—such as partial nozzle clogging, header pressure fluctuations, emulsion viscosity shifts, or hydrodynamic edge pooling—frequently allow microscopic liquid films and droplets to bypass the air knives.
When residual coolant carries over onto downstream processes (continuous annealing, galvanizing, or organic coating lines), it causes severe surface contamination, oil-carbon burn marks, coating delamination, coil downgrading, and costly scrap. Currently, coolant carryover is typically discovered only during downstream or final surface inspection, after thousands of meters of strip have already been processed.

B. Core Technical Innovation (100% Non-Contact & Flatness-Safe)

To detect residual coolant reliably under continuous mill production without touching the strip or introducing pneumatic disturbances (which can cause strip fluttering or air-pocket distortion on thin gauges), AeroSense-CRM deploys an overhead, non-contact dual-sensor inspection bridge immediately downstream of the exit air knives:
1. Short-Wave Infrared (SWIR) Line-Scan Optical Sensing (1450 nm / 1940 nm):
	• Conventional RGB vision systems fail in CRM environments due to motion blur at 1200 m/min, dense steam/mist occlusion, and harsh specular glare from reflective cold-rolled steel.
	• Water and rolling emulsions exhibit strong optical absorption bands centered at 1450 nm and 1940 nm, whereas bare cold-rolled steel acts as a high-reflectance mirror. A high-speed SWIR line-scan sensor (>20 kHz line rate) penetrates ambient mill vapor and captures high-contrast moisture profiles across the entire strip width with zero motion blur.
2. Non-Contact Capacitive Fringe-Field Strip Array (7 Transverse Zones):
	• Mounted safely 12–15 mm above the passline across 7 transverse zones (with dedicated high-density coverage at the left and right strip edges where coolant pooling most commonly occurs).
	• Because water/rolling emulsion possesses a relative dielectric constant (\(\varepsilon_r \approx 80\)) dramatically higher than ambient air (\(\varepsilon_r \approx 1\)), any residual liquid film passing beneath the sensor array produces an instantaneous capacitance shift (measured in picofarads, pF). This generates an unmistakable, real-time oscilloscope/ECG-style signal spike even in dense steam conditions.
3. Sub-5ms Edge-AI Sensor Fusion & Coil-Mapping Engine:
	• An industrial fanless Edge-AI processor fuses both optical absorption and dielectric fringe-field streams in under 5 milliseconds (corresponding to < 10 cm of linear strip travel at 1200 m/min).
	• Dual-sensor cross-verification eliminates false alarms caused by ambient vapor or surface roughness variations, classifying strip condition into Dry, Micro-Mist Carryover, or Continuous Film Carryover mapped directly to exact coil length meter-marks.
4. Three-Tier Automated PLC & Level-2 MES Intervention Workflow:
	• Tier 1 – Green (Optimal Dry Strip): Confirms effective air-knife stripping; logs clean quality telemetry.
	• Tier 2 – Amber (Early Micro-Carryover Warning): Identifies localized moisture spikes (e.g., Zone 1 or Zone 7 edge pooling) and alerts pulpit operators to inspect or purge specific air-knife nozzles before defects escalate.
	• Tier 3 – Red (Critical Carryover Intervention): Automatically flags exact coil meter-marks in the Level-2 MES/Quality database and triggers immediate downstream line alerts before the affected coil enters annealing or coating lines.
# CRM Coolant Carryover Detection Simulator

A browser-based concept simulator for exploring residual coolant carryover on high-speed cold-rolling lines. It models seven-zone SWIR and capacitive telemetry with simulated air-knife responses.

**Tata InnoVerse context:** An independent concept demonstration, not an official Tata product or endorsement.

## Live demo

[Open the live interactive simulator](https://bhuyanamitnishanka-debug.github.io/CRM-Coolant-Carryover-Detection-Simulator/)

## Run locally

Requires [Bun](https://bun.sh/).

```sh
bun install --frozen-lockfile
bun run dev
```

Vite serves the app at `http://localhost:3000`. To build the site, run `bun run build`; `bun run lint` checks TypeScript.

## Limitations

Telemetry and Edge-AI/closed-loop values are illustrative local simulations, not live sensor readings or actual inference. The app does not connect to mill equipment, PLCs, or MES systems and is not a certified control system.
3. Proof-of-Concept (PoC) Execution Proposal (3-Step Exploded-to-Assembled Plan)


Phase 1: Live Digital Twin & Telemetry Validation (Completed – Ready for Review)

• Interactive Web Simulation: We have deployed a live, browser-accessible digital-twin prototype (https://github.io) demonstrating real-time strip speed scaling (200–1200 m/min), exit air-knife efficiency degradation, 7-zone transverse moisture heatmaps, ECG-style dual-sensor signal spikes, and automated PLC coil-defect logging.

Phase 2: Benchtop & Offline Strip-Rig Calibration (Weeks 1–3)

• Hardware Assembly: Assemble the single-line sensor bridge integrating the SWIR line-scan unit, 7-zone capacitive array, lens air-purge shield, and Edge-AI DAQ module.
• Calibration: Test controlled emulsion film thicknesses (1 µm to 50 µm) across cold-rolled steel test coupons on a high-speed rotary/linear test rig to lock detection thresholds.

Phase 3: Plant-Level Single-Stand Pilot Trial (Weeks 4–8)

• Non-Invasive Installation: Mount the modular bolt-on bridge onto the existing exit bridle/passline frame of one Cold Rolling Mill line during a scheduled roll-change maintenance window (zero unscheduled production downtime).
• Shadow-Mode & Live Alert Trial: Run parallel logging against downstream final inspection reports over 4 weeks to verify carryover detection accuracy (>98%), false-alarm rejection, and scrap reduction ROI.
• Multi-Line Scalability: Standard OPC-UA / Modbus-TCP interfaces and modular width brackets allow rapid replication across multiple CRM lines and sister plants.

4. Entire Physical PoC Cost Breakdown (Single Mill Line Pilot)

(Note: Digital twin simulation software is already live and free to evaluate. The budget below covers physical hardware fabrication, industrial sensors, and on-site pilot deployment for one Cold Rolling Mill line.)

Sr. No.	Component / Work Package	Technical Specification	Estimated Cost (INR ₹)
1	SWIR Line-Scan Optical Sensor & IR Illuminator	1450 nm / 1940 nm industrial high-speed line-scan unit (>20 kHz) with IP67 enclosure	₹4,50,000
2	Non-Contact Capacitive Fringe-Field Array (7-Zone)	High-sensitivity dielectric strip sensors with EMI shielding & signal conditioning	₹1,80,000
3	Industrial Edge-AI Compute Unit & High-Speed DAQ	Rugged fanless GPU/NPU edge box (<5 ms inference) + multi-channel ADC card	₹1,40,000
4	PLC Integration & SCADA/HMI Software Module	OPC-UA / Modbus-TCP driver, real-time waveform UI & Level-2 coil-mapping logger	₹95,000
5	Modular Mechanical Bridge & Lens Air-Purge Shield	Stainless steel bolt-on passline frame with positive-pressure optical air-wipe	₹85,000
6	On-Site Calibration, Commissioning & 4-Week Trial	Mill installation during scheduled roll-change, threshold tuning & validation report	₹1,00,000
	Total Estimated Physical PoC Cost	Complete Single-Line Pilot Deployment (Excluding Taxes)	₹10,50,000 (₹10.5 Lakhs)


Part 2: Official Contribution & Submission Letter (For Tata InnoVerse Portal / Email)

text
Subject: PoC Submission: AeroSense-CRM – Non-Contact SWIR + Capacitive Edge-AI Coolant Carryover Detection System

Dear Tata InnoVerse Evaluation Team,

I am pleased to submit our Proof-of-Concept (PoC) solution for the open innovation challenge: "Detection of Coolant Carryover from Mill."

In high-speed Cold Rolling Mills operating up to 1200 m/min, residual rolling emulsion bypassing exit air knives leads to downstream coating defects, rework, and coil scrap. To detect carryover reliably under continuous mill conditions without touching the steel strip or disturbing strip flatness with extra air pressure, we have engineered AeroSense-CRM—a 100% non-contact dual-sensor bridge combining Short-Wave Infrared (SWIR 1450/1940 nm) optical sensing with a 7-zone capacitive fringe-field array, driven by a sub-5ms Edge-AI inference engine.

To enable your technical panel to immediately test the system architecture, real-time telemetry waveforms, and automated PLC coil-marking workflow, we have deployed a live interactive digital-twin simulation:

- Live Interactive Simulation: https://bhuyanamitnishanka-debug.github.io/CRM-Coolant-Carryover-Detection-Simulator/
- Open-Innovation GitHub Repository: https://github.com/bhuyanamitnishanka-debug/CRM-Coolant-Carryover-Detection-Simulator

Our modular bolt-on architecture is built for rapid deployment across multiple rolling mill lines during routine roll-change windows, with an estimated single-line physical pilot PoC budget of INR 10.5 Lakhs. We are also actively collaborating with metallurgy and industrial automation engineers through our open repository to further refine mill-specific parameters.

Thank you for the opportunity to contribute to Tata InnoVerse. I look forward to your technical feedback and the opportunity to collaborate on a plant-level pilot trial.

Sincerely,

Amit Nishanka Bhuyan
Lead System Architect & AI Project Coordinator
Salipur, Odisha, India
Use code with caution.

