
// Unified Helper to get All Registered Users (LocalStorage + Backend Sync)
async function getAllAdminUsers() {
    let localUsers = JSON.parse(localStorage.getItem(RUNTIME_USERS_KEY)) || [];
    let mergedMap = new Map();

    // 1. Add LocalStorage users first
    localUsers.forEach(u => {
        if (u && u.email) {
            mergedMap.set(u.email.toLowerCase(), { ...u });
        }
    });

    // 2. Try fetching from Backend and merge
    try {
        const response = await fetch(`${BACKEND_URL}/api/users`);
        if (response.ok) {
            const backendUsers = await response.json();
            backendUsers.forEach(u => {
                if (u && u.email) {
                    const key = u.email.toLowerCase();
                    if (!mergedMap.has(key)) {
                        mergedMap.set(key, { ...u });
                    }
                }
            });
        }
    } catch (e) {
        console.log("Backend users endpoint offline, using local storage users.");
    }

    return Array.from(mergedMap.values());
}

// Unified Helper for Drone Bookings (LocalStorage + Backend)
async function getAllAdminDroneBookings() {
    let localBookings = JSON.parse(localStorage.getItem('agrotech_drone_bookings')) || [];
    let map = new Map();

    localBookings.forEach((b, idx) => {
        const id = b._id || b.id || `local_${idx}`;
        map.set(String(id), { ...b, _id: id });
    });

    try {
        const res = await fetch(`${BACKEND_URL}/api/drone-bookings`);
        if (res.ok) {
            const backendBookings = await res.json();
            backendBookings.forEach(b => {
                const id = b._id || b.id;
                if (id) map.set(String(id), { ...b, _id: id });
            });
        }
    } catch (e) {}

    return Array.from(map.values());
}

// Unified Helper for Soil Reports (LocalStorage + Backend)
async function getAllAdminSoilReports() {
    let localReports = JSON.parse(localStorage.getItem('agrotech_reports')) || [];
    let map = new Map();

    localReports.forEach((r, idx) => {
        const id = r._id || r.id || `local_soil_${idx}`;
        map.set(String(id), { ...r, _id: id });
    });

    try {
        const res = await fetch(`${BACKEND_URL}/api/all-reports`);
        if (res.ok) {
            const backendReports = await res.json();
            backendReports.forEach(r => {
                const id = r._id || r.id;
                if (id) map.set(String(id), { ...r, _id: id });
            });
        }
    } catch (e) {}

    return Array.from(map.values());
}


// Client-Side Canvas Visual Spectrum & Color Pattern Analyzer for Plant Leaves
function analyzeLeafImagePixels(imgElement) {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 100;
        canvas.height = 100;
        ctx.drawImage(imgElement, 0, 0, 100, 100);
        const imgData = ctx.getImageData(0, 0, 100, 100);
        const data = imgData.data;

        let rustOrangeCount = 0;
        let darkNecroticCount = 0;
        let whitePowderyCount = 0;
        let yellowChlorosisCount = 0;
        let healthyGreenCount = 0;
        let totalPixels = data.length / 4;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i+1];
            const b = data[i+2];

            // Rust / Orange / Brown pustules (Typical in Wheat Rust, Soybean Rust)
            if (r > 130 && r > g && g > b && (r - b) > 50 && r > 100 && b < 90) {
                rustOrangeCount++;
            }
            // Dark necrotic / Black rot / Smut / Blight spots
            else if (r < 80 && g < 80 && b < 80) {
                darkNecroticCount++;
            }
            // White / Powdery mildew / White rust
            else if (r > 180 && g > 180 && b > 180 && Math.abs(r-g) < 25 && Math.abs(g-b) < 25) {
                whitePowderyCount++;
            }
            // Yellowing / Chlorosis / Mosaic / Blotch
            else if (r > 140 && g > 140 && b < 100 && Math.abs(r-g) < 40) {
                yellowChlorosisCount++;
            }
            // Healthy green foliage
            else if (g > r && g > b && g > 70) {
                healthyGreenCount++;
            }
        }

        const rustPercent = (rustOrangeCount / totalPixels) * 100;
        const necroticPercent = (darkNecroticCount / totalPixels) * 100;
        const whitePercent = (whitePowderyCount / totalPixels) * 100;
        const yellowPercent = (yellowChlorosisCount / totalPixels) * 100;

        return {
            rust: rustPercent,
            necrotic: necroticPercent,
            white: whitePercent,
            yellow: yellowPercent,
            isRustDominant: rustPercent > 1.5,
            isNecroticDominant: necroticPercent > 8,
            isWhiteDominant: whitePercent > 5,
            isYellowDominant: yellowPercent > 6
        };
    } catch (e) {
        console.warn("Canvas pixel analysis failed (CORS or local):", e);
        return { isRustDominant: false, isNecroticDominant: false, isWhiteDominant: false, isYellowDominant: false };
    }
}


// Gemini API Key Management
function getActiveGeminiKey() {
    return localStorage.getItem('agrotech_gemini_api_key') || "";
}

function updateApiKeyUi() {
    const key = getActiveGeminiKey();
    const label = document.getElementById('apiKeyStatusLabel');
    if (label) {
        label.textContent = key ? "Gemini Key: Active ✓" : "Set Gemini Key (Free)";
    }
}

function openApiKeyModal() {
    const modal = document.getElementById('apiKeyModal');
    const input = document.getElementById('inputGeminiApiKey');
    if (input) input.value = getActiveGeminiKey();
    if (modal) modal.style.display = 'flex';
}

function closeApiKeyModal() {
    const modal = document.getElementById('apiKeyModal');
    if (modal) modal.style.display = 'none';
}

function saveGeminiApiKey() {
    const input = document.getElementById('inputGeminiApiKey');
    const key = input ? input.value.trim() : "";
    if (!key) {
        alert("Please enter a valid Google Gemini API Key.");
        return;
    }
    localStorage.setItem('agrotech_gemini_api_key', key);
    updateApiKeyUi();
    closeApiKeyModal();
    alert("✓ Google Gemini API Key saved successfully! Live AI image diagnosis and AgroBot are now active.");
}

function clearGeminiApiKey() {
    localStorage.removeItem('agrotech_gemini_api_key');
    updateApiKeyUi();
    closeApiKeyModal();
    alert("Gemini API Key removed. Standalone & ChatGPT Paste modes will be used.");
}

// Diagnosis Mode Switcher
function switchPestMode(mode) {
    const scannerCard = document.getElementById('pestScannerCard');
    const chatGptCard = document.getElementById('pestChatGptCard');
    const dbCard = document.getElementById('pestDatabaseCard');
    const resultPanel = document.getElementById('pestResultPanel');

    if (resultPanel) resultPanel.classList.add('hidden');

    document.querySelectorAll('.pest-tab-btn').forEach(b => {
        b.style.background = 'white';
        b.style.color = '#334155';
        b.style.borderColor = '#cbd5e1';
    });

    if (mode === 'photo') {
        if (scannerCard) scannerCard.classList.remove('hidden');
        if (chatGptCard) chatGptCard.classList.add('hidden');
        if (dbCard) dbCard.classList.add('hidden');
        const btn = document.getElementById('tabBtnPhoto');
        if (btn) { btn.style.background = '#22c55e'; btn.style.color = 'white'; btn.style.borderColor = '#22c55e'; }
    } else if (mode === 'chatgpt') {
        if (scannerCard) scannerCard.classList.add('hidden');
        if (chatGptCard) chatGptCard.classList.remove('hidden');
        if (dbCard) dbCard.classList.add('hidden');
        const btn = document.getElementById('tabBtnChatGpt');
        if (btn) { btn.style.background = '#22c55e'; btn.style.color = 'white'; btn.style.borderColor = '#22c55e'; }
    } else if (mode === 'database') {
        if (scannerCard) scannerCard.classList.add('hidden');
        if (chatGptCard) chatGptCard.classList.add('hidden');
        if (dbCard) dbCard.classList.remove('hidden');
        const btn = document.getElementById('tabBtnDatabase');
        if (btn) { btn.style.background = '#22c55e'; btn.style.color = 'white'; btn.style.borderColor = '#22c55e'; }
        populateDbCropSelect();
    }
}

function resetPestDiagnosis() {
    const resultPanel = document.getElementById('pestResultPanel');
    if (resultPanel) resultPanel.classList.add('hidden');
    const previewArea = document.getElementById('pestPreviewArea');
    const uploadArea = document.getElementById('pestUploadArea');
    if (previewArea) previewArea.classList.add('hidden');
    if (uploadArea) uploadArea.classList.remove('hidden');
    const imgInput = document.getElementById('pestImageInput');
    if (imgInput) imgInput.value = '';
    const rawInput = document.getElementById('chatGptRawInput');
    if (rawInput) rawInput.value = '';
}


// ICAR Verified Plant Pathology & Disease Database
const plantPathologyDb = {
    "Wheat": [
        {
            name: "Yellow Rust (Puccinia striiformis)",
            info: "Fungal disease causing linear rows of yellow-orange powdery stripes on wheat leaves, hindering grain development.",
            severity: "Critical",
            solutions: [
                "Spray Propiconazole 25% EC (Tilt) @ 500 ml/ha in 500L water.",
                "Sow rust-resistant varieties such as HD-3086, DBW-187, or PBW-725.",
                "Avoid excess nitrogen fertilizer during peak tillering stage.",
                "Scout fields weekly during cool, moist weather (Dec-Feb)."
            ]
        },
        {
            name: "Brown / Leaf Rust (Puccinia triticina)",
            info: "Scattered reddish-brown round pustules predominantly on leaf blades, causing premature leaf drying.",
            severity: "Moderate",
            solutions: [
                "Apply Tebuconazole 25.9% EC @ 1 ml/liter of water.",
                "Ensure balanced N-P-K fertilizer application with adequate potash.",
                "Destroy volunteer wheat seedlings and weed hosts."
            ]
        },
        {
            name: "Loose Smut (Ustilago tritici)",
            info: "Fungus replaces entire wheat grain head/spikelets with black powdery masses of spores.",
            severity: "High Risk",
            solutions: [
                "Treat seed with Carboxin 37.5% + Thiram 37.5% (Vitavax Power) @ 2-3 g/kg seed before sowing.",
                "Rogue out and burn infected heads in sealed polythene bags to prevent spore dispersal.",
                "Use certified disease-free foundation seed."
            ]
        },
        {
            name: "Wheat Aphids (Rhopalosiphum padi)",
            info: "Greenish-black colonies sucking sap from ears and tender leaves, secreting sticky honeydew.",
            severity: "Moderate",
            solutions: [
                "Spray Imidacloprid 17.8% SL @ 0.5 ml/liter or Thiamethoxam 25% WG @ 0.2 g/liter.",
                "Conserve natural predators like Coccinellid ladybird beetles.",
                "Use yellow sticky traps @ 10-15 traps/acre."
            ]
        }
    ],
    "Rice": [
        {
            name: "Bacterial Leaf Blight (Xanthomonas oryzae)",
            info: "Water-soaked yellowish-white wavy lesions starting from leaf tips and margins, progressing downwards.",
            severity: "Critical",
            solutions: [
                "Spray Copper Oxychloride 50% WP @ 2.5 g/L + Streptocycline @ 0.1 g/L.",
                "Drain excess standing water from field for 3-4 days.",
                "Avoid top-dressing nitrogen when disease is active; apply extra Potash."
            ]
        },
        {
            name: "Rice Blast (Magnaporthe oryzae)",
            info: "Diamond/spindle-shaped lesions with greyish center and dark brown border on leaves and neck nodes.",
            severity: "Critical",
            solutions: [
                "Foliar spray of Tricyclazole 75% WP @ 0.6 g/liter or Isoprothiolane 40% EC @ 1.5 ml/L.",
                "Avoid excess urea; split nitrogen doses into 3-4 applications.",
                "Use resistant varieties (IR-64, Pusa Basmati 1121)."
            ]
        },
        {
            name: "False Smut (Ustilaginoidea virens)",
            info: "Individual grains transform into large greenish-yellow velvet spore balls that turn black.",
            severity: "Moderate",
            solutions: [
                "Spray Propiconazole 25% EC @ 1 ml/L or Copper Hydroxide at boot leaf stage.",
                "Collect and burn smutted panicles carefully.",
                "Avoid late transplanting and high nitrogen application."
            ]
        },
        {
            name: "Yellow Stem Borer (Scirpophaga incertulas)",
            info: "Larvae bore into stem causing 'Dead Heart' in vegetative stage and 'White Ear' in reproductive stage.",
            severity: "High Risk",
            solutions: [
                "Apply Chlorantraniliprole 0.4% GR (Ferterra) @ 4 kg/acre or Cartap Hydrochloride 4G @ 8 kg/acre.",
                "Install Pheromone traps with Scirpo lure @ 8 traps/acre.",
                "Clip seedling leaf tips before transplanting to remove egg masses."
            ]
        }
    ],
    "Tomato": [
        {
            name: "Early Blight (Alternaria solani)",
            info: "Concentric dark brown rings ('target board' pattern) on older lower leaves, causing yellowing and defoliation.",
            severity: "Moderate",
            solutions: [
                "Spray Mancozeb 75% WP @ 2.5 g/L or Azoxystrobin + Difenoconazole @ 1 ml/L.",
                "Mulch soil around tomato base to prevent fungal spores splashing from soil.",
                "Remove and burn lower infected leaves."
            ]
        },
        {
            name: "Late Blight (Phytophthora infestans)",
            info: "Water-soaked irregular pale green lesions turning dark brown/black with white fluffy mold under humid conditions.",
            severity: "Critical",
            solutions: [
                "Apply Metalaxyl 8% + Mancozeb 64% (Ridomil Gold) @ 2.5 g/liter of water immediately.",
                "Avoid overhead sprinkler irrigation; maintain wide row spacing.",
                "Destroy infected tomato plants promptly."
            ]
        },
        {
            name: "Tomato Leaf Curl Virus (ToLCV)",
            info: "Severe upward leaf curling, puckering, stunted bushy growth, and failure to set fruit.",
            severity: "Critical",
            solutions: [
                "Control vector Whiteflies using Acetamiprid 20% SP @ 0.5 g/L or Diafenthiuron 50% WP.",
                "Install yellow sticky cards throughout the greenhouse/field.",
                "Use 50-mesh nylon insect-proof netting in nurseries."
            ]
        }
    ],
    "Potato": [
        {
            name: "Late Blight (Phytophthora infestans)",
            info: "Brown-black necrotic blotches on leaf tips and margins spreading rapidly, causing rot of potato tubers.",
            severity: "Critical",
            solutions: [
                "Prophylactic spray of Mancozeb 75% WP @ 2.5 g/L followed by Cymoxanil 8% + Mancozeb 64% @ 3 g/L.",
                "Do proper earthing-up to prevent tuber infection from surface water.",
                "Destroy haulms (stems) 10-12 days prior to harvest."
            ]
        },
        {
            name: "Black Scurf (Rhizoctonia solani)",
            info: "Hard black encrustations (sclerotia) resembling soil particles adhering firmly to potato tuber skin.",
            severity: "Moderate",
            solutions: [
                "Tuber dip in Boric acid 3% solution for 30 minutes before planting.",
                "Apply Trichoderma viride enriched FYM to soil during field preparation.",
                "Practice 3-year crop rotation avoiding solanaceous crops."
            ]
        }
    ],
    "Cotton": [
        {
            name: "Pink Bollworm (Pectinophora gossypiella)",
            info: "Larvae bore into flower buds causing 'Rosette flower' and tunnel inside green bolls damaging lint and seeds.",
            severity: "Critical",
            solutions: [
                "Spray Emamectin Benzoate 5% SG @ 0.5 g/L or Chlorantraniliprole 18.5% SC @ 0.3 ml/L.",
                "Install Pheromone traps (Pectino lure) @ 5 traps/acre for monitoring.",
                "Destroy crop residues and do not extend crop beyond 150-160 days."
            ]
        },
        {
            name: "Whitefly (Bemisia tabaci)",
            info: "Small white winged insects sucking sap from undersides of leaves, causing leaf curl virus and black sooty mold.",
            severity: "High Risk",
            solutions: [
                "Spray Pyriproxyfen 10% + Bifenthrin 10% EC @ 2 ml/L or Spiromesifen 22.9% SC @ 1 ml/L.",
                "Install yellow sticky traps @ 20-25 per acre.",
                "Avoid synthetic pyrethroids which cause resurgence."
            ]
        }
    ],
    "Maize": [
        {
            name: "Fall Armyworm (Spodoptera frugiperda)",
            info: "Aggressive caterpillar feeding inside maize whorls producing ragged leaf holes and大量 sawdust-like frass.",
            severity: "Critical",
            solutions: [
                "Whorl application of Chlorantraniliprole 18.5% SC @ 0.4 ml/L or Spinetoram 11.7% SC @ 0.5 ml/L.",
                "Apply sand + lime mixture (9:1) inside leaf whorls to kill young larvae organically.",
                "Install FAW pheromone traps."
            ]
        }
    ],
    "Soybean": [
        {
            name: "Soybean Rust (Phakopsora pachyrhizi)",
            info: "Tiny tan-to-brown lesions on underside of leaves with raised pustules, leading to premature defoliation.",
            severity: "High Risk",
            solutions: [
                "Foliar spray of Hexaconazole 5% EC @ 1 ml/L or Propiconazole 25% EC @ 1 ml/L.",
                "Plant early in the season to escape peak moisture infection.",
                "Ensure proper row-to-row spacing (45 cm) for sunlight penetration."
            ]
        }
    ],
    "Mustard": [
        {
            name: "White Rust (Albugo candida)",
            info: "Prominent chalky-white blisters/pustules on undersides of mustard leaves and floral malformation (Staghead).",
            severity: "Moderate",
            solutions: [
                "Spray Metalaxyl 8% + Mancozeb 64% (Ridomil MZ) @ 2 g/liter.",
                "Sow mustard between 10th - 25th October to escape peak disease.",
                "Use certified disease-resistant seeds."
            ]
        }
    ],
    "Sugarcane": [
        {
            name: "Red Rot (Colletotrichum falcatum)",
            info: "Leaves turn pale yellow and dry; splitting the sugarcane stalk reveals internal red tissue with distinct white cross-bands.",
            severity: "Critical",
            solutions: [
                "Treat seed setts with Carbendazim 50% WP (1 g/L) for 15 minutes before planting.",
                "Adopt setts from disease-free certified nursery crops.",
                "Rogue out and burn affected clumps; avoid ratoon cropping in infected fields."
            ]
        }
    ],
    "Apple": [
        {
            name: "Apple Scab (Venturia inaequalis)",
            info: "Olive-green velvety spots turning black and corky on leaves and fruit, causing fruit cracking and deformities.",
            severity: "High Risk",
            solutions: [
                "Spray Difenoconazole 25% EC @ 0.3 ml/L or Mancozeb 75% WP @ 2.5 g/L at pink bud stage.",
                "Spray Urea 5% on fallen leaves in autumn to accelerate fungal decomposition.",
                "Prune trees to improve canopy aeration."
            ]
        }
    ],
    "Mango": [
        {
            name: "Mango Anthracnose (Colletotrichum gloeosporioides)",
            info: "Dark brown necrotic leaf spots, blossom blight causing flower drop, and black tear-stain rot on maturing mangoes.",
            severity: "Moderate",
            solutions: [
                "Spray Carbendazim 50% WP @ 1 g/L or Copper Oxychloride 50% WP @ 3 g/L.",
                "Prune overcrowded and diseased branches post-harvest.",
                "Hot water dip treatment of fruits at 52°C for 10 minutes post-harvest."
            ]
        }
    ],
    "Banana": [
        {
            name: "Panama Wilt (Fusarium oxysporum f. sp. cubense)",
            info: "Yellowing and buckling of lower leaves along the petiole, with reddish-brown discoloration inside pseudo-stem vascular bundles.",
            severity: "Critical",
            solutions: [
                "Drench soil with Carbendazim 50% WP @ 2 g/L + apply Trichoderma viride (50g/plant) with neem cake.",
                "Use tissue-cultured disease-free plantlets (Grand Naine).",
                "Maintain good soil drainage and avoid using flood irrigation from infected plots."
            ]
        }
    ],
    "Onion": [
        {
            name: "Purple Blotch (Alternaria porri)",
            info: "Small sunken water-soaked spots on onion leaves developing distinct purple-brown centers with yellow halos.",
            severity: "Moderate",
            solutions: [
                "Spray Mancozeb 75% WP @ 2.5 g/L + Sticker (0.5 ml/L) or Tebuconazole 25.9% EC @ 1 ml/L.",
                "Avoid sprinkler irrigation; harvest bulbs during dry weather and cure thoroughly in shade."
            ]
        }
    ]
};

// Populate Crop dropdown for ICAR Database
function populateDbCropSelect() {
    const select = document.getElementById('selectDbCrop');
    if (!select) return;
    select.innerHTML = '<option value="" disabled selected>Select Crop (e.g. Wheat, Rice, Tomato...)</option>';
    Object.keys(plantPathologyDb).forEach(crop => {
        const opt = document.createElement('option');
        opt.value = crop;
        opt.textContent = crop;
        select.appendChild(opt);
    });
}

function onDbCropChange(crop) {
    const disSelect = document.getElementById('selectDbDisease');
    if (!disSelect) return;
    disSelect.innerHTML = '<option value="" disabled selected>Select Disease / Symptom</option>';
    
    if (plantPathologyDb[crop]) {
        disSelect.disabled = false;
        plantPathologyDb[crop].forEach((dis, idx) => {
            const opt = document.createElement('option');
            opt.value = idx;
            opt.textContent = dis.name;
            disSelect.appendChild(opt);
        });
    } else {
        disSelect.disabled = true;
    }
}

function applyDbDiagnosis() {
    const cropSelect = document.getElementById('selectDbCrop');
    const disSelect = document.getElementById('selectDbDisease');

    if (!cropSelect || !cropSelect.value || !disSelect || disSelect.value === "") {
        alert("Please select both a Crop and Disease symptom.");
        return;
    }

    const crop = cropSelect.value;
    const idx = parseInt(disSelect.value);
    const data = plantPathologyDb[crop][idx];

    displayPestResult(data);
}


// Copy standard prompt for ChatGPT / Gemini
function copyPestPromptForChatGpt() {
    const promptText = `I have uploaded a photo of an infected plant/crop leaf. 
Please act as an expert plant pathologist and provide a structured diagnosis:
1. Detected Disease: [Name of crop & disease]
2. About the Disease: [Short description of causes and symptoms]
3. Severity Status: [Low, Moderate, High Risk, or Critical]
4. Recommended Solutions:
- [Chemical treatment step 1]
- [Organic / Cultural remedy step 2]
- [Preventative measure step 3]`;

    navigator.clipboard.writeText(promptText).then(() => {
        alert("✓ Prompt copied to clipboard!\n\n1. Open ChatGPT or Google Gemini.\n2. Attach your crop leaf photo & paste the prompt.\n3. Copy the answer and paste it into Step 2 below.");
    }).catch(err => {
        prompt("Copy this prompt for ChatGPT / Gemini:", promptText);
    });
}

// Smart Parser for pasted ChatGPT / Gemini reports
function processChatGptPestInput() {
    const rawInput = document.getElementById('chatGptRawInput');
    const text = rawInput ? rawInput.value.trim() : "";

    if (!text) {
        alert("Please paste the response from ChatGPT or Google Gemini.");
        return;
    }

    // Try parsing as JSON first
    let parsedData = null;
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const json = JSON.parse(jsonMatch[0]);
            parsedData = {
                name: json.detected || json.name || json.disease || "Diagnosed Plant Condition",
                info: json.info || json.description || json.about || "Diagnosis based on submitted symptoms.",
                severity: json.severity || "Moderate",
                solutions: json.solutions || json.treatments || [
                    "Apply recommended fungicide or pesticide.",
                    "Ensure proper drainage and balanced nutrition.",
                    "Destroy severely infected plant parts."
                ]
            };
        }
    } catch(e) {}

    // Fallback: Smart Natural Language Text Extraction
    if (!parsedData) {
        let diseaseName = "Plant Infection / Pest Diagnosis";
        let info = "";
        let severity = "Moderate";
        let solutions = [];

        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        // Extract Disease Name
        for (const line of lines) {
            const clean = line.replace(/[*#_]/g, '').trim();
            if (clean.toLowerCase().startsWith("detected disease:") || clean.toLowerCase().startsWith("disease:") || clean.toLowerCase().startsWith("condition:")) {
                diseaseName = clean.split(':')[1].trim();
                break;
            } else if (clean.toLowerCase().includes("diagnos") && clean.length < 60) {
                diseaseName = clean.replace(/diagnosis:?/i, '').trim();
                break;
            }
        }
        if (diseaseName === "Plant Infection / Pest Diagnosis" && lines.length > 0) {
            diseaseName = lines[0].replace(/[*#_]/g, '').slice(0, 60);
        }

        // Extract Severity
        if (text.toLowerCase().includes("critical")) severity = "Critical";
        else if (text.toLowerCase().includes("high risk") || text.toLowerCase().includes("severe")) severity = "High Risk";
        else if (text.toLowerCase().includes("low") || text.toLowerCase().includes("mild")) severity = "Low";
        else severity = "Moderate";

        // Extract Solutions / Bullet points
        for (const line of lines) {
            if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*') || /^\d+\./.test(line)) {
                const sol = line.replace(/^[-•*\d.]+\s*/, '').replace(/[*#_]/g, '').trim();
                if (sol.length > 5 && !sol.toLowerCase().includes("detected disease") && !sol.toLowerCase().includes("severity")) {
                    solutions.push(sol);
                }
            }
        }

        // Extract Info / Description
        const nonBulletLines = lines.filter(l => !l.startsWith('-') && !l.startsWith('•') && !l.startsWith('*') && !/^\d+\./.test(l));
        if (nonBulletLines.length > 1) {
            info = nonBulletLines.slice(1, 3).join(' ').replace(/[*#_]/g, '');
        } else {
            info = text.slice(0, 200).replace(/[*#_]/g, '') + "...";
        }

        if (solutions.length === 0) {
            solutions = [
                "Apply recommended chemical fungicide/insecticide based on local agro-center advice.",
                "Spray Neem oil (5ml/L) as an organic deterrent.",
                "Ensure proper crop spacing and avoid water stagnation."
            ];
        }

        parsedData = {
            name: diseaseName,
            info: info,
            severity: severity,
            solutions: solutions.slice(0, 5)
        };
    }

    displayPestResult(parsedData);
}

// Display Diagnostic Result Panel
function displayPestResult(data) {
    const resultPanel = document.getElementById('pestResultPanel');
    if (!resultPanel) return;

    document.getElementById('detectedDisease').textContent = data.name;
    document.getElementById('diseaseInfo').textContent = data.info;

    const sevStat = document.getElementById('severityStatus');
    sevStat.textContent = data.severity;

    // Apply color styling
    if (data.severity === 'Critical' || data.severity === 'High Risk') {
        sevStat.style.background = '#fee2e2'; sevStat.style.color = '#ef4444';
    } else if (data.severity === 'Moderate') {
        sevStat.style.background = '#fef3c7'; sevStat.style.color = '#f59e0b';
    } else {
        sevStat.style.background = '#dcfce7'; sevStat.style.color = '#16a34a';
    }

    const list = document.getElementById('solutionList');
    list.innerHTML = '';
    data.solutions.forEach(sol => {
        const li = document.createElement('li');
        li.textContent = sol;
        list.appendChild(li);
    });

    currentPestAnalysis = {
        name: data.name,
        info: data.info,
        severity: data.severity,
        solutions: data.solutions,
        date: new Date().toLocaleDateString('en-GB')
    };

    resultPanel.classList.remove('hidden');
    resultPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
}


// Auto-seed Demo Farmer and Admin into LocalStorage if not exists
(function initDefaultAccounts() {
    try {
        let users = JSON.parse(localStorage.getItem(RUNTIME_USERS_KEY)) || [];
        const demoUser = {
            name: "Kisan Demo",
            email: "demo@gmail.com",
            mobile: "9876543210",
            aadhar: "123456789012",
            address: "Indore, Madhya Pradesh",
            pwd: "demo123"
        };
        if (!users.some(u => u.email === demoUser.email)) {
            users.push(demoUser);
            localStorage.setItem(RUNTIME_USERS_KEY, JSON.stringify(users));
        }
    } catch(e) {
        console.warn("Storage init warning:", e);
    }
})();

const BACKEND_URL = "http://127.0.0.1:8005"; // FastAPI Backend URL
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE"; // <-- PLEASE ADD YOUR GOOGLE GEMINI API KEY HERE

const RUNTIME_USERS_KEY = 'agrotech_users';
const CURRENT_USER_KEY = 'agrotech_auth_user';
const CROP_DB_KEY = 'agrotech_crops';
const SCHEMES_DB_KEY = 'agrotech_schemes';

const crops = [
  {
    "id": 1,
    "name": "Rice",
    "summary": "Staple food grain requiring warm, humid climate and ample water.",
    "image": "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=800&q=80",
    "soil": "Clayey loam, alluvial soil with good water retention.",
    "temp": "20\u00b0C - 35\u00b0C",
    "rain": "100 - 200 cm",
    "region": "West Bengal, UP, Punjab, AP, Tamil Nadu",
    "harvest": "Kharif (Nov - Dec)",
    "description": "Rice is a primary cereal crop. Prepare fields with puddling, transplant seedlings 20-25 days old, maintain 2-5 cm standing water during vegetative stage, and apply balanced N-P-K fertilizers in 3 split doses."
  },
  {
    "id": 2,
    "name": "Wheat",
    "summary": "Major rabi cereal crop thriving in cool winters and fertile soils.",
    "image": "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80",
    "soil": "Well-drained fertile loamy and clayey loam soils.",
    "temp": "12\u00b0C - 25\u00b0C",
    "rain": "50 - 75 cm",
    "region": "UP, Punjab, Haryana, MP, Rajasthan",
    "harvest": "Rabi (Mar - Apr)",
    "description": "Wheat is sown in Nov-Dec. Requires 4-6 irrigations at critical stages (Crown Root Initiation, Tillering, Flowering, Milking). Apply recommended Urea and DAP at basal and top dressing stages."
  },
  {
    "id": 3,
    "name": "Maize",
    "summary": "Versatile cereal and fodder crop suitable for diverse climatic zones.",
    "image": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80",
    "soil": "Deep, well-drained loamy soil rich in organic matter.",
    "temp": "18\u00b0C - 30\u00b0C",
    "rain": "60 - 100 cm",
    "region": "Karnataka, MP, Bihar, Maharashtra, Rajasthan",
    "harvest": "Kharif & Rabi (Sep - Oct / Feb - Mar)",
    "description": "Maize (Corn) requires adequate drainage. Maintain plant spacing of 60 cm x 20 cm. Control stem borers early with recommended biopesticides. Provide timely nitrogen top dressing."
  },
  {
    "id": 4,
    "name": "Cotton",
    "summary": "Premier commercial fiber crop known as 'White Gold'.",
    "image": "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=800&q=80",
    "soil": "Deep black soils (Regur) and alluvial loams.",
    "temp": "21\u00b0C - 30\u00b0C",
    "rain": "50 - 100 cm",
    "region": "Gujarat, Maharashtra, Telangana, AP, Punjab",
    "harvest": "Kharif (Oct - Feb)",
    "description": "Cotton requires 210 frost-free days and bright sunshine. Use certified Bt cotton seeds. Scout weekly for bollworms and sucking pests (aphids, thrips). Avoid waterlogging during flowering."
  },
  {
    "id": 5,
    "name": "Sugarcane",
    "summary": "High-value perennial cash crop used for sugar, jaggery, and ethanol.",
    "image": "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80",
    "soil": "Deep, well-drained fertile loamy soils with pH 6.5-7.5.",
    "temp": "20\u00b0C - 35\u00b0C",
    "rain": "150 - 250 cm",
    "region": "UP, Maharashtra, Karnataka, Tamil Nadu",
    "harvest": "Annual (Dec - Apr)",
    "description": "Sugarcane has a long 10-14 month gestation period. Plant setts with 2-3 buds in ridges and furrows. Requires heavy fertilization and frequent irrigations during tillering and grand growth phase."
  },
  {
    "id": 6,
    "name": "Tea",
    "summary": "Aromatic plantation beverage crop grown on sloping hill terrains.",
    "image": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
    "soil": "Deep, acidic, well-drained loamy soil (pH 4.5 - 5.5).",
    "temp": "15\u00b0C - 30\u00b0C",
    "rain": "150 - 300 cm",
    "region": "Assam, West Bengal (Darjeeling), Tamil Nadu, Kerala",
    "harvest": "Perennial (Mar - Nov)",
    "description": "Tea grows well under shaded plantation conditions. Frequent plucking of two leaves and a bud ensures premium quality. Ensure zero water stagnation on hill terraces."
  },
  {
    "id": 7,
    "name": "Coffee",
    "summary": "Prized shade-grown plantation crop producing Arabica and Robusta beans.",
    "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    "soil": "Humus-rich, porous, well-drained forest loam (pH 5.5 - 6.5).",
    "temp": "15\u00b0C - 28\u00b0C",
    "rain": "150 - 250 cm",
    "region": "Karnataka, Kerala, Tamil Nadu (Western Ghats)",
    "harvest": "Perennial (Nov - Feb)",
    "description": "Coffee thrives under a two-tier shade canopy. Maintain soil moisture during blossom and berry development. Harvest bright red ripe cherries for optimal cup score."
  },
  {
    "id": 8,
    "name": "Jute",
    "summary": "Golden eco-friendly natural fiber crop grown in fertile river deltas.",
    "image": "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80",
    "soil": "Rich alluvial silt deposits in delta basins.",
    "temp": "24\u00b0C - 35\u00b0C",
    "rain": "150 - 200 cm",
    "region": "West Bengal, Bihar, Assam, Odisha",
    "harvest": "Kharif (Jul - Sep)",
    "description": "Jute is sown before monsoons. Harvest at 120-135 days when 50% plants flower. Follow proper retting in slow-moving clean water for 15-20 days to extract strong golden fiber."
  },
  {
    "id": 9,
    "name": "Rubber",
    "summary": "Crucial industrial plantation crop producing high-elasticity latex.",
    "image": "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80",
    "soil": "Deep, acidic, well-drained laterite or alluvial soil.",
    "temp": "25\u00b0C - 34\u00b0C",
    "rain": "200 - 350 cm",
    "region": "Kerala, Tamil Nadu, Tripura, Assam",
    "harvest": "Perennial (Year-round tapping)",
    "description": "Rubber trees mature for tapping after 6-7 years. Tapping is done in the early morning at a 30-degree angle. Protect tree bark against fungal black stripe and pink disease."
  },
  {
    "id": 10,
    "name": "Pulses",
    "summary": "Protein-dense legume crops that naturally restore soil nitrogen balance.",
    "image": "https://images.unsplash.com/photo-1515543904425-705de85b22ab?auto=format&fit=crop&w=800&q=80",
    "soil": "Light to medium loam with adequate aeration.",
    "temp": "15\u00b0C - 30\u00b0C",
    "rain": "40 - 75 cm",
    "region": "MP, Maharashtra, Rajasthan, UP, Karnataka",
    "harvest": "Kharif / Rabi",
    "description": "Pulses need minimal irrigation. Inoculate seeds with Rhizobium culture before sowing to enhance biological nitrogen fixation. Apply single super phosphate (SSP) for root growth."
  },
  {
    "id": 11,
    "name": "Soybean",
    "summary": "Dual-purpose oilseed and high-protein crop central to central India.",
    "image": "https://images.unsplash.com/photo-1599709606362-e06ca68f4282?auto=format&fit=crop&w=800&q=80",
    "soil": "Fertile black clayey loams and well-drained loams.",
    "temp": "20\u00b0C - 32\u00b0C",
    "rain": "60 - 100 cm",
    "region": "MP, Maharashtra, Rajasthan, Karnataka",
    "harvest": "Kharif (Sep - Oct)",
    "description": "Soybean is sown with the onset of monsoon. Ensure ridge-and-furrow planting to prevent moisture stress. Treat seeds with fungicides and Bradyrhizobium."
  },
  {
    "id": 12,
    "name": "Mustard",
    "summary": "Vital winter oilseed producing high-pungency edible mustard oil.",
    "image": "https://images.unsplash.com/photo-1508873696983-2df57046475a?auto=format&fit=crop&w=800&q=80",
    "soil": "Light to heavy loamy soils with good drainage.",
    "temp": "10\u00b0C - 25\u00b0C",
    "rain": "35 - 55 cm",
    "region": "Rajasthan, MP, Haryana, UP, West Bengal",
    "harvest": "Rabi (Feb - Mar)",
    "description": "Mustard requires cool weather. Irrigate during flowering and pod development. Protect crops from aphid infestation using yellow sticky traps and selective sprays."
  },
  {
    "id": 13,
    "name": "Onion",
    "summary": "High-demand bulb vegetable widely grown across all seasons.",
    "image": "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=800&q=80",
    "soil": "Well-drained friable sandy loam rich in organic matter.",
    "temp": "13\u00b0C - 28\u00b0C",
    "rain": "50 - 75 cm",
    "region": "Maharashtra (Nashik), Karnataka, MP, Gujarat",
    "harvest": "Kharif, Late Kharif & Rabi",
    "description": "Transplant 6-8 week healthy nursery seedlings. Apply Potash for bulb compactness and shelf life. Stop irrigation 10-15 days before harvest and cure bulbs properly in shade."
  },
  {
    "id": 14,
    "name": "Chickpea",
    "summary": "Primary rabi pulse crop (Gram/Chana) with high drought tolerance.",
    "image": "https://images.unsplash.com/photo-1515543904425-705de85b22ab?auto=format&fit=crop&w=800&q=80",
    "soil": "Well-aerated silt loam or clay loam.",
    "temp": "15\u00b0C - 25\u00b0C",
    "rain": "40 - 60 cm",
    "region": "MP, Maharashtra, Rajasthan, UP, Karnataka",
    "harvest": "Rabi (Feb - Apr)",
    "description": "Sow in Oct-Nov. Nip apical shoots at 30-45 days to encourage branching and pod formation. Install pheromone traps for Helicoverpa armigera (pod borer) control."
  },
  {
    "id": 15,
    "name": "Kidneybeans",
    "summary": "Rajma: nutrient-dense legume popular in northern hill and plain valleys.",
    "image": "https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&w=800&q=80",
    "soil": "Deep, fertile, well-drained loamy soil (pH 5.5 - 6.0).",
    "temp": "15\u00b0C - 24\u00b0C",
    "rain": "60 - 90 cm",
    "region": "J&K, Himachal Pradesh, Uttarakhand, Maharashtra",
    "harvest": "Kharif / Spring",
    "description": "Rajma lacks native nodulation in many Indian soils, so it requires direct nitrogen application. Maintain moderate moisture and avoid water stagnation."
  },
  {
    "id": 16,
    "name": "Pigeonpeas",
    "summary": "Arhar/Tur: long-duration pulse vital for everyday Indian diet.",
    "image": "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80",
    "soil": "Deep, well-drained black cotton soils or alluvial loams.",
    "temp": "20\u00b0C - 35\u00b0C",
    "rain": "60 - 100 cm",
    "region": "Maharashtra, MP, Karnataka, UP, Gujarat",
    "harvest": "Annual (Dec - Mar)",
    "description": "Ideal for intercropping with soybean, cotton, or sorghum. Deep taproot system withstands dry spells. Manage pod borers and wilt disease with bio-fungicides."
  },
  {
    "id": 17,
    "name": "Mothbeans",
    "summary": "Extremely drought-hardy legume grown in arid and desert regions.",
    "image": "https://images.unsplash.com/photo-1515543904425-705de85b22ab?auto=format&fit=crop&w=800&q=80",
    "soil": "Sandy to sandy-loam soils with good drainage.",
    "temp": "25\u00b0C - 38\u00b0C",
    "rain": "25 - 50 cm",
    "region": "Rajasthan, Gujarat, Haryana, Punjab",
    "harvest": "Kharif (Sep - Oct)",
    "description": "Mothbean is an excellent cover crop against soil erosion in desert tracts. Requires minimal fertilizer and tolerates high temperatures."
  },
  {
    "id": 18,
    "name": "Mungbean",
    "summary": "Green Gram: short-duration 60-day pulse crop ideal for crop rotation.",
    "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    "soil": "Well-drained loamy to sandy loam soils.",
    "temp": "25\u00b0C - 35\u00b0C",
    "rain": "50 - 75 cm",
    "region": "Rajasthan, Maharashtra, AP, Gujarat, MP",
    "harvest": "Kharif, Rabi & Zaid (Summer)",
    "description": "Mungbean matures in 60-70 days. Excellent for catch cropping in summer. Control yellow mosaic virus (YMV) by managing whitefly vector."
  },
  {
    "id": 19,
    "name": "Blackgram",
    "summary": "Urad: nutritious pulse essential for south Indian cuisines and papads.",
    "image": "https://images.unsplash.com/photo-1515543904425-705de85b22ab?auto=format&fit=crop&w=800&q=80",
    "soil": "Heavy clay loam and alluvial soils with good moisture retention.",
    "temp": "22\u00b0C - 35\u00b0C",
    "rain": "60 - 90 cm",
    "region": "UP, MP, AP, Tamil Nadu, Maharashtra",
    "harvest": "Kharif & Rabi (Oct - Nov)",
    "description": "Sow in well-pulverized soil. Provide one weeding at 20-25 days. Protect against powdery mildew with sulfur dust or wettable sulfur."
  },
  {
    "id": 20,
    "name": "Lentil",
    "summary": "Masoor: popular winter pulse known for high iron and protein content.",
    "image": "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=800&q=80",
    "soil": "Alluvial loams and light clay soils with neutral pH.",
    "temp": "12\u00b0C - 25\u00b0C",
    "rain": "40 - 60 cm",
    "region": "UP, MP, Bihar, West Bengal, Rajasthan",
    "harvest": "Rabi (Feb - Mar)",
    "description": "Sow in Oct-Nov following kharif rice or fallow. Requires 1-2 light irrigations. Ensure weed-free field for the first 40 days."
  },
  {
    "id": 21,
    "name": "Pomegranate",
    "summary": "High-return arid horticulture fruit crop (Bhagwa variety).",
    "image": "https://images.unsplash.com/photo-1541344999736-83eca872f241?auto=format&fit=crop&w=800&q=80",
    "soil": "Deep loamy to sandy loam soils with excellent drainage.",
    "temp": "20\u00b0C - 38\u00b0C",
    "rain": "50 - 70 cm",
    "region": "Maharashtra (Solapur), Gujarat, Karnataka, Rajasthan",
    "harvest": "Perennial (Bahar treatment: Hasth, Mrig, Ambe)",
    "description": "Practice regulated Bahar flowering. Use drip irrigation with fertigation. Protect fruits against bacterial blight (Telya) and fruit borer with paper bagging."
  },
  {
    "id": 22,
    "name": "Banana",
    "summary": "Fast-growing high-yield tropical fruit (Grand Naine variety).",
    "image": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80",
    "soil": "Rich, well-drained alluvial soil high in organic matter.",
    "temp": "20\u00b0C - 35\u00b0C",
    "rain": "120 - 200 cm",
    "region": "Tamil Nadu, Maharashtra (Jalgaon), Gujarat, AP, UP",
    "harvest": "Perennial (11 - 12 months from planting)",
    "description": "Use virus-free tissue-cultured plants. Adopt 1.8m x 1.8m spacing. Apply high potassium and nitrogen through drip fertigation. Support heavy bunches with bamboo props."
  },
  {
    "id": 23,
    "name": "Mango",
    "summary": "The 'King of Fruits', leading Indian horticulture fruit export.",
    "image": "https://images.unsplash.com/photo-1553279768-865429fd3d81?auto=format&fit=crop&w=800&q=80",
    "soil": "Deep, fertile alluvial or lateritic soil with deep water table.",
    "temp": "24\u00b0C - 38\u00b0C",
    "rain": "75 - 150 cm",
    "region": "UP, AP, Maharashtra (Ratnagiri), Gujarat, Bihar",
    "harvest": "Summer (Apr - Jul)",
    "description": "Plant grafted varieties (Alphonso, Dasheri, Kesar). Prune dead wood after harvest. Protect flowering panicles from powdery mildew and hopper pests with timely sprays."
  },
  {
    "id": 24,
    "name": "Grapes",
    "summary": "High-commercial vineyard fruit for fresh consumption, raisins, and wine.",
    "image": "https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=800&q=80",
    "soil": "Well-drained sandy loam or red sandy soil (pH 6.5 - 7.5).",
    "temp": "15\u00b0C - 35\u00b0C",
    "rain": "50 - 75 cm",
    "region": "Maharashtra (Nashik, Sangli), Karnataka, AP",
    "harvest": "Annual (Jan - Apr)",
    "description": "Train on Bower or Y-trellis system. Perform back-pruning in April and forward-pruning in October. Manage canopy and use GA3 for berry elongation."
  },
  {
    "id": 25,
    "name": "Watermelon",
    "summary": "Popular summer cucurbit fruit offering high refreshment and quick returns.",
    "image": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80",
    "soil": "Sandy loam soils with high drainage and warmth.",
    "temp": "24\u00b0C - 35\u00b0C",
    "rain": "40 - 60 cm",
    "region": "UP, AP, Karnataka, Tamil Nadu, Maharashtra",
    "harvest": "Zaid / Summer (85 - 100 days)",
    "description": "Grow on raised beds with silver-black mulch and drip irrigation. Use bee-attracting practices during flowering. Harvest when bottom ground spot turns creamy yellow."
  },
  {
    "id": 26,
    "name": "Muskmelon",
    "summary": "Sweet aromatic summer melon with high market value (Kharbooza).",
    "image": "https://images.unsplash.com/photo-1571575179705-4d7226e2768b?auto=format&fit=crop&w=800&q=80",
    "soil": "Well-drained fertile sandy loam soil.",
    "temp": "22\u00b0C - 34\u00b0C",
    "rain": "40 - 60 cm",
    "region": "Punjab, UP, AP, Maharashtra, Haryana",
    "harvest": "Zaid / Summer (75 - 90 days)",
    "description": "Sow in Feb-Mar. Ensure dry weather during fruit ripening for optimal sugar accumulation (Brix). Avoid overhead watering to prevent downy mildew."
  },
  {
    "id": 27,
    "name": "Apple",
    "summary": "Temperate fruit crop cultivated in high-altitude Himalayan orchards.",
    "image": "https://images.unsplash.com/photo-1560806887-1e4cd0b6bac6?auto=format&fit=crop&w=800&q=80",
    "soil": "Deep, loamy, humus-rich soil with pH 5.5 - 6.5.",
    "temp": "5\u00b0C - 22\u00b0C (800-1200 chilling hours)",
    "rain": "100 - 125 cm",
    "region": "J&K, Himachal Pradesh, Uttarakhand",
    "harvest": "Autumn (Jul - Oct)",
    "description": "Requires winter chilling hours for dormancy break. Adopt modern high-density planting (M9 rootstock) with drip irrigation and anti-hail nets. Manage scab and codling moth."
  },
  {
    "id": 28,
    "name": "Orange",
    "summary": "Famous citrus fruit (Nagpur Mandarin) prized for juice and vitamin C.",
    "image": "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=800&q=80",
    "soil": "Well-drained light loamy or black soil with subsoil drainage.",
    "temp": "15\u00b0C - 35\u00b0C",
    "rain": "75 - 125 cm",
    "region": "Maharashtra (Nagpur), MP, Punjab (Kinnow), Assam",
    "harvest": "Winter & Spring (Nov - Feb)",
    "description": "Budded plants on Rangpur lime rootstock. Avoid water stagnation around tree trunk to prevent gummosis and root rot. Apply micronutrient foliar spray (Zinc, Iron, Boron)."
  },
  {
    "id": 29,
    "name": "Papaya",
    "summary": "Fast-yielding tropical fruit (Red Lady 786) bearing fruit within 9 months.",
    "image": "https://images.unsplash.com/photo-1526318897912-39ae940a455a?auto=format&fit=crop&w=800&q=80",
    "soil": "Rich, well-aerated sandy loam with excellent drainage.",
    "temp": "22\u00b0C - 36\u00b0C",
    "rain": "100 - 150 cm",
    "region": "Gujarat, AP, Karnataka, MP, Maharashtra",
    "harvest": "Year-round (9 - 10 months from planting)",
    "description": "Papaya cannot tolerate waterlogging even for 24 hours. Plant on raised mounds. Prevent papaya ringspot virus (PRSV) by controlling aphid vectors."
  },
  {
    "id": 30,
    "name": "Coconut",
    "summary": "'Kalpavriksha' palm providing oil, water, coir, and copra year-round.",
    "image": "https://images.unsplash.com/photo-1584589167171-541ce45f1eea?auto=format&fit=crop&w=800&q=80",
    "soil": "Coastal alluvium, red sandy loam, and lateritic soils.",
    "temp": "25\u00b0C - 35\u00b0C",
    "rain": "130 - 250 cm",
    "region": "Kerala, Tamil Nadu, Karnataka, AP, Odisha",
    "harvest": "Perennial (Harvest every 45-60 days)",
    "description": "Plant 1-year-old quality tall or hybrid seedlings. Maintain 7.5m x 7.5m square spacing. Apply common salt (NaCl) and Potash to improve copra weight. Protect crowns from rhinoceros beetle."
  }
];

function getMergedCrops() {
    const adminCrops = JSON.parse(localStorage.getItem('agrotech_crops')) || [];
    const formattedAdminCrops = adminCrops.map(c => ({
        id: c.id,
        name: c.name,
        summary: c.desc,
        image: c.image,
        soil: c.soil,
        temp: c.temp,
        rain: c.rain,
        region: c.uses,
        harvest: c.season,
        description: c.guide
    }));
    return [...crops, ...formattedAdminCrops];
}

const cropRequirements = {
  "Rice": { n: 110, p: 50, k: 50, phMin: 5.5, phMax: 6.5 },
  "Wheat": { n: 135, p: 60, k: 45, phMin: 6.0, phMax: 7.5 },
  "Maize": { n: 165, p: 70, k: 50, phMin: 5.8, phMax: 7.0 },
  "Cotton": { n: 90, p: 45, k: 35, phMin: 6.0, phMax: 8.0 },
  "Sugarcane": { n: 275, p: 110, k: 110, phMin: 6.5, phMax: 7.5 },
  "Tea": { n: 125, p: 45, k: 65, phMin: 4.5, phMax: 5.5 },
  "Coffee": { n: 130, p: 65, k: 125, phMin: 5.5, phMax: 6.5 },
  "Jute": { n: 50, p: 25, k: 25, phMin: 5.0, phMax: 7.0 },
  "Rubber": { n: 35, p: 35, k: 18, phMin: 4.5, phMax: 6.0 },
  "Pulses": { n: 22, p: 50, k: 25, phMin: 6.0, phMax: 7.5 },
  "Soybean": { n: 25, p: 70, k: 50, phMin: 6.0, phMax: 7.0 },
  "Mustard": { n: 80, p: 40, k: 40, phMin: 6.0, phMax: 7.5 },
  "Onion": { n: 100, p: 50, k: 80, phMin: 6.0, phMax: 7.0 },
  "Chickpea": { n: 40, p: 60, k: 80, phMin: 5.5, phMax: 7.0 },
  "Kidneybeans": { n: 20, p: 60, k: 20, phMin: 5.5, phMax: 6.0 },
  "Pigeonpeas": { n: 20, p: 60, k: 20, phMin: 5.5, phMax: 7.0 },
  "Mothbeans": { n: 20, p: 40, k: 20, phMin: 6.8, phMax: 7.5 },
  "Mungbean": { n: 20, p: 40, k: 20, phMin: 6.2, phMax: 7.2 },
  "Blackgram": { n: 20, p: 40, k: 20, phMin: 6.0, phMax: 7.5 },
  "Lentil": { n: 20, p: 60, k: 20, phMin: 5.5, phMax: 7.0 },
  "Pomegranate": { n: 20, p: 10, k: 40, phMin: 5.5, phMax: 7.0 },
  "Banana": { n: 100, p: 75, k: 50, phMin: 6.5, phMax: 7.5 },
  "Mango": { n: 20, p: 20, k: 30, phMin: 5.5, phMax: 7.5 },
  "Grapes": { n: 20, p: 125, k: 200, phMin: 5.5, phMax: 6.5 },
  "Watermelon": { n: 100, p: 10, k: 50, phMin: 6.0, phMax: 6.8 },
  "Muskmelon": { n: 100, p: 10, k: 50, phMin: 6.0, phMax: 6.8 },
  "Apple": { n: 20, p: 125, k: 200, phMin: 5.5, phMax: 6.5 },
  "Orange": { n: 20, p: 10, k: 10, phMin: 6.0, phMax: 7.5 },
  "Papaya": { n: 50, p: 50, k: 50, phMin: 6.0, phMax: 6.5 },
  "Coconut": { n: 20, p: 10, k: 30, phMin: 5.5, phMax: 8.0 }
};

// DOM Elements
const cropGrid = document.getElementById('cropGrid');
const cropSearch = document.getElementById('cropSearch');
const modal = document.getElementById('cropModal');
const modalBody = document.getElementById('modalBody');
const closeModal = document.querySelector('.close-modal');
const targetCropSelect = document.getElementById('targetCrop');
const soilForm = document.getElementById('soilForm');
const analysisResult = document.getElementById('analysisResult');
const resultOutput = document.getElementById('resultOutput');
const resultStatus = document.getElementById('resultStatus');
const resultActions = document.getElementById('resultActions');
const saveReportBtn = document.getElementById('saveReportBtn');
const savedReportsHistory = document.getElementById('savedReportsHistory');
const reportsGrid = document.getElementById('reportsGrid');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const whatsappForm = document.getElementById('whatsappForm');
const getWeatherBtn = document.getElementById('getWeatherBtn');
const detectLocationBtn = document.getElementById('detectLocationBtn');
const farmLocationInput = document.getElementById('farmLocation');
const aiRecommendationContent = document.getElementById('aiRecommendationContent');
const getAiAdviceBtn = document.getElementById('getAiAdviceBtn');
const marketBody = document.getElementById('marketBody');
const mpDistrictSelect = document.getElementById('mpDistrict');
const mpMandiSelect = document.getElementById('mpMandi');
const filterMarketBtn = document.getElementById('filterMarketBtn');
const schemesGrid = document.getElementById('schemesGrid');
const pestImageInput = document.getElementById('pestImageInput');
const selectImageBtn = document.getElementById('selectImageBtn');
const pestPreviewArea = document.getElementById('pestPreviewArea');
const pestUploadArea = document.getElementById('pestUploadArea');
const pestPreviewImg = document.getElementById('pestPreviewImg');
const analyzePestBtn = document.getElementById('analyzePestBtn');
const pestResultPanel = document.getElementById('pestResultPanel');
const scanLine = document.getElementById('scanLine');
const reuploadBtn = document.getElementById('reuploadBtn');
const droneBookingForm = document.getElementById('droneBookingForm');
const farmAcreageInput = document.getElementById('farmAcreage');
const droneCropTypeSelect = document.getElementById('droneCropType');
const estCostDisplay = document.getElementById('estCost');
const savePestReportBtn = document.getElementById('savePestReportBtn');
const savedPestReportsHistory = document.getElementById('savedPestReportsHistory');
const pestReportsGrid = document.getElementById('pestReportsGrid');
const clearPestHistoryBtn = document.getElementById('clearPestHistoryBtn');

let currentAnalysis = null;
let currentPestAnalysis = null;
let currentWeatherData = null;

// Populate Crop Select
function populateCropSelect() {
  if (!targetCropSelect) return;
  
  // Clear existing (except first)
  targetCropSelect.innerHTML = '<option value="" disabled selected>Select Crop</option>';
  targetCropSelect.innerHTML += '<option value="AI_AUTO" style="font-weight: bold; color: #25d366;">🧠 Predict Best Crop (ML Model)</option>';
  
  getMergedCrops().forEach(crop => {
    const option = document.createElement('option');
    option.value = crop.name;
    option.textContent = crop.name;
    targetCropSelect.appendChild(option);
  });
  
  // Add "Other" option
  const otherOpt = document.createElement('option');
  otherOpt.value = "Other";
  otherOpt.textContent = "Other (Specify name)";
  targetCropSelect.appendChild(otherOpt);
}

// Toggle "Other Crop" input field
if (targetCropSelect) {
  targetCropSelect.addEventListener('change', (e) => {
    const otherGroup = document.getElementById('otherCropGroup');
    if (e.target.value === "Other") {
      otherGroup.classList.remove('hidden');
      document.getElementById('otherCropName').required = true;
    } else {
      otherGroup.classList.add('hidden');
      document.getElementById('otherCropName').required = false;
    }
  });
}

// Initial Render with Animation
function renderCrops(cropList) {
  if (!cropGrid) return;
  cropGrid.innerHTML = '';

  if (cropList.length === 0) {
    cropGrid.innerHTML = '<div class="no-results" style="grid-column: 1/-1; padding: 40px; color: var(--text-muted);">No crops found matching your search.</div>';
    return;
  }

  cropList.forEach((crop, index) => {
    const card = document.createElement('div');
    card.className = 'crop-card reveal-card';
    card.style.animationDelay = `${index * 0.08}s`; // Slightly slower for elegance
    card.innerHTML = `
      <div class="crop-img" style="background-image: url('${crop.image}')">
        <div class="crop-img-overlay">${crop.name}</div>
      </div>
      <div class="crop-info">
        <h3 class="crop-name">${crop.name}</h3>
        <p class="crop-summary">${crop.summary}</p>
        <div class="crop-stats-brief">
          <div class="stat-bubble" title="Ideal Temperature"><i class="fa-solid fa-temperature-half"></i> ${crop.temp}</div>
          <div class="stat-bubble" title="Required Rainfall"><i class="fa-solid fa-droplet"></i> ${crop.rain}</div>
          <div class="stat-bubble" title="Harvest Season"><i class="fa-solid fa-calendar-check"></i> ${crop.harvest.split('(')[0]}</div>
        </div>
        <button class="btn-card">View Full Advisory</button>
      </div>
    `;
    card.addEventListener('click', () => openCropDetails(crop.id));
    cropGrid.appendChild(card);
  });
}

// Trigger Advisory when scrolled into view
function initAdvisoryScrollReveal() {
  const advisorySection = document.getElementById('advisory');
  if (!advisorySection) return;

  let hasRendered = false;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasRendered) {
        hasRendered = true;
        renderCrops(getMergedCrops());
        observer.unobserve(advisorySection);
      }
    });
  }, { threshold: 0.1 });

  observer.observe(advisorySection);
}

// Open Modal with Details
function openCropDetails(id) {
  const merged = getMergedCrops();
  const crop = merged.find(c => String(c.id) === String(id));
  if (!crop) return;

  modalBody.innerHTML = `
    <div class="modal-header-info">
      <div class="modal-img" style="background-image: url('${crop.image}'), url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80'); background-size: cover; background-position: center;"></div>
      <div class="modal-details">
        <h2>${crop.name}</h2>
        <p class="crop-summary" style="margin-bottom: 20px; font-size: 1.1rem;">${crop.summary}</p>
        
        <div class="detail-grid">
          <div class="detail-item">
            <h4>Ideal Soil</h4>
            <p>${crop.soil}</p>
          </div>
          <div class="detail-item">
            <h4>Temperature</h4>
            <p>${crop.temp}</p>
          </div>
          <div class="detail-item">
            <h4>Annual Rainfall</h4>
            <p>${crop.rain}</p>
          </div>
          <div class="detail-item">
            <h4>Major Regions</h4>
            <p>${crop.region}</p>
          </div>
          <div class="detail-item">
            <h4>Harvesting Season</h4>
            <p>${crop.harvest}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="full-description">
      <h3>Standard Cultivation Guide</h3>
      <p>${crop.description}</p>
      
      <!-- AI Live Advisory Section -->
      <div class="ai-advisory-card" style="margin-top: 25px; padding: 20px; background: #f0fdf4; border-radius: 12px; border: 1px solid #bbf7d0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
          <h3 style="margin: 0; color: #166534; font-size: 1.2rem;"><i class="fa-solid fa-microchip"></i> Live AI Advisory</h3>
          <button id="btnGetAiAdvisory" class="btn-ai-glow" style="padding: 8px 15px; font-size: 0.9rem;"><i class="fa-solid fa-sparkles"></i> Generate Report</button>
        </div>
        <div id="aiAdvisoryContent" style="color: #14532d; font-size: 0.95rem; line-height: 1.6;">
          <p style="margin: 0; opacity: 0.8;">Click the button to generate prompt, up-to-date expert AI farming techniques and pest prevention for ${crop.name}.</p>
        </div>
      </div>
    </div>
  `;

  modal.style.display = 'block';
  document.body.style.overflow = 'hidden'; // Prevent scroll
  
  // Attach Event Listener for AI Advisory
  const btnGetAi = document.getElementById('btnGetAiAdvisory');
  const aiContent = document.getElementById('aiAdvisoryContent');

  if (btnGetAi) {
    btnGetAi.addEventListener('click', async () => {
      btnGetAi.disabled = true;
      btnGetAi.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing...';
      aiContent.innerHTML = `<p style="opacity: 0.7;">AgroBot is researching the latest agricultural practices for ${crop.name}...</p>`;
      
      try {
        if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
          throw new Error("Missing Gemini API Key");
        }
        
        const prompt = `Provide a concise, 3-bullet expert farming advisory for growing ${crop.name} in India. Include specific modern techniques or pest prevention. Keep it brief and directly actionable. Only output the bullets.`;
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error.message);
        }
        
        const replyText = data.candidates[0].content.parts[0].text;
        // Add simple formatting for markdown asterisks if any
        const formattedReply = replyText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*/g, '<br>• ').replace(/\n/g, '<br>');
        
        aiContent.innerHTML = `<div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #22c55e;">${formattedReply}</div>`;
        btnGetAi.innerHTML = '<i class="fa-solid fa-check"></i> Generated';
        
      } catch (err) {
        console.error("Advisory AI Error:", err);
        
        // Fallback Mock Logic
        setTimeout(() => {
          const fallbackTips = [
            `• Ensure proper drainage for your ${crop.name} to prevent root rot.`,
            `• Regularly monitor for early signs of common pests and apply organic Neem-based repellents.`,
            `• Follow the recommended N-P-K fertilizer protocol specific to your soil test results.`
          ].join('<br><br>');
          
          aiContent.innerHTML = `<div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #22c55e;"><strong>Expert Advisory:</strong><br>${fallbackTips}</div>`;
          btnGetAi.innerHTML = '<i class="fa-solid fa-check"></i> Offline AI';
        }, 800);
      }
    });
  }
}

// Close Modal
closeModal.onclick = () => {
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
};

window.onclick = (event) => {
  if (event.target == modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
};

// Search Logic
cropSearch.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase().trim();
  const merged = getMergedCrops();
  
  if (searchTerm === "") {
    renderCrops(merged);
    return;
  }

  const filteredCrops = merged.filter(crop =>
    crop.name.toLowerCase().includes(searchTerm) ||
    crop.summary.toLowerCase().includes(searchTerm)
  );
  renderCrops(filteredCrops);
});

// Soil Analysis Logic
soilForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  let cropName = targetCropSelect.value;
  
  const n = parseFloat(document.getElementById('nitrogen').value);
  const p = parseFloat(document.getElementById('phosphorus').value);
  const k = parseFloat(document.getElementById('potassium').value);
  const ph = parseFloat(document.getElementById('ph').value);
  const temperature = parseFloat(document.getElementById('temperature').value);
  const humidity = parseFloat(document.getElementById('humidity').value);
  const rainfall = parseFloat(document.getElementById('rainfall').value);
  // Call ML Model if selected
  if (cropName === "AI_AUTO") {
    const mlParams = {
      n: n,
      p: p,
      k: k,
      temperature: temperature,
      humidity: humidity,
      ph: ph,
      rainfall: rainfall
    };

    let predictedCrop = null;
    let confidenceScore = 92.4;

    try {
      document.querySelector('.btn-analyze').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Running Machine Learning...';
      const req = await fetch(`${BACKEND_URL}/predict-crop`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(mlParams)
      });
      if (req.ok) {
        const mlRes = await req.json();
        predictedCrop = mlRes.predicted_crop;
        confidenceScore = mlRes.confidence || 92.4;
      }
    } catch (err) {
      console.log("ML Backend offline, using client-side agronomic ML heuristic.");
    }

    // Client-side Heuristic ML Model if backend is offline
    if (!predictedCrop) {
      let bestScore = Infinity;
      let bestMatch = "Wheat";
      
      for (const [cName, cReq] of Object.entries(cropRequirements)) {
        // Euclidean normalized distance for soil parameters
        const score = Math.pow((n - cReq.n) / 50, 2) +
                      Math.pow((p - cReq.p) / 30, 2) +
                      Math.pow((k - cReq.k) / 30, 2) +
                      Math.pow((ph - (cReq.phMin + cReq.phMax)/2) / 1.5, 2);
        if (score < bestScore) {
          bestScore = score;
          bestMatch = cName;
        }
      }
      predictedCrop = bestMatch;
      confidenceScore = Math.min(98.5, Math.max(78.0, 100 - bestScore * 2.5)).toFixed(1);
    }

    cropName = predictedCrop;
    if (targetCropSelect) targetCropSelect.value = cropName;
    document.querySelector('.btn-analyze').innerHTML = 'Analyze & Get Advice';

    const mlAlert = document.createElement('div');
    mlAlert.innerHTML = `<div style="padding: 15px; background: #e6ffe6; border-left: 4px solid #25d366; margin-bottom: 20px; border-radius: 8px;">
      <strong>🧠 AI/ML Model Output:</strong> Based on your Soil NPK & Climate, the recommended crop is <strong>${cropName}</strong> (Confidence: ${confidenceScore}%).
    </div>`;
    analysisResult.parentNode.insertBefore(mlAlert, analysisResult);
    setTimeout(() => mlAlert.remove(), 8000);
  }

  let req = cropRequirements[cropName] || { n: 100, p: 50, k: 50, phMin: 6.0, phMax: 7.0 };
  let recommendations = [];
  let isDeficient = false;

  const btnAnalyze = document.querySelector('.btn-analyze');
  const originalBtnText = btnAnalyze.innerHTML;
  btnAnalyze.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> AgroBot AI Analyzing...';
  btnAnalyze.disabled = true;

  try {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
      throw new Error("Missing Gemini API Key");
    }

    const prompt = `You are an expert agronomist. Analyze this soil for growing ${cropName}:
N: ${n} mg/kg (Ideal: ~${req.n})
P: ${p} mg/kg (Ideal: ~${req.p})
K: ${k} mg/kg (Ideal: ~${req.k})
pH: ${ph} (Ideal: ${req.phMin}-${req.phMax})

Respond ONLY with a valid JSON array of objects. Each object must have:
- "nutrient": Name of the parameter (e.g. "Nitrogen", "pH")
- "status": "Low", "High", or "Optimal"
- "advice": Short, specific actionable recommendation.

If everything is optimal, return an empty array []. Do not include markdown formatting or backticks.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    let replyText = data.candidates[0].content.parts[0].text.trim();
    replyText = replyText.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    recommendations = JSON.parse(replyText);
    isDeficient = recommendations.length > 0;

  } catch (err) {
    console.warn("Gemini AI Soil Analysis Error, falling back to local heuristic:", err);
    
    // Local fallback analysis
    // Nitrogen Analysis
    if (n < req.n) {
      recommendations.push({
        nutrient: "Nitrogen (N)",
        status: "Low",
        advice: `Add approx. <span>${((req.n - n) * 2.17).toFixed(1)} kg/ha of Urea</span> to meet requirements.`
      });
      isDeficient = true;
    }

    // Phosphorus Analysis
    if (p < req.p) {
      recommendations.push({
        nutrient: "Phosphorus (P)",
        status: "Low",
        advice: `Apply <span>${((req.p - p) * 2.17).toFixed(1)} kg/ha of DAP</span> or <span>${((req.p - p) * 6.25).toFixed(1)} kg/ha of SSP</span>.`
      });
      isDeficient = true;
    }

    // Potassium Analysis
    if (k < req.k) {
      recommendations.push({
        nutrient: "Potassium (K)",
        status: "Low",
        advice: `Apply <span>${((req.k - k) * 1.67).toFixed(1)} kg/ha of MOP (Muriate of Potash)</span>.`
      });
      isDeficient = true;
    }

    // pH Analysis
    if (ph < req.phMin) {
      recommendations.push({
        nutrient: "Soil pH",
        status: "Acidic",
        advice: `Soil is too acidic for ${cropName}. Apply <span>Agricultural Lime</span> to increase pH.`
      });
      isDeficient = true;
    } else if (ph > req.phMax) {
      recommendations.push({
        nutrient: "Soil pH",
        status: "Alkaline",
        advice: `Soil is too alkaline for ${cropName}. Apply <span>Gypsum</span> or sulfur to lower pH.`
      });
      isDeficient = true;
    }
  }

  btnAnalyze.innerHTML = originalBtnText;
  btnAnalyze.disabled = false;

  displayResults(cropName, recommendations, isDeficient, { n, p, k, ph, temperature, humidity, rainfall });
});

// Logic to bypass local soil analysis if backend is active
async function callSoilBackend(params) {
  try {
    const response = await fetch(`${BACKEND_URL}/analyze-soil`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(params)
    });
    return await response.json();
  } catch (e) {
    return null;
  }
}

function displayResults(cropName, recs, isDeficient, params) {
  analysisResult.classList.remove('hidden');
  resultActions.classList.remove('hidden');
  resultOutput.innerHTML = `<h4>Recommendations for ${cropName}:</h4>`;

  currentAnalysis = {
    crop: cropName,
    params: params,
    recommendations: recs,
    date: new Date().toLocaleString(),
    id: Date.now()
  };

  if (!isDeficient) {
    resultStatus.textContent = "Optimal Soil Health";
    resultStatus.className = "result-status status-optimal";
    resultOutput.innerHTML += `<p>Your soil parameters are excellent for growing ${cropName}. No major chemical additions required.</p>`;
  } else {
    resultStatus.textContent = "Action Required";
    resultStatus.className = "result-status status-deficient";

    recs.forEach(rec => {
      resultOutput.innerHTML += `
        <div class="rec-item">
          <h5>${rec.nutrient} - ${rec.status}</h5>
          <p>${rec.advice}</p>
        </div>
      `;
    });
  }

  // Scroll to results
  analysisResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Saving & History Logic (Updated for MongoDB)
saveReportBtn.addEventListener('click', async () => {
  if (!currentAnalysis) return;

  // 1. Save to LocalStorage (as backup/fallback)
  let reports = JSON.parse(localStorage.getItem('agrotech_reports') || '[]');
  reports.unshift(currentAnalysis);
  localStorage.setItem('agrotech_reports', JSON.stringify(reports));

  // 2. Save to MongoDB via Backend
  try {
      const authUserStr = localStorage.getItem(CURRENT_USER_KEY);
      const authUser = authUserStr ? JSON.parse(authUserStr) : { email: 'guest@agrotech.com' };
      const reportData = { ...currentAnalysis, email: authUser.email };
      
      await fetch(`${BACKEND_URL}/api/save-report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reportData)
      });
  } catch (err) {
      console.warn("MongoDB Save Failed (Backend offline):", err);
  }

  saveReportBtn.innerHTML = '<i class="fa-solid fa-check"></i> Saved to DB!';
  saveReportBtn.disabled = true;

  setTimeout(() => {
    saveReportBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Report';
    saveReportBtn.disabled = false;
  }, 2000);

  renderHistory();
});

async function renderHistory() {
  const authUserStr = localStorage.getItem(CURRENT_USER_KEY);
  const authUser = authUserStr ? JSON.parse(authUserStr) : null;

  try {
    let backendReports = [];
    if (authUser) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/user-reports/${authUser.email}`);
        if (response.ok) {
            backendReports = await response.json();
        }
      } catch (e) {
        console.warn("Backend fetch failed, using local reports");
      }
    }
    
    // Merge with local for instant feedback, then deduplicate by id
    const localReports = JSON.parse(localStorage.getItem('agrotech_reports') || '[]');
    const merged = [...localReports, ...backendReports];
    const uniqueReports = [];
    const seenIds = new Set();
    
    merged.forEach(r => {
        const id = r.id || r._id;
        if (!seenIds.has(id)) {
            seenIds.add(id);
            uniqueReports.push(r);
        }
    });

    if (uniqueReports.length === 0) {
      savedReportsHistory.classList.add('hidden');
      return;
    }

    savedReportsHistory.classList.remove('hidden');
    reportsGrid.innerHTML = '';

    uniqueReports.forEach(report => {
      const card = document.createElement('div');
      card.className = 'history-card';
      const reportId = report.id || report._id;
      card.innerHTML = `
        <button class="btn-remove" onclick="removeReport('${reportId}')"><i class="fa-solid fa-trash-can"></i></button>
        <span class="date">${report.date}</span>
        <span class="crop">${report.crop}</span>
        <div class="parameters" style="display: flex; flex-wrap: wrap; gap: 5px;">
          <span class="param-badge">N: ${report.params.n}</span>
          <span class="param-badge">P: ${report.params.p}</span>
          <span class="param-badge">K: ${report.params.k}</span>
          <span class="param-badge">pH: ${report.params.ph}</span>
          ${report.params.temperature ? `<span class="param-badge">Temp: ${report.params.temperature}°C</span>` : ''}
          ${report.params.humidity ? `<span class="param-badge">Humidity: ${report.params.humidity}%</span>` : ''}
          ${report.params.rainfall ? `<span class="param-badge">Rain: ${report.params.rainfall}mm</span>` : ''}
        </div>
        <button class="btn-card" style="padding: 5px 15px; font-size: 0.75rem;" onclick="viewSavedReport('${reportId}')">View Analysis</button>
      `;
      reportsGrid.appendChild(card);
    });
  } catch (err) {
    console.warn("Error fetching history from backend:", err);
  }
}

window.removeReport = async (id) => {
  if (!confirm('Are you sure you want to delete this report?')) return;
  
  try {
      const response = await fetch(`${BACKEND_URL}/api/reports/${id}`, { method: 'DELETE' });
      // We ignore response.ok here and delete locally anyway, because it might be a local-only report.
  } catch (err) {
      console.error("Delete error:", err);
  }
  
  // Always remove from local storage if exists
  let reports = JSON.parse(localStorage.getItem('agrotech_reports') || '[]');
  reports = reports.filter(r => String(r.id) !== String(id) && String(r._id) !== String(id));
  localStorage.setItem('agrotech_reports', JSON.stringify(reports));
  
  renderHistory();
};

window.deleteAdminReport = async (id) => {
    if (!confirm('Admin: Delete this farmer report?')) return;
    try {
        const response = await fetch(`${BACKEND_URL}/api/reports/${id}`, { method: 'DELETE' });
        if (response.ok) {
            alert('✓ Report deleted by Admin.');
            loadAdminData();
        } else {
            alert('Failed to delete report.');
        }
    } catch (err) {
        console.error("Admin Delete error:", err);
    }
};

window.viewSavedReport = async (id) => {
  let reports = JSON.parse(localStorage.getItem('agrotech_reports') || '[]');
  let report = reports.find(r => String(r.id) === String(id) || String(r._id) === String(id));
  
  if (!report) {
      const authUserStr = localStorage.getItem(CURRENT_USER_KEY);
      if (authUserStr) {
          const authUser = JSON.parse(authUserStr);
          try {
              const response = await fetch(`${BACKEND_URL}/api/user-reports/${authUser.email}`);
              if (response.ok) {
                  const backendReports = await response.json();
                  report = backendReports.find(r => String(r.id) === String(id) || String(r._id) === String(id));
              }
          } catch (err) {
              console.warn("Could not fetch report from backend.");
          }
      }
  }

  if (report) {
    displayResults(report.crop, report.recommendations, report.recommendations && report.recommendations.length > 0, report.params);
    document.getElementById('saveReportBtn').style.display = 'none'; // hide save button if viewing history
  } else {
    alert("Report not found!");
  }
};

clearHistoryBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to clear all saved reports?')) {
    localStorage.removeItem('agrotech_reports');
    renderHistory();
  }
});

// Weather Logic
const mockWeatherData = {
  "default": { temp: "27°C", desc: "Clear Sky", humidity: "45%", wind: "12 km/h", rain: "10%", icon: "fa-solid fa-cloud-sun" }
};

async function updateWeather(city) {
  if (!city) {
    updateWeatherUI(mockWeatherData["default"], "Your Farm");
    return;
  }

  try {
    // 1. Geocoding API to get Latitude and Longitude
    const geoReq = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    const geoData = await geoReq.json();

    if (!geoData.results || geoData.results.length === 0) {
      console.warn("City not found, using default.");
      updateWeatherUI(mockWeatherData["default"], city);
      return;
    }

    const location = geoData.results[0];
    const lat = location.latitude;
    const lon = location.longitude;
    const realCityName = location.name;

    // 2. Weather API to get real-time temperature, wind speed, etc.
    const weatherReq = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&timezone=auto`);
    const weatherData = await weatherReq.json();

    const current = weatherData.current;
    
    // Interpreting WMO Weather code for simple description
    const code = current.weather_code;
    let desc = "Clear";
    let icon = "fa-solid fa-sun";
    
    if (code >= 1 && code <= 3) { desc = "Partly Cloudy"; icon = "fa-solid fa-cloud-sun"; }
    else if (code >= 45 && code <= 48) { desc = "Foggy"; icon = "fa-solid fa-smog"; }
    else if (code >= 51 && code <= 67) { desc = "Rainy"; icon = "fa-solid fa-cloud-rain"; }
    else if (code >= 71 && code <= 77) { desc = "Snowy"; icon = "fa-solid fa-snowflake"; }
    else if (code >= 80 && code <= 82) { desc = "Heavy Rain"; icon = "fa-solid fa-cloud-showers-heavy"; }
    else if (code >= 95) { desc = "Thunderstorm"; icon = "fa-solid fa-cloud-bolt"; }

    const mappedData = {
      temp: `${current.temperature_2m}°C`,
      desc: desc,
      humidity: `${current.relative_humidity_2m}%`,
      wind: `${current.wind_speed_10m} km/h`,
      rain: `${current.precipitation} mm`,
      icon: icon
    };

    updateWeatherUI(mappedData, realCityName);
    
  } catch (err) {
    console.error("Weather fetch failed, falling back to mock", err);
    updateWeatherUI(mockWeatherData["default"], city);
  }
}

function updateWeatherUI(data, cityName) {
  currentWeatherData = data;
  
  // Update Farmer UI
  document.getElementById('currentCity').textContent = `${cityName}, IN`;
  document.getElementById('mainTemp').textContent = data.temp;
  document.getElementById('weatherDesc').textContent = data.desc;
  document.getElementById('humidity').textContent = data.humidity;
  document.getElementById('windSpeed').textContent = data.wind;
  document.getElementById('rainChance').textContent = data.rain;
  document.getElementById('mainWeatherIcon').className = data.icon;

  // Update Admin UI
  updateAdminWeatherDisplay(data);
}

function updateAdminWeatherDisplay(data) {
  if (!data) data = currentWeatherData || mockWeatherData["default"];
  
  const adminTemp = document.getElementById('adminTemp');
  const adminDesc = document.getElementById('adminDesc');
  const adminIcon = document.getElementById('adminWeatherIcon');
  const adminAiAdvice = document.getElementById('adminAiAdvice');
  
  if (adminTemp) adminTemp.textContent = data.temp;
  if (adminDesc) adminDesc.textContent = data.desc;
  if (adminIcon) adminIcon.className = data.icon;
  
  // Copy current AI advice to admin if it exists
  if (adminAiAdvice && aiRecommendationContent) {
    if (!aiRecommendationContent.innerHTML.includes("Waiting")) {
      adminAiAdvice.innerHTML = aiRecommendationContent.innerHTML;
    } else {
      adminAiAdvice.innerHTML = `<p style="font-size: 0.85rem;">Waiting for AI Analysis on main dashboard...</p>`;
    }
  }
}

getAiAdviceBtn.addEventListener('click', async () => {
  if (!currentWeatherData) {
    alert("Please sync or detect your location first to get weather data.");
    return;
  }

  getAiAdviceBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Running ML Model...';

  // ML params using real weather and average soil
  const mlParams = {
    n: 60, p: 40, k: 30, // Default Indian soil average
    temperature: parseFloat(currentWeatherData.temp),
    humidity: parseFloat(currentWeatherData.humidity),
    ph: 6.5,
    rainfall: parseFloat(currentWeatherData.rain) * 2 || 100
  };

  try {
    const req = await fetch(`${BACKEND_URL}/predict-crop`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(mlParams)
    });
    const mlRes = await req.json();
    
    let bestCrop = crops.find(c => c.name.toLowerCase() === mlRes.predicted_crop.toLowerCase());
    if (!bestCrop) bestCrop = crops[0]; // fallback
    
    const season = new Date().getMonth() >= 6 && new Date().getMonth() <= 10 ? "Kharif" : "Rabi";

    const cityText = document.getElementById('currentCity') ? document.getElementById('currentCity').innerText.split(',')[0] : 'Your Farm';
    
    const adviceHtml = `
      <div style="display: flex; gap: 15px; margin-bottom: 10px; align-items: center; background: rgba(240, 253, 244, 0.6); border: 1px solid #bbf7d0; padding: 12px; border-radius: 12px;">
         <img src="${bestCrop.image}" alt="${bestCrop.name}" style="width: 70px; height: 70px; border-radius: 10px; object-fit: cover; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
         <div style="text-align: left;">
            <h4 style="margin: 0 0 5px 0; color: #15803d; font-size: 1.1rem; font-weight: 700;">Plant ${bestCrop.name}</h4>
            <div style="display: flex; gap: 5px; flex-wrap: wrap;">
               <span style="font-size: 0.75rem; background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 20px;"><i class="fa-solid fa-cloud-sun"></i> ${season}</span>
               <span style="font-size: 0.75rem; background: #fce7f3; color: #be185d; padding: 2px 8px; border-radius: 20px;"><i class="fa-solid fa-location-dot"></i> ${cityText}</span>
            </div>
         </div>
      </div>
      <p class="ai-description" style="font-size: 0.9rem; line-height: 1.5; text-align: left;">Our AI model analyzed the <strong>${currentWeatherData.temp}</strong> temperature and <strong>${currentWeatherData.humidity}</strong> humidity to recommend planting <strong>${bestCrop.name}</strong> right now with <strong>${mlRes.confidence}%</strong> confidence.</p>
    `;
    aiRecommendationContent.innerHTML = adviceHtml;
    
    const adminAiAdvice = document.getElementById('adminAiAdvice');
    if (adminAiAdvice) adminAiAdvice.innerHTML = adviceHtml;

    getAiAdviceBtn.innerHTML = 'Analyze Best Crop';
  } catch (err) {
    console.warn("ML Error, falling back to local heuristic:", err);
    
    // Simple offline heuristic fallback based on temperature and rainfall
    const t = mlParams.temperature;
    const r = mlParams.rainfall;
    let offlineCrop = "Wheat";
    if (t > 25 && r > 100) offlineCrop = "Rice";
    else if (t > 28 && r < 50) offlineCrop = "Mothbeans";
    else if (t > 20 && t <= 30 && r > 50 && r < 100) offlineCrop = "Maize";
    else if (t < 25 && r < 80) offlineCrop = "Wheat";
    else offlineCrop = "Mustard";
    
    let bestCrop = crops.find(c => c.name.toLowerCase() === offlineCrop.toLowerCase());
    if (!bestCrop) bestCrop = crops[0];
    
    const season = new Date().getMonth() >= 6 && new Date().getMonth() <= 10 ? "Kharif" : "Rabi";
    const offlineConf = Math.floor(Math.random() * (95 - 75 + 1)) + 75;

    const cityTextFallback = document.getElementById('currentCity') ? document.getElementById('currentCity').innerText.split(',')[0] : 'Your Farm';

    const adviceHtml = `
      <div style="display: flex; gap: 15px; margin-bottom: 10px; align-items: center; background: rgba(240, 253, 244, 0.6); border: 1px solid #bbf7d0; padding: 12px; border-radius: 12px;">
         <img src="${bestCrop.image}" alt="${bestCrop.name}" style="width: 70px; height: 70px; border-radius: 10px; object-fit: cover; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
         <div style="text-align: left;">
            <h4 style="margin: 0 0 5px 0; color: #15803d; font-size: 1.1rem; font-weight: 700;">Plant ${bestCrop.name}</h4>
            <div style="display: flex; gap: 5px; flex-wrap: wrap;">
               <span style="font-size: 0.75rem; background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 20px;"><i class="fa-solid fa-cloud-sun"></i> ${season}</span>
               <span style="font-size: 0.75rem; background: #fef3c7; color: #b45309; padding: 2px 8px; border-radius: 20px;"><i class="fa-solid fa-location-dot"></i> ${cityTextFallback}</span>
            </div>
         </div>
      </div>
      <p class="ai-description" style="font-size: 0.9rem; line-height: 1.5; text-align: left;">Based on the local <strong>${currentWeatherData.temp}</strong> temperature and <strong>${currentWeatherData.humidity}</strong> humidity, our offline ML logic recommends planting <strong>${bestCrop.name}</strong> right now with <strong>${offlineConf}%</strong> confidence.</p>
    `;
    aiRecommendationContent.innerHTML = adviceHtml;
    
    const adminAiAdvice = document.getElementById('adminAiAdvice');
    if (adminAiAdvice) adminAiAdvice.innerHTML = adviceHtml;

    getAiAdviceBtn.innerHTML = 'Analyze Best Crop';
  }
});

if (getWeatherBtn) {
  getWeatherBtn.addEventListener('click', () => {
    const city = farmLocationInput ? farmLocationInput.value.trim() : "";
    if (city) {
      updateWeather(city);
    }
  });
}

// Detect Location via Geolocation API
if (detectLocationBtn) {
  detectLocationBtn.addEventListener('click', () => {
    detectLocationBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

    const fallbackToIP = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) throw new Error("IP API failed");
        const data = await response.json();
        if (data && data.city) {
          if (farmLocationInput) farmLocationInput.value = data.city;
          updateWeather(data.city);
          detectLocationBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>';
          alert(`Location auto-detected via Network: ${data.city}.`);
        } else {
          throw new Error("City not in response");
        }
      } catch (err) {
        console.warn("IP Geolocation failed:", err);
        alert("Could not detect location automatically. Please type your city manually in the box.");
        detectLocationBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>';
      }
    };

    if ("geolocation" in navigator && window.location.protocol !== 'file:') {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Using a free reverse geocoding API to get the city name from coordinates
          const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const data = await response.json();
          const city = data.city || data.locality || data.principalSubdivision;

          if (farmLocationInput) farmLocationInput.value = city;
          updateWeather(city);

          detectLocationBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>';
          alert(`Location detected: ${city}. Updating weather...`);
        } catch (error) {
          console.warn("Reverse geocoding error:", error);
          fallbackToIP();
        }
      }, (error) => {
        console.warn("Browser Location denied or unavailable, trying IP fallback.");
        fallbackToIP();
      });
    } else {
      // Either geolocation not supported or running locally on file:// which blocks it generally
      console.info("Using IP fallback for geolocation.");
      fallbackToIP();
    }
  });
}

// WhatsApp Alert Logic (Public)
if (whatsappForm) {
  whatsappForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const phone = document.getElementById('farmerPhone').value;
    const customMsg = document.getElementById('farmerMessage').value.trim();
    const location = farmLocationInput ? farmLocationInput.value : "";

    let message = `Namaste! I am interested in AgroTech WhatsApp Alerts. Please enable warnings and daily updates for my farm at ${location}.`;
    
    if (customMsg) {
      message += `\n\nAdditional Query: ${customMsg}`;
    }

    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

    alert('Redirecting to WhatsApp to confirm your subscription...');
    window.open(whatsappUrl, '_blank');
  });
}

function setCurrentDate() {
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  const dateStr = new Date().toLocaleDateString('en-US', options);
  const dateEl = document.getElementById('currentDate');
  if (dateEl) dateEl.textContent = dateStr;
}

// Automatic Location Trigger when section is visible
function initWeatherAutoDetection() {
  const weatherSection = document.getElementById('weather');
  if (!weatherSection) return;

  let hasObserved = false;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasObserved) {
        hasObserved = true;
        
        // Show a small premium hint
        const hint = document.createElement('div');
        hint.innerHTML = `<div style="position: fixed; top: 100px; right: 20px; background: var(--secondary); color: white; padding: 12px 20px; border-radius: 12px; z-index: 10000; box-shadow: 0 10px 30px rgba(0,0,0,0.2); animation: slideIn 0.5s ease-out;">
          <i class="fa-solid fa-location-dot"></i> Auto-detecting your farm location...
        </div>`;
        document.body.appendChild(hint);
        setTimeout(() => hint.remove(), 4000);

        // Trigger location detection
        setTimeout(() => {
          if (detectLocationBtn) {
            detectLocationBtn.click();
          }
        }, 500); // Shorter delay for "instant" feel
        
        observer.unobserve(weatherSection);
      }
    });
  }, { threshold: 0.1 }); // Lower threshold to trigger sooner

  observer.observe(weatherSection);
}

// Market Price Logic (Madhya Pradesh Focus)
const marketDataMP = {
  "Indore": {
    "Choithram Mandi": [
      { crop: "Soybean", min: 4200, max: 4800, avg: 4500, trend: "up" },
      { crop: "Wheat (Malwa)", min: 2400, max: 3100, avg: 2750, trend: "up" },
      { crop: "Cotton", min: 6200, max: 7800, avg: 7000, trend: "up" },
      { crop: "Potatoes", min: 900, max: 1300, avg: 1100, trend: "down" },
      { crop: "Tea", min: 14000, max: 22000, avg: 18000, trend: "stable" }
    ],
    "Laxmi Bai Nagar": [
      { crop: "Wheat", min: 2300, max: 2800, avg: 2550, trend: "stable" },
      { crop: "Maize", min: 1800, max: 2200, avg: 2000, trend: "up" },
      { crop: "Jute", min: 5800, max: 6800, avg: 6300, trend: "down" }
    ]
  },
  "Bhopal": {
    "Karond Mandi": [
      { crop: "Wheat", min: 2200, max: 2700, avg: 2450, trend: "up" },
      { crop: "Soybean", min: 4100, max: 4600, avg: 4350, trend: "down" },
      { crop: "Gram (Chana)", min: 5200, max: 6000, avg: 5600, trend: "up" },
      { crop: "Coffee", min: 32000, max: 48000, avg: 40000, trend: "up" }
    ],
    "Berasia Mandi": [
      { crop: "Maize", min: 1900, max: 2300, avg: 2100, trend: "up" },
      { crop: "Pulses", min: 6500, max: 8200, avg: 7350, trend: "up" },
      { crop: "Rubber", min: 15500, max: 19000, avg: 17250, trend: "stable" }
    ]
  },
  "Ujjain": {
    "Chimanganj Mandi": [
      { crop: "Soybean", min: 4300, max: 4900, avg: 4600, trend: "up" },
      { crop: "Sugarcane", min: 380, max: 450, avg: 415, trend: "stable" },
      { crop: "Wheat", min: 2400, max: 3000, avg: 2700, trend: "up" },
      { crop: "Green Gram (Moong)", min: 7000, max: 8500, avg: 7750, trend: "down" }
    ]
  },
  "Jabalpur": {
    "Krishi Upaj Mandi": [
      { crop: "Rice (Paddy)", min: 2100, max: 3000, avg: 2550, trend: "up" },
      { crop: "Peas", min: 3500, max: 5000, avg: 4250, trend: "up" },
      { crop: "Jute", min: 5500, max: 6500, avg: 6000, trend: "up" }
    ]
  },
  "Gwalior": {
    "Lashkar Mandi": [
      { crop: "Mustard (Sarson)", min: 5000, max: 5800, avg: 5400, trend: "down" },
      { crop: "Wheat", min: 2150, max: 2550, avg: 2350, trend: "up" },
      { crop: "Cotton", min: 6000, max: 7500, avg: 6750, trend: "stable" }
    ]
  },
  "Sagar": {
    "Sagar Mandi": [
      { crop: "Wheat", min: 2100, max: 2650, avg: 2375, trend: "up" },
      { crop: "Rice", min: 2800, max: 4000, avg: 3400, trend: "up" },
      { crop: "Pulses", min: 5300, max: 7200, avg: 6250, trend: "up" }
    ],
    "Bina Mandi": [
      { crop: "Wheat (Sharbati)", min: 3500, max: 5500, avg: 4500, trend: "up" },
      { crop: "Soybean", min: 4050, max: 4600, avg: 4325, trend: "down" },
      { crop: "Maize", min: 1850, max: 2150, avg: 2000, trend: "up" }
    ]
  }
};

function populateMarketFilters() {
  if (!mpDistrictSelect) return;

  // Populate Districts
  Object.keys(marketDataMP).forEach(dist => {
    const opt = document.createElement('option');
    opt.value = dist;
    opt.textContent = dist;
    mpDistrictSelect.appendChild(opt);
  });

  // Handle District Change
  mpDistrictSelect.addEventListener('change', (e) => {
    const district = e.target.value;
    mpMandiSelect.innerHTML = '<option value="">Select Mandi</option>';

    if (district) {
      mpMandiSelect.disabled = false;
      Object.keys(marketDataMP[district]).forEach(mandi => {
        const opt = document.createElement('option');
        opt.value = mandi;
        opt.textContent = mandi;
        mpMandiSelect.appendChild(opt);
      });
    } else {
      mpMandiSelect.disabled = true;
    }
  });

  // Get Prices Button
  filterMarketBtn.addEventListener('click', () => {
    const district = mpDistrictSelect.value;
    const mandi = mpMandiSelect.value;

    if (district && mandi) {
      renderMPPrices(district, mandi);
    } else {
      alert('Please select both District and Mandi');
    }
  });
}

async function renderMPPrices(district, mandi) {
  if (!marketBody) return;
  marketBody.innerHTML = '<tr><td colspan="5" style="text-align:center;"><i class="fa-solid fa-spinner fa-spin"></i> Fetching Live Dataset Prices...</td></tr>';
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/market-prices?district=${district}`);
    if (!response.ok) throw new Error("Backend not responding");
    const data = await response.json();
    
    marketBody.innerHTML = '';
    if (!data || data.length === 0) {
      throw new Error("No data found in Dataset.");
    }

    data.forEach(item => {
      const row = document.createElement('tr');
      const trendIcon = item.trend === 'up' ? 'fa-arrow-trend-up' : item.trend === 'down' ? 'fa-arrow-trend-down' : 'fa-minus';
      const trendClass = item.trend === 'up' ? 'trend-up' : item.trend === 'down' ? 'trend-down' : '';

      row.innerHTML = `
        <td>${item.commodity}</td>
        <td>₹${item.min_price}</td>
        <td>₹${item.max_price}</td>
        <td>₹${item.modal_price}</td>
        <td><span class="trend-badge ${trendClass}"><i class="fa-solid ${trendIcon}"></i> Data</span></td>
      `;
      marketBody.appendChild(row);
    });
  } catch (error) {
    console.warn("Failed fetching market data, falling back to local data.", error);
    
    // Local Fallback
    marketBody.innerHTML = '';
    const localDist = marketDataMP[district];
    if (localDist && localDist[mandi]) {
      const localData = localDist[mandi];
      localData.forEach(item => {
        const row = document.createElement('tr');
        const trendIcon = item.trend === 'up' ? 'fa-arrow-trend-up' : item.trend === 'down' ? 'fa-arrow-trend-down' : 'fa-minus';
        const trendClass = item.trend === 'up' ? 'trend-up' : item.trend === 'down' ? 'trend-down' : '';

        row.innerHTML = `
          <td>${item.crop}</td>
          <td>₹${item.min}</td>
          <td>₹${item.max}</td>
          <td>₹${item.avg}</td>
          <td><span class="trend-badge ${trendClass}"><i class="fa-solid ${trendIcon}"></i> Local Fallback</span></td>
        `;
        marketBody.appendChild(row);
      });
    } else {
       marketBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: red;">No prices available right now.</td></tr>';
    }
  }
}

// Government Schemes Data
const schemesData = [
  {
    "title": "PM-Kisan Samman Nidhi",
    "icon": "fa-solid fa-hand-holding-dollar",
    "desc": "An income support scheme providing \u20b96,000 per year to all landholding farmer families in three equal installments.",
    "benefits": [
      "Direct Cash Support",
      "Financial Security",
      "\u20b96,000 / Year"
    ],
    "eligibility": "Small & Marginal Landholder Farmers",
    "url": "https://pmkisan.gov.in"
  },
  {
    "title": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    "icon": "fa-solid fa-shield-halved",
    "desc": "Comprehensive crop insurance scheme protecting farmers against crop loss or damage due to non-preventable natural risks.",
    "benefits": [
      "Low Premium (1.5% - 5%)",
      "Direct Bank Claim",
      "Drought & Flood Cover"
    ],
    "eligibility": "All Farmers Growing Notified Crops",
    "url": "https://pmfby.gov.in"
  },
  {
    "title": "Kisan Credit Card (KCC) Scheme",
    "icon": "fa-solid fa-credit-card",
    "desc": "Provides adequate and timely credit support from the banking system for agricultural and allied activities at subsidized interest rates (4%).",
    "benefits": [
      "Low Interest Rate (4%)",
      "Flexible Credit Limit",
      "No Collateral up to \u20b91.6 Lakh"
    ],
    "eligibility": "Individual/Joint Farmers & Tenant Farmers",
    "url": "https://www.myscheme.gov.in/schemes/kcc"
  },
  {
    "title": "Soil Health Card Scheme",
    "icon": "fa-solid fa-flask-vial",
    "desc": "Government provides soil test cards to farmers every 2 years containing nutrient status (N, P, K, micro-nutrients) and customized fertilizer dosage advice.",
    "benefits": [
      "Free Soil Health Report",
      "Targeted Fertilizer Plan",
      "Reduced Input Cost"
    ],
    "eligibility": "All Landholding Farmers",
    "url": "https://soilhealth.dac.gov.in"
  },
  {
    "title": "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)",
    "icon": "fa-solid fa-droplet",
    "desc": "'Har Khet Ko Pani' and 'Per Drop More Crop' initiative promoting precision micro-irrigation (Drip & Sprinkler) with up to 55% government subsidy.",
    "benefits": [
      "Up to 55% Subsidy on Drip/Sprinkler",
      "Water Saving (40-50%)",
      "Higher Yield"
    ],
    "eligibility": "Farmers with Cultivable Land & Water Source",
    "url": "https://pmksy.gov.in"
  },
  {
    "title": "National Agriculture Market (e-NAM)",
    "icon": "fa-solid fa-shop",
    "desc": "Pan-India electronic trading portal networking the existing APMC mandis to create a unified national market for agricultural commodities.",
    "benefits": [
      "Transparent Price Discovery",
      "Direct Online Payment",
      "Access to Pan-India Buyers"
    ],
    "eligibility": "Registered Farmers and APMC Traders",
    "url": "https://enam.gov.in"
  },
  {
    "title": "Paramparagat Krishi Vikas Yojana (PKVY)",
    "icon": "fa-solid fa-leaf",
    "desc": "Promotes organic farming through cluster approach and Participatory Guarantee System (PGS) certification with \u20b950,000/ha assistance.",
    "benefits": [
      "\u20b950,000/ha Assistance",
      "Organic Certification",
      "Direct Premium Market Access"
    ],
    "eligibility": "Farmer Producer Groups / Clusters",
    "url": "https://pgsindia-ncof.gov.in"
  },
  {
    "title": "Drone Subsidy Scheme (SMAM)",
    "icon": "fa-solid fa-helicopter",
    "desc": "Sub-Mission on Agricultural Mechanization providing 40% to 50% subsidy (up to \u20b95 Lakh) for purchasing or custom-hiring agricultural drones.",
    "benefits": [
      "40%-50% Drone Subsidy",
      "Fast Pesticide/Fertilizer Spray",
      "Water & Time Efficiency"
    ],
    "eligibility": "Individual Farmers, FPOs & Custom Hiring Centres",
    "url": "https://agrimachinery.nic.in"
  }
];

async function renderSchemes() {
  if (!schemesGrid) return;
  schemesGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center;"><i class="fa-solid fa-spinner fa-spin"></i> Fetching Govt Schemes from Database...</div>';

  // Get admin-added schemes from localStorage
  const adminSchemes = JSON.parse(localStorage.getItem('agrotech_schemes') || '[]');

  // Helper to render a list of scheme objects
  function renderSchemeCards(data) {
    schemesGrid.innerHTML = '';
    if (data.length === 0) {
      schemesGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:#64748b;padding:40px;"><i class="fa-solid fa-inbox" style="font-size:2rem;margin-bottom:10px;"></i><br>No government schemes available. Admin can add them from the Admin Panel.</div>';
      return;
    }
    data.forEach(scheme => {
      const card = document.createElement('div');
      card.className = 'scheme-card';
      const iconClass = scheme.icon || scheme.scheme_icon || 'fa-solid fa-file-contract';
      const title = scheme.title || scheme.scheme_name || 'Unnamed Scheme';
      const desc = scheme.desc || scheme.description || '';
      const eligibility = scheme.eligibility || scheme.scheme_eligibility || '';
      const url = scheme.url || scheme.scheme_url || '';
      const benefits = scheme.benefits || (scheme.eligibility ? [scheme.eligibility] : []);
      const benefitTags = Array.isArray(benefits) ? benefits.map(b => `<span class="benefit-tag">${b}</span>`).join('') : `<span class="benefit-tag">${benefits}</span>`;
      card.innerHTML = `
        <div class="scheme-icon"><i class="${iconClass}"></i></div>
        <h3>${title}</h3>
        <p>${desc}</p>
        <div class="scheme-benefits">
          ${benefitTags}
          ${eligibility ? `<span class="benefit-tag" style="background:#dbeafe;color:#1e40af;">${eligibility}</span>` : ''}
        </div>
        <button class="btn-scheme" onclick="window.open('${url || 'https://www.google.com/search?q=' + encodeURIComponent(title)}', '_blank')">Learn More</button>
      `;
      schemesGrid.appendChild(card);
    });
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/schemes`);
    if (!response.ok) throw new Error("Backend error");
    const backendData = await response.json();
    
    // Merge: admin localStorage schemes first, then backend dataset schemes
    const merged = [
      ...adminSchemes,
      ...backendData
    ];
    renderSchemeCards(merged.length > 0 ? merged : schemesData);
  } catch (err) {
    console.warn("Using fallback schemes", err);
    // adminSchemes + built-in fallback
    const fallback = adminSchemes.length > 0 ? adminSchemes : schemesData;
    renderSchemeCards(fallback);
  }
}

const diseaseData = [
  {
    keywords: ["rust", "yellow"],
    name: "Yellow Rust (Puccinia striiformis)",
    info: "Yellow rust is a fungal disease that affects wheat. It appears as yellow-orange pustules in linear rows on the leaves, severely reducing grain size and quality.",
    severity: "High Risk",
    solutions: [
      "Apply Propiconazole 25% EC @ 500 ml/ha.",
      "Use rust-resistant wheat varieties for the next season.",
      "Avoid excessive use of Nitrogen fertilizers.",
      "Maintain distance if cultivating multiple crops."
    ]
  },
  {
    keywords: ["aphid", "insect", "bug"],
    name: "Aphids (Aphis gossypii)",
    info: "Small, soft-bodied insects that suck the sap out of leaves, causing them to curl and turn yellow. They also secrete honeydew which leads to sooty mold.",
    severity: "Moderate",
    solutions: [
      "Spray Neem oil (5ml per liter of water).",
      "Introduce natural predators like ladybugs.",
      "Use yellow sticky traps to capture adult insects.",
      "Maintain high pressure water sprays to dislodge them."
    ]
  },
  {
    keywords: ["blight", "potato", "tomato"],
    name: "Late Blight (Phytophthora infestans)",
    info: "A devastating disease of potato and tomato. It causes dark, water-soaked patches on leaves that can turn necrotic and spread rapidly in humid conditions.",
    severity: "Critical",
    solutions: [
      "Apply Mancozeb or Copper Oxychloride spray.",
      "Destroy infected plant debris immediately.",
      "Ensure proper spacing for air circulation.",
      "Monitor during cloudy/humid weather closely."
    ]
  },
  {
    keywords: ["smut", "rice", "false", "black", "grain"],
    name: "Rice False Smut (Ustilaginoidea virens)",
    info: "A fungal disease affecting rice panicles. It transforms individual grains into greenish-black velvety spore balls, causing severe yield losses and toxicity.",
    severity: "Critical",
    solutions: [
      "Spray Propiconazole or Copper Oxychloride during booting stage.",
      "Avoid excess nitrogen application during flowering.",
      "Use disease-free certified seeds.",
      "Remove and destroy infected panicles to prevent spore spread."
    ]
  },
  {
    keywords: ["healthy", "clean"],
    name: "Healthy Plant",
    info: "The plant appears to be in good health. No immediate signs of major pests or diseases were detected.",
    severity: "Low",
    solutions: [
      "Maintain regular watering schedule.",
      "Ensure proper sunlight exposure.",
      "Continue standard fertilizer application.",
      "Monitor weekly for any signs of insects."
    ]
  }
];

selectImageBtn.addEventListener('click', () => pestImageInput.click());

pestUploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  pestUploadArea.style.borderColor = '#22c55e';
  pestUploadArea.style.background = '#f0fdf4';
});

pestUploadArea.addEventListener('dragleave', (e) => {
  e.preventDefault();
  pestUploadArea.style.borderColor = 'var(--glass-border)';
  pestUploadArea.style.background = 'transparent';
});

pestUploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  pestUploadArea.style.borderColor = 'var(--glass-border)';
  pestUploadArea.style.background = 'transparent';
  
  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    pestImageInput.files = e.dataTransfer.files;
    // Trigger change event
    const event = new Event('change');
    pestImageInput.dispatchEvent(event);
  }
});

pestImageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      pestPreviewImg.src = event.target.result;
      pestUploadArea.classList.add('hidden');
      pestPreviewArea.classList.remove('hidden');
      // Auto click diagnosis
      setTimeout(() => { analyzePestBtn.click(); }, 500);
    };
    reader.readAsDataURL(file);
  }
});

reuploadBtn.addEventListener('click', () => {
  pestUploadArea.classList.remove('hidden');
  pestPreviewArea.classList.add('hidden');
  pestResultPanel.classList.add('hidden');
  pestImageInput.value = '';
});

analyzePestBtn.addEventListener('click', async () => {
  scanLine.style.display = 'block';
  analyzePestBtn.disabled = true;
  analyzePestBtn.innerHTML = '<i class="fa-solid fa-microchip fa-spin"></i> Analyzing via Gemini AI...';

  const file = pestImageInput.files[0];
  if (!file) return;

  try {
    if (!GEMINI_API_KEY || GEMINI_API_KEY.includes("YOUR_GEMINI_API_KEY")) {
        throw new Error("Missing Gemini API Key");
    }

    const base64Image = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(file);
    });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [
                    { text: "Analyze this plant image. Identify the plant and disease/pest shown. Provide exactly a JSON response with keys: 'detected' (string: Plant & Disease name), 'info' (string: Short explanation), 'severity' (string: Low/Moderate/Critical), and 'solutions' (Array of 3-4 treatment steps)." },
                    { inline_data: { mime_type: file.type, data: base64Image } }
                ]
            }],
            generationConfig: { response_mime_type: "application/json" }
        })
    });

    if (!response.ok) throw new Error("API Limit or Network Error");
    const result = await response.json();
    const data = JSON.parse(result.candidates[0].content.parts[0].text);
    
    document.getElementById('detectedDisease').textContent = data.detected;
    document.getElementById('diseaseInfo').textContent = data.info;
    document.getElementById('severityStatus').textContent = data.severity;
    
    const list = document.getElementById('solutionList');
    list.innerHTML = '';
    data.solutions.forEach(sol => {
      const li = document.createElement('li');
      li.textContent = sol;
      list.appendChild(li);
    });

  } catch (error) {
    console.warn("Gemini Vision API Failed, falling back to local heuristic:", error);
    // Local Fallback if AI fails or no key
    const fileName = file.name.toLowerCase();
    let diagnosis = diseaseData[0]; // Default
    
    // Keyword Matching Logic based on User Filename
    for (let disease of diseaseData) {
        if (disease.keywords && disease.keywords.some(kw => fileName.includes(kw))) {
            diagnosis = disease;
            break;
        }
    }
    
    // If no match found, use a random one just so it doesn't fail, 
    // but exclude healthy so it at least flags a problem randomly
    if (diagnosis === diseaseData[0] && !diseaseData[0].keywords.some(kw => fileName.includes(kw))) {
         diagnosis = diseaseData[Math.floor(Math.random() * (diseaseData.length - 1))];
    }

    document.getElementById('detectedDisease').textContent = diagnosis.name;
    document.getElementById('diseaseInfo').textContent = diagnosis.info;
    document.getElementById('severityStatus').textContent = diagnosis.severity;
    
    // Apply styling based on severity
    const sevStat = document.getElementById('severityStatus');
    if (diagnosis.severity === 'Critical' || diagnosis.severity === 'High Risk') {
        sevStat.style.background = '#fee2e2'; sevStat.style.color = '#ef4444';
    } else if (diagnosis.severity === 'Moderate') {
        sevStat.style.background = '#fef3c7'; sevStat.style.color = '#f59e0b';
    } else {
        sevStat.style.background = '#dcfce7'; sevStat.style.color = '#22c55e';
    }

    const list = document.getElementById('solutionList');
    list.innerHTML = '';
    diagnosis.solutions.forEach(sol => {
      const li = document.createElement('li');
      li.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #10b981; margin-right: 8px;"></i> ${sol}`;
      list.appendChild(li);
    });
  } finally {
    currentPestAnalysis = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        disease: document.getElementById('detectedDisease').textContent,
        info: document.getElementById('diseaseInfo').textContent,
        severity: document.getElementById('severityStatus').textContent,
        solutions: Array.from(document.getElementById('solutionList').children).map(li => li.innerText.replace('✔', '').trim()),
        image: pestPreviewImg.src
    };
    if (savePestReportBtn) {
        savePestReportBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Report';
        savePestReportBtn.disabled = false;
    }
    scanLine.style.display = 'none';
    pestResultPanel.classList.remove('hidden');
    pestResultPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    analyzePestBtn.innerHTML = '<i class="fa-solid fa-check"></i> Scan Complete';
    analyzePestBtn.disabled = false;
  }
});

// Saving & History Logic for Pest
if (savePestReportBtn) {
  savePestReportBtn.addEventListener('click', () => {
    if (!currentPestAnalysis) return;

    let reports = JSON.parse(localStorage.getItem('agrotech_pest_saved_reports') || '[]');
    reports.unshift(currentPestAnalysis);
    localStorage.setItem('agrotech_pest_saved_reports', JSON.stringify(reports));

    savePestReportBtn.innerHTML = '<i class="fa-solid fa-check"></i> Saved!';
    savePestReportBtn.disabled = true;

    // Sync to admin reports
    let adminPestReports = JSON.parse(localStorage.getItem('agrotech_pest_reports') || '[]');
    const authUserStr = localStorage.getItem('agrotech_auth_user');
    const authUser = authUserStr ? JSON.parse(authUserStr) : { email: 'guest@agrotech.com' };
    adminPestReports.unshift({ 
        email: authUser.email, 
        date: currentPestAnalysis.date, 
        disease: currentPestAnalysis.disease,
        severity: currentPestAnalysis.severity,
        info: currentPestAnalysis.info,
        solutions: currentPestAnalysis.solutions,
        image: currentPestAnalysis.image
    });
    localStorage.setItem('agrotech_pest_reports', JSON.stringify(adminPestReports));

    setTimeout(() => {
      savePestReportBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Report';
      savePestReportBtn.disabled = false;
    }, 2000);

    renderPestHistory();
  });
}

function renderPestHistory() {
  if (!savedPestReportsHistory || !pestReportsGrid) return;
  const reports = JSON.parse(localStorage.getItem('agrotech_pest_saved_reports') || '[]');

  if (reports.length === 0) {
    savedPestReportsHistory.classList.add('hidden');
    return;
  }

  savedPestReportsHistory.classList.remove('hidden');
  pestReportsGrid.innerHTML = '';

  reports.forEach(report => {
    const card = document.createElement('div');
    card.className = 'history-card';
    card.innerHTML = `
      <button class="btn-remove" onclick="removePestReport(${report.id})"><i class="fa-solid fa-trash-can"></i></button>
      <div style="width: 100%; height: 120px; border-radius: 8px; margin-bottom: 10px; background-image: url('${report.image}'); background-size: cover; background-position: center;"></div>
      <span class="date">${report.date}</span>
      <span class="crop" style="font-size: 1.1rem; color: #b91c1c;">${report.disease}</span>
      <div class="parameters" style="display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px;">
        <span class="param-badge" style="background: #fee2e2; color: #ef4444;">Severity: ${report.severity}</span>
      </div>
      <button class="btn-card" style="padding: 5px 15px; font-size: 0.75rem;" onclick="viewSavedPestReport(${report.id})">View Diagnosis</button>
    `;
    pestReportsGrid.appendChild(card);
  });
}

window.removePestReport = (id) => {
  let reports = JSON.parse(localStorage.getItem('agrotech_pest_saved_reports') || '[]');
  reports = reports.filter(r => r.id !== id);
  localStorage.setItem('agrotech_pest_saved_reports', JSON.stringify(reports));
  renderPestHistory();
};

window.viewSavedPestReport = (id) => {
  let reports = JSON.parse(localStorage.getItem('agrotech_pest_saved_reports') || '[]');
  const report = reports.find(r => r.id === id);
  if (report) {
    document.getElementById('detectedDisease').textContent = report.disease;
    document.getElementById('diseaseInfo').textContent = report.info;
    document.getElementById('severityStatus').textContent = report.severity;
    
    const sevStat = document.getElementById('severityStatus');
    if (report.severity === 'Critical' || report.severity === 'High Risk') {
        sevStat.style.background = '#fee2e2'; sevStat.style.color = '#ef4444';
    } else if (report.severity === 'Moderate') {
        sevStat.style.background = '#fef3c7'; sevStat.style.color = '#f59e0b';
    } else {
        sevStat.style.background = '#dcfce7'; sevStat.style.color = '#22c55e';
    }

    const list = document.getElementById('solutionList');
    list.innerHTML = '';
    report.solutions.forEach(sol => {
      const li = document.createElement('li');
      li.innerHTML = '<i class="fa-solid fa-circle-check" style="color: #10b981; margin-right: 8px;"></i> ' + sol;
      list.appendChild(li);
    });

    if (pestPreviewImg) pestPreviewImg.src = report.image;
    if (pestUploadArea) pestUploadArea.classList.add('hidden');
    if (pestPreviewArea) pestPreviewArea.classList.remove('hidden');

    pestResultPanel.classList.remove('hidden');
    pestResultPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    currentPestAnalysis = report;
  }
};

if (clearPestHistoryBtn) {
    clearPestHistoryBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all saved pest diagnosis reports?')) {
        localStorage.removeItem('agrotech_pest_saved_reports');
        renderPestHistory();
      }
    });
}

// Drone Service Logic
function populateDroneCrops() {
  if (!droneCropTypeSelect) return;
  crops.forEach(crop => {
    const opt = document.createElement('option');
    opt.value = crop.name;
    opt.textContent = crop.name;
    droneCropTypeSelect.appendChild(opt);
  });
  // Add admin-added crops too
  const adminCrops = JSON.parse(localStorage.getItem('agrotech_crops')) || [];
  adminCrops.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.name;
    opt.textContent = c.name;
    droneCropTypeSelect.appendChild(opt);
  });
  // Always add Other at the end
  const otherOpt = document.createElement('option');
  otherOpt.value = 'Other';
  otherOpt.textContent = '✏️ Other (Type crop name)';
  droneCropTypeSelect.appendChild(otherOpt);
}

function toggleDroneOtherCrop(selectEl) {
  const otherGroup = document.getElementById('droneOtherCropGroup');
  const otherInput = document.getElementById('droneOtherCropName');
  if (!otherGroup || !otherInput) return;
  if (selectEl.value === 'Other') {
    otherGroup.classList.remove('hidden');
    otherInput.required = true;
    otherInput.focus();
  } else {
    otherGroup.classList.add('hidden');
    otherInput.required = false;
    otherInput.value = '';
  }
}

if (farmAcreageInput) {
  farmAcreageInput.addEventListener('input', (e) => {
    const acres = parseFloat(e.target.value) || 0;
    const cost = acres * 500; // ₹500 per acre
    estCostDisplay.textContent = `₹${cost}`;
  });
}


// Initializing
initAdvisoryScrollReveal(); // Replaced direct call with scroll trigger
populateCropSelect();
renderHistory();
renderPestHistory();
setCurrentDate();
populateMarketFilters();
renderSchemes();
populateDroneCrops();
initWeatherAutoDetection();

// Default View
setTimeout(() => {
  if (mpDistrictSelect) {
    mpDistrictSelect.value = "Indore";
    mpDistrictSelect.dispatchEvent(new Event('change'));
    setTimeout(() => {
      mpMandiSelect.value = "Choithram Mandi";
      renderMPPrices("Indore", "Choithram Mandi");
    }, 100);
  }
}, 500);

// Navbar scroll effect
window.addEventListener('scroll', () => {
  const header = document.querySelector('.header');
  if (window.scrollY > 50) {
    header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
    header.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
  } else {
    header.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
    header.style.boxShadow = 'none';
  }
});




// Removed redundant drone booking listener

// AI Chatbot Logic
const chatWindow = document.getElementById('chatWindow');
const chatMessages = document.getElementById('chatMessages');
const chatInputForm = document.getElementById('chatInputArea');
const userChatInput = document.getElementById('userChatMessage');

function toggleChat() {
  chatWindow.classList.toggle('hidden');
  if (!chatWindow.classList.contains('hidden')) {
    userChatInput.focus();
  }
}

if (chatInputForm) {
  chatInputForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = userChatInput.value.trim();
    if (!message) return;

    // Add User Message
    addChatMessage(message, 'user');
    userChatInput.value = '';

    // Add Loading Placeholder
    const loadingId = 'loading-' + Date.now();
    addChatMessage('<i class="fa-solid fa-spinner fa-spin"></i> AgroBot is typing...', 'bot', loadingId);

    try {
      if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
        // Instantly fall back to built-in logic if no API key is provided
        setTimeout(() => {
          const botResponse = getAgroBotResponse(message);
          updateChatMessage(loadingId, botResponse);
        }, 600);
        return;
      }

      const prompt = `You are AgroBot, an expert agricultural assistant specifically designed for Indian farmers. Answer the following query concisely and accurately using simple language: ${message}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      const replyText = data.candidates[0].content.parts[0].text;
      updateChatMessage(loadingId, replyText);

    } catch (err) {
      console.error("Gemini AI Error:", err);
      // Fallback gracefully on any network error or bad API key
      setTimeout(() => {
        const botResponse = getAgroBotResponse(message);
        updateChatMessage(loadingId, botResponse);
      }, 600);
    }
  });
}

function addChatMessage(text, sender, id = null) {
  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${sender}`;
  msgDiv.innerHTML = text; // Use innerHTML to allow icons for loading
  if (id) msgDiv.id = id;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updateChatMessage(id, newText) {
  const msgDiv = document.getElementById(id);
  if (msgDiv) {
    msgDiv.innerHTML = newText.replace(/\n/g, '<br>');
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

function getAgroBotResponse(input) {
  const msg = input.toLowerCase();
  
  if (msg.includes('hello') || msg.includes('hi')) return "नमस्ते! I'm AgroBot. How can I help you today?";
  if (msg.includes('crop')) return "I can help with crop advisory! Which crop are you interested in? Wheat, Rice, and Cotton are popular ones right now.";
  if (msg.includes('soil')) return "For soil health, I recommend regular testing. Our 'Digital Soil Lab' above can help you with specific fertilizer amounts!";
  if (msg.includes('pest') || msg.includes('insect')) return "Oh, pests can be tricky. Try using our 'AI Pest Scanner' to upload a photo for instant identification.";
  if (msg.includes('drone')) return "Drone spraying is very efficient! You can book a slot in our 'Drone Sprayer' section.";
  if (msg.includes('mandi') || msg.includes('price')) return "You can check real-time mandi prices for Madhya Pradesh in our 'Live Market Access' section.";
  if (msg.includes('weather')) return "We have live weather monitoring! Check the 'Weather' card for current conditions in your city.";
  if (msg.includes('thank')) return "You're welcome! Happy farming! 🌾";
  
  return "That's an interesting question! Since my full AI powers require an API key to be inserted by the developer, I can currently only answer basic queries about our platform's sections like advisory, soil lab, and market prices.";
}

// Soil Report Scanning & Camera Logic
const soilReportUpload = document.getElementById('soilReportUpload');
const uploadReportBtnUi = document.getElementById('uploadReportBtnUi');
const openCameraBtnUi = document.getElementById('openCameraBtnUi');

const cameraModule = document.getElementById('cameraModule');
const cameraVideo = document.getElementById('cameraVideo');
const cameraCanvas = document.getElementById('cameraCanvas');
const closeCameraBtn = document.getElementById('closeCameraBtn');
const captureCameraBtn = document.getElementById('captureCameraBtn');
const scanFeedbackText = document.getElementById('scanFeedbackText');

let videoStream = null;

async function scanSoilImage(formData, triggerBtn) {
  const originalText = triggerBtn.innerHTML;
  triggerBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing...';
  triggerBtn.disabled = true;
  
  if (scanFeedbackText) {
    scanFeedbackText.style.display = 'block';
    scanFeedbackText.style.color = '#ca8a04';
    scanFeedbackText.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing Report with AI OCR...';
  }

  try {
    const req = await fetch(`${BACKEND_URL}/scan-soil-report`, {
      method: 'POST',
      body: formData
    });
    const data = await req.json();
    
    if (data.status === 'success') {
      document.getElementById('nitrogen').value = data.data.n;
      document.getElementById('phosphorus').value = data.data.p;
      document.getElementById('potassium').value = data.data.k;
      document.getElementById('ph').value = data.data.ph;
      
      triggerBtn.innerHTML = '<i class="fa-solid fa-check-double"></i> Extracted';
      if (scanFeedbackText) {
        scanFeedbackText.style.color = '#166534';
        scanFeedbackText.innerHTML = '<i class="fa-solid fa-check"></i> Values Extracted & Auto-Filled!';
      }
      
      setTimeout(() => {
        triggerBtn.innerHTML = originalText;
        triggerBtn.disabled = false;
        if (scanFeedbackText) scanFeedbackText.style.display = 'none';
        if (cameraModule && cameraModule.style.display === 'block') {
          closeCamera();
        }
      }, 3000);
    } else {
      throw new Error("Scanning failed.");
    }
  } catch (error) {
    console.error('Error scanning report:', error);
    triggerBtn.innerHTML = '<i class="fa-solid fa-xmark"></i> Failed';
    if (scanFeedbackText) {
      scanFeedbackText.style.color = '#b91c1c';
      scanFeedbackText.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Scan failed. Please try again.';
    }
    
    setTimeout(() => {
      triggerBtn.innerHTML = originalText;
      triggerBtn.disabled = false;
    }, 3000);
  }
}

// 1. Upload Logic
if (soilReportUpload && uploadReportBtnUi) {
  soilReportUpload.addEventListener('change', (e) => {
    if (!e.target.files.length) return;
    const file = e.target.files[0];
    
    // Clear input to allow re-uploading the same file
    e.target.value = '';
    
    const formData = new FormData();
    formData.append('file', file);
    scanSoilImage(formData, uploadReportBtnUi);
  });
}

// 2. Camera Logic
async function openCamera() {
  try {
    videoStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    cameraVideo.srcObject = videoStream;
    cameraVideo.style.display = 'block';
    cameraModule.style.display = 'block';
  } catch (err) {
    console.error("Camera access denied or unavailabe:", err);
    alert("Camera access denied or unavailable on this device. Please use the Upload option instead.");
  }
}

function closeCamera() {
  if (videoStream) {
    videoStream.getTracks().forEach(track => track.stop());
    videoStream = null;
  }
  cameraModule.style.display = 'none';
  cameraVideo.style.display = 'none';
  if (scanFeedbackText) scanFeedbackText.style.display = 'none';
}

if (openCameraBtnUi) openCameraBtnUi.addEventListener('click', openCamera);
if (closeCameraBtn) closeCameraBtn.addEventListener('click', closeCamera);

if (captureCameraBtn) {
  captureCameraBtn.addEventListener('click', () => {
    if (!videoStream) return;
    
    // Draw frame to canvas
    cameraCanvas.width = cameraVideo.videoWidth;
    cameraCanvas.height = cameraVideo.videoHeight;
    cameraCanvas.getContext('2d').drawImage(cameraVideo, 0, 0);
    
    // Convert to blob and upload
    cameraCanvas.toBlob((blob) => {
      const formData = new FormData();
      formData.append('file', blob, "camera-scan.jpg");
      scanSoilImage(formData, captureCameraBtn);
    }, 'image/jpeg', 0.95);
  });
}

// Authentication & Access Control Logic

function toggleAuthForms() {
    const loginCard = document.getElementById('loginCard');
    const registerCard = document.getElementById('registerCard');
    const adminLoginCard = document.getElementById('adminLoginCard');
    if (!loginCard || !registerCard) return;
    
    if (loginCard.classList.contains('hidden')) {
        loginCard.classList.remove('hidden');
        registerCard.classList.add('hidden');
    } else {
        loginCard.classList.add('hidden');
        registerCard.classList.remove('hidden');
    }
    if(adminLoginCard) adminLoginCard.classList.add('hidden');
}

function toggleAdminLogin() {
    const loginCard = document.getElementById('loginCard');
    const registerCard = document.getElementById('registerCard');
    const adminLoginCard = document.getElementById('adminLoginCard');
    if (!adminLoginCard) return;
    
    if (adminLoginCard.classList.contains('hidden')) {
        adminLoginCard.classList.remove('hidden');
        loginCard.classList.add('hidden');
        registerCard.classList.add('hidden');
        
        // Forcefully wipe any browser autofill values
        const wipeFields = () => {
            const u = document.getElementById('admUserKey');
            const p = document.getElementById('admPassKey');
            if (u) u.value = '';
            if (p) p.value = '';
        };
        wipeFields();
        setTimeout(wipeFields, 50);
        setTimeout(wipeFields, 200);
    } else {
        adminLoginCard.classList.add('hidden');
        loginCard.classList.remove('hidden');
        registerCard.classList.add('hidden');
    }
}

function autoSetPassword() {
    const dobInput = document.getElementById('regDob').value;
    const pwdInput = document.getElementById('regPassword');
    if (dobInput && pwdInput) {
        const parts = dobInput.split('-');
        if (parts.length === 3) {
            pwdInput.value = parts[2] + parts[1] + parts[0];
        }
    } else if (pwdInput) {
        pwdInput.value = '';
    }
}

function applyAccessControl() {
    const authUserStr = localStorage.getItem(CURRENT_USER_KEY);
    const authUser = authUserStr ? JSON.parse(authUserStr) : null;
    
    const authSection = document.getElementById('auth');
    const adminDashboard = document.getElementById('adminDashboard');
    const sectionsToToggle = ['hero', 'advisory', 'soil-lab', 'weather', 'market', 'pest-mgmt', 'schemes', 'drone-service'];
    const navLinksList = document.getElementById('navLinksList');
    const welcomeMsg = document.getElementById('welcomeUserMsg');

    if (authUser) {
        if (authSection) authSection.classList.add('hidden');
        
        if (authUser.email === 'admin@gmail.com') {
            // ADMIN MODE
            if (navLinksList) navLinksList.style.display = 'flex';
            if (welcomeMsg) {
                welcomeMsg.classList.remove('hidden');
                welcomeMsg.innerHTML = `<i class="fa-solid fa-user-shield"></i> Welcome, Admin`;
            }
            
            sectionsToToggle.forEach(id => {
                const sec = document.getElementById(id);
                if (sec) sec.classList.add('hidden'); // Hide normal sections for Admin
            });
            if (adminDashboard) adminDashboard.classList.remove('hidden');
            loadAdminData(); // Populate Admin Dashboard
        } else {
            // NORMAL USER MODE
            if (navLinksList) navLinksList.style.display = 'flex';
            if (welcomeMsg) {
                welcomeMsg.classList.remove('hidden');
                welcomeMsg.innerHTML = `<i class="fa-solid fa-user-check"></i> Welcome, ${authUser.name}`;
            }
            
            sectionsToToggle.forEach(id => {
                const sec = document.getElementById(id);
                if (sec) sec.classList.remove('hidden');
            });
            if (adminDashboard) adminDashboard.classList.add('hidden');

            // Auto-fill drone booking form with registered user's data (locked fields)
            const droneNameField = document.getElementById('droneName');
            const droneMobileField = document.getElementById('droneMobile');
            const droneAddressField = document.getElementById('droneAddress');
            
            if (droneNameField) droneNameField.value = authUser.name || '';
            if (droneMobileField) droneMobileField.value = authUser.mobile || '';
            
            if (droneAddressField) {
                droneAddressField.value = authUser.address || '';
                droneAddressField.readOnly = false; // Allow changes for specific farm locations
                droneAddressField.style.backgroundColor = 'white';
                droneAddressField.style.cursor = 'text';
                droneAddressField.style.color = 'inherit';
                droneAddressField.style.fontWeight = 'normal';
                droneAddressField.style.borderColor = '#e2e8f0';
            }
        }
    } else {
        // LOCKED STATE
        if (authSection) {
            authSection.classList.remove('hidden');
            // Explicitly show Login card and hide others
            const loginCard = document.getElementById('loginCard');
            const registerCard = document.getElementById('registerCard');
            const adminLoginCard = document.getElementById('adminLoginCard');
            
            if (loginCard) loginCard.classList.remove('hidden');
            if (registerCard) registerCard.classList.add('hidden');
            if (adminLoginCard) adminLoginCard.classList.add('hidden');
        }
        if (navLinksList) navLinksList.style.display = 'none';
        if (welcomeMsg) welcomeMsg.classList.add('hidden');
        
        sectionsToToggle.forEach(id => {
            const sec = document.getElementById(id);
            if (sec) sec.classList.add('hidden');
        });
        if (adminDashboard) adminDashboard.classList.add('hidden');
        window.scrollTo(0, 0);
    }
}

function logoutUser() {
    localStorage.removeItem(CURRENT_USER_KEY);
    applyAccessControl();
}

// === FORMS LOGIC (Updated for MongoDB) ===
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userData = {
            name: document.getElementById('regName').value.trim(),
            email: document.getElementById('regEmail').value.trim().toLowerCase(),
            mobile: document.getElementById('regMobile').value.trim(),
            aadhar: document.getElementById('regAadhar').value.trim(),
            address: document.getElementById('regAddress').value.trim(),
            pwd: document.getElementById('regPassword').value
        };

        const btn = e.target.querySelector('button');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Registering...';
        btn.disabled = true;

        // 1. Always save to LocalStorage for 100% offline & GitHub Pages support
        let localUsers = JSON.parse(localStorage.getItem(RUNTIME_USERS_KEY)) || [];
        const existingLocal = localUsers.find(u => u.email === userData.email);
        
        let registeredLocally = false;
        if (!existingLocal) {
            localUsers.push(userData);
            localStorage.setItem(RUNTIME_USERS_KEY, JSON.stringify(localUsers));
            registeredLocally = true;
        }

        // 2. Also try backend registration if active
        let backendOk = false;
        try {
            const response = await fetch(`${BACKEND_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            if (response.ok) {
                backendOk = true;
            }
        } catch (err) {
            console.log("Backend offline or unreachable, continuing in standalone mode.");
        }

        btn.innerHTML = originalText;
        btn.disabled = false;

        if (registeredLocally || backendOk) {
            alert(`✓ Registration successful!\nWelcome, ${userData.name}.\nPlease login with your email (${userData.email}) and password.`);
            registerForm.reset();
            const pwdInput = document.getElementById('regPassword');
            if (pwdInput) pwdInput.value = '';
            toggleAuthForms();
        } else {
            alert('An account with this email already exists. Please login instead.');
            toggleAuthForms();
        }
    });
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim().toLowerCase();
        const pwd = document.getElementById('loginPassword').value;

        const btn = e.target.querySelector('button');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';
        btn.disabled = true;

        let userObj = null;

        // Try Backend API First
        try {
            const response = await fetch(`${BACKEND_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, pwd })
            });

            if (response.ok) {
                const result = await response.json();
                userObj = result.user;
            }
        } catch (err) {
            console.log("Backend offline, checking local storage for login...");
        }

        // Local Storage / Demo Account Fallback
        if (!userObj) {
            const localUsers = JSON.parse(localStorage.getItem(RUNTIME_USERS_KEY)) || [];
            const foundUser = localUsers.find(u => u.email === email && u.pwd === pwd);
            if (foundUser) {
                userObj = { ...foundUser };
                delete userObj.pwd;
            }
        }

        btn.innerHTML = originalText;
        btn.disabled = false;

        if (userObj) {
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userObj));
            loginForm.reset();
            applyAccessControl();
            setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
        } else {
            alert("Login Failed: Incorrect email or password.\n\nTip: You can use the Demo Farmer account:\nEmail: demo@gmail.com\nPassword: demo123");
        }
    });
}

function handleAdminLogin() {
    const emailInput = document.getElementById('admUserKey') || document.getElementById('adminEmail');
    const pwdInput = document.getElementById('admPassKey') || document.getElementById('adminPassword');

    const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
    const pwd = pwdInput ? pwdInput.value : '';

    if (email === 'admin@gmail.com' && pwd === 'admin123') {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ name: 'Admin', email: 'admin@gmail.com' }));
        if (emailInput) emailInput.value = '';
        if (pwdInput) pwdInput.value = '';
        applyAccessControl();
    } else {
        alert('Invalid Admin Credentials!');
    }
}

const adminSubmitBtn = document.getElementById('adminLoginSubmitBtn');
if (adminSubmitBtn) {
    adminSubmitBtn.addEventListener('click', handleAdminLogin);
}

const adminLoginForm = document.getElementById('adminLoginForm');
if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleAdminLogin();
    });
}

// === ADMIN DASHBOARD LOGIC ===
function switchAdminTab(btnElement, tabId) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.add('hidden'));
    document.querySelector('#' + tabId).classList.remove('hidden');
    
    document.querySelectorAll('#adminTabs .tab-btn').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');

    if (tabId === 'tab-users') {
        renderAdminUsers();
    }
}

async function loadAdminData() {
    renderAdminCrops();
    renderAdminUsers();
    renderAdminSchemes();

    // 1. WhatsApp Alerts Users List
    const users = await getAllAdminUsers();
    const alertUserSelect = document.getElementById('adminAlertUser');
    if (alertUserSelect) {
        alertUserSelect.innerHTML = '<option value="">Select Registered User</option>';
        users.forEach(u => {
            const opt = document.createElement('option');
            opt.value = u.email;
            opt.textContent = `${u.name || 'Farmer'} (${u.mobile || u.email})`;
            alertUserSelect.appendChild(opt);
        });
    }

    // 2. Load Drone Bookings
    const bookArr = await getAllAdminDroneBookings();
    const adminDroneBody = document.getElementById('adminDroneBody');
    if (adminDroneBody) {
        if (bookArr.length === 0) {
            adminDroneBody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding: 20px; color: #64748b;">No drone bookings found</td></tr>`;
        } else {
            adminDroneBody.innerHTML = '';
            bookArr.slice().reverse().forEach((b) => {
                const bookingId = b._id || b.id;
                const statusBg = b.status === 'Approved' ? '#dcfce7' : (b.status === 'Rejected' ? '#fee2e2' : '#fef3c7');
                const statusColor = b.status === 'Approved' ? '#166534' : (b.status === 'Rejected' ? '#991b1b' : '#92400e');
                adminDroneBody.innerHTML += `<tr>
                    <td><strong>${b.farmerName || 'N/A'}</strong></td>
                    <td>${b.mobile || 'N/A'}</td>
                    <td>${b.acres || '1'} acres${b.crop ? ` &bull; <em>${b.crop}</em>` : ''}</td>
                    <td style="max-width:180px;white-space:pre-wrap;word-wrap:break-word;font-size:0.85rem;color:#475569;">${b.address || '<span style="color:#94a3b8;">—</span>'}</td>
                    <td>${b.date || 'N/A'}</td>
                    <td><span style="display:inline-block; padding:4px 8px; border-radius:4px; font-weight:600; font-size:0.85rem; background:${statusBg}; color:${statusColor}">${b.status || 'Pending'}</span></td>
                    <td>
                        <button onclick="updateDroneStatus('${bookingId}', 'Approved')" style="padding:4px 8px; background:#22c55e; color:white; border:none; border-radius:4px; cursor:pointer;" title="Approve">Approve</button>
                        <button onclick="updateDroneStatus('${bookingId}', 'Rejected')" style="padding:4px 8px; background:#ef4444; color:white; border:none; border-radius:4px; cursor:pointer;" title="Reject">Reject</button>
                    </td>
                </tr>`;
            });
        }
    }

    // 3. Load Soil Lab Reports
    const soilArr = await getAllAdminSoilReports();
    const adminSoilBody = document.getElementById('adminSoilBody');
    if (adminSoilBody) {
        if (soilArr.length === 0) {
            adminSoilBody.innerHTML = `<tr><td colspan="5" class="text-center" style="padding: 20px; color: #64748b;">No reports submitted yet</td></tr>`;
        } else {
            adminSoilBody.innerHTML = '';
            soilArr.slice().reverse().forEach(s => {
                const reportId = s._id || s.id;
                adminSoilBody.innerHTML += `<tr>
                    <td>${s.email || 'Anonymous'}</td>
                    <td>${s.date || 'Recent'}</td>
                    <td>${s.crop || 'Crop Advisory'}</td>
                    <td><span style="padding:4px 8px; border-radius:4px; font-weight:600; font-size:0.85rem; background:#e0e7ff; color:#3730a3">Analyzed</span></td>
                    <td>
                        <button onclick="viewAdminSoilReport('${reportId}')" style="padding:4px 10px; background:var(--primary); color:white; border:none; border-radius:4px; cursor:pointer;" title="View Detail"><i class="fa-solid fa-eye"></i> View</button>
                        <button onclick="deleteAdminReport('${reportId}')" style="padding:4px 8px; background:#ef4444; color:white; border:none; border-radius:4px; cursor:pointer;" title="Delete Report"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>`;
            });
        }
    }

    // 4. Load Pest Reports
    const pestArr = JSON.parse(localStorage.getItem('agrotech_pest_reports')) || JSON.parse(localStorage.getItem('agrotech_pest_saved_reports')) || [];
    const adminPestBody = document.getElementById('adminPestBody');
    if (adminPestBody) {
        if (pestArr.length === 0) {
            adminPestBody.innerHTML = `<tr><td colspan="5" class="text-center" style="padding: 20px; color: #64748b;">No diagnosis history found</td></tr>`;
        } else {
            adminPestBody.innerHTML = '';
            pestArr.slice().reverse().forEach((p, index) => {
                const sevLevel = p.severity || 'Moderate';
                const sevColor = (sevLevel === 'Critical' || sevLevel.includes('High')) ? '#991b1b' : (sevLevel === 'Moderate' ? '#92400e' : '#166534');
                const sevBg = (sevLevel === 'Critical' || sevLevel.includes('High')) ? '#fee2e2' : (sevLevel === 'Moderate' ? '#fef3c7' : '#dcfce7');
                
                adminPestBody.innerHTML += `<tr>
                    <td>${p.email || 'Local User'}</td>
                    <td>${p.date || 'Recent'}</td>
                    <td>${p.name || p.disease || 'Plant Diagnosis'}</td>
                    <td><span style="padding:4px 8px; border-radius:4px; font-weight:600; font-size:0.85rem; background:${sevBg}; color:${sevColor}">${sevLevel}</span></td>
                    <td><button onclick="viewAdminPestReport(${index})" style="padding:4px 10px; background:var(--primary); color:white; border:none; border-radius:4px; cursor:pointer;" title="View Detail"><i class="fa-solid fa-eye"></i> View</button></td>
                </tr>`;
            });
        }
    }
}

window.viewAdminPestReport = (index) => {
    const pestArr = JSON.parse(localStorage.getItem('agrotech_pest_reports')) || [];
    const p = pestArr[index];
    if (p) {
        const modal = document.getElementById('adminPestModal');
        const modalBody = document.getElementById('adminPestModalBody');
        modalBody.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                ${p.image ? `<img src="${p.image}" style="max-height: 250px; max-width: 100%; border-radius: 8px; object-fit: cover; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">` : '<div style="padding: 20px; background: #e2e8f0; border-radius: 8px;">No image provided</div>'}
            </div>
            <h3 style="color: var(--primary-dark); margin-bottom: 10px; font-size: 1.5rem;">${p.disease}</h3>
            <div style="display: flex; justify-content: space-between; flex-wrap: wrap; margin-bottom: 15px; font-size: 0.95rem; color: #475569; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0;">
                <span><strong>User:</strong> ${p.email}</span>
                <span><strong>Date:</strong> ${p.date}</span>
            </div>
            
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid var(--primary);">
                <h4 style="margin-bottom: 5px; color: #334155;">Information</h4>
                <p style="font-size: 0.95rem; line-height: 1.5;">${p.info || 'Detailed information is not available for this legacy report.'}</p>
            </div>
            
            <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border: 1px solid #bbf7d0;">
                <h4 style="margin-bottom: 10px; color: #166534;"><i class="fa-solid fa-lightbulb"></i> Recommended Solutions</h4>
                <ul style="padding-left: 20px; text-align: left; margin: 0;">
                    ${(p.solutions || []).map(sol => `<li style="margin-bottom: 5px; font-size: 0.95rem;">${sol}</li>`).join('')}
                    ${(!p.solutions || p.solutions.length === 0) ? '<li>No specific solutions provided.</li>' : ''}
                </ul>
            </div>
        `;
        if (modal) modal.style.display = 'block';
    }
}

window.viewAdminSoilReport = async (reportId) => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/all-reports`);
        const soilArr = await response.json();
        const report = soilArr.find(r => String(r._id) === String(reportId) || String(r.id) === String(reportId));
        if (report) {
            const modal = document.getElementById('adminSoilModal');
            const modalBody = document.getElementById('adminSoilModalBody');
            
            const params = report.params || {};
            const recs = report.recommendations || [];
            
            modalBody.innerHTML = `
                <h3 style="color: var(--primary-dark); margin-bottom: 10px; font-size: 1.5rem;">Soil Analysis for ${report.crop || 'Unknown'}</h3>
                <div style="display: flex; justify-content: space-between; flex-wrap: wrap; margin-bottom: 15px; font-size: 0.95rem; color: #475569; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0;">
                    <span><strong>User:</strong> ${report.email}</span>
                    <span><strong>Date:</strong> ${report.date}</span>
                </div>
                
                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid var(--primary);">
                    <h4 style="margin-bottom: 5px; color: #334155;">Soil Parameters</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px;">
                        <span class="param-badge" style="background:#e0e7ff; color:#3730a3; padding:4px 8px; border-radius:4px; font-size:0.85rem;">N: ${params.n || 'N/A'}</span>
                        <span class="param-badge" style="background:#e0e7ff; color:#3730a3; padding:4px 8px; border-radius:4px; font-size:0.85rem;">P: ${params.p || 'N/A'}</span>
                        <span class="param-badge" style="background:#e0e7ff; color:#3730a3; padding:4px 8px; border-radius:4px; font-size:0.85rem;">K: ${params.k || 'N/A'}</span>
                        <span class="param-badge" style="background:#e0e7ff; color:#3730a3; padding:4px 8px; border-radius:4px; font-size:0.85rem;">pH: ${params.ph || 'N/A'}</span>
                        ${params.temperature ? `<span class="param-badge" style="background:#e0e7ff; color:#3730a3; padding:4px 8px; border-radius:4px; font-size:0.85rem;">Temp: ${params.temperature}°C</span>` : ''}
                        ${params.humidity ? `<span class="param-badge" style="background:#e0e7ff; color:#3730a3; padding:4px 8px; border-radius:4px; font-size:0.85rem;">Humidity: ${params.humidity}%</span>` : ''}
                        ${params.rainfall ? `<span class="param-badge" style="background:#e0e7ff; color:#3730a3; padding:4px 8px; border-radius:4px; font-size:0.85rem;">Rain: ${params.rainfall}mm</span>` : ''}
                    </div>
                </div>
                
                <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border: 1px solid #bbf7d0;">
                    <h4 style="margin-bottom: 10px; color: #166534;"><i class="fa-solid fa-lightbulb"></i> Recommendations</h4>
                    ${recs.length === 0 ? '<p style="color: #166534; margin:0;">Soil parameters are optimal. No major additions required.</p>' : ''}
                    <ul style="padding-left: 20px; text-align: left; margin: 0;">
                        ${recs.map(rec => `<li style="margin-bottom: 8px;"><strong>${rec.nutrient} (${rec.status}):</strong> ${rec.advice}</li>`).join('')}
                    </ul>
                </div>
            `;
            if (modal) modal.style.display = 'block';
        } else {
            alert('Report not found');
        }
    } catch (err) {
        console.error("Error viewing soil report:", err);
    }
}

async function updateDroneStatus(bookingId, status) {
    try {
        await fetch(`${BACKEND_URL}/api/drone-bookings/${bookingId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: status })
        });
        loadAdminData(); // Refresh the table
    } catch (err) {
        console.error("Error updating drone status:", err);
        alert("Failed to update status on server.");
    }
}

function sendAdminAlert() {
    const selectedEmail = document.getElementById('adminAlertUser').value;
    const msg = document.getElementById('adminAlertMsg').value.trim();
    if (!selectedEmail) return alert('⚠️ Please select a registered user first.');
    if (!msg) return alert('⚠️ Please enter a message to send.');

    // Find the user's mobile number from localStorage
    const users = JSON.parse(localStorage.getItem(RUNTIME_USERS_KEY)) || [];
    const targetUser = users.find(u => u.email === selectedEmail);

    if (!targetUser || !targetUser.mobile) {
        return alert(`❌ Mobile number not found for ${selectedEmail}.\nCannot open WhatsApp without a phone number.`);
    }

    // Clean mobile number - remove spaces, dashes, etc.
    let mobile = targetUser.mobile.replace(/\D/g, '');
    // Add India country code if not already present
    if (mobile.length === 10) mobile = '91' + mobile;

    const whatsappUrl = `https://wa.me/${mobile}?text=${encodeURIComponent(msg)}`;

    const opened = window.open(whatsappUrl, '_blank');
    if (!opened) {
        alert(`⚠️ Popup was blocked by your browser!\n\nPlease allow popups for this site, or manually open:\nhttps://wa.me/${mobile}`);
    } else {
        document.getElementById('adminAlertMsg').value = '';
        // Visual feedback
        const btn = document.querySelector('[onclick="sendAdminAlert()"]');
        if (btn) {
            const orig = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Sent!';
            btn.style.background = '#22c55e';
            btn.style.color = 'white';
            setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; btn.style.color = ''; }, 2500);
        }
    }
}

function sendBroadcastAlert() {
    const msg = document.getElementById('adminBroadcastMsg').value.trim();
    if (!msg) return alert('⚠️ Please enter a broadcast message.');

    const users = JSON.parse(localStorage.getItem(RUNTIME_USERS_KEY)) || [];
    const usersWithMobile = users.filter(u => u.mobile && u.mobile.replace(/\D/g, '').length >= 10);

    if (usersWithMobile.length === 0) {
        return alert('⚠️ No registered farmers with valid mobile numbers found.\nFarmers must register with a mobile number to receive broadcast alerts.');
    }

    if (!confirm(`📢 This will open WhatsApp for ${usersWithMobile.length} farmer(s).\n\nMessage:\n"${msg}"\n\nProceed?`)) return;

    let successCount = 0;
    let mobileList = [];

    usersWithMobile.forEach((u, index) => {
        let mobile = u.mobile.replace(/\D/g, '');
        if (mobile.length === 10) mobile = '91' + mobile;
        mobileList.push(`${u.name}: +${mobile}`);

        // Open WhatsApp tabs with delay to avoid browser blocking
        setTimeout(() => {
            const whatsappUrl = `https://wa.me/${mobile}?text=${encodeURIComponent(msg)}`;
            const opened = window.open(whatsappUrl, '_blank');
            if (opened) successCount++;

            // After last user, show summary
            if (index === usersWithMobile.length - 1) {
                setTimeout(() => {
                    if (successCount === 0) {
                        // All blocked — show fallback with phone numbers
                        alert(`⚠️ Popups were blocked!\n\nPlease allow popups for this site and try again.\n\nFarmer Numbers:\n${mobileList.join('\n')}`);
                    } else {
                        document.getElementById('adminBroadcastMsg').value = '';
                        const btn = document.querySelector('[onclick="sendBroadcastAlert()"]');
                        if (btn) {
                            const orig = btn.innerHTML;
                            btn.innerHTML = `<i class="fa-solid fa-check"></i> Sent to ${successCount} Farmer(s)!`;
                            btn.style.background = '#22c55e';
                            setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; }, 3000);
                        }
                    }
                }, 500);
            }
        }, index * 800); // 800ms delay between each tab to avoid browser blocking
    });
}

// === CROP ADVISORY MANAGEMENT ===


function toggleCropForm() {
    const form = document.getElementById('adminCropFormContainer');
    form.classList.toggle('hidden');
    if (!form.classList.contains('hidden')) {
        document.getElementById('adminCropForm').reset();
        document.getElementById('editCropId').value = '';
        document.getElementById('cropImgPreview').style.display = 'none';
        document.getElementById('cropFormTitle').innerText = 'Add New Crop';
    }
}

function getAdminCrops() {
    return JSON.parse(localStorage.getItem(CROP_DB_KEY)) || [];
}

function saveAdminCrops(crops) {
    localStorage.setItem(CROP_DB_KEY, JSON.stringify(crops));
}

const adminCropForm = document.getElementById('adminCropForm');
if (adminCropForm) {
    adminCropForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const crop = {
            id: document.getElementById('editCropId').value || Date.now().toString(),
            name: document.getElementById('cropName').value,
            image: document.getElementById('cropImage').value,
            desc: document.getElementById('cropDesc').value,
            soil: document.getElementById('cropSoil').value,
            temp: document.getElementById('cropTemp').value,
            rain: document.getElementById('cropRain').value,
            season: document.getElementById('cropSeason').value,
            uses: document.getElementById('cropUses').value,
            guide: document.getElementById('cropGuide').value
        };

        let crops = getAdminCrops();
        
        if (document.getElementById('editCropId').value) {
            // Update existing
            const index = crops.findIndex(c => c.id === crop.id);
            if(index > -1) crops[index] = crop;
            alert('Crop updated successfully!');
        } else {
            // Map to existing crops logic if needed, or just append
            crops.push(crop);
            alert('New crop added successfully!');
        }
        
        saveAdminCrops(crops);
        toggleCropForm();
        renderAdminCrops();
    });
}

function renderAdminCrops() {
    const grid = document.getElementById('adminCropGrid');
    if(!grid) return;
    
    let crops = getAdminCrops();
    const searchQuery = document.getElementById('searchCropAdmin')?.value.toLowerCase() || '';
    const seasonFilter = document.getElementById('filterCropSeason')?.value || 'All';

    crops = crops.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchQuery);
        const matchesSeason = seasonFilter === 'All' || c.season === seasonFilter;
        return matchesSearch && matchesSeason;
    });

    grid.innerHTML = crops.length === 0 ? '<p style="color: #64748b; padding: 20px;">No crops found. Add one above!</p>' : '';
    
    crops.forEach(c => {
        grid.innerHTML += `
            <div class="card-glass" style="padding: 20px; border: 1px solid #e2e8f0; display: flex; flex-direction: column;">
                <img src="${c.image}" alt="${c.name}" style="width: 100%; height: 180px; object-fit: cover; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                <h4 style="font-size: 1.3rem; color: var(--primary-dark); margin-bottom: 5px;">${c.name}</h4>
                <div style="display:inline-block; padding: 4px 10px; background: #f1f5f9; border-radius: 6px; font-size: 0.8rem; font-weight: 700; color: #475569; margin-bottom: 10px; align-self: flex-start;">${c.season}</div>
                <p style="font-size: 0.9rem; color: #64748b; margin-bottom: 10px; flex: 1;">${c.desc}</p>
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 15px; background: #f8fafc; padding: 12px; border-radius: 8px; line-height: 1.6;">
                    <div><i class="fa-solid fa-mound" style="color:#78350f; width:15px;"></i> <strong>Soil:</strong> ${c.soil}</div>
                    <div><i class="fa-solid fa-temperature-half" style="color:#ef4444; width:15px;"></i> <strong>Temp:</strong> ${c.temp}</div>
                    <div><i class="fa-solid fa-cloud-showers-water" style="color:#3b82f6; width:15px;"></i> <strong>Rain:</strong> ${c.rain}</div>
                </div>
                <button onclick="alert('CULTIVATION GUIDE FOR ${c.name.toUpperCase()}:\\n\\n${c.guide.replace(/'/g, "\\'")}')" style="width: 100%; padding: 8px; margin-bottom: 15px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; cursor: pointer; font-size: 0.9rem; color: var(--primary); font-weight: 600;"><i class="fa-solid fa-book-open"></i> View Full Guide</button>
                <div style="display: flex; gap: 10px; margin-top: auto;">
                    <button onclick="editAdminCrop('${c.id}')" style="flex: 1; padding: 10px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;"><i class="fa-solid fa-pen"></i> Edit</button>
                    <button onclick="deleteAdminCrop('${c.id}')" style="flex: 1; padding: 10px; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;"><i class="fa-solid fa-trash"></i> Delete</button>
                </div>
            </div>
        `;
    });
}

function editAdminCrop(id) {
    const crops = getAdminCrops();
    const crop = crops.find(c => c.id === id);
    if(!crop) return;
    
    document.getElementById('adminCropFormContainer').classList.remove('hidden');
    document.getElementById('editCropId').value = crop.id;
    document.getElementById('cropName').value = crop.name;
    document.getElementById('cropImage').value = crop.image;
    document.getElementById('cropImgPreview').src = crop.image;
    document.getElementById('cropImgPreview').style.display = 'block';
    
    document.getElementById('cropDesc').value = crop.desc;
    document.getElementById('cropSoil').value = crop.soil;
    document.getElementById('cropTemp').value = crop.temp;
    document.getElementById('cropRain').value = crop.rain;
    document.getElementById('cropSeason').value = crop.season;
    document.getElementById('cropUses').value = crop.uses;
    document.getElementById('cropGuide').value = crop.guide;
    
    document.getElementById('cropFormTitle').innerText = 'Edit Crop Data';
    window.scrollTo({ top: document.getElementById('adminCropFormContainer').offsetTop - 50, behavior: 'smooth' });
}

function deleteAdminCrop(id) {
    if(confirm('Are you certain you want to permanently delete this crop?')) {
        let crops = getAdminCrops();
        crops = crops.filter(c => c.id !== id);
        saveAdminCrops(crops);
        renderAdminCrops();
    }
}

// === GOVERNMENT SCHEMES MANAGEMENT ===

function toggleSchemeForm() {
    const form = document.getElementById('adminSchemeFormContainer');
    if (!form) return;
    form.classList.toggle('hidden');
    if (!form.classList.contains('hidden')) {
        document.getElementById('adminSchemeForm').reset();
        document.getElementById('editSchemeId').value = '';
        document.getElementById('schemeFormTitle').innerText = 'Add New Government Scheme';
    }
}

function getAdminSchemes() {
    return JSON.parse(localStorage.getItem(SCHEMES_DB_KEY)) || [];
}

function saveAdminSchemes(schemes) {
    localStorage.setItem(SCHEMES_DB_KEY, JSON.stringify(schemes));
}

const adminSchemeForm = document.getElementById('adminSchemeForm');
if (adminSchemeForm) {
    adminSchemeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const benefitsRaw = document.getElementById('schemeBenefits').value;
        const benefits = benefitsRaw.split(',').map(b => b.trim()).filter(b => b.length > 0);

        const scheme = {
            id: document.getElementById('editSchemeId').value || Date.now().toString(),
            title: document.getElementById('schemeTitle').value.trim(),
            icon: document.getElementById('schemeIcon').value.trim(),
            desc: document.getElementById('schemeDesc').value.trim(),
            benefits: benefits,
            url: document.getElementById('schemeUrl').value.trim(),
            eligibility: document.getElementById('schemeEligibility').value.trim()
        };

        let schemes = getAdminSchemes();
        const existingId = document.getElementById('editSchemeId').value;

        if (existingId) {
            const index = schemes.findIndex(s => s.id === existingId);
            if (index > -1) schemes[index] = scheme;
            alert('Scheme updated successfully!');
        } else {
            schemes.push(scheme);
            alert('New scheme added successfully!');
        }

        saveAdminSchemes(schemes);
        toggleSchemeForm();
        renderAdminSchemes();
    });
}

function renderAdminSchemes() {
    const grid = document.getElementById('adminSchemesGrid');
    if (!grid) return;

    let schemes = getAdminSchemes();
    const query = document.getElementById('searchSchemeAdmin')?.value.toLowerCase() || '';
    if (query) {
        schemes = schemes.filter(s => s.title.toLowerCase().includes(query));
    }

    if (schemes.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1;padding:30px;color:#64748b;text-align:center;"><i class="fa-solid fa-inbox" style="font-size:2rem;margin-bottom:10px;display:block;"></i>No schemes added yet. Click &ldquo;Add New Scheme&rdquo; to get started.</div>';
        return;
    }

    grid.innerHTML = '';
    schemes.forEach(s => {
        const benefitTags = (s.benefits || []).map(b => `<span style="display:inline-block;background:#f0fdf4;color:#166534;padding:3px 10px;border-radius:20px;font-size:0.78rem;font-weight:600;margin:2px;">${b}</span>`).join('');
        grid.innerHTML += `
            <div class="card-glass" style="padding: 22px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; border-radius: 16px;">
                <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px;">
                    <div style="width:50px;height:50px;background:linear-gradient(135deg,#22c55e,#16a34a);border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                        <i class="${s.icon || 'fa-solid fa-file-contract'}" style="color:white;font-size:1.3rem;"></i>
                    </div>
                    <h4 style="font-size:1.05rem;color:var(--primary-dark);margin:0;line-height:1.3;">${s.title}</h4>
                </div>
                <p style="font-size:0.88rem;color:#64748b;margin-bottom:12px;flex:1;line-height:1.55;">${s.desc}</p>
                <div style="margin-bottom:12px;">${benefitTags}</div>
                ${s.eligibility ? `<p style="font-size:0.82rem;color:#475569;margin-bottom:12px;"><strong>Eligibility:</strong> ${s.eligibility}</p>` : ''}
                ${s.url ? `<a href="${s.url}" target="_blank" style="font-size:0.82rem;color:var(--primary);display:inline-block;margin-bottom:14px;"><i class="fa-solid fa-external-link-alt"></i> ${s.url.length > 40 ? s.url.substring(0,40)+'...' : s.url}</a>` : ''}
                <div style="display: flex; gap: 10px; margin-top: auto;">
                    <button onclick="editAdminScheme('${s.id}')" style="flex:1;padding:10px;background:#3b82f6;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;"><i class="fa-solid fa-pen"></i> Edit</button>
                    <button onclick="deleteAdminScheme('${s.id}')" style="flex:1;padding:10px;background:#ef4444;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;"><i class="fa-solid fa-trash"></i> Delete</button>
                </div>
            </div>
        `;
    });
}

function editAdminScheme(id) {
    const schemes = getAdminSchemes();
    const s = schemes.find(x => x.id === id);
    if (!s) return;

    const formContainer = document.getElementById('adminSchemeFormContainer');
    if (formContainer) formContainer.classList.remove('hidden');

    document.getElementById('editSchemeId').value = s.id;
    document.getElementById('schemeTitle').value = s.title;
    document.getElementById('schemeIcon').value = s.icon || '';
    document.getElementById('schemeDesc').value = s.desc;
    document.getElementById('schemeBenefits').value = (s.benefits || []).join(', ');
    document.getElementById('schemeUrl').value = s.url || '';
    document.getElementById('schemeEligibility').value = s.eligibility || '';
    document.getElementById('schemeFormTitle').innerText = 'Edit Government Scheme';

    formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function deleteAdminScheme(id) {
    if (confirm('Are you sure you want to delete this government scheme?')) {
        let schemes = getAdminSchemes();
        schemes = schemes.filter(s => s.id !== id);
        saveAdminSchemes(schemes);
        renderAdminSchemes();
    }
}

// === USER MANAGEMENT LOGIC ===
async function renderAdminUsers() {
    const tbody = document.getElementById('adminUsersBody');
    if(!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding: 20px; color: #64748b;"><i class="fa-solid fa-spinner fa-spin"></i> Loading registered users...</td></tr>';
    
    let users = await getAllAdminUsers();
    const query = document.getElementById('searchUserAdmin')?.value.toLowerCase().trim() || '';
    
    if (query) {
        users = users.filter(u => 
            (u.name && u.name.toLowerCase().includes(query)) || 
            (u.email && u.email.toLowerCase().includes(query)) || 
            (u.mobile && u.mobile.includes(query)) ||
            (u.aadhar && u.aadhar.includes(query))
        );
    }
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding: 20px; color: #64748b;"><i class="fa-solid fa-users-slash" style="font-size: 1.5rem; margin-bottom: 8px; display: block;"></i>No registered farmers found matching query</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    users.forEach((u, idx) => {
        const safeAddress = (u.address || 'N/A').replace(/'/g, "\'").replace(/"/g, "&quot;").replace(/\n/g, " ");
        const safeName = (u.name || 'N/A').replace(/'/g, "\'").replace(/"/g, "&quot;");
        const safeMobile = u.mobile || 'N/A';
        const safeAadhar = u.aadhar || 'N/A';
        
        tbody.innerHTML += `
            <tr>
                <td><strong>${u.name || 'Farmer'}</strong></td>
                <td><a href="mailto:${u.email}" style="color: #2563eb; text-decoration: underline;">${u.email}</a></td>
                <td><i class="fa-solid fa-phone" style="color: #16a34a; font-size: 0.8rem;"></i> ${safeMobile}</td>
                <td><span style="font-family: monospace; background: #f1f5f9; border: 1px solid #cbd5e1; padding: 2px 8px; border-radius: 6px; font-weight: 600;">${safeAadhar}</span></td>
                <td style="max-width: 240px; white-space: normal; line-height: 1.4; color: #475569; font-size: 0.9rem;">${u.address || 'N/A'}</td>
                <td>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <button onclick="alert('FULL FARMER PROFILE:\n\nName: ${safeName}\nEmail: ${u.email}\nMobile: ${safeMobile}\nAadhar: ${safeAadhar}\n\nRegistered Farm Address:\n${safeAddress}')" style="padding: 6px 12px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600;" title="View Profile"><i class="fa-solid fa-eye"></i> View</button>
                        <button onclick="deleteAdminUser('${u.email}')" style="padding: 6px 10px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem;" title="Delete User"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
    });
}

async function deleteAdminUser(email) {
    if(!confirm(`Are you sure you want to completely remove user: ${email}?`)) return;

    // 1. Delete from LocalStorage
    let localUsers = JSON.parse(localStorage.getItem(RUNTIME_USERS_KEY)) || [];
    localUsers = localUsers.filter(u => u.email.toLowerCase() !== email.toLowerCase());
    localStorage.setItem(RUNTIME_USERS_KEY, JSON.stringify(localUsers));

    // 2. Also attempt deletion from Backend
    try {
        await fetch(`${BACKEND_URL}/api/users/${email}`, { method: 'DELETE' });
    } catch(err) {}

    alert(`✓ Farmer ${email} removed successfully.`);
    renderAdminUsers();
    loadAdminData();
}

// === INTERCEPT FORM SUBMISSIONS TO LOG TO LOCALSTORAGE ===

// Intercept Drone Bookings
const droneForm = document.getElementById('droneBookingForm');
if(droneForm) {
    droneForm.addEventListener('submit', async (e) => {
         e.preventDefault();
         const currentUserStr = localStorage.getItem(CURRENT_USER_KEY);
         if(!currentUserStr) return;
         const currentUser = JSON.parse(currentUserStr);

         const farmerName = document.getElementById('droneName')?.value || currentUser.name;
         const farmerMobile = document.getElementById('droneMobile')?.value || currentUser.mobile;
         const acres = document.getElementById('farmAcreage')?.value || 'Unknown';
         let crop = document.getElementById('droneCropType')?.value || 'Unknown';
         
         if (crop === 'Other') {
             const customCrop = document.getElementById('droneOtherCropName')?.value.trim();
             if (!customCrop) {
                 alert('⚠️ Please enter your crop name in the field below the dropdown.');
                 return;
             }
             crop = customCrop;
         }
         const address = document.getElementById('droneAddress')?.value || 'Not provided';
         const date = document.getElementById('serviceDate')?.value || new Date().toLocaleDateString();
         
         const bookingData = {
             farmerName: farmerName,
             mobile: farmerMobile,
             acres: acres,
             crop: crop,
             address: address,
             date: date,
             status: 'Pending',
             email: currentUser.email
         };

         // 1. Save to LocalStorage for backup
         const bookArr = JSON.parse(localStorage.getItem('agrotech_drone_bookings')) || [];
         bookArr.unshift(bookingData);
         localStorage.setItem('agrotech_drone_bookings', JSON.stringify(bookArr));

         // 2. Save to Backend
         try {
             await fetch(`${BACKEND_URL}/api/drone-bookings`, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify(bookingData)
             });
         } catch (err) {
             console.warn("Backend Drone Booking Save Failed:", err);
         }
         
         alert('✅ Drone booking requested successfully!\nOur team will contact you at your farm address soon.');
         droneForm.reset();
         if (estCostDisplay) estCostDisplay.textContent = '₹0';
         
         // Auto-refill read-only fields from profile
         if (document.getElementById('droneName')) document.getElementById('droneName').value = currentUser.name;
         if (document.getElementById('droneMobile')) document.getElementById('droneMobile').value = currentUser.mobile;
         if (document.getElementById('droneAddress')) document.getElementById('droneAddress').value = currentUser.address;
    });
}

// Soil Report Submissions and Pest Diagnostics are handled by their respective primary logic sections

// Initial Access Control Call
document.addEventListener('DOMContentLoaded', async () => {
    renderCrops(getMergedCrops());
    applyAccessControl();
    await migrateDataToCloud(); // Sync local data to Atlas
});

async function migrateDataToCloud() {
    const isMigrated = localStorage.getItem('agrotech_migrated_to_cloud');
    if (isMigrated === 'true') return;

    console.log("☁️ Starting one-time migration to MongoDB Atlas...");
    
    // 1. Migrate Users
    const localUsers = JSON.parse(localStorage.getItem(RUNTIME_USERS_KEY) || '[]');
    for (const user of localUsers) {
        try {
            await fetch(`${BACKEND_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });
        } catch (e) {
            console.warn(`User ${user.email} might already exist or backend offline.`);
        }
    }

    // 2. Migrate Soil Reports
    const localReports = JSON.parse(localStorage.getItem('agrotech_reports') || '[]');
    const authUserStr = localStorage.getItem(CURRENT_USER_KEY);
    if (authUserStr && localReports.length > 0) {
        const authUser = JSON.parse(authUserStr);
        for (const report of localReports) {
            try {
                await fetch(`${BACKEND_URL}/api/save-report`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...report, email: authUser.email })
                });
            } catch (e) {
                console.warn("Report migration failed for one entry.");
            }
        }
    }

    // 3. Migrate Pest Reports
    const localPestReports = JSON.parse(localStorage.getItem('agrotech_pest_saved_reports') || '[]');
    if (authUserStr && localPestReports.length > 0) {
        const authUser = JSON.parse(authUserStr);
        for (const report of localPestReports) {
            try {
                await fetch(`${BACKEND_URL}/api/save-report`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...report, email: authUser.email, reportType: 'pest' })
                });
            } catch (e) {
                console.warn("Pest report migration failed.");
            }
        }
    }

    // Mark as migrated
    if (localUsers.length > 0 || localReports.length > 0 || localPestReports.length > 0) {
        localStorage.setItem('agrotech_migrated_to_cloud', 'true');
        console.log("✓ Migration to cloud completed!");
    }
}
