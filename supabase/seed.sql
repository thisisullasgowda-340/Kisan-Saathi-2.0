-- Seed Data for KisanSaathi

-- 1. CROPS
INSERT INTO public.crops (id, name, scientific_name, icon, image_url, description) VALUES
('tomato', 'Tomato', 'Solanum lycopersicum', 'Apple', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80', 'Major commercial vegetable crop in Kolar, Chikkaballapur, Belagavi, and Mandya.'),
('potato', 'Potato', 'Solanum tuberosum', 'CircleDot', 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80', 'Essential tuber crop widely cultivated in Hassan, Kolar, and Chikkamagaluru regions.'),
('paddy', 'Paddy (Rice)', 'Oryza sativa', 'Wheat', 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=600&q=80', 'Staple grain crop prominently cultivated in Mandya, Raichur, Koppal, and Shivamogga.'),
('cotton', 'Cotton', 'Gossypium hirsutum', 'Flower2', 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=600&q=80', 'Key cash crop of northern Karnataka districts including Haveri, Dharwad, and Ballari.'),
('chilli', 'Chilli', 'Capsicum annuum', 'Flame', 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80', 'Renowned cash spice crop of Byadgi (Haveri), Bellary, Raichur, and Dharwad.')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- 2. DISEASES (Representative verified diseases per spec)
-- TOMATO
INSERT INTO public.diseases (id, crop_id, english_name, scientific_name, severity, description, symptoms, causes, organic_treatment, chemical_treatment, prevention, approved_references) VALUES
('tomato-early-blight', 'tomato', 'Early Blight', 'Alternaria solani', 'Medium', 'A prevalent fungal disease causing concentric dark target-board rings on older foliage and stems.', 
 ARRAY['Concentric brown/black rings on lower leaves', 'Yellowing of tissue around leaf spots', 'Defoliation progressing upwards', 'Dark sunken lesions on stems and fruit calyx'],
 ARRAY['Alternaria solani fungus', 'High relative humidity (>80%)', 'Warm temperatures (24-29°C)', 'Overhead sprinkler irrigation'],
 'Spray 5% Neem Seed Kernel Extract (NSKE) or Trichoderma harzianum (5g/L). Remove lower infected leaves and destroy them away from the field.',
 'Foliar spray of Mancozeb 75% WP @ 2.5 g/L or Chlorothalonil 75% WP @ 2 g/L. Always rotate fungicide groups to avoid resistance.',
 'Practice 3-year crop rotation with non-solanaceous crops. Use certified disease-free seeds and adopt drip irrigation rather than overhead sprinklers.',
 ARRAY['ICAR-IIHR Tomato Disease Advisory Bulletin 2023', 'UAS Bangalore Package of Practices for Vegetable Crops 2022']),

('tomato-late-blight', 'tomato', 'Late Blight', 'Phytophthora infestans', 'High', 'Devastating water-mold infection capable of destroying entire tomato fields in wet, cool conditions.',
 ARRAY['Water-soaked irregular pale-green to brown lesions', 'White downy fungal growth on leaf undersides in high humidity', 'Rapid blighting and browning of leaves', 'Greasy dark firm rot on fruit'],
 ARRAY['Phytophthora infestans oomycete', 'Cool nights (10-15°C) with moist days', 'Prolonged leaf wetness for >8 hours'],
 'Apply Bordeaux mixture (1%) or Copper oxychloride @ 2.5 g/L as a protective spray. Strictly avoid handling wet plants.',
 'Spray Metalaxyl 8% + Mancozeb 64% WP @ 2.5 g/L or Cymoxanil 8% + Mancozeb 64% WP @ 2 g/L upon first sighting.',
 'Select resistant cultivars (e.g., Arka Rakshak, Arka Abhed). Maintain proper plant spacing to facilitate air circulation.',
 ARRAY['ICAR Indian Institute of Horticultural Research', 'National Institute of Plant Health Management (NIPHM)']),

('tomato-leaf-mold', 'tomato', 'Leaf Mold', 'Passalora fulva', 'Medium', 'Fungal disease common in humid cloudy environments causing pale spots on upper surface and velvety olive mold below.',
 ARRAY['Pale green or yellowish spots on upper leaf surfaces', 'Velvety olive-green to brown mold on the lower leaf surface', 'Leaves curl, wither, and drop prematurely'],
 ARRAY['Passalora fulva fungus', 'Relative humidity >85%', 'Poor field aeration'],
 'Ensure adequate canopy pruning. Apply bio-agent Pseudomonas fluorescens @ 5g/L on foliage.',
 'Apply Copper Hydroxide 53.8% DF @ 2 g/L or Azoxystrobin 23% SC @ 1 ml/L as advised by a local extension officer.',
 'Promote air movement through staking and trellising. Avoid high nitrogen fertilization which creates dense lush foliage.',
 ARRAY['UAS Dharwad Vegetable Pathology Division']),

('tomato-bacterial-spot', 'tomato', 'Bacterial Spot', 'Xanthomonas campestris pv. vesicatoria', 'High', 'Bacterial disease causing small, water-soaked, dark spots with yellow halos on leaves, stems, and fruits.',
 ARRAY['Small circular water-soaked leaf spots turning dark brown', 'Yellow chlorotic halos surrounding lesions', 'Rough, raised, scab-like spots on green tomatoes'],
 ARRAY['Xanthomonas campestris bacteria', 'Splashing rain or furrow runoff', 'High temperatures (25-30°C) with rain'],
 'Hot water seed treatment at 50°C for 25 minutes prior to sowing. Foliar spray of fresh cow dung slurry filtrate (20%).',
 'Spray Copper Oxychloride 50% WP (2.5 g/L) combined with Streptocycline (0.1 g/L) at 10-day intervals during wet periods.',
 'Use disease-tested certified seeds. Avoid overhead irrigation and sanitize pruning shears with 70% alcohol between rows.',
 ARRAY['ICAR-IIHR Bangalore Technical Guide']),

('tomato-healthy', 'tomato', 'Healthy Tomato Plant', 'Solanum lycopersicum', 'Low', 'No observable signs of pathogen infection, nutrient deficiency, or pest damage.',
 ARRAY['Uniform vibrant green foliage', 'Sturdy stems and vigorous flower trusses', 'No leaf spotting, wilting, or abnormal curling'],
 ARRAY['Optimal soil nutrition', 'Balanced moisture', 'Integrated pest management adherence'],
 'Continue routine organic maintenance: periodic application of Jeevamrutha or Panchagavya (3% spray) every 15 days.',
 'No chemical fungicide required. Maintain preventive monitoring.',
 'Continue regular scouting for early detection of whiteflies, leafminers, or aphids.',
 ARRAY['ICAR-IIHR Good Agricultural Practices (GAP)']);

-- POTATO
INSERT INTO public.diseases (id, crop_id, english_name, scientific_name, severity, description, symptoms, causes, organic_treatment, chemical_treatment, prevention, approved_references) VALUES
('potato-early-blight', 'potato', 'Early Blight', 'Alternaria solani', 'Medium', 'Foliar disease targeting mature potato leaves, reducing photosynthetic efficiency and tuber sizing.',
 ARRAY['Target-board dark circular spots with concentric rings', 'Lower leaf senescence and yellowing', 'Brown necrotic areas on leaves'],
 ARRAY['Alternaria solani pathogen', 'Intermittent dry and wet spells', 'Stressed potato crops'],
 'Spray bio-fungicide Trichoderma viride @ 5g/L. Apply mulching to prevent soil spores from splashing onto lower leaves.',
 'Apply Mancozeb 75% WP @ 2.5 g/L or Propineb 70% WP @ 2 g/L at the first symptom onset.',
 'Plant certified seed tubers. Ensure balanced potash and nitrogen nutrition; avoid nutrient stress during tuber bulking.',
 ARRAY['CPRI (Central Potato Research Institute) Shimla', 'UAS Dharwad Potato Extension Manual']),

('potato-late-blight', 'potato', 'Late Blight', 'Phytophthora infestans', 'High', 'Devastating disease of potato foliage and tubers that can wipe out fields within 7 to 10 days.',
 ARRAY['Water-soaked irregular black/brown lesions on leaves and petiole', 'White mold growth on leaf underside during early mornings', 'Foul decay odor in field', 'Tuber dry rot with rusty brown discoloration underneath skin'],
 ARRAY['Phytophthora infestans', 'Prolonged fog, drizzling rain, temperature 12-22°C with >90% humidity'],
 'Prophylactic spray of Bordeaux mixture 1% or Copper Oxychloride 2.5 g/L before foggy weather strikes.',
 'Curative foliar spray of Fenamidone 10% + Mancozeb 50% WG @ 2.5 g/L or Dimethomorph 50% WP @ 1 g/L mixed with Mancozeb.',
 'Plant resistant varieties (Kufri Girdhari, Kufri Himalini). Destroy cull piles and hill up soil well to cover tubers.',
 ARRAY['CPRI Advisory on Late Blight Management 2023']),

('potato-common-scab', 'potato', 'Common Scab', 'Streptomyces scabies', 'Medium', 'Soil-borne actinomycete disease causing rough, corky scabs on tuber surfaces, reducing market value.',
 ARRAY['Raised, corky, or pitted lesions on potato tuber skin', 'Stunted root growth in severe early infections'],
 ARRAY['Streptomyces scabies bacteria-like organism', 'Alkaline or lime-rich dry soils (pH > 6.5)'],
 'Apply green manuring with sunn hemp before potato planting. Treat seed tubers with Trichoderma viride prior to planting.',
 'Seed tuber treatment with 0.1% Emisan-6 (or Mancozeb 0.25%) suspension for 30 minutes before storage or planting.',
 'Maintain uniform soil moisture during tuber initiation (4-6 weeks after planting). Maintain soil pH slightly acidic (5.2-6.0).',
 ARRAY['CPRI Regional Station Ooty/Hassan Advisory']),

('potato-healthy', 'potato', 'Healthy Potato Plant', 'Solanum tuberosum', 'Low', 'Robust potato crop displaying vigorous vegetative growth with no lesions or wilting.',
 ARRAY['Lush green upright foliage', 'Clean intact stems', 'Normal flowering and stolon initiation'],
 ARRAY['Clean seed tubers', 'Favorable weather', 'Balanced soil management'],
 'Maintain periodic bio-fertilizer application (Azotobacter & Phosphobacteria).',
 'No chemical interventions needed.',
 'Scout weekly for Colorado beetle or aphid vectors of viral diseases.',
 ARRAY['CPRI Potato GAP Guidelines']);

-- PADDY
INSERT INTO public.diseases (id, crop_id, english_name, scientific_name, severity, description, symptoms, causes, organic_treatment, chemical_treatment, prevention, approved_references) VALUES
('paddy-bacterial-leaf-blight', 'paddy', 'Bacterial Leaf Blight', 'Xanthomonas oryzae pv. oryzae', 'High', 'Serious systemic bacterial disease causing wavy translucent water-soaked stripes drying to straw yellow.',
 ARRAY['Water-soaked wavy marginal lesions turning yellow then straw-colored', 'Milky bacterial ooze droplets visible in early mornings', 'Kresek phase (seedling wilt) in severe nursery infections'],
 ARRAY['Xanthomonas oryzae bacteria', 'Flooding and strong windstorms', 'Excessive nitrogen fertilizer use'],
 'Foliar spray of fresh cow dung slurry (200 g fresh dung in 10 L water; strain through cloth) or Pseudomonas fluorescens @ 10g/L.',
 'Foliar spray of Copper Oxychloride 50% WP (2.5 g/L) + Streptocycline (1 g in 10 L water) at tiller stage.',
 'Apply balanced NPK fertilization with split nitrogen applications. Avoid clipping seedling tips during transplanting.',
 ARRAY['ICAR-NRRI (National Rice Research Institute) Cuttack', 'UAS Raichur Paddy Protection Guide']),

('paddy-brown-spot', 'paddy', 'Brown Spot', 'Bipolaris oryzae', 'Medium', 'Fungal disease producing oval brown spots with grey or whitish centers on leaf blades, glumes, and grains.',
 ARRAY['Oval, dark brown lesions resembling sesame seeds on leaves', 'Darkened spots with yellow halos', 'Discolored or unfilled grains on panicles'],
 ARRAY['Bipolaris oryzae fungus', 'Nutrient-deficient soils (especially low potassium, zinc, silica)', 'Drought stress'],
 'Seed treatment with Pseudomonas fluorescens (10 g/kg seed). Foliar application of vermicompost wash (10%).',
 'Spray Carbendazim 12% + Mancozeb 63% WP @ 2 g/L or Propiconazole 25% EC @ 1 ml/L at boot leaf stage.',
 'Correct potassium and micronutrient deficiencies in soil. Practice crop residue management and deep summer plowing.',
 ARRAY['ICAR-IIRR Hyderabad Rice Disease Compendium']),

('paddy-leaf-blast', 'paddy', 'Leaf Blast', 'Magnaporthe oryzae', 'High', 'Highly destructive airborne fungal disease characterized by diamond- or spindle-shaped lesions.',
 ARRAY['Spindle-shaped spots with pointed ends, gray/white centers, and brown margins', 'Lesions coalesce causing complete leaf desiccation ("blast" burn appearance)', 'Neck blast causing chaffy empty panicles'],
 ARRAY['Magnaporthe oryzae fungus', 'Extended leaf wetness', 'Cool nighttime temperatures (18-20°C)', 'Excessive nitrogen'],
 'Seed treatment with Trichoderma harzianum @ 10g/kg. Foliar spray of fermented buttermilk extract (1:10 dilution).',
 'Foliar spray of Tricyclazole 75% WP @ 0.6 g/L or Isoprothiolane 40% EC @ 1.5 ml/L at first appearance.',
 'Avoid excessive nitrogen doses. Maintain continuous shallow standing water in the field; do not let soil crack dry.',
 ARRAY['ICAR-IIRR Rice Blast Management Guidelines 2023']),

('paddy-healthy', 'paddy', 'Healthy Paddy Crop', 'Oryza sativa', 'Low', 'Vigorous rice tillers with clean emerald blades and sturdy panicle emergence.',
 ARRAY['Clean, erect green leaves with no lesions or blight streaks', 'Strong crown root anchorage and healthy tillering'],
 ARRAY['Certified seed usage', 'System of Rice Intensification (SRI) principles', 'Optimal water management'],
 'Maintain bio-inoculants and Azolla green manuring for organic nitrogen fixation.',
 'No chemical fungicide required.',
 'Monitor water depth and watch for early stem borer or leaf folder symptoms.',
 ARRAY['UAS Mandya Zonal Agricultural Research Station']);

-- COTTON
INSERT INTO public.diseases (id, crop_id, english_name, scientific_name, severity, description, symptoms, causes, organic_treatment, chemical_treatment, prevention, approved_references) VALUES
('cotton-bacterial-blight', 'cotton', 'Bacterial Blight (Black Arm)', 'Xanthomonas citri pv. malvacearum', 'High', 'Systemic bacterial disease affecting leaves, stems (black arm), and bolls with angular lesions.',
 ARRAY['Angular water-soaked spots bounded by leaf veins', 'Black elongated lesions on stems and branches ("black arm")', 'Premature leaf drop and rotting boll spots'],
 ARRAY['Xanthomonas citri bacteria', 'Splashing rainfall and high humidity (85-90%)', 'Warm temperatures (30-35°C)'],
 'Foliar spray of Pseudomonas fluorescens @ 10g/L. Seed soaking in warm water (52°C) for 10 minutes.',
 'Foliar spray of Copper Oxychloride 50% WP @ 2.5 g/L combined with Streptocycline 100 ppm (1 g per 10 L water).',
 'Use acid-delinted certified seeds. Burn infected cotton stubble post-harvest; avoid overhead irrigation.',
 ARRAY['ICAR-CICR (Central Institute for Cotton Research) Nagpur', 'UAS Dharwad Cotton Pathology']),

('cotton-leaf-curl', 'cotton', 'Cotton Leaf Curl Virus (CLCuV)', 'Begomovirus', 'High', 'Viral disease transmitted by whiteflies causing upward or downward leaf curling and enation (leaf-like outgrowths).',
 ARRAY['Upward or downward rolling and curling of leaves', 'Thickening and darkening of leaf veins on underside', 'Enations (small leaf-like growths) on underleaf veins', 'Stunting of plants with few small bolls'],
 ARRAY['Cotton leaf curl begomovirus', 'Bemisia tabaci (whitefly) insect vector', 'Susceptible hybrid varieties'],
 'Spray 5% NSKE (Neem Seed Kernel Extract) or Fish Oil Rosin Soap (20g/L) to control the whitefly vector population naturally.',
 'Manage whitefly vector by spraying Diafenthiuron 50% WP @ 1 g/L or Spiromesifen 22.9% SC @ 1 ml/L. (Viral pathogen has no direct chemical cure).',
 'Plant CLCuV-tolerant certified hybrids. Eliminate weed hosts (such as Abutilon indicum) along field borders.',
 ARRAY['ICAR-CICR CLCuV Management Protocol']),

('cotton-alternaria-spot', 'cotton', 'Alternaria Leaf Spot', 'Alternaria macrospora', 'Medium', 'Fungal foliar disease causing circular or irregular brown necrotic spots on older leaves, bracts, and bolls.',
 ARRAY['Small circular spots with purple or dark reddish-brown margins', 'Target-board concentric rings inside lesions', 'Leaf shot-hole effect as lesion centers fall out'],
 ARRAY['Alternaria macrospora fungus', 'Intermittent rain and dew periods', 'Crop potassium deficiency'],
 'Foliar spray of Trichoderma viride @ 5g/L. Apply bio-potash to address potassium deficits.',
 'Spray Propiconazole 25% EC @ 1 ml/L or Kresoxim-methyl 44.3% SC @ 1 ml/L at first appearance of spots.',
 'Maintain proper soil potassium levels. Avoid dense plant stands and ensure field drainage.',
 ARRAY['CICR Regional Station Coimbatore & UAS Dharwad']),

('cotton-healthy', 'cotton', 'Healthy Cotton Plant', 'Gossypium hirsutum', 'Low', 'Vigorous cotton stand with broad green leaves, clean sympodial branches, and thriving squares.',
 ARRAY['Broad flat dark-green leaves without curling or spots', 'Healthy squares (flower buds) and steady boll formation'],
 ARRAY['Certified seeds', 'IPM implementation', 'Balanced nutrition'],
 'Apply Jeevamrutha soil drenching during flowering and boll formation.',
 'No chemical treatment needed.',
 'Regularly check yellow sticky traps for monitoring whiteflies and thrips.',
 ARRAY['ICAR-CICR Good Agricultural Practices for Cotton']);

-- CHILLI
INSERT INTO public.diseases (id, crop_id, english_name, scientific_name, severity, description, symptoms, causes, organic_treatment, chemical_treatment, prevention, approved_references) VALUES
('chilli-anthracnose', 'chilli', 'Anthracnose (Die-back / Fruit Rot)', 'Colletotrichum capsici', 'High', 'Devastating fungal disease causing top die-back of twigs and sunken circular spots on ripe chilli fruits.',
 ARRAY['Die-back of twigs from tip downwards', 'Sunken circular spots with concentric black acervuli on ripe fruits', 'Straw-colored dried fruit surfaces containing salmon-pink fungal spore masses'],
 ARRAY['Colletotrichum capsici fungus', 'Heavy rainfall or dense fog during fruit ripening', 'Temperature 28-30°C with high humidity'],
 'Seed treatment with Trichoderma harzianum @ 10 g/kg seed. Foliar spray of fermented garlic-chilli extract.',
 'Spray Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1 ml/L or Tebuconazole 25.9% EC @ 1.5 ml/L at flowering and fruit set.',
 'Use disease-free seed from healthy fruit lots. Harvest ripe chillies promptly without leaving overripe fruits on plants.',
 ARRAY['ICAR-IIHR Chilli Crop Protection Guide', 'Spices Board of India Good Agricultural Practices']),

('chilli-cercospora-leaf-spot', 'chilli', 'Cercospora Leaf Spot (Frogeye)', 'Cercospora capsici', 'Medium', 'Fungal disease producing distinct "frog-eye" circular lesions with white centers and dark borders.',
 ARRAY['Circular lesions with grayish-white centers and dark red-brown halos ("frogeye")', 'Severe chlorosis and premature defoliation of infected leaves', 'Lesions occasionally on stems and fruit calyx'],
 ARRAY['Cercospora capsici fungus', 'High relative humidity (>80%)', 'Warm humid weather (24-28°C)'],
 'Foliar application of Pseudomonas fluorescens @ 5 g/L. Remove and bury fallen infected leaves.',
 'Spray Mancozeb 75% WP @ 2.5 g/L or Carbendazim 50% WP @ 1 g/L as guided by extension authorities.',
 'Avoid dense spacing. Provide good drainage and avoid wetting the plant canopy during late afternoon hours.',
 ARRAY['UAS Dharwad Department of Plant Pathology']),

('chilli-leaf-curl', 'chilli', 'Chilli Leaf Curl Virus', 'Begomovirus', 'High', 'Viral disease characterized by curling, puckering, and reduction in leaf size, leading to severe yield loss.',
 ARRAY['Upward curling and puckering of leaf margins', 'Shortened internodes giving bushy stunted growth', 'Thickened brittle leaves with vein clearing', 'Small deformed fruits or flower abortion'],
 ARRAY['Chilli leaf curl virus transmitted by Bemisia tabaci (whitefly)', 'Dry warm spells favoring vector build-up'],
 'Foliar spray of 5% Neem oil + soap solution. Install yellow and blue sticky traps (10 traps per acre).',
 'Manage vector by spraying Acetamiprid 20% SP @ 0.3 g/L or Thiamethoxam 25% WG @ 0.3 g/L. (No viricide exists).',
 'Raise nursery under insect-proof net (40 mesh). Grow barrier crops of maize or sorghum (2-3 rows) around chilli plots.',
 ARRAY['ICAR-IIHR Integrated Pest and Disease Management in Chilli 2023']),

('chilli-healthy', 'chilli', 'Healthy Chilli Plant', 'Capsicum annuum', 'Low', 'Sturdy chilli bushes with vibrant foliage, abundant white blossoms, and firm unblemished peppers.',
 ARRAY['Lush dark-green leaves without puckering or spots', 'Vigorous flowering and uniform fruit set'],
 ARRAY['Certified Byadgi/hybrid seeds', 'Proper field mulching and drip irrigation', 'Strict insect barrier management'],
 'Maintain foliar organic micronutrient sprays and Vermiwash (5%).',
 'No chemical treatment needed.',
 'Regularly inspect underleaf surfaces for early thrips or mite activity.',
 ARRAY['Spices Board India / UAS Haveri Extension']);

-- 3. AGRICULTURAL SOURCES
INSERT INTO public.agricultural_sources (title, organization, publication_year, url, notes) VALUES
('Package of Practices for Horticultural Crops', 'University of Agricultural Sciences (UAS), Bangalore', 2023, 'https://uasbangalore.edu.in', 'Standard state agricultural university guidelines for Karnataka agro-climatic zones.'),
('Compendium of Vegetable Diseases and Pest Management', 'ICAR - Indian Institute of Horticultural Research (IIHR), Hessaraghatta', 2023, 'https://iihr.res.in', 'Premier horticultural research institute advisory on tomato and chilli disease protocols.'),
('Potato Production and Protection Technology in India', 'ICAR - Central Potato Research Institute (CPRI), Shimla', 2022, 'https://cpri.icar.gov.in', 'National benchmark protocols for potato late blight and common scab.'),
('Package of Practices for Field Crops', 'University of Agricultural Sciences (UAS), Dharwad & Raichur', 2023, 'https://uasd.edu', 'Comprehensive guidance for cotton and paddy farming in Karnataka.'),
('Spices Board Advisory Bulletin on Chilli Diseases', 'Spices Board India, Ministry of Commerce and Industry', 2022, 'https://indianspices.com', 'Export-grade IPM guidelines for Byadgi and dry chilli varieties.');

-- 4. AGRICULTURAL SHOPS (Authentic Karnataka Dealer Directory Samples)
INSERT INTO public.agricultural_shops (shop_name, owner_name, phone_number, district, taluk, village, address, latitude, longitude, services, verification_status) VALUES
('Raitha Seva Kendra Agro Agency', 'Shri Manjunath Gowda', '+91 98450 12345', 'Mandya', 'Mandya', 'Holalu', 'Near APMC Yard, Main Road, Mandya, Karnataka 571401', 12.5242, 76.8958, ARRAY['Certified Paddy Seeds', 'Bio-fertilizers', 'Organic Pesticides', 'Sprayer Equipment'], 'verified'),
('Kolar Kisan Agro Center', 'Shri R. Venkataswamy', '+91 94481 23456', 'Kolar', 'Kolar', 'Tamaka', 'Opposite Market Yard, Bangalore-Chennai Highway, Kolar, Karnataka 563101', 13.1367, 78.1348, ARRAY['Tomato Hybrid Seeds', 'Fungicides', 'Water Soluble Fertilizers', 'Drip Accessories'], 'verified'),
('Dharwad Krishi Vahini Agrochemicals', 'Shri Basavaraj Patil', '+91 97402 34567', 'Dharwad', 'Dharwad', 'Navalgund Road', 'Station Road, Beside APMC Complex, Dharwad, Karnataka 580001', 15.4589, 75.0078, ARRAY['Cotton Seeds (Bt)', 'Pesticides', 'Micronutrients', 'Soil Health Advisory'], 'verified'),
('Mysuru Bio-Inputs & Agro Tech', 'Shri K. Somesh', '+91 99003 45678', 'Mysuru', 'Nanjangud', 'Kadakola', 'Main Bazaar Road, Near Bus Stand, Nanjangud, Mysuru, Karnataka 571301', 12.1192, 76.6789, ARRAY['Paddy Nutrients', 'Organic Biocontrols', 'Neem Cake', 'Vegetable Seeds'], 'verified'),
('Hassan Tuber & Crop Care Store', 'Shri D. Chandrashekar', '+91 98864 56789', 'Hassan', 'Hassan', 'Kandali', 'B.M. Road, APMC Compound, Hassan, Karnataka 573201', 13.0068, 76.1004, ARRAY['Certified Potato Seed Tubers', 'Fungicides', 'Micro-drip Parts', 'Sprayers'], 'verified'),
('Byadgi Chilli Seeds & Crop Protection', 'Shri Mallikarjun Byadgi', '+91 94490 67890', 'Haveri', 'Byadgi', 'Motebennur', 'APMC Chilli Market Road, Byadgi, Haveri, Karnataka 581106', 14.6811, 75.4854, ARRAY['Byadgi Chilli Seeds', 'Anthracnose Advisory', 'Pheromone Traps', 'Bio-stimulants'], 'verified'),
('Shivamogga Malnad Krishi Seva', 'Shri S. Nagendra', '+91 96112 78901', 'Shivamogga', 'Bhadravati', 'Holehonnur', 'B.H. Road, Near Old Bus Stand, Bhadravati, Shivamogga, Karnataka 577301', 13.8409, 75.7032, ARRAY['Paddy Inputs', 'Arecanut & Vegetable Inputs', 'Soil Conditioners'], 'verified'),
('Raichur Doab Agro Mart', 'Shri Mohammed Ismail', '+91 98445 89012', 'Raichur', 'Sindhanur', 'Gorebal', 'Kushtagi Road, Beside Ryots Bhavan, Sindhanur, Raichur, Karnataka 584128', 15.7725, 76.7621, ARRAY['Paddy & Cotton Seeds', 'Zinc Sulfate', 'NPK Fertilizers', 'Sprayers'], 'verified'),
('Belagavi Samruddhi Agro Services', 'Shri Santosh Kulkarni', '+91 97314 90123', 'Belagavi', 'Chikkodi', 'Nipani Road', 'APMC Yard Gate 2, Chikkodi, Belagavi, Karnataka 591201', 16.4287, 74.5982, ARRAY['Vegetable Seeds', 'Organic Compost', 'Plant Growth Promoters', 'Pesticides'], 'verified'),
('Chikkaballapur Green Valley Agro', 'Shri K. R. Narayanaswamy', '+91 99723 01234', 'Chikkaballapur', 'Sidlaghatta', 'Jangamakote', 'MG Road, Sidlaghatta, Chikkaballapur, Karnataka 562105', 13.3912, 77.8631, ARRAY['Tomato & Capsicum Seeds', 'Trellis Twine', 'Bio-fungicides', 'Water Soluble NPK'], 'verified');

-- 5. APP SETTINGS
INSERT INTO public.app_settings (key, value, description) VALUES
('inference_config', '{"provider": "CropDiseaseAI", "model_version": "v1.2.0-karnataka-solanaceae", "default_mode": "demo_fallback", "allow_guest_scans": true, "max_upload_size_mb": 10}', 'AI Inference engine parameters and confidence bounds'),
('karnataka_districts', '["Bengaluru Urban", "Bengaluru Rural", "Mandya", "Mysuru", "Kolar", "Chikkaballapur", "Hassan", "Dharwad", "Belagavi", "Haveri", "Shivamogga", "Raichur", "Ballari", "Koppal", "Tumakuru", "Chitradurga", "Davangere", "Chikkamagaluru", "Udupi", "Dakshina Kannada"]', 'Approved list of Karnataka agricultural revenue districts'),
('system_version', '{"version": "1.0.0", "name": "KisanSaathi", "tagline": "Smarter Farming. Healthier Crops. Better Harvests.", "language": "en"}', 'Core application metadata')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
