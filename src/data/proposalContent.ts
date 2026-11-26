export interface HotspotSpec {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  xPct: number;
  yPct: number;
  specs: string[];
  description: string;
}

export const CONCEPT_3D_HOTSPOTS: HotspotSpec[] = [
  {
    id: 'swir-bridge',
    number: '01',
    title: 'SWIR Line-Scan Optical Bridge',
    subtitle: '1450 nm & 1940 nm Water Absorption Bands',
    xPct: 41,
    yPct: 33,
    specs: ['> 20 kHz line-scan rate', '15 mm non-contact standoff', 'Positive-pressure dry air purge curtain'],
    description:
      'Captures high-contrast transverse moisture profiles across the reflective steel strip without motion blur at 1200 m/min and penetrates ambient rolling mist.',
  },
  {
    id: 'capacitive-array',
    number: '02',
    title: 'Capacitive Fringe-Field Sensor Array',
    subtitle: '7-Zone Dielectric Contrast (εr ≈ 80 vs εr ≈ 1)',
    xPct: 43,
    yPct: 47,
    specs: ['12–15 mm overhead clearance', 'Differential flutter compensation', 'Zero-maintenance vapor backup'],
    description:
      'Monitors dielectric shift across 7 transverse strip zones, providing rugged backup detection in dense steam and eliminating false triggers from vertical strip flutter.',
  },
  {
    id: 'air-knife',
    number: '03',
    title: '7-Zone Coanda Exit Air-Knife Manifold',
    subtitle: 'Closed-Loop Proportional Piezo Servo Valves',
    xPct: 62,
    yPct: 50,
    specs: ['< 3 ms proportional piezo actuation', 'Coanda micro-wipes + edge-dam shields', 'Up to 34% compressed air savings'],
    description:
      'Divides exit air wiping into 7 independent pneumatic zones so wet edges receive instant pressure boosts while dry center zones avoid excess compressed air waste.',
  },
  {
    id: 'edge-ai-plc',
    number: '04',
    title: 'Sub-5ms Edge-AI & Level-2 MES Cabinet',
    subtitle: 'OPC-UA / Modbus-TCP Industrial Interface',
    xPct: 83,
    yPct: 37,
    specs: ['< 5.0 ms sensor fusion latency', '< 10 cm strip travel window at 20 m/s', '3-tier PLC & downstream line alerting'],
    description:
      'Fuses SWIR optical absorption and capacitive dielectric shift in under 5 ms to trigger pneumatic boosts and log exact meter-marks before downstream annealing or coating.',
  },
];

export const ENGINEERING_CHECKPOINTS = [
  {
    title: 'Passline Flutter & Vibration Compensation',
    challenge: 'At 1200 m/min, vertical strip flutter alters raw capacitive gap readings.',
    mitigation:
      'Differential dual-channel capacitive compensation separates strip height oscillation from true liquid film thickness.',
  },
  {
    title: 'SWIR Optical Window Fouling Prevention',
    challenge: 'Rolling mill mist and oil aerosol gradually coat exposed optical lenses.',
    mitigation:
      'Positive-pressure dry air purge curtain continuously shields the SWIR sensor windows from aerosol deposition.',
  },
  {
    title: 'High-Speed Pneumatic Valve Actuation',
    challenge: 'Standard solenoid valves require 15–30 ms to actuate, lagging behind 20 m/s strip travel.',
    mitigation:
      'Proportional piezo/servo pneumatic valves actuate in <3 ms to match the <5 ms Edge-AI closed-loop trigger.',
  },
];

export const PROPOSAL_ESSAYS = {
  en: {
    label: 'English',
    heading: 'Non-Contact Dual-Sensor & Edge-AI Coolant Carryover Control',
    body: 'In modern high-speed Cold Rolling Mills, steel strips travel at speeds reaching 1200 meters per minute while rolling emulsions cool and lubricate the work rolls. When exit air knives fail to completely strip away this coolant, microscopic liquid films travel downstream into annealing and coating lines, causing severe surface defects and costly coil rejections. Traditional optical cameras struggle in this harsh environment because high strip speeds cause motion blur, steam blocks visibility, and polished steel reflects harsh glare. Our non-contact solution solves this bottleneck by combining Short-Wave Infrared (SWIR) spectroscopy at water-absorbing wavelengths (1450 nm and 1940 nm) with a non-contact capacitive dielectric sensor array positioned safely above the passline. Processed by an Edge-AI controller in under 5 milliseconds, this dual-sensor architecture accurately detects coolant carryover across the entire strip width without touching the steel or disturbing strip flatness, enabling immediate preventive action and zero downstream scrap.',
  },
  hi: {
    label: 'हिन्दी (Hindi)',
    heading: 'हाई-स्पीड कोल्ड रोलिंग मिलों के लिए नॉन-कॉन्टैक्ट कूलेंट नियंत्रण प्रणाली',
    body: 'आधुनिक हाई-स्पीड कोल्ड रोलिंग मिलों में स्टील की पट्टियां 1200 मीटर प्रति मिनट की तेज़ रफ़्तार से चलती हैं, जहाँ रोलर्स को ठंडा और चिकना रखने के लिए कूलेंट (इमल्शन) का उपयोग किया जाता है। जब एग्जिट एयर-नाइफ इस कूलेंट को पूरी तरह साफ नहीं पाते, तो बचा हुआ तरल आगे की कोटिंग और फिनिशिंग लाइनों में जाकर स्टील की सतह को खराब कर देता है, जिससे भारी आर्थिक नुकसान और स्क्रैप होता है। सामान्य कैमरे तेज़ रफ़्तार, भाप (धुंध) और स्टील की चमक के कारण इसे सही से नहीं पकड़ पाते। हमारा यह \'नॉन-कॉन्टैक्ट\' समाधान स्टील की पट्टी को बिना छुए, पासलाइन के ठीक ऊपर लगे शॉर्ट-वेव इन्फ्रारेड (SWIR - 1450 nm / 1940 nm) सेंसर और कैपेसिटिव डाइइलेक्ट्रिक सेंसर एरे को जोड़ता है। एज-AI (Edge-AI) प्रोसेसर 5 मिलीसेकंड से भी कम समय में कूलेंट की नमी को पहचानकर तुरंत ऑपरेटर और PLC सिस्टम को अलर्ट भेजता है, जिससे स्टील की गुणवत्ता सुरक्षित रहती है और बर्बादी पूरी तरह रुक जाती है।',
  },
  or: {
    label: 'ଓଡ଼ିଆ (Odia)',
    heading: 'ହାଇ-ସ୍ପିଡ୍ କୋଲ୍ଡ ରୋଲିଂ ମିଲ୍ ପାଇଁ ନନ୍-କଣ୍ଟାକ୍ଟ କୁଲାଣ୍ଟ ନିୟନ୍ତ୍ରଣ ପ୍ରଣାଳୀ',
    body: 'ଆଧୁନିକ ହାଇ-ସ୍ପିଡ୍ କୋଲ୍ଡ ରୋଲିଂ ମିଲଗୁଡ଼ିକରେ ଷ୍ଟିଲ୍ ସିଟ୍ ମିନିଟ୍ ପ୍ରତି ୧୨୦୦ ମିଟର ବେଗରେ ଗତି କରିଥାଏ, ଯେଉଁଠାରେ ରୋଲରଗୁଡ଼ିକୁ ଥଣ୍ଡା ଓ ଚିକ୍କଣ ରଖିବା ପାଇଁ କୁଲାଣ୍ଟ (Coolant) ବ୍ୟବହାର କରାଯାଏ। ଯେତେବେଳେ ଏଗଜିଟ୍ ଏୟାର-ନାଇଫ୍ ଏହି କୁଲାଣ୍ଟକୁ ସମ୍ପୂର୍ଣ୍ଣ ସଫା କରିପାରେ ନାହିଁ, ସେତେବେଳେ ବଳକା ତରଳ ପଦାର୍ଥ ପରବର୍ତ୍ତୀ କୋଟିଂ ଓ ଫିନିସିଂ ପ୍ରକ୍ରିୟାକୁ ଯାଇ ଷ୍ଟିଲର ଉପରିଭାଗକୁ ନଷ୍ଟ କରିଦିଏ, ଯାହାଫଳରେ ବ୍ୟାପକ କ୍ଷତି ଓ ସ୍କ୍ରାପ୍ ସୃଷ୍ଟି ହୁଏ। ଅତ୍ୟଧିକ ବେଗ, ବାଷ୍ପ (ଧୂଆଁ) ଏବଂ ଷ୍ଟିଲର ଚମକ ଯୋଗୁଁ ସାଧାରଣ କ୍ୟାମେରା ଏହାକୁ ଠିକ୍ ଭାବରେ ଚିହ୍ନଟ କରିପାରେ ନାହିଁ। ଆମର ଏହି \'ନନ୍-କଣ୍ଟାକ୍ଟ\' (Non-Contact) ସମାଧାନ ଷ୍ଟିଲ୍ ସିଟକୁ ନ ଛୁଇଁ, ପାସଲାଇନ୍ ଉପରେ ଲାଗିଥିବା ସର୍ଟ-ୱେଭ୍ ଇନଫ୍ରାରେଡ୍ (SWIR - 1450 nm / 1940 nm) ସେନ୍ସର ଏବଂ କ୍ୟାପାସିଟିଭ୍ ଡାଇଇଲେକ୍ଟ୍ରିକ୍ ସେନ୍ସର ଆରେକୁ ଏକାଠି ବ୍ୟବହାର କରେ। ଏଜ୍-AI (Edge-AI) ସିଷ୍ଟମ୍ ୫ ମିଲିସେକେଣ୍ଡରୁ କମ୍ ସମୟ ମଧ୍ୟରେ କୁଲାଣ୍ଟର ଉପସ୍ଥିତିକୁ ଚିହ୍ନଟ କରି ତୁରନ୍ତ ଅପରେଟର ଏବଂ PLC କୁ ସତର୍କ ସୂଚନା ଦିଏ, ଯାହାଦ୍ୱାରା ଉତ୍ପାଦର ଗୁଣବତ୍ତା ବଜାୟ ରହେ ଏବଂ କ୍ଷତି ରୋକାଯାଇପାରେ।',
  },
};

export const ARCHITECTURE_MODULES = [
  {
    index: '01',
    title: 'SWIR Line-Scan Optical Bridge (1450 nm / 1940 nm)',
    detail:
      'Water and oil-in-water rolling emulsions exhibit strong optical absorption at 1450 nm and 1940 nm against high-reflectance cold-rolled steel. Scanning above 20 kHz eliminates motion blur at 1200 m/min and cuts through dense rolling mist.',
  },
  {
    index: '02',
    title: 'Non-Contact Capacitive Fringe-Field Sensor Array',
    detail:
      'Suspended 12–15 mm above the passline across 7 transverse zones. Exploits the 80:1 dielectric contrast between rolling emulsion (εr ≈ 80) and ambient air (εr ≈ 1) with differential flutter offset correction.',
  },
  {
    index: '03',
    title: 'Sub-5ms Edge-AI Inference & Coil-Mapping Engine',
    detail:
      'Fuses SWIR optical absorption and capacitive dielectric shift in under 5 ms—under 10 cm of strip travel at 20 m/s—classifying Dry, Micro-Mist, and Film Carryover mapped to exact coil meter-marks.',
  },
  {
    index: '04',
    title: 'Three-Tier Automated PLC Alert & Closed-Loop Mitigation',
    detail:
      'Triggers <3 ms proportional piezo boosts across 7 Coanda air-knife zones, logs meter-marks to Level-2 MES, and alerts downstream annealing/coating lines before scrap accumulates.',
  },
];
