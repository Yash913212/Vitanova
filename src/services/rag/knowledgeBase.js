/**
 * NutriVision AI — RAG Knowledge Base
 * Translation-ready structured entries for key nutrition, health and diet topics.
 */

export const KNOWLEDGE_BASE = [
  // --- FRUITS ---
  {
    id: 'banana',
    category: 'fruits',
    title: {
      en: 'Banana',
      hi: 'केला (Banana)',
      te: 'అరటిపండు (Banana)'
    },
    nutritionFacts: { calories: 89, protein: '1.1g', carbs: '23g', fats: '0.3g', fiber: '2.6g', potassium: '358mg' },
    benefits: {
      en: 'Excellent fast-digesting energy source, supports muscle recovery, boosts mood, high in potassium.',
      hi: 'त्वरित ऊर्जा का बेहतरीन स्रोत, मांसपेशियों की रिकवरी में सहायक, पोटेशियम से भरपूर।',
      te: 'త్వరిత శక్తినిచ్చే అద్భుతమైన వనరు, కండరాల రికవరీకి తోడ్పడుతుంది, పొటాషియం ఎక్కువ.'
    },
    recommendedIntake: {
      en: '1-2 medium bananas daily.',
      hi: 'प्रतिदिन 1-2 मध्यम केले।',
      te: 'రోజుకు 1-2 మధ్యస్థ అరటిపండ్లు.'
    },
    bestTime: {
      en: 'Pre-workout for energy, or post-workout for recovery.',
      hi: 'ऊर्जा के लिए वर्कआउट से पहले, या रिकवरी के लिए वर्कआउट के बाद।',
      te: 'వ్యాయామానికి ముందు శక్తి కోసం, లేదా తర్వాత రికవరీ కోసం.'
    },
    warnings: {
      en: 'High glycemic load; consume in moderation if diabetic.',
      hi: 'उच्च ग्लाइसेमिक लोड; मधुमेह रोगी सीमित मात्रा में ही सेवन करें।',
      te: 'గ్లైసెమిక్ ఇండెక్స్ ఎక్కువ; డయాబెటిస్ ఉన్నవారు పరిమితంగా తీసుకోవాలి.'
    },
    relatedFoods: ['apple', 'avocado', 'yogurt', 'muscle_gain']
  },
  {
    id: 'apple',
    category: 'fruits',
    title: {
      en: 'Apple',
      hi: 'सेब (Apple)',
      te: 'ఆపిల్ (Apple)'
    },
    nutritionFacts: { calories: 52, protein: '0.3g', carbs: '14g', fats: '0.2g', fiber: '2.4g', vitaminC: '4.6mg' },
    benefits: {
      en: 'High in fiber and antioxidants. Supports heart health, aids weight management, promotes gut health.',
      hi: 'फाइबर और एंटीऑक्सीडेंट से भरपूर। हृदय स्वास्थ्य में सुधार, वजन नियंत्रण, आंतों के लिए अच्छा।',
      te: 'పీచుపదార్థం మరియు యాంటీఆక్సిడెంట్లు ఎక్కువ. గుండె ఆరోగ్యానికి, బరువు నియంత్రణకు మంచిది.'
    },
    recommendedIntake: {
      en: '1 medium apple daily.',
      hi: 'प्रतिदिन 1 मध्यम सेब।',
      te: 'రోజుకు ఒక మధ్యస్థ ఆపిల్.'
    },
    bestTime: {
      en: 'Morning breakfast or mid-morning snack.',
      hi: 'सुबह के नाश्ते में या दोपहर से पहले स्नैक के रूप में।',
      te: 'ఉదయం అల్పాహారంలో లేదా మధ్యాహ్నానికి ముందు స్నాక్‌గా.'
    },
    warnings: {
      en: 'Eat with skin for fiber, but wash thoroughly to remove wax/pesticides.',
      hi: 'फाइबर के लिए छिलके सहित खाएं, लेकिन मोम/कीटनाशकों को हटाने के लिए अच्छी तरह धो लें।',
      te: 'పీచు కోసం తొక్కతో తినండి, కానీ మైనం/పురుగుమందులు పోయేలా బాగా కడగాలి.'
    },
    relatedFoods: ['banana', 'spinach', 'healthy_eating', 'fat_loss']
  },

  // --- VEGETABLES ---
  {
    id: 'spinach',
    category: 'vegetables',
    title: {
      en: 'Spinach',
      hi: 'पालक (Spinach)',
      te: 'పాలకూర (Spinach)'
    },
    nutritionFacts: { calories: 23, protein: '2.9g', carbs: '3.6g', fats: '0.4g', fiber: '2.2g', iron: '2.7mg', calcium: '99mg' },
    benefits: {
      en: 'Iron-rich superfood, builds red blood cells, strengthens bones, rich in vitamins A, C, and K.',
      hi: 'आयरन से भरपूर सुपरफूड, लाल रक्त कोशिकाओं का निर्माण, हड्डियों को मजबूत और ऊर्जावान बनाता है।',
      te: 'ఐరన్ ఎక్కువగా ఉండే సూపర్ ఫుడ్, రక్తకణాల ఉత్పత్తి పెంచుతుంది, ఎముకలను దృఢపరుస్తుంది.'
    },
    recommendedIntake: {
      en: '1 cup cooked or 2 cups raw spinach 3-4 times a week.',
      hi: 'सप्ताह में 3-4 बार 1 कप पका हुआ या 2 कप कच्चा पालक।',
      te: 'వారానికి 3-4 సార్లు 1 కప్పు ఉడికించిన లేదా 2 కప్పుల పచ్చి పాలకూర.'
    },
    bestTime: {
      en: 'Lunch or dinner, cooked with healthy fats like olive oil to absorb vitamins.',
      hi: 'दोपहर या रात का भोजन, विटामिन अवशोषण के लिए जैतून के तेल जैसे स्वस्थ वसा के साथ पकाएं।',
      te: 'మధ్యాహ్నం లేదా రాత్రి భోజనం, విటమిన్లు గ్రహించడానికి ఆలివ్ ఆయిల్ వంటి ఆరోగ్యకరమైన కొవ్వులతో వండాలి.'
    },
    warnings: {
      en: 'High in oxalates; consume in moderation if prone to kidney stones.',
      hi: 'ऑक्सालेट की अधिक मात्रा; गुर्दे की पथरी (kidney stones) के मरीज सीमित मात्रा में लें।',
      te: 'ఆక్సలేట్లు ఎక్కువ; కిడ్నీలో రాళ్లు ఉన్నవారు పరిమितంగా తీసుకోవాలి.'
    },
    relatedFoods: ['broccoli', 'carrot', 'immunity_foods', 'diabetic_safe_foods']
  },
  {
    id: 'broccoli',
    category: 'vegetables',
    title: {
      en: 'Broccoli',
      hi: 'हरी गोभी (Broccoli)',
      te: 'బ్రోకలీ (Broccoli)'
    },
    nutritionFacts: { calories: 34, protein: '2.8g', carbs: '7g', fats: '0.4g', fiber: '2.6g', vitaminC: '89.2mg' },
    benefits: {
      en: 'Extremely high in Vitamin C, anti-inflammatory, detoxifies the body, contains anti-cancer compounds.',
      hi: 'विटामिन सी से भरपूर, सूजन को कम करता है, शरीर को डिटॉक्सीफाई करता है, कैंसर विरोधी तत्व।',
      te: 'విటమిన్ సి అత్యధికంగా ఉంటుంది, మంటను తగ్గిస్తుంది, క్యాన్సర్ నిరోధక సమ్మేళనాలు కలిగి ఉంది.'
    },
    recommendedIntake: {
      en: '1 cup chopped broccoli daily or every other day.',
      hi: 'प्रतिदिन या एक दिन छोड़कर 1 कप कटी हुई ब्रोकोली।',
      te: 'రోజు మార్చి రోజు 1 కప్పు తరిగిన బ్రోకలీ.'
    },
    bestTime: {
      en: 'Lunch or dinner, lightly steamed to preserve vitamins.',
      hi: 'दोपहर या रात के भोजन में, विटामिन बचाने के लिए हल्का भाप देकर (steamed) खाएं।',
      te: 'మధ్యాహ్నం లేదా రాత్రి భోజనం, విటమిన్లు నశించకుండా తేలికగా ఆవిరిపై ఉడికించాలి.'
    },
    warnings: {
      en: 'May cause gas or bloating in sensitive stomachs if eaten raw.',
      hi: 'कच्चा खाने पर संवेदनशील पेट में गैस या सूजन (bloating) का कारण बन सकता है।',
      te: 'పచ్చిగా తింటే గ్యాస్ లేదా కడుపు ఉబ్బరానికి దారితీయవచ్చు.'
    },
    relatedFoods: ['spinach', 'capsicum', 'immunity_foods', 'healthy_eating']
  },

  // --- NUTRIENTS ---
  {
    id: 'protein',
    category: 'nutrients',
    title: {
      en: 'Protein',
      hi: 'प्रोटीन (Protein)',
      te: 'ప్రోటీన్ (Protein)'
    },
    benefits: {
      en: 'Essential building block of life. Builds and repairs muscles, supports skin, hair, and immune health, promotes satiety.',
      hi: 'जीवन का आवश्यक निर्माण खंड। मांसपेशियों का निर्माण और मरम्मत, त्वचा, बाल और प्रतिरक्षा प्रणाली का समर्थन।',
      te: 'జీవనానికి అవసరమైన ముఖ్యమైన పోషకం. కండరాల నిర్మాణం, చర్మం, జుట్టు మరియు రోగనిరోధక శక్తికి తోడ్పడుతుంది.'
    },
    recommendedIntake: {
      en: '0.8g to 2.0g per kilogram of body weight, depending on physical activity.',
      hi: 'शारीरिक गतिविधि के आधार पर, प्रति किलोग्राम शरीर के वजन पर 0.8 ग्राम से 2.0 ग्राम।',
      te: 'శారీరక శ్రమను బట్టి, శరీర బరువులో ప్రతి కిలోకు 0.8 గ్రా నుండి 2.0 గ్రా వరకు.'
    },
    bestTime: {
      en: 'Distributed evenly throughout meals, especially post-workout.',
      hi: 'सभी भोजनों में समान रूप से वितरित, विशेष रूप से वर्कआउट के बाद।',
      te: 'అన్ని పూటలా సమానంగా తీసుకోవాలి, వ్యాయామం ముగిసిన వెంటనే తప్పనిసరి.'
    },
    warnings: {
      en: 'Excessive high protein without adequate water can strain kidneys over time.',
      hi: 'पर्याप्त पानी के बिना अत्यधिक प्रोटीन का सेवन समय के साथ गुर्दे पर दबाव डाल सकता है।',
      te: 'తగినంత నీరు తాగకుండా ఎక్కువ ప్రోటీన్ తీసుకుంటే కాలక్రమేణా కిడ్నీలపై భారం పడుతుంది.'
    },
    relatedFoods: ['chicken', 'paneer', 'egg', 'tofu', 'muscle_gain']
  },
  {
    id: 'fiber',
    category: 'nutrients',
    title: {
      en: 'Dietary Fiber',
      hi: 'फाइबर (Dietary Fiber)',
      te: 'పీచు పదార్థం (Dietary Fiber)'
    },
    benefits: {
      en: 'Improves digestion, keeps you full (helps fat loss), lowers cholesterol, regulates blood sugar levels.',
      hi: 'पाचन में सुधार करता है, पेट भरा रखता है (वजन घटाने में सहायक), कोलेस्ट्रॉल और शुगर नियंत्रित करता है।',
      te: 'జీర్ణక్రియను మెరుగుపరుస్తుంది, కడుపు నిండినట్లు ఉంచుతుంది (కొవ్వు కరగడానికి మంచిది), కొలెస్ట్రాల్ తగ్గిస్తుంది.'
    },
    recommendedIntake: {
      en: '25g per day for women, 38g per day for men.',
      hi: 'महिलाओं के लिए 25 ग्राम और पुरुषों के लिए 38 ग्राम प्रतिदिन।',
      te: 'మహిళలకు రోజుకు 25 గ్రాములు, పురుషులకు రోజుకు 38 గ్రాములు.'
    },
    bestTime: {
      en: 'Throughout the day with meals. Start morning with high-fiber grains.',
      hi: 'भोजन के साथ पूरे दिन। सुबह की शुरुआत उच्च फाइबर वाले अनाज से करें।',
      te: 'రోజంతా భోజనంతో పాటు. ఉదయం పీచు ఎక్కువగా ఉండే ధాన్యాలతో ప్రారంభించండి.'
    },
    warnings: {
      en: 'Increase intake gradually and drink plenty of water to avoid gas or cramps.',
      hi: 'गैस या ऐंठन से बचने के लिए धीरे-धीरे फाइबर बढ़ाएं और खूब पानी पिएं।',
      te: 'గ్యాస్ లేదా కడుపు నొప్పి రాకుండా ఉండటానికి పీచు క్రమంగా పెంచుతూ, ఎక్కువ నీరు తాగాలి.'
    },
    relatedFoods: ['apple', 'oats', 'lentils', 'fat_loss', 'diabetic_safe_foods']
  },

  // --- VITAMINS ---
  {
    id: 'vitamin_c',
    category: 'vitamins',
    title: {
      en: 'Vitamin C (Ascorbic Acid)',
      hi: 'विटामिन सी (Vitamin C)',
      te: 'విటమిన్ సి (Vitamin C)'
    },
    benefits: {
      en: 'Powerful antioxidant, critical for immune cell function, aids iron absorption, essential for skin collagen production.',
      hi: 'शक्तिशाली एंटीऑक्सीडेंट, रोग प्रतिरोधक क्षमता बढ़ाने में सहायक, आयरन अवशोषण और त्वचा के कोलेजन के लिए आवश्यक।',
      te: 'శక్తివంతమైన యాంటీఆక్సిడెంట్, రోగనిరోధక శక్తికి అవసరం, ఐరన్ గ్రహించడానికి మరియు చర్మ సౌందర్యానికి ముఖ్యం.'
    },
    recommendedIntake: {
      en: '75mg - 90mg daily. Upper limit is 2000mg.',
      hi: '75 मिलीग्राम - 90 मिलीग्राम प्रतिदिन। अधिकतम सीमा 2000 मिलीग्राम है।',
      te: 'రోజుకు 75mg - 90mg. గరిష్ట పరిమితి 2000mg.'
    },
    bestTime: {
      en: 'Morning or afternoon, ideally taken alongside iron-rich meals (like spinach) to boost absorption.',
      hi: 'सुबह या दोपहर में, अवशोषण बढ़ाने के लिए आयरन युक्त भोजन (जैसे पालक) के साथ लें।',
      te: 'ఉదయం లేదా మధ్యాహ్నం, ఐరన్ ఉన్న ఆహారంతో (పాలకూర వంటివి) తీసుకుంటే ఐరన్ బాగా అందుతుంది.'
    },
    warnings: {
      en: 'High doses (above 2000mg) can cause diarrhea, stomach upset, and kidney stones.',
      hi: 'अत्यधिक खुराक (2000mg से अधिक) से दस्त, पेट खराब और गुर्दे की पथरी हो सकती है।',
      te: 'ఎక్కువ మోతాదులో (2000mg పైన) తీసుకుంటే విరేచనాలు, కడుపు నొప్పి మరియు కిడ్నీలో రాళ్లు ఏర్పడవచ్చు.'
    },
    relatedFoods: ['orange', 'broccoli', 'guava', 'immunity_foods']
  },

  // --- MINERALS ---
  {
    id: 'potassium',
    category: 'minerals',
    title: {
      en: 'Potassium',
      hi: 'पोटेशियम (Potassium)',
      te: 'పొటాషియం (Potassium)'
    },
    benefits: {
      en: 'Crucial electrolyte. Lowers blood pressure, prevents muscle cramps, supports nerve transmission and heart rhythm.',
      hi: 'महत्वपूर्ण इलेक्ट्रोलाइट। रक्तचाप कम करता है, मांसपेशियों की ऐंठन रोकता है, हृदय गति नियमित रखता है।',
      te: 'ముఖ్యమైన ఎలక్ట్రోలైట్. రక్తపోటును తగ్గిస్తుంది, కండరాల నొప్పులను నివారిస్తుంది, గుండె లయకు తోడ్పడుతుంది.'
    },
    recommendedIntake: {
      en: '2,600mg (women) to 3,400mg (men) daily.',
      hi: 'प्रतिदिन 2,600 मिलीग्राम (महिलाएं) से 3,400 मिलीग्राम (पुरुष)।',
      te: 'రోజుకు 2,600mg (మహిళలు) నుండి 3,400mg (పురుషులు).'
    },
    bestTime: {
      en: 'Consistently throughout the day, particularly after intense sweating or workouts.',
      hi: 'पूरे दिन नियमित रूप से, विशेष रूप से अत्यधिक पसीने या वर्कआउट के बाद।',
      te: 'రోజంతా క్రమం తప్పకుండా, ముఖ్యంగా వ్యాయామం ముగిసిన తర్వాత లేదా బాగా చెమట పట్టినప్పుడు.'
    },
    warnings: {
      en: 'If you have chronic kidney disease, consult a doctor as excess potassium can be dangerous.',
      hi: 'यदि आपको किडनी की गंभीर बीमारी है, तो डॉक्टर से सलाह लें, क्योंकि अधिक पोटेशियम खतरनाक हो सकता है।',
      te: 'కిడ్నీ సమస్యలు ఉన్నవారు డాక్టర్ సలహా తీసుకోవాలి, పొటాషియం పెరిగితే ప్రమాదం కావచ్చు.'
    },
    relatedFoods: ['banana', 'watermelon', 'beetroot', 'hydration']
  },

  // --- HEALTH TOPICS: HYDRATION ---
  {
    id: 'hydration',
    category: 'hydration',
    title: {
      en: 'Hydration & Water Intake',
      hi: 'जल योजन और पानी का सेवन (Hydration)',
      te: 'హైడ్రేషన్ మరియు నీటి వినియోగం (Hydration)'
    },
    benefits: {
      en: 'Regulates body temperature, lubricates joints, flushes waste, improves cognitive function, boosts metabolism.',
      hi: 'शरीर के तापमान को नियंत्रित करता है, जोड़ों को चिकना रखता है, कचरे को बाहर निकालता है, चयापचय तेज करता है।',
      te: 'శరీర ఉష్ణోగ్రతను నియంత్రిస్తుంది, కీళ్లను సజావుగా ఉంచుతుంది, వ్యర్థాలను విసర్జిస్తుంది, జీవక్రియను పెంచుతుంది.'
    },
    recommendedIntake: {
      en: '2.7 liters (women) to 3.7 liters (men) of total water per day.',
      hi: 'प्रतिदिन कुल 2.7 लीटर (महिलाएं) से 3.7 लीटर (पुरुष) पानी।',
      te: 'రోజుకు 2.7 లీటర్లు (మహిళలు) నుండి 3.7 లీటర్ల (పురుషులు) నీరు.'
    },
    bestTime: {
      en: 'Start with 1 glass upon waking up, drink before meals, and during/after exercise.',
      hi: 'जागने पर 1 गिलास से शुरुआत करें, भोजन से पहले और व्यायाम के दौरान/बाद में पिएं।',
      te: 'ఉదయం నిద్ర లేవగానే 1 గ్లాసు తాగాలి, భోజనానికి ముందు మరియు వ్యాయామ సమయంలో/తర్వాత తాగాలి.'
    },
    warnings: {
      en: 'Extreme over-hydration in a short time can cause hyponatremia (dangerously low sodium).',
      hi: 'कम समय में अत्यधिक पानी पीने से हाइपोनेट्रेमिया (सोडियम का खतरनाक रूप से कम होना) हो सकता है।',
      te: 'అతి తక్కువ సమయంలో అతిగా నీరు తాగితే రక్తంలో సోడియం తగ్గి ప్రమాదం కావచ్చు.'
    },
    relatedFoods: ['watermelon', 'cucumber', 'orange', 'potassium']
  },

  // --- HEALTH TOPICS: DIETARY OBJECTIVES ---
  {
    id: 'fat_loss',
    category: 'fat_loss',
    title: {
      en: 'Nutrition for Fat Loss',
      hi: 'वजन और वसा घटाने के लिए पोषण (Fat Loss)',
      te: 'కొవ్వు తగ్గించడానికి పోషణ (Fat Loss)'
    },
    benefits: {
      en: 'Promotes sustained calorie deficit, maintains muscle mass with lean proteins, keeps energy levels stable, reduces body fat percentage.',
      hi: 'लगातार कैलोरी की कमी बनाए रखता है, मांसपेशियों को बचाता है, ऊर्जा स्तर को स्थिर रखता है, वसा घटाता है।',
      te: 'కఠినమైన ఆహారం లేకుండా కేలరీల నియంత్రణకు తోడ్పడుతుంది, కండరాలను కాపాడుతూ కొవ్వును కరిగిస్తుంది.'
    },
    recommendedIntake: {
      en: 'A mild calorie deficit (300-500 kcal under maintenance) with high protein and high fiber intake.',
      hi: 'उच्च प्रोटीन और उच्च फाइबर के साथ हल्की कैलोरी की कमी (रखरखाव से 300-500 kcal कम)।',
      te: 'ఎక్కువ ప్రోటీన్ మరియు పీచుతో పాటు, రోజువారీ కేలరీలను 300-500 kcal తగ్గించాలి.'
    },
    bestTime: {
      en: 'Eat protein-rich and fiber-rich meals early to control appetite throughout the day.',
      hi: 'भूख को नियंत्रित करने के लिए दिन की शुरुआत में ही प्रोटीन और फाइबर युक्त भोजन करें।',
      te: 'ఆకలి నియంత్రణ కోసం ఉదయం పూట ప్రోటీన్ మరియు పీచు ఎక్కువగా ఉండే ఆహారం తీసుకోవాలి.'
    },
    warnings: {
      en: 'Avoid crash dieting; severe calorie restriction slows metabolism and triggers muscle loss.',
      hi: 'क्रैश डाइटिंग से बचें; अत्यधिक कैलोरी की कमी चयापचय को धीमा कर देती है और मांसपेशियां घटाती है।',
      te: 'కఠినమైన ఉపవాసాలు వద్దు; అతిగా కేలరీలు తగ్గిస్తే జీవక్రియ మందగిస్తుంది మరియు కండరాల నష్టం జరుగుతుంది.'
    },
    relatedFoods: ['spinach', 'broccoli', 'oats', 'fiber', 'healthy_eating']
  },
  {
    id: 'muscle_gain',
    category: 'muscle_gain',
    title: {
      en: 'Nutrition for Muscle Gain',
      hi: 'मांसपेशियों के निर्माण के लिए पोषण (Muscle Gain)',
      te: 'కండరాల వృద్ధి కోసం పోషణ (Muscle Gain)'
    },
    benefits: {
      en: 'Supports muscle protein synthesis, accelerates post-workout recovery, increases strength, optimizes hormonal health.',
      hi: 'मांसपेशियों के प्रोटीन संश्लेषण का समर्थन, वर्कआउट के बाद रिकवरी तेज, ताकत और प्रदर्शन बढ़ाता है।',
      te: 'కండరాల ప్రోటీన్ సంశ్లేషణను పెంచుతుంది, వ్యాయామం తర్వాత త్వరగా కోలుకోవడానికి మరియు బలానికి తోడ్పడుతుంది.'
    },
    recommendedIntake: {
      en: '1.6g - 2.2g protein per kg of bodyweight, with a moderate calorie surplus (200-400 kcal).',
      hi: 'शरीर के वजन के प्रति किलो पर 1.6 - 2.2 ग्राम प्रोटीन, साथ ही कैलोरी में हल्की बढ़ोतरी (200-400 kcal)।',
      te: 'శరీర బరువులో కిలోకు 1.6g - 2.2g ప్రోటీన్, మరియు 200-400 kcal అదనపు కేలరీలు.'
    },
    bestTime: {
      en: 'Post-workout protein + fast carbs (like banana), and casein protein before bedtime.',
      hi: 'वर्कआउट के तुरंत बाद प्रोटीन + त्वरित कार्ब्स (जैसे केला), और सोने से पहले कैसीन प्रोटीन।',
      te: 'వ్యాయామం ముగిసిన వెంటనే ప్రోటీన్ + పిండిపదార్థాలు (అరటిపండు వంటివి), నిద్రపోయే ముందు నెమ్మదిగా జీర్ణమయ్యే ప్రోటీన్.'
    },
    warnings: {
      en: 'Consuming high calories from junk food (dirty bulking) gains excess body fat, not muscle.',
      hi: 'जंक फूड से अधिक कैलोरी लेने (dirty bulking) से सिर्फ चर्बी बढ़ती है, मांसपेशी नहीं।',
      te: 'జంక్ ఫుడ్స్ ద్వారా కేలరీలు పెంచితే (డర్టీ బల్కింగ్) కేవలం కొవ్వు పెరుగుతుంది, కండరాలు కాదు.'
    },
    relatedFoods: ['banana', 'protein', 'chicken', 'paneer', 'egg', 'meal_timing']
  },

  // --- HEALTH TOPICS: LIFESTYLE & CLINICAL ---
  {
    id: 'healthy_eating',
    category: 'healthy_eating',
    title: {
      en: 'Balanced Diet & Healthy Eating',
      hi: 'संतुलित आहार और स्वस्थ खानपान (Balanced Diet)',
      te: 'సమతుల్య ఆహారం మరియు ఆరోగ్యకరమైన అలవాట్లు (Balanced Diet)'
    },
    benefits: {
      en: 'Provides long-term health, prevents lifestyle diseases, sustains everyday energy levels, improves longevity and mental clarity.',
      hi: 'दीर्घकालिक स्वास्थ्य प्रदान करता है, जीवनशैली की बीमारियों से बचाता है, ऊर्जा और मानसिक स्पष्टता प्रदान करता है।',
      te: 'దీర్ఘకాలిక ఆరోగ్యాన్ని ఇస్తుంది, జీవనశైలి వ్యాధులను నివారిస్తుంది, రోజంతా స్థిరమైన శక్తిని ఇస్తుంది.'
    },
    recommendedIntake: {
      en: 'Follow the 80/20 rule: 80% whole food nutrients, 20% flexibility.',
      hi: '80/20 नियम का पालन करें: 80% संपूर्ण और प्राकृतिक भोजन, 20% लचीलापन।',
      te: '80/20 సూత్రం పాటించండి: 80% సహజసిద్ధమైన ఆహారం, 20% ఇతర ఇష్టమైన ఆహారాలు.'
    },
    bestTime: {
      en: 'Eat at fixed intervals daily to support circadian rhythm and healthy digestion.',
      hi: 'पाचन क्रिया और जैविक घड़ी (circadian rhythm) को ठीक रखने के लिए प्रतिदिन निश्चित समय पर भोजन करें।',
      te: 'జీర్ణక్రియ మరియు జీవ గడియారం సరిగ్గా పనిచేయడానికి రోజూ నిర్ణీత సమయాల్లో తినాలి.'
    },
    warnings: {
      en: 'Avoid highly processed foods, excess refined sugars, and hydrogenated trans-fats.',
      hi: 'अत्यधिक प्रोसेस्ड फूड, रिफाइंड शुगर और हानिकारक ट्रांस-फैट से पूरी तरह बचें।',
      te: 'ప్యాక్ చేసిన ఆహారాలు, పంచదార మరియు హానికరమైన ట్రాన్స్-ఫ్యాట్స్‌కు దూరంగా ఉండండి.'
    },
    relatedFoods: ['apple', 'spinach', 'broccoli', 'oats', 'hydration']
  },
  {
    id: 'diabetic_safe_foods',
    category: 'diabetic_safe_foods',
    title: {
      en: 'Diabetic-Safe Foods & Blood Sugar Control',
      hi: 'मधुमेह-सुरक्षित भोजन (Diabetic-Safe Foods)',
      te: 'డయాబెటిస్ రోగులకు సురక్షిత ఆహారాలు (Diabetic-Safe Foods)'
    },
    benefits: {
      en: 'Prevents blood glucose spikes, improves insulin sensitivity, supports weight management, reduces cardiovascular risks.',
      hi: 'रक्त शर्करा (glucose) में अचानक वृद्धि को रोकता है, इंसुलिन संवेदनशीलता में सुधार, हृदय रोग का जोखिम कम।',
      te: 'రక్తంలో గ్లూకోజ్ స్థాయిలు అకస్మాత్తుగా పెరగకుండా చూస్తుంది, ఇన్సులిన్ పనితీరును మెరుగుపరుస్తుంది.'
    },
    recommendedIntake: {
      en: 'Prioritize low-glycemic index (GI) foods rich in soluble fiber and lean protein.',
      hi: 'कम ग्लाइसेमिक इंडेक्स (GI) वाले खाद्य पदार्थों, घुलनशील फाइबर और लीन प्रोटीन को प्राथमिकता दें।',
      te: 'తక్కువ గ్లైసెమిక్ ఇండెక్స్ (GI) ఉండి, పీచు మరియు ప్రోటీన్ ఎక్కువగా ఉండే ఆహారాలకు ప్రాధాన్యత ఇవ్వండి.'
    },
    bestTime: {
      en: 'Consistent carbohydrate counting across regular spaced meals; avoid skipping meals.',
      hi: 'नियमित समय पर सीमित मात्रा में कार्बोहाइड्रेट लें; भोजन छोड़ना (skipping) हानिकारक हो सकता है।',
      te: 'క్రమమైన వ్యవధిలో పిండి పదార్థాల కొలతతో తినాలి; ఏ పూట భోజనాన్ని కూడా దాటవేయవద్దు.'
    },
    warnings: {
      en: 'Avoid high GI foods like white bread, sugary soda, and extreme quantities of sweet fruits.',
      hi: 'मैदा, सफेद ब्रेड, मीठे सोडे और बहुत ज्यादा मीठे फलों के सेवन से पूरी तरह बचें।',
      te: 'వైట్ బ్రెడ్, కూల్ డ్రింక్స్ మరియు ఎక్కువ తీపి ఉండే పండ్లను అతిగా తినకూడదు.'
    },
    relatedFoods: ['spinach', 'broccoli', 'oats', 'tofu', 'fiber']
  },
  {
    id: 'immunity_foods',
    category: 'immunity_foods',
    title: {
      en: 'Immune Boosting Nutrition',
      hi: 'प्रतिरक्षा बढ़ाने वाला पोषण (Immune Boosting)',
      te: 'రోగనిరోధక శక్తిని పెంచే పోషణ (Immune Boosting)'
    },
    benefits: {
      en: 'Strengthens body defenses, reduces duration/severity of infections, fights oxidative stress, repairs cellular damage.',
      hi: 'शरीर की सुरक्षा प्रणाली को मजबूत करता है, संक्रमण की गंभीरता कम करता है, कोशिकाओं की मरम्मत।',
      te: 'శరీర రక్షణ వ్యవస్థను పటిష్టం చేస్తుంది, ఇన్ఫెక్షన్ల తీవ్రతను తగ్గిస్తుంది, కణాల నష్టాన్ని నివారిస్తుంది.'
    },
    recommendedIntake: {
      en: 'A daily colorful spectrum of antioxidant-rich fruits and green leafy vegetables.',
      hi: 'प्रतिदिन एंटीऑक्सीडेंट से भरपूर रंग-बिरंगे फल और हरी पत्तेदार सब्जियां लें।',
      te: 'యాంటీఆక్సిడెంట్లు ఎక్కువగా ఉండే రంగురంగుల పండ్లు మరియు ఆకుకూరలు రోజూ తినాలి.'
    },
    bestTime: {
      en: 'Include immune boosters with breakfast or lunch to actively support immune surveillance.',
      hi: 'सक्रिय प्रतिरक्षा प्रणाली के लिए सुबह के नाश्ते या दोपहर के भोजन में इन्हें शामिल करें।',
      te: 'రోగనిరోధక కణాల చురుకుదనం కోసం ఉదయం లేదా మధ్యాహ్న భోజనంలో వీటిని చేర్చుకోవాలి.'
    },
    warnings: {
      en: 'Immune health is built by daily habit, not overnight high-dose supplement loads.',
      hi: 'प्रतिरक्षा स्वास्थ्य दैनिक आदतों से बनता है, न कि रातोंरात बहुत सारे सप्लीमेंट लेने से।',
      te: 'రోగనిరోధక శక్తి అనేది రోజువారీ అలవాట్లతో వస్తుంది, ఒకేరోజు ఎక్కువ సప్లిమెంట్లు వేసుకుంటే రాదు.'
    },
    relatedFoods: ['broccoli', 'spinach', 'orange', 'guava', 'vitamin_c']
  },
  {
    id: 'meal_timing',
    category: 'meal_timing',
    title: {
      en: 'Workout Nutrition & Meal Timing',
      hi: 'वर्कआउट पोषण और भोजन का समय (Meal Timing)',
      te: 'వ్యాయామ పోషణ మరియు భోజన సమయాలు (Meal Timing)'
    },
    benefits: {
      en: 'Maximizes training performance, prevents muscle breakdown, supports immediate glycogen replenishment, speeds up recovery.',
      hi: 'ट्रेनिंग प्रदर्शन को अधिकतम करता है, मांसपेशियों के टूटने को रोकता है, रिकवरी की गति बढ़ाता है।',
      te: 'వ్యాయామం చేసేటప్పుడు అత్యుత్తమ ప్రదర్శన ఇవ్వడానికి, కండరాలు కరగకుండా ఉండటానికి మరియు త్వరగా కోలుకోవడానికి తోడ్పడుతుంది.'
    },
    recommendedIntake: {
      en: 'Pre-workout carbs 1-2 hours before; post-workout protein + carbs within 45 minutes.',
      hi: 'वर्कआउट से 1-2 घंटे पहले कार्ब्स; वर्कआउट के बाद 45 मिनट के भीतर प्रोटीन + कार्ब्स।',
      te: 'వ్యాయామానికి 1-2 గంటల ముందు పిండిపదార్థాలు; వ్యాయామం ముగిసిన 45 నిమిషాల లోపు ప్రోటీన్ + పిండిపదార్థాలు.'
    },
    bestTime: {
      en: 'Timed precisely around intensive sessions. Avoid heavy fat meals before workout.',
      hi: 'गहन वर्कआउट सत्रों के आस-पास सटीक समय पर। वर्कआउट से पहले भारी वसायुक्त भोजन से बचें।',
      te: 'వ్యాయామ సమయాలకు తగినట్లుగా. వ్యాయామానికి ముందు ఎక్కువ కొవ్వు ఉండే ఆహారం తినవద్దు.'
    },
    warnings: {
      en: 'Exercising on an extremely full stomach causes cramps and sluggishness due to redirected blood flow.',
      hi: 'भरे पेट व्यायाम करने से रक्त प्रवाह के विचलन के कारण ऐंठन और आलस्य आ सकता है।',
      te: 'కడుపు నిండా తిని వ్యాయామం చేస్తే రక్త ప్రసరణ జీర్ణకోశం వైపు మళ్లి కండరాల నొప్పులు మరియు బద్ధకం వస్తాయి.'
    },
    relatedFoods: ['banana', 'protein', 'muscle_gain', 'gym_diet']
  },
  {
    id: 'gym_diet',
    category: 'gym_diet',
    title: {
      en: 'Gym Diet & Fitness Nutrition',
      hi: 'जिम डाइट और फिटनेस पोषण (Gym Diet)',
      te: 'జిమ్ డైట్ మరియు ఫిట్‌నెస్ పోషణ (Gym Diet)'
    },
    benefits: {
      en: 'Improves body composition, optimizes electrolyte balances, fuels high-intensity performance, protects lean tissues.',
      hi: 'शरीर की बनावट (body composition) में सुधार, इलेक्ट्रोलाइट संतुलन, उच्च प्रदर्शन में सहायक।',
      te: 'శరీర ఆకృతిని మెరుగుపరుస్తుంది, ఎలక్ట్రోలైట్ల సమతుల్యతను కాపాడుతుంది, కండరాలను రక్షిస్తుంది.'
    },
    recommendedIntake: {
      en: 'High-protein diet customized by bodyweight, supplemented with complex carbohydrates and healthy fats.',
      hi: 'शरीर के वजन के अनुसार उच्च-प्रोटीन आहार, जटिल कार्बोहाइड्रेट और स्वस्थ वसा का मिश्रण।',
      te: 'శరీర బరువుకు తగినట్లుగా ఎక్కువ ప్రోటీన్ ఉండి, కాంప్లెక్స్ పిండిపదార్థాలు మరియు మంచి కొవ్వులు ఉన్న ఆహారం.'
    },
    bestTime: {
      en: 'Structured eating every 3-4 hours to sustain amino acid pools in the bloodstream.',
      hi: 'रक्त में अमीनो एसिड के स्तर को बनाए रखने के लिए हर 3-4 घंटे में भोजन संरचित करें।',
      te: 'రక్తంలో అమినో యాసిడ్ల నిల్వలను కాపాడటానికి ప్రతి 3-4 గంటలకు ఒకసారి పోషకాలు తీసుకోవాలి.'
    },
    warnings: {
      en: 'Avoid highly marketed fitness supplements without solid whole-food foundations.',
      hi: 'बिना अच्छे प्राकृतिक भोजन के केवल अत्यधिक विज्ञापित सप्लीमेंट्स पर निर्भर रहने से बचें।',
      te: 'సహజమైన ఆహారాన్ని పక్కనబెట్టి కేవలం జిమ్ సప్లిమెంట్లపైనే ఆధారపడకూడదు.'
    },
    relatedFoods: ['protein', 'banana', 'muscle_gain', 'meal_timing']
  }
];
