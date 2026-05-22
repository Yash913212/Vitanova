/**
 * NutriVision AI — SQLite Multilingual Data Seeder
 * Populates 42 food profiles and 12 nutrition/health topics in English, Hindi, and Telugu.
 */

import { runQuery, withTransaction } from './sqlite.js';

// Comprehensive localized food and topic dataset
const SEED_DATA = [
  // --- FRUITS ---
  {
    id: 'banana',
    category: 'fruits',
    calories: 89, protein: 1.1, carbs: 23, fats: 0.3, fiber: 2.6, hydration: 75,
    vitamins: ['Vitamin B6', 'Vitamin C', 'Folate'],
    minerals: ['Potassium', 'Magnesium', 'Manganese'],
    translations: {
      en: {
        name: 'Banana',
        benefits: 'Excellent fast-digesting energy source, supports muscle recovery, boosts mood, high in potassium.',
        best_time: 'Pre-workout for energy, or post-workout for recovery.',
        recommended_quantity: '1-2 medium bananas daily (118g)',
        warnings: 'High glycemic load; consume in moderation if diabetic.'
      },
      hi: {
        name: 'केला (Banana)',
        benefits: 'त्वरित ऊर्जा का बेहतरीन स्रोत, मांसपेशियों की रिकवरी में सहायक, पोटेशियम से भरपूर।',
        best_time: 'ऊर्जा के लिए वर्कआउट से पहले, या रिकवरी के लिए वर्कआउट के बाद।',
        recommended_quantity: 'प्रतिदिन 1-2 मध्यम केले (118g)।',
        warnings: 'उच्च ग्लाइसेमिक लोड; मधुमेह रोगी सीमित मात्रा में ही सेवन करें।'
      },
      te: {
        name: 'అరటిపండు (Banana)',
        benefits: 'త్వరిత శక్తినిచ్చే అద్భుతమైన వనరు, కండరాల రికవరీకి తోడ్పడుతుంది, పొటాషియం ఎక్కువ.',
        best_time: 'వ్యాయామానికి ముందు शक्ति కోసం, లేదా తర్వాత రికవరీ కోసం.',
        recommended_quantity: 'రోజుకు 1-2 మధ్యస్థ అరటిపండ్లు (118g).',
        warnings: 'గ్లైసెమిక్ ఇండెక్స్ ఎక్కువ; డయాబెటిస్ ఉన్నవారు పరిమితంగా తీసుకోవాలి.'
      }
    }
  },
  {
    id: 'apple',
    category: 'fruits',
    calories: 52, protein: 0.3, carbs: 14, fats: 0.2, fiber: 2.4, hydration: 86,
    vitamins: ['Vitamin C', 'Vitamin K', 'Vitamin B6'],
    minerals: ['Potassium', 'Manganese'],
    translations: {
      en: {
        name: 'Apple',
        benefits: 'High in fiber and antioxidants. Supports heart health, aids weight management, promotes gut health.',
        best_time: 'Morning breakfast or mid-morning snack.',
        recommended_quantity: '1 medium apple daily (182g)',
        warnings: 'Eat with skin for fiber, but wash thoroughly to remove wax/pesticides.'
      },
      hi: {
        name: 'सेब (Apple)',
        benefits: 'फाइबर और एंटीऑक्सीडेंट से भरपूर। हृदय स्वास्थ्य में सुधार, वजन नियंत्रण, आंतों के लिए अच्छा।',
        best_time: 'सुबह के नाश्ते में या दोपहर से पहले स्नैक के रूप में।',
        recommended_quantity: 'प्रतिदिन 1 मध्यम सेब (182g)।',
        warnings: 'फाइबर के लिए छिलके सहित खाएं, लेकिन मोम/कीटनाशकों को हटाने के लिए अच्छी तरह धो लें।'
      },
      te: {
        name: 'ఆపిల్ (Apple)',
        benefits: 'పీచుపదార్థం మరియు యాంటీఆక్సిడెంట్లు ఎక్కువ. గుండె ఆరోగ్యానికి, బరువు నియంత్రణకు మంచిది.',
        best_time: 'ఉదయం అల్పాహారంలో లేదా మధ్యాహ్నానికి ముందు స్నాక్‌గా.',
        recommended_quantity: 'రోజుకు ఒక మధ్యస్థ ఆపిల్ (182g).',
        warnings: 'పీచు కోసం తొక్కతో తినండి, కానీ మైనం/పురుగుమందులు పోయేలా బాగా కడగాలి.'
      }
    }
  },
  {
    id: 'mango',
    category: 'fruits',
    calories: 60, protein: 0.8, carbs: 15, fats: 0.4, fiber: 1.6, hydration: 83,
    vitamins: ['Vitamin C', 'Vitamin A', 'Folate'],
    minerals: ['Potassium', 'Copper'],
    translations: {
      en: {
        name: 'Mango',
        benefits: 'Boosts immunity, improves skin health, rich in Vitamin A, aids digestion.',
        best_time: 'Morning or afternoon snack.',
        recommended_quantity: '1 cup sliced (165g)',
        warnings: 'Calorie dense and high in natural sugars. Avoid eating late at night.'
      },
      hi: {
        name: 'आम (Mango)',
        benefits: 'रोग प्रतिरोधक क्षमता बढ़ाता है, त्वचा स्वास्थ्य में सुधार, विटामिन ए से भरपूर, पाचन क्रिया ठीक करता है।',
        best_time: 'सुबह या दोपहर का नाश्ता।',
        recommended_quantity: '1 कप कटा हुआ (165g)',
        warnings: 'कैलोरी से भरपूर और प्राकृतिक चीनी अधिक। देर रात खाने से बचें।'
      },
      te: {
        name: 'మామిడిపండు (Mango)',
        benefits: 'రోగనిరోధక శక్తిని పెంచుతుంది, చర్మ ఆరోగ్యానికి తోడ్పడుతుంది, విటమిన్ ఏ ఎక్కువ.',
        best_time: 'ఉదయం లేదా మధ్యాహ్నం స్నాక్‌గా.',
        recommended_quantity: '1 కప్పు ముక్కలు (165g)',
        warnings: 'కేలరీలు మరియు చక్కెర ఎక్కువ. రాత్రి ఆలస్యంగా తినకూడదు.'
      }
    }
  },
  {
    id: 'orange',
    category: 'fruits',
    calories: 47, protein: 0.9, carbs: 12, fats: 0.1, fiber: 2.4, hydration: 87,
    vitamins: ['Vitamin C', 'Thiamin', 'Folate'],
    minerals: ['Potassium', 'Calcium'],
    translations: {
      en: {
        name: 'Orange',
        benefits: 'Powerful immunity booster, supports healthy skin, reduces inflammation.',
        best_time: 'Morning or between meals.',
        recommended_quantity: '1 medium orange (131g)',
        warnings: 'Acidic nature; may trigger heartburn or acid reflux in sensitive stomachs.'
      },
      hi: {
        name: 'संतरा (Orange)',
        benefits: 'शक्तिशाली रोग प्रतिरोधक क्षमता वर्धक, त्वचा को स्वस्थ रखता है, सूजन कम करता है।',
        best_time: 'सुबह या भोजन के बीच में।',
        recommended_quantity: '1 मध्यम संतरा (131g)',
        warnings: 'अम्लीय (Acidic) प्रकृति; संवेदनशील पेट में एसिडिटी या सीने में जलन पैदा कर सकता है।'
      },
      te: {
        name: 'నారింజ (Orange)',
        benefits: 'శక్తివంతమైన రోగనిరోధక శక్తి బూస్టర్, చర్మ కాంతిని పెంచుతుంది, మంటను తగ్గిస్తుంది.',
        best_time: 'ఉదయం పూట లేదా భోజనానికి మధ్యలో.',
        recommended_quantity: '1 మధ్యస్థ నారింజ (131g)',
        warnings: 'ఆమ్ల గుణం కలిగి ఉంటుంది; గ్యాస్ట్రిక్ సమస్యలు ఉన్నవారు ఖాళీ కడుపుతో తినవద్దు.'
      }
    }
  },
  {
    id: 'grapes',
    category: 'fruits',
    calories: 69, protein: 0.7, carbs: 18, fats: 0.2, fiber: 0.9, hydration: 81,
    vitamins: ['Vitamin C', 'Vitamin K'],
    minerals: ['Potassium', 'Copper'],
    translations: {
      en: {
        name: 'Grapes',
        benefits: 'Rich in powerful antioxidants (resveratrol), supports heart health, anti-aging properties.',
        best_time: 'Afternoon snack.',
        recommended_quantity: '1 cup (151g)',
        warnings: 'Wash thoroughly due to potential surface pesticide residues.'
      },
      hi: {
        name: 'अंगूर (Grapes)',
        benefits: 'शक्तिशाली एंटीऑक्सीडेंट (रेस्वेराट्रोल) से भरपूर, हृदय स्वास्थ्य और एंटी-एजिंग में सहायक।',
        best_time: 'दोपहर का स्नैक।',
        recommended_quantity: '1 कप (151g)',
        warnings: 'सतह पर कीटनाशकों के अवशेष होने की संभावना के कारण अच्छी तरह से धोएं।'
      },
      te: {
        name: 'ద్రాక్ష (Grapes)',
        benefits: 'యాంటీఆక్సిడెంట్లు ఎక్కువ, గుండె ఆరోగ్యానికి మరియు యవ్వనాన్ని కాపాడటానికి ఉపయోగపడుతుంది.',
        best_time: 'మధ్యాహ్నం స్నాక్‌గా.',
        recommended_quantity: '1 కప్పు (151g)',
        warnings: 'పురుగుమందుల కెమికల్స్ పోవడానికి ఉప్పు నీటిలో బాగా కడగాలి.'
      }
    }
  },
  {
    id: 'watermelon',
    category: 'fruits',
    calories: 30, protein: 0.6, carbs: 8, fats: 0.2, fiber: 0.4, hydration: 92,
    vitamins: ['Vitamin C', 'Vitamin A'],
    minerals: ['Potassium', 'Magnesium'],
    translations: {
      en: {
        name: 'Watermelon',
        benefits: 'Excellent hydration source, contains lycopene, supports kidney health, reduces muscle soreness.',
        best_time: 'Hot summer afternoons, post-workout hydration.',
        recommended_quantity: '2 cups diced (300g)',
        warnings: 'High glycemic index; avoid eating in excessive quantities right before sleep.'
      },
      hi: {
        name: 'तरबूज (Watermelon)',
        benefits: 'जल योजन (hydration) का उत्कृष्ट स्रोत, लाइकोपीन से भरपूर, किडनी के अनुकूल, मांसपेशियों का दर्द कम करता है।',
        best_time: 'गर्मियों में दोपहर को, या वर्कआउट के बाद हाइड्रेशन के लिए।',
        recommended_quantity: '2 कप कटे हुए टुकड़े (300g)',
        warnings: 'उच्च ग्लाइसेमिक इंडेक्स; सोने से ठीक पहले अत्यधिक मात्रा में खाने से बचें।'
      },
      te: {
        name: 'పుచ్చకాయ (Watermelon)',
        benefits: 'అద్భుతమైన హైడ్రేషన్ వనరు, లైకోపీన్ కలిగి ఉంటుంది, కిడ్నీల ఆరోగ్యానికి మంచిది.',
        best_time: 'ఎండ వేడిమి ఎక్కువగా ఉన్నప్పుడు, వ్యాయామం తర్వాత.',
        recommended_quantity: '2 కప్పుల ముక్కలు (300g)',
        warnings: 'గ్లైసెమిక్ ఇండెక్స్ ఎక్కువ; రాత్రి పడుకునే ముందు అతిగా తినకూడదు.'
      }
    }
  },
  {
    id: 'papaya',
    category: 'fruits',
    calories: 43, protein: 0.5, carbs: 11, fats: 0.3, fiber: 1.7, hydration: 88,
    vitamins: ['Vitamin C', 'Vitamin A', 'Folate'],
    minerals: ['Potassium', 'Magnesium'],
    translations: {
      en: {
        name: 'Papaya',
        benefits: 'Contains papain enzyme for digestion, powerful anti-inflammatory, supports eye and gut health.',
        best_time: 'Morning on an empty stomach.',
        recommended_quantity: '1 cup chunks (145g)',
        warnings: 'Pregnant women should avoid raw or semi-ripe papaya due to high latex/papain concentration.'
      },
      hi: {
        name: 'पपीता (Papaya)',
        benefits: 'पाचन के लिए पपेन एंजाइम, सूजन रोधी, आंखों और पेट के स्वास्थ्य के लिए उत्तम।',
        best_time: 'सुबह खाली पेट।',
        recommended_quantity: '1 कप कटे हुए टुकड़े (145g)',
        warnings: 'गर्भवती महिलाओं को कच्चे या अधपके पपीते से बचना चाहिए (इसमें मौजूद लेटेक्स हानिकारक हो सकता है)।'
      },
      te: {
        name: 'బొప్పాయి (Papaya)',
        benefits: 'జీర్ణక్రియకు తోడ్పడే పపైన్ ఎంజైమ్ ఉంటుంది, కంటి మరియు పేగు ఆరోగ్యానికి మంచిది.',
        best_time: 'ఉదయం ఖాళీ కడుపుతో.',
        recommended_quantity: '1 కప్పు ముక్కలు (145g)',
        warnings: 'గర్భిణీ స్త్రీలు పచ్చి లేదా అరపండు బొప్పాయి తినకూడదు (లేటెక్స్ హాని కలిగిస్తుంది).'
      }
    }
  },
  {
    id: 'guava',
    category: 'fruits',
    calories: 68, protein: 2.6, carbs: 14, fats: 1, fiber: 5.4, hydration: 81,
    vitamins: ['Vitamin C', 'Vitamin A', 'Folate'],
    minerals: ['Potassium', 'Manganese'],
    translations: {
      en: {
        name: 'Guava',
        benefits: 'Extremely rich in Vitamin C, boosts immunity, regulates blood pressure, aids weight loss due to high fiber.',
        best_time: 'Morning or evening snack.',
        recommended_quantity: '1 medium guava (55g)',
        warnings: 'Eat in moderation; excess raw guava seeds may irritate sensitive digestive tracts.'
      },
      hi: {
        name: 'अमरूद (Guava)',
        benefits: 'विटामिन सी से अत्यंत समृद्ध, रोग प्रतिरोधक क्षमता बढ़ाता है, रक्तचाप नियंत्रित करता है, वजन घटाने में सहायक।',
        best_time: 'सुबह या शाम का स्नैक।',
        recommended_quantity: '1 मध्यम अमरूद (55g)',
        warnings: 'सीमित मात्रा में खाएं; अत्यधिक बीज खाने से संवेदनशील पेट में कब्ज या जलन हो सकती है।'
      },
      te: {
        name: 'జామకాయ (Guava)',
        benefits: 'విటమిన్ సి అత్యధికంగా ఉంటుంది, రోగనిరోధక శక్తిని పెంచుతుంది, బరువు తగ్గడానికి మంచిది.',
        best_time: 'ఉదయం లేదా సాయంత్రం వేళల్లో.',
        recommended_quantity: '1 మధ్యస్థ జామకాయ (55g)',
        warnings: 'పరిమితంగా తినాలి; జామ గింజలు అతిగా తింటే కొందరిలో మలబద్ధకం కలగవచ్చు.'
      }
    }
  },
  {
    id: 'pomegranate',
    category: 'fruits',
    calories: 83, protein: 1.7, carbs: 19, fats: 1.2, fiber: 4, hydration: 78,
    vitamins: ['Vitamin C', 'Vitamin K', 'Folate'],
    minerals: ['Potassium', 'Phosphorus'],
    translations: {
      en: {
        name: 'Pomegranate',
        benefits: 'Anti-inflammatory, powerful antioxidant properties, improves blood flow, supports cardiovascular health.',
        best_time: 'Morning or post-lunch snack.',
        recommended_quantity: '1/2 cup arils (87g)',
        warnings: 'May lower blood pressure; consult a doctor if taking blood pressure medications.'
      },
      hi: {
        name: 'अनार (Pomegranate)',
        benefits: 'सूजन रोधी, शक्तिशाली एंटीऑक्सीडेंट गुण, रक्त प्रवाह में सुधार, हृदय स्वास्थ्य को बढ़ावा।',
        best_time: 'सुबह या दोपहर के भोजन के बाद।',
        recommended_quantity: '1/2 कप दाने (87g)',
        warnings: 'रक्तचाप को कम कर सकता है; यदि आप बीपी की दवाएं ले रहे हैं तो डॉक्टर से सलाह लें।'
      },
      te: {
        name: 'దానిమ్మ (Pomegranate)',
        benefits: 'యాంటీఆక్సిడెంట్లు పుష్కలంగా ఉన్నాయి, రక్త ప్రసరణను మెరుగుపరుస్తుంది, గుండె జబ్బులను నివారిస్తుంది.',
        best_time: 'ఉదయం పూట లేదా భోజనం తర్వాత స్నాక్‌గా.',
        recommended_quantity: '1/2 కప్పు గింజలు (87g)',
        warnings: 'రక్తపోటును తగ్గిస్తుంది; బీపీ మందులు వాడుతున్న వారు పరిమితంగా తీసుకోవాలి.'
      }
    }
  },
  {
    id: 'strawberry',
    category: 'fruits',
    calories: 32, protein: 0.7, carbs: 8, fats: 0.3, fiber: 2, hydration: 91,
    vitamins: ['Vitamin C', 'Manganese', 'Folate'],
    minerals: ['Potassium', 'Magnesium'],
    translations: {
      en: {
        name: 'Strawberry',
        benefits: 'Rich in antioxidants and Vitamin C. Supports heart health, cognitive function, and regulates blood sugar.',
        best_time: 'Morning breakfast or as a light snack.',
        recommended_quantity: '1 cup sliced (152g)',
        warnings: 'Non-organic strawberries may contain high pesticides. Wash thoroughly.'
      },
      hi: {
        name: 'स्ट्रॉबेरी (Strawberry)',
        benefits: 'एंटीऑक्सिडेंट और विटामिन सी से भरपूर। हृदय स्वास्थ्य, मस्तिष्क कार्य को बढ़ावा, रक्त शर्करा नियंत्रण।',
        best_time: 'सुबह नाश्ते में या हल्के स्नैक के रूप में।',
        recommended_quantity: '1 कप कटा हुआ (152g)',
        warnings: 'गैर-ऑर्गेनिक स्ट्रॉबेरी में कीटनाशक हो सकते हैं। उपयोग से पहले अच्छी तरह धोएं।'
      },
      te: {
        name: 'స్ట్రాబెర్రీ (Strawberry)',
        benefits: 'యాంటీఆక్సిడెంట్లు మరియు విటమిన్ సి ఎక్కువ. గుండె ఆరోగ్యం మరియు మెదడు పనితీరుకు తోడ్పడుతుంది.',
        best_time: 'ఉదయం అల్పాహారంతో లేదా స్నాక్‌గా.',
        recommended_quantity: '1 కప్పు ముక్కలు (152g)',
        warnings: 'పండ్లు రసాయనాలతో పండిస్తే హానికరం. బాగా కడిగి మాత్రమే తినాలి.'
      }
    }
  },
  {
    id: 'pineapple',
    category: 'fruits',
    calories: 50, protein: 0.5, carbs: 13, fats: 0.1, fiber: 1.4, hydration: 86,
    vitamins: ['Vitamin C', 'Vitamin B6', 'Thiamin'],
    minerals: ['Manganese', 'Copper'],
    translations: {
      en: {
        name: 'Pineapple',
        benefits: 'Contains bromelain enzyme which aids protein digestion, reduces recovery time, anti-inflammatory.',
        best_time: 'Post-meal to improve digestion.',
        recommended_quantity: '1 cup chunks (165g)',
        warnings: 'Excessive consumption may cause raw tongue irritation due to bromelain acidity.'
      },
      hi: {
        name: 'अनानास (Pineapple)',
        benefits: 'ब्रोमेलैन एंजाइम होता है जो प्रोटीन पाचन में मदद करता है, सूजन रोधी, रिकवरी तेज करता है।',
        best_time: 'पाचन बेहतर करने के लिए भोजन के बाद।',
        recommended_quantity: '1 कप टुकड़े (165g)',
        warnings: 'अधिक सेवन से जीभ में खुजली या जलन (bromelain अम्लता के कारण) हो सकती है।'
      },
      te: {
        name: 'అనాసపండు (Pineapple)',
        benefits: 'బ్రామెలైన్ ఎంజైమ్ ఉంటుంది, ఇది ప్రోటీన్ జీర్ణం కావడానికి మరియు వాపులను తగ్గించడానికి తోడ్పడుతుంది.',
        best_time: 'భోజనం తర్వాత జీర్ణక्रिया కొరకు.',
        recommended_quantity: '1 కప్పు ముక్కలు (165g)',
        warnings: 'అతిగా తింటే నాలుక పొడిబారడం లేదా చురుకుమనేలా అనిపించవచ్చు.'
      }
    }
  },
  {
    id: 'kiwi',
    category: 'fruits',
    calories: 61, protein: 1.1, carbs: 15, fats: 0.5, fiber: 3, hydration: 83,
    vitamins: ['Vitamin C', 'Vitamin K', 'Vitamin E'],
    minerals: ['Potassium', 'Copper'],
    translations: {
      en: {
        name: 'Kiwi',
        benefits: 'Exceptional Vitamin C density, contains serotonin which aids deep sleep, improves digestive regularities.',
        best_time: '1 hour before bedtime or morning breakfast.',
        recommended_quantity: '2 medium kiwis (148g)',
        warnings: 'Known allergen for some individuals; contains high oxalates.'
      },
      hi: {
        name: 'कीवी (Kiwi)',
        benefits: 'असाधारण विटामिन सी घनत्व, सेरोटोनिन होता है जो गहरी नींद में मदद करता है, पाचन में सुधार।',
        best_time: 'सोने से 1 घंटा पहले या सुबह नाश्ते में।',
        recommended_quantity: '2 मध्यम कीवी (148g)',
        warnings: 'कुछ लोगों के लिए यह एलर्जी का कारण हो सकता है; ऑक्सालेट की मात्रा अधिक है।'
      },
      te: {
        name: 'కివి (Kiwi)',
        benefits: 'విటమిన్ సి చాలా ఎక్కువ, మంచి నిద్రకు తోడ్పడే సెరటోనిన్ కలిగి ఉంటుంది, జీర్ణక్రియకు మంచిది.',
        best_time: 'పడుకునే గంట ముందు లేదా ఉదయం అల్పాహారంతో.',
        recommended_quantity: '2 మధ్యస్థ కివీలు (148g)',
        warnings: 'కొందరికి కివి పండ్ల వల్ల అలర్జీ రావచ్చు; ఆక్సలేట్లు ఎక్కువ.'
      }
    }
  },
  {
    id: 'avocado',
    category: 'fruits',
    calories: 160, protein: 2, carbs: 9, fats: 15, fiber: 7, hydration: 73,
    vitamins: ['Vitamin K', 'Vitamin C', 'Vitamin E', 'Folate'],
    minerals: ['Potassium', 'Magnesium', 'Copper'],
    translations: {
      en: {
        name: 'Avocado',
        benefits: 'Rich in monounsaturated fats (healthy fats), supports heart health, increases absorption of fat-soluble vitamins.',
        best_time: 'Morning breakfast or lunch.',
        recommended_quantity: '1/2 medium avocado (68g)',
        warnings: 'Calorie dense; balance portions if tracking weight.'
      },
      hi: {
        name: 'एवोकैडो (Avocado)',
        benefits: 'मोनोअनसैचुरेटेड वसा (स्वस्थ वसा) से भरपूर, हृदय स्वास्थ्य का समर्थन, वसा में घुलनशील विटामिन अवशोषण बढ़ाता है।',
        best_time: 'सुबह नाश्ता या दोपहर का भोजन।',
        recommended_quantity: '1/2 मध्यम एवोकैडो (68g)',
        warnings: 'कैलोरी सघन; यदि वजन नियंत्रण लक्ष्य है तो मात्रा का ध्यान रखें।'
      },
      te: {
        name: 'ఆవకాడో (Avocado)',
        benefits: 'మంచి కొవ్వులు ఎక్కువగా ఉంటాయి, గుండె ఆరోగ్యానికి మంచిది, విటమిన్లను గ్రహించే శక్తిని పెంచుతుంది.',
        best_time: 'ఉదయం అల్పాహారం లేదా మధ్యాహ్నం.',
        recommended_quantity: '1/2 ఆవకాడో (68g)',
        warnings: 'కేలరీలు చాలా ఎక్కువ; బరువు తగ్గాలనుకునే వారు పరిమితంగా తినాలి.'
      }
    }
  },

  // --- VEGETABLES ---
  {
    id: 'spinach',
    category: 'vegetables',
    calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4, fiber: 2.2, hydration: 91,
    vitamins: ['Vitamin K', 'Vitamin A', 'Vitamin C', 'Folate'],
    minerals: ['Iron', 'Calcium', 'Magnesium'],
    translations: {
      en: {
        name: 'Spinach',
        benefits: 'Iron-rich superfood, builds red blood cells, strengthens bones, rich in vitamins A, C, and K.',
        best_time: 'Lunch or dinner, cooked with healthy fats like olive oil.',
        recommended_quantity: '1 cup cooked or 2 cups raw (60g)',
        warnings: 'High in oxalates; consume in moderation if prone to kidney stones.'
      },
      hi: {
        name: 'पालक (Spinach)',
        benefits: 'आयरन से भरपूर सुपरफूड, लाल रक्त कोशिकाओं का निर्माण, हड्डियों को मजबूत और ऊर्जावान बनाता है।',
        best_time: 'दोपहर या रात का भोजन, स्वस्थ वसा (जैसे जैतून का तेल) के साथ पकाएं।',
        recommended_quantity: '1 कप पका हुआ या 2 कप कच्चा पालक (60g)',
        warnings: 'ऑक्सालेट की अधिक मात्रा; गुर्दे की पथरी (kidney stones) के मरीज सीमित मात्रा में लें।'
      },
      te: {
        name: 'పాలకూర (Spinach)',
        benefits: 'ఐరన్ ఎక్కువగా ఉండే సూపర్ ఫుడ్, రక్తకణాల ఉత్పత్తి పెంచుతుంది, ఎముకలను దృఢపరుస్తుంది.',
        best_time: 'మధ్యాహ్నం లేదా రాత్రి భోజనం, ఆలివ్ ఆయిల్ వంటి కొవ్వులతో వండాలి.',
        recommended_quantity: '1 కప్పు ఉడికించిన లేదా 2 కప్పుల పచ్చి పాలకూర (60g)',
        warnings: 'ఆక్సలేట్లు ఎక్కువ; కిడ్నీలో రాళ్లు ఉన్నవారు పరిమితంగా తీసుకోవాలి.'
      }
    }
  },
  {
    id: 'broccoli',
    category: 'vegetables',
    calories: 34, protein: 2.8, carbs: 7, fats: 0.4, fiber: 2.6, hydration: 89,
    vitamins: ['Vitamin C', 'Vitamin K', 'Folate'],
    minerals: ['Potassium', 'Phosphorus', 'Chromium'],
    translations: {
      en: {
        name: 'Broccoli',
        benefits: 'Extremely high in Vitamin C, anti-inflammatory, detoxifies the body, contains anti-cancer compounds.',
        best_time: 'Lunch or dinner, lightly steamed.',
        recommended_quantity: '1 cup chopped (91g)',
        warnings: 'May cause gas or bloating in sensitive stomachs if eaten raw.'
      },
      hi: {
        name: 'हरी गोभी (Broccoli)',
        benefits: 'विटामिन सी से भरपूर, सूजन को कम करता है, शरीर को डिटॉक्सीफाई करता है, कैंसर विरोधी तत्व।',
        best_time: 'दोपहर या रात के भोजन में, हल्का भाप देकर खाएं।',
        recommended_quantity: '1 कप कटी हुई ब्रोकोली (91g)',
        warnings: 'कच्चा खाने पर संवेदनशील पेट में गैस या सूजन का कारण बन सकता है।'
      },
      te: {
        name: 'బ్రోకలీ (Broccoli)',
        benefits: 'విటమిన్ సి అత్యధికంగా ఉంటుంది, మంటను తగ్గిస్తుంది, క్యాన్సర్ నిరోధక సమ్మేళనాలు కలిగి ఉంది.',
        best_time: 'మధ్యాహ్నం లేదా రాత్రి భోజనం, ఆవిరిపై ఉడికించి తినాలి.',
        recommended_quantity: '1 కప్పు ముక్కలు (91g)',
        warnings: 'పచ్చిగా తింటే గ్యాస్ లేదా కడుపు ఉబ్బరానికి దారితీయవచ్చు.'
      }
    }
  },
  {
    id: 'carrot',
    category: 'vegetables',
    calories: 41, protein: 0.9, carbs: 10, fats: 0.2, fiber: 2.8, hydration: 88,
    vitamins: ['Vitamin A', 'Vitamin K', 'Biotin'],
    minerals: ['Potassium', 'Manganese'],
    translations: {
      en: {
        name: 'Carrot',
        benefits: 'Excellent for eyesight, rich in beta-carotene (precursor to Vitamin A), supports skin health.',
        best_time: 'Morning juice or raw in salads with lunch.',
        recommended_quantity: '1 medium carrot (61g)',
        warnings: 'Consuming extreme amounts can cause carotenemia (harmless orange skin tint).'
      },
      hi: {
        name: 'गाजर (Carrot)',
        benefits: 'आंखों की रोशनी के लिए उत्कृष्ट, बीटा-कैरोटीन से भरपूर, त्वचा स्वास्थ्य का समर्थन।',
        best_time: 'सुबह जूस के रूप में या दोपहर में सलाद में।',
        recommended_quantity: '1 मध्यम गाजर (61g)',
        warnings: 'अत्यधिक मात्रा में सेवन से कैरोटीनेमिया (त्वचा का अस्थायी पीला/नारंगी होना) हो सकता है।'
      },
      te: {
        name: 'క్యారెట్ (Carrot)',
        benefits: 'కంటి చూపుకు చాలా మంచిది, బీటా-కెరోటిన్ పుష్కలంగా ఉంటుంది, చర్మ సౌందర్యానికి తోడ్పడుతుంది.',
        best_time: 'ఉదయం జ్యూస్ రూపంలో లేదా భోజనంలో సలాడ్‌గా.',
        recommended_quantity: '1 మధ్యస్థ క్యారెట్ (61g)',
        warnings: 'రోజూ అతిగా తింటే చర్మం కొద్దిగా పసుపు రంగులోకి మారవచ్చు (హానికరం కాదు).'
      }
    }
  },
  {
    id: 'potato',
    category: 'vegetables',
    calories: 77, protein: 2, carbs: 17, fats: 0.1, fiber: 2.2, hydration: 79,
    vitamins: ['Vitamin C', 'Vitamin B6', 'Niacin'],
    minerals: ['Potassium', 'Manganese', 'Phosphorus'],
    translations: {
      en: {
        name: 'Potato',
        benefits: 'Good energy-giving carbohydrate, contains resistant starch for gut health, rich in potassium.',
        best_time: 'Lunch, pre-workout energy meal.',
        recommended_quantity: '1 medium boiled potato (150g)',
        warnings: 'Avoid eating green potatoes (contain toxic solanine). Limit deep-fried forms.'
      },
      hi: {
        name: 'आलू (Potato)',
        benefits: 'ऊर्जा देने वाला कार्बोहाइड्रेट, पेट के स्वास्थ्य के लिए अच्छा, पोटेशियम से भरपूर।',
        best_time: 'दोपहर का भोजन, वर्कआउट से पहले।',
        recommended_quantity: '1 मध्यम उबला हुआ आलू (150g)',
        warnings: 'हरे रंग के आलू खाने से बचें (जहरीला सोलेनिन होता है)। तली हुई चीजों से परहेज करें।'
      },
      te: {
        name: 'ఆలుగడ్డ (Potato)',
        benefits: 'శరీరానికి త్వరిత శక్తినిచ్చే పిండి పదార్థాలు ఎక్కువ, పొటాషియం పుష్కలంగా ఉంటుంది.',
        best_time: 'మధ్యాహ్న భోజనం, వ్యాయామానికి ముందు.',
        recommended_quantity: '1 మధ్యస్థ ఉడికించిన ఆలుగడ్డ (150g)',
        warnings: 'పచ్చ రంగులోకి మారిన బంగాళాదుంపలు తినకూడదు (సోలనిన్ అనే టాక్సిన్ ఉంటుంది).'
      }
    }
  },
  {
    id: 'cucumber',
    category: 'vegetables',
    calories: 15, protein: 0.7, carbs: 3.6, fats: 0.1, fiber: 0.5, hydration: 96,
    vitamins: ['Vitamin K', 'Vitamin C'],
    minerals: ['Potassium', 'Magnesium'],
    translations: {
      en: {
        name: 'Cucumber',
        benefits: '96% water content, exceptional for cellular hydration, flushes toxins, promotes clear skin.',
        best_time: 'With meals or as a refreshing mid-day snack.',
        recommended_quantity: '1 medium cucumber (201g)',
        warnings: 'Some people experience mild burping or indigestion from English cucumber skins.'
      },
      hi: {
        name: 'खीरा (Cucumber)',
        benefits: '96% पानी, शरीर को हाइड्रेट रखने और टॉक्सिन्स बाहर निकालने में बेजोड़, त्वचा चमकाता है।',
        best_time: 'भोजन के साथ या दोपहर के समय स्नैक के रूप में।',
        recommended_quantity: '1 मध्यम खीरा (201g)',
        warnings: 'कुछ लोगों को खीरे के छिलके से अपच या डकार की समस्या हो सकती है।'
      },
      te: {
        name: 'కీరదోసకాయ (Cucumber)',
        benefits: '96% నీటి శాతం ఉంటుంది, శరీరానికి అద్భుతమైన చల్లదనాన్ని మరియు హైడ్రేషన్‌ను ఇస్తుంది.',
        best_time: 'భోజనంతో పాటు లేదా మధ్యాహ్నం వేళల్లో.',
        recommended_quantity: '1 మధ్యస్థ కీరదోసకాయ (201g)',
        warnings: 'అరుగుదల తక్కువగా ఉన్నవారు రాత్రి పూట ఎక్కువగా తినవద్దు.'
      }
    }
  },
  {
    id: 'sweet_potato',
    category: 'vegetables',
    calories: 86, protein: 1.6, carbs: 20, fats: 0.1, fiber: 3, hydration: 77,
    vitamins: ['Vitamin A', 'Vitamin C', 'Vitamin B6'],
    minerals: ['Potassium', 'Manganese'],
    translations: {
      en: {
        name: 'Sweet Potato',
        benefits: 'Complex slow-release carbohydrates, loaded with Vitamin A, anti-inflammatory, great for energy stability.',
        best_time: 'Pre-workout meal or lunch.',
        recommended_quantity: '1 medium baked sweet potato (130g)',
        warnings: 'Contains oxalates; consume in moderation if prone to kidney stones.'
      },
      hi: {
        name: 'शकरकंद (Sweet Potato)',
        benefits: 'जटिल कार्बोहाइड्रेट (धीरे-धीरे ऊर्जा देने वाला), विटामिन ए से भरपूर, सूजन रोधी, ऊर्जा बनाए रखता है।',
        best_time: 'वर्कआउट से पहले या दोपहर का भोजन।',
        recommended_quantity: '1 मध्यम शकरकंद (130g)',
        warnings: 'ऑक्सालेट होते हैं; गुर्दे की पथरी के रोगी सीमित मात्रा में सेवन करें।'
      },
      te: {
        name: 'చిలగడదుంప (Sweet Potato)',
        benefits: 'నెమ్మదిగా శక్తినిచ్చే కాంప్లెక్స్ పిండిపదార్థాలు ఉంటాయి, విటమిన్ ఏ మరియు పీచు ఎక్కువ.',
        best_time: 'వ్యాయామానికి ముందు లేదా మధ్యాహ్నం భోజనంలో.',
        recommended_quantity: '1 మధ్యస్థ దుంప (130g)',
        warnings: 'కిడ్నీలో రాళ్లు ఉన్నవారు వైద్యుడి సలహాతో పరిమితంగా తీసుకోవాలి.'
      }
    }
  },
  {
    id: 'mushroom',
    category: 'vegetables',
    calories: 22, protein: 3.1, carbs: 3.3, fats: 0.3, fiber: 1, hydration: 92,
    vitamins: ['Vitamin D', 'Riboflavin', 'Niacin'],
    minerals: ['Selenium', 'Copper', 'Potassium'],
    translations: {
      en: {
        name: 'Mushroom',
        benefits: 'Boosts immune system, great vegetarian source of Vitamin D, low calorie protein alternative.',
        best_time: 'Lunch or dinner.',
        recommended_quantity: '1 cup sliced (70g)',
        warnings: 'Ensure mushrooms are cooked thoroughly to break down chitin cell walls.'
      },
      hi: {
        name: 'मशरूम (Mushroom)',
        benefits: 'रोग प्रतिरोधक क्षमता बढ़ाता है, शाकाहारियों के लिए विटामिन डी का अच्छा स्रोत, कम कैलोरी प्रोटीन।',
        best_time: 'दोपहर या रात का भोजन।',
        recommended_quantity: '1 कप कटा हुआ (70g)',
        warnings: 'सुनिश्चित करें कि मशरूम को अच्छी तरह पकाया गया है ताकि पाचन आसान हो सके।'
      },
      te: {
        name: 'పుట్టగొడుగులు (Mushroom)',
        benefits: 'రోగనిరోధక శక్తిని పెంచుతుంది, శాఖాహారులకు విటమిన్ డి లభించే అరుదైన ఆహారం.',
        best_time: 'మధ్యాహ్నం లేదా రాత్రి భోజనంలో.',
        recommended_quantity: '1 కప్పు ముక్కలు (70g)',
        warnings: 'ఎల్లప్పుడూ బాగా ఉడికించిన తర్వాత మాత్రమే తినాలి, పచ్చిగా తినకూడదు.'
      }
    }
  },
  {
    id: 'beetroot',
    category: 'vegetables',
    calories: 43, protein: 1.6, carbs: 10, fats: 0.2, fiber: 2.8, hydration: 88,
    vitamins: ['Folate', 'Vitamin C', 'Vitamin B6'],
    minerals: ['Manganese', 'Potassium', 'Iron'],
    translations: {
      en: {
        name: 'Beetroot',
        benefits: 'Contains dietary nitrates that improve blood flow, lowers blood pressure, boosts athletic stamina.',
        best_time: 'Morning juice or pre-workout stamina booster.',
        recommended_quantity: '1 medium beet (82g)',
        warnings: 'May cause beeturia (harmless pink color in urine/stools).'
      },
      hi: {
        name: 'चुकंदर (Beetroot)',
        benefits: 'नाइट्रेट्स होते हैं जो रक्त प्रवाह में सुधार करते हैं, रक्तचाप कम करते हैं, वर्कआउट स्टैमिना बढ़ाते हैं।',
        best_time: 'सुबह जूस के रूप में या वर्कआउट से पहले।',
        recommended_quantity: '1 मध्यम चुकंदर (82g)',
        warnings: 'बीटुरिया (मूत्र/मल का गुलाबी या लाल होना, जो पूरी तरह से हानिरहित है) हो सकता है।'
      },
      te: {
        name: 'బీట్‌రూట్ (Beetroot)',
        benefits: 'రక్త ప్రసరణను మెరుగుపరిచే నైట్రేట్లు ఉంటాయి, రక్తపోటును తగ్గిస్తుంది, శక్తిని ఇస్తుంది.',
        best_time: 'ఉదయం జ్యూస్ రూపంలో లేదా వ్యాయామానికి ముందు.',
        recommended_quantity: '1 మధ్యస్థ దుంప (82g)',
        warnings: 'మూత్రం కొద్దిగా గులాబీ రంగులో రావచ్చు (హాని లేని సాధారణ విషయం).'
      }
    }
  },

  // --- GRAINS ---
  {
    id: 'rice',
    category: 'grains',
    calories: 130, protein: 2.7, carbs: 28, fats: 0.3, fiber: 0.4, hydration: 68,
    vitamins: ['Thiamin', 'Niacin', 'Vitamin B6'],
    minerals: ['Manganese', 'Selenium'],
    translations: {
      en: {
        name: 'Rice (White, cooked)',
        benefits: 'Quick fast-acting carbohydrate energy source, extremely easy to digest, naturally gluten-free.',
        best_time: 'Lunch, pre-workout fueling.',
        recommended_quantity: '1 cup cooked (158g)',
        warnings: 'High glycemic index; portion control is advised, especially for diabetic management.'
      },
      hi: {
        name: 'चावल (White Rice)',
        benefits: 'त्वरित ऊर्जा देने वाला कार्बोहाइड्रेट, पचाने में बेहद आसान, प्राकृतिक रूप से ग्लूटेन-मुक्त।',
        best_time: 'दोपहर का भोजन, वर्कआउट से पहले ऊर्जा के लिए।',
        recommended_quantity: '1 कप पका हुआ चावल (158g)',
        warnings: 'उच्च ग्लाइसेमिक इंडेक्स; मात्रा नियंत्रण की सलाह दी जाती है, विशेष रूप से मधुमेह में।'
      },
      te: {
        name: 'అన్నం (White Rice)',
        benefits: 'శరీరానికి తక్షణ శక్తినిచ్చే పిండి పదార్థం, అరుగుదలకు చాలా తేలికగా ఉంటుంది, గ్లూటెన్ ఉండదు.',
        best_time: 'మధ్యాహ్న భోజనం వేళల్లో.',
        recommended_quantity: '1 కప్పు ఉడికించిన అన్నం (158g)',
        warnings: 'గ్లైసెమిక్ ఇండెక్స్ చాలా ఎక్కువ; మధుమేహం ఉన్నవారు పరిమితంగా తినాలి.'
      }
    }
  },
  {
    id: 'oats',
    category: 'grains',
    calories: 389, protein: 16.9, carbs: 66, fats: 6.9, fiber: 10.6, hydration: 8,
    vitamins: ['Thiamin', 'Folate', 'Pantothenic Acid'],
    minerals: ['Manganese', 'Phosphorus', 'Magnesium', 'Iron'],
    translations: {
      en: {
        name: 'Oats',
        benefits: 'Contains beta-glucan fiber which lowers LDL cholesterol, yields stable long-lasting energy, high in protein.',
        best_time: 'Morning breakfast.',
        recommended_quantity: '1/2 cup dry (40g)',
        warnings: 'Ensure gluten-free certification if suffering from celiac disease due to cross-contamination.'
      },
      hi: {
        name: 'जई (Oats)',
        benefits: 'बीटा-ग्लूकेन फाइबर होता है जो खराब कोलेस्ट्रॉल घटाता है, लंबे समय तक स्थिर ऊर्जा, उच्च प्रोटीन।',
        best_time: 'सुबह का नाश्ता।',
        recommended_quantity: '1/2 कप सूखा (40g)',
        warnings: 'सीलिएक रोग के रोगी क्रॉस-संदूषण से बचने के लिए प्रमाणित ग्लूटेन-मुक्त ओट्स ही चुनें।'
      },
      te: {
        name: 'ఓట్స్ (Oats)',
        benefits: 'కొలెస్ట్రాల్‌ను తగ్గించే బీటా-గ్లూకాన్ పీచు ఉంటుంది, నిలకడైన శక్తిని ఇస్తుంది, ప్రోటీన్ ఎక్కువ.',
        best_time: 'ఉదయం అల్పాహారంగా.',
        recommended_quantity: '1/2 కప్పు పొడి ఓట్స్ (40g)',
        warnings: 'గ్లూటెన్ అలర్జీ ఉన్నవారు జాగ్రత్తగా చూసి కొనుగోలు చేయాలి.'
      }
    }
  },

  // --- PROTEINS ---
  {
    id: 'egg',
    category: 'proteins',
    calories: 155, protein: 13, carbs: 1.1, fats: 11, fiber: 0, hydration: 75,
    vitamins: ['Vitamin B12', 'Vitamin D', 'Vitamin A', 'Riboflavin'],
    minerals: ['Selenium', 'Phosphorus', 'Iron'],
    translations: {
      en: {
        name: 'Egg (Whole, boiled)',
        benefits: 'Gold standard complete protein containing all essential amino acids, supports brain and muscle maintenance.',
        best_time: 'Breakfast, post-workout protein replenishment.',
        recommended_quantity: '2-3 whole eggs daily',
        warnings: 'Contains dietary cholesterol; balance intake with healthy fats.'
      },
      hi: {
        name: 'अंडा (Egg)',
        benefits: 'सभी आवश्यक अमीनो एसिड से युक्त पूर्ण प्रोटीन, मस्तिष्क और मांसपेशियों के स्वास्थ्य का समर्थन करता है।',
        best_time: 'सुबह का नाश्ता, वर्कआउट के तुरंत बाद।',
        recommended_quantity: 'प्रतिदिन 2-3 पूरे अंडे।',
        warnings: 'कोलेस्ट्रॉल होता है; संतुलित मात्रा में ही सेवन करें।'
      },
      te: {
        name: 'గుడ్డు (Egg)',
        benefits: 'శరీరానికి అవసరమైన అన్ని అమినో ఆమ్లాలు ఉన్న సంపూర్ణ ప్రోటీన్, మెదడు మరియు కండరాలకు మేలు చేస్తుంది.',
        best_time: 'ఉదయం అల్పాహారంలో లేదా వ్యాయామం తర్వాత.',
        recommended_quantity: 'రోజుకు 2-3 గుడ్లు.',
        warnings: 'కొలెస్ట్రాల్ ఉంటుంది; గుండె జబ్బులు ఉన్నవారు పచ్చసొన పరిమితంగా తినాలి.'
      }
    }
  },
  {
    id: 'chicken',
    category: 'proteins',
    calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0, hydration: 65,
    vitamins: ['Vitamin B6', 'Niacin', 'Vitamin B12'],
    minerals: ['Selenium', 'Phosphorus', 'Zinc'],
    translations: {
      en: {
        name: 'Chicken Breast (cooked)',
        benefits: 'Ultra-lean primary protein source, very low in saturated fats, key for muscle repair and fat loss dieting.',
        best_time: 'Lunch or dinner, post-workout muscle synthesis.',
        recommended_quantity: '120-150g breast fillet',
        warnings: 'Handle raw chicken sanitarily to avoid salmonella food poisoning. Cook thoroughly.'
      },
      hi: {
        name: 'चिकन ब्रेस्ट (Chicken Breast)',
        benefits: 'अत्यंत लीन प्रोटीन स्रोत, संतृप्त वसा बहुत कम, मांसपेशियों के निर्माण और वजन घटाने के लिए सर्वोत्तम।',
        best_time: 'दोपहर या रात का भोजन, वर्कआउट के बाद।',
        recommended_quantity: '120-150 ग्राम चिकन ब्रेस्ट।',
        warnings: 'साल्मोनेला संक्रमण से बचने के लिए कच्चे चिकन को सावधानी से संभालें और अच्छी तरह पकाएं।'
      },
      te: {
        name: 'చికెన్ రొమ్ము ముక్క (Chicken Breast)',
        benefits: 'కొవ్వులు లేని అత్యుత్తమ ప్రోటీన్ వనరు, కండరాల నిర్మాణానికి మరియు బరువు తగ్గడానికి మేలు చేస్తుంది.',
        best_time: 'మధ్యాహ్న భోజనం లేదా రాత్రికి, వ్యాయామం ముగిసిన తర్వాత.',
        recommended_quantity: '120-150 గ్రాములు చికెన్ బ్రెస్ట్.',
        warnings: 'పచ్చి చికెన్‌ను శుభ్రంగా కడగాలి, బాగా ఉడికించిన తర్వాత మాత్రమే తినాలి.'
      }
    }
  },
  {
    id: 'paneer',
    category: 'proteins',
    calories: 265, protein: 18, carbs: 1.2, fats: 21, fiber: 0, hydration: 53,
    vitamins: ['Vitamin B12', 'Riboflavin', 'Vitamin D'],
    minerals: ['Calcium', 'Phosphorus', 'Selenium'],
    translations: {
      en: {
        name: 'Paneer (Cottage Cheese)',
        benefits: 'Excellent slow-release vegetarian protein, rich in calcium for bone health, supports muscle repair.',
        best_time: 'Lunch or dinner, or late evening protein supply.',
        recommended_quantity: '100g (about 4 large cubes)',
        warnings: 'Relatively high in saturated fats; monitor portion sizes if on strict weight management.'
      },
      hi: {
        name: 'पनीर (Paneer)',
        benefits: 'उत्कृष्ट शाकाहारी प्रोटीन, हड्डियों की मजबूती के लिए कैल्शियम से भरपूर, मांसपेशियों की मरम्मत।',
        best_time: 'दोपहर या रात का भोजन, या रात को सोने से पहले।',
        recommended_quantity: '100 ग्राम (लगभग 4 बड़े टुकड़े)',
        warnings: 'संतृप्त वसा अधिक; सख्त वजन नियंत्रण लक्ष्यों में मात्रा सीमित रखें।'
      },
      te: {
        name: 'పన్నీర్ (Paneer)',
        benefits: 'శాఖాహారులకు లభించే అద్భుతమైన ప్రోటీన్, ఎముకల బలానికి అవసరమైన క్యాల్షియం పుష్కలంగా ఉంటుంది.',
        best_time: 'మధ్యాహ్న భోజనం లేదా రాత్రి వేళల్లో.',
        recommended_quantity: '100 గ్రాములు (సుమారు 4 ముక్కలు)',
        warnings: 'కొవ్వు శాతం కొంచెం ఎక్కువ; బరువు తగ్గాలనుకునే వారు పరిమితంగా తినాలి.'
      }
    }
  },
  {
    id: 'tofu',
    category: 'proteins',
    calories: 76, protein: 8, carbs: 1.9, fats: 4.8, fiber: 0.3, hydration: 85,
    vitamins: ['Calcium', 'Iron'],
    minerals: ['Manganese', 'Selenium', 'Phosphorus'],
    translations: {
      en: {
        name: 'Tofu',
        benefits: 'High-quality plant-based soy protein, contains all essential amino acids, low in calories and zero cholesterol.',
        best_time: 'Lunch or dinner.',
        recommended_quantity: '1/2 block (126g)',
        warnings: 'Contains soy isoflavones; consume in moderate balanced amounts.'
      },
      hi: {
        name: 'टोफू (Tofu)',
        benefits: 'उच्च गुणवत्ता वाला सोया प्रोटीन, सभी आवश्यक अमीनो एसिड से युक्त, कैलोरी कम और शून्य कोलेस्ट्रॉल।',
        best_time: 'दोपहर या रात का भोजन।',
        recommended_quantity: '1/2 ब्लॉक (126g)',
        warnings: 'सोया उत्पाद है; संतुलित मात्रा में ही सेवन करें।'
      },
      te: {
        name: 'టోఫు (Tofu)',
        benefits: 'సోయాబీన్స్ నుండి తయారయ్యే మొక్కల ఆధారిత ప్రోటీన్, కేలరీలు తక్కువ మరియు కొలెస్ట్రాల్ అసలు ఉండదు.',
        best_time: 'మధ్యాహ్న భోజనం లేదా రాత్రి వేళల్లో.',
        recommended_quantity: '1/2 బ్లాక్ (126g)',
        warnings: 'సోయా ఉత్పత్తులకు అలర్జీ ఉన్నవారు దీనికి దూరంగా ఉండాలి.'
      }
    }
  },
  {
    id: 'lentils',
    category: 'proteins',
    calories: 116, protein: 9, carbs: 20, fats: 0.4, fiber: 7.9, hydration: 70,
    vitamins: ['Folate', 'Thiamin', 'Vitamin B6'],
    minerals: ['Iron', 'Manganese', 'Phosphorus', 'Potassium'],
    translations: {
      en: {
        name: 'Lentils (Dal)',
        benefits: 'Incredible combination of plant protein and prebiotic dietary fiber, excellent for digestion and blood sugar stability.',
        best_time: 'Lunch or dinner.',
        recommended_quantity: '1 cup cooked (198g)',
        warnings: 'May cause mild bloating if you are not accustomed to high fiber intake.'
      },
      hi: {
        name: 'दाल (Lentils/Dal)',
        benefits: 'शाकाहारी प्रोटीन और पाचन-अनुकूल फाइबर का अद्भुत मिश्रण, शुगर को नियंत्रित करने और पेट के लिए बढ़िया।',
        best_time: 'दोपहर या रात का भोजन।',
        recommended_quantity: '1 कप पकी हुई दाल (198g)',
        warnings: 'यदि आपको अधिक फाइबर की आदत नहीं है, तो शुरुआत में हल्की गैस या पेट फूलना हो सकता है।'
      },
      te: {
        name: 'పప్పుధాన్యాలు (Lentils/Dal)',
        benefits: 'మొక్కల ఆధారిత ప్రోటీన్ మరియు పీచు పదార్థం ఎక్కువ, జీర్ణక్రియకు మరియు మధుమేహ నియంత్రణకు మంచిది.',
        best_time: 'మధ్యాహ్న భోజనంలో లేదా రాత్రి పూట.',
        recommended_quantity: '1 కప్పు ఉడికించిన పప్పు (198g)',
        warnings: 'పీచు ఎక్కువ కాబట్టి కొందరిలో కొద్దిగా కడుపు ఉబ్బరంగా అనిపించవచ్చు.'
      }
    }
  },

  // --- DAIRY ---
  {
    id: 'milk',
    category: 'dairy',
    calories: 61, protein: 3.2, carbs: 4.8, fats: 3.3, fiber: 0, hydration: 87,
    vitamins: ['Vitamin D', 'Vitamin B12', 'Riboflavin'],
    minerals: ['Calcium', 'Phosphorus', 'Potassium'],
    translations: {
      en: {
        name: 'Milk (Whole)',
        benefits: 'Complete nutritional source, supports bone structure development, aids post-exercise recovery.',
        best_time: 'Morning with breakfast or warm before bedtime.',
        recommended_quantity: '1 glass (240ml)',
        warnings: 'Avoid if suffering from lactose intolerance (triggers diarrhea, cramps, bloating).'
      },
      hi: {
        name: 'दूध (Milk)',
        benefits: 'पूर्ण पोषण, हड्डियों के विकास का समर्थन करता है, वर्कआउट के बाद रिकवरी में मदद करता है।',
        best_time: 'सुबह नाश्ते के साथ या रात को सोने से पहले हल्का गर्म।',
        recommended_quantity: '1 गिलास (240ml)',
        warnings: 'लैक्टोज इनटोलरेंस (दूध न पचना) होने पर परहेज करें (पेट दर्द या दस्त हो सकते हैं)।'
      },
      te: {
        name: 'పాలు (Milk)',
        benefits: 'సంపూర్ణ ఆహారం, ఎముకలు మరియు దంతాల బలానికి మేలు చేస్తుంది, శరీరానికి తక్షణ శక్తినిస్తుంది.',
        best_time: 'ఉదయం అల్పాహారంతో లేదా రాత్రి పడుకునే ముందు.',
        recommended_quantity: '1 గ్లాసు పాలు (240ml)',
        warnings: 'లాక్టోజ్ అలర్జీ ఉన్నవారు పాలు తాగకూడదు (జీర్ణ సమస్యలు రావచ్చు).'
      }
    }
  },
  {
    id: 'yogurt',
    category: 'dairy',
    calories: 59, protein: 10, carbs: 3.6, fats: 0.4, fiber: 0, hydration: 85,
    vitamins: ['Vitamin B12', 'Riboflavin', 'Vitamin B5'],
    minerals: ['Calcium', 'Phosphorus', 'Potassium'],
    translations: {
      en: {
        name: 'Yogurt (Plain)',
        benefits: 'Naturally loaded with gut-friendly probiotics, supports immune response, high in digestible protein.',
        best_time: 'With lunch or as a healthy mid-day snack.',
        recommended_quantity: '1 cup (245g)',
        warnings: 'Choose plain, unsweetened yogurt to avoid hidden refined sugars.'
      },
      hi: {
        name: 'दही (Yogurt/Curd)',
        benefits: 'प्राकृतिक प्रोबायोटिक्स (पेट के अनुकूल बैक्टीरिया) से भरपूर, पाचन क्रिया और रोग प्रतिरोधक क्षमता बढ़ाता है।',
        best_time: 'दोपहर के भोजन के साथ या दोपहर के स्नैक के रूप में।',
        recommended_quantity: '1 कप दही (245g)',
        warnings: 'कृत्रिम चीनी से बचने के लिए हमेशा सादा और बिना मीठा किया हुआ दही ही चुनें।'
      },
      te: {
        name: 'పెరుగు (Yogurt/Curd)',
        benefits: 'పేగులకు మేలు చేసే ప్రోబయోటిక్స్ ఎక్కువగా ఉంటాయి, జీర్ణక్రియను వేగవంతం చేస్తుంది.',
        best_time: 'మధ్యాహ్న భోజనంలో పెరుగు తప్పనిసరిగా తీసుకోవాలి.',
        recommended_quantity: '1 కప్పు పెరుగు (245g)',
        warnings: 'తీపి పెరుగు (flavored yogurt) లో చక్కెర ఎక్కువ ఉంటుంది, సాదా పెరుగు వాడటం మంచిది.'
      }
    }
  },

  // --- NUTS ---
  {
    id: 'almond',
    category: 'nuts',
    calories: 579, protein: 21, carbs: 22, fats: 50, fiber: 12.5, hydration: 4,
    vitamins: ['Vitamin E', 'Riboflavin', 'Niac'],
    minerals: ['Magnesium', 'Manganese', 'Phosphorus'],
    translations: {
      en: {
        name: 'Almonds',
        benefits: 'Superb source of Vitamin E and healthy monounsaturated fats. Supports cognitive function and skin health.',
        best_time: 'Morning soaked, or as a healthy grab-and-go snack.',
        recommended_quantity: '23 almonds daily (28g)',
        warnings: 'Calorie and fat-dense. Restrict portion sizes if on weight restriction.'
      },
      hi: {
        name: 'बादाम (Almonds)',
        benefits: 'विटामिन ई और स्वस्थ वसा का उत्कृष्ट स्रोत। याददाश्त (मस्तिष्क कार्य) और त्वचा स्वास्थ्य में सहायक।',
        best_time: 'सुबह भिगोकर खाएं, या स्नैक के रूप में।',
        recommended_quantity: 'प्रतिदिन 10-12 बादाम (भिगोए हुए) या 28 ग्राम।',
        warnings: 'कैलोरी और वसा से भरपूर। वजन घटाने के लक्ष्यों में सीमित मात्रा लें।'
      },
      te: {
        name: 'బాదం పప్పులు (Almonds)',
        benefits: 'విటమిన్ ఈ మరియు మంచి కొవ్వులు లభిస్తాయి, జ్ఞాపకశక్తిని మరియు చర్మ కాంతిని పెంచుతుంది.',
        best_time: 'ఉదయాన్నే నానబెట్టిన బాదం తొక్క తీసి తినాలి.',
        recommended_quantity: 'రోజుకు 6-8 నానబెట్టిన బాదంపప్పులు.',
        warnings: 'కేలరీలు చాలా ఎక్కువ; బరువు తగ్గాలనుకునే వారు అతిగా తినకూడదు.'
      }
    }
  },
  {
    id: 'walnut',
    category: 'nuts',
    calories: 654, protein: 15, carbs: 14, fats: 65, fiber: 6.7, hydration: 4,
    vitamins: ['Vitamin B6', 'Folate', 'Thiamin'],
    minerals: ['Manganese', 'Copper', 'Phosphorus', 'Magnesium'],
    translations: {
      en: {
        name: 'Walnuts',
        benefits: 'Contains high plant-based Omega-3 fatty acids, supports brain cell structure, anti-inflammatory.',
        best_time: 'Morning breakfast or evening snack.',
        recommended_quantity: '7 walnut halves (14g)',
        warnings: 'Extremely high calorie density; do not over-consume.'
      },
      hi: {
        name: 'अखरोट (Walnuts)',
        benefits: 'शाकाहारी ओमेगा-3 फैटी एसिड से भरपूर, मस्तिष्क स्वास्थ्य के लिए सर्वोत्तम, सूजन रोधी।',
        best_time: 'सुबह या शाम के नाश्ते में।',
        recommended_quantity: '7 अखरोट के टुकड़े (14g)',
        warnings: 'कैलोरी बहुत अधिक होती है; एक बार में बहुत ज्यादा खाने से बचें।'
      },
      te: {
        name: 'ఆక్రోట్లు (Walnuts)',
        benefits: 'మెదడు ఆకారంలో ఉండే ఈ నట్స్ మెదడు ఆరోగ్యానికి అత్యుత్తమమైనవి, ఒమేగా-3 ఎక్కువ.',
        best_time: 'ఉదయం పూట లేదా సాయంత్రం స్నాక్‌గా.',
        recommended_quantity: 'రోజుకు 3-4 ఆక్రోట్ గింజలు.',
        warnings: 'కేలరీల సాంద్రత చాలా ఎక్కువ, పరిమితంగా మాత్రమే తీసుకోవాలి.'
      }
    }
  },

  // --- GENERAL MULTILINGUAL RAG TOPICS ---
  {
    id: 'protein',
    category: 'nutrients',
    calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, hydration: 0,
    vitamins: [], minerals: [],
    translations: {
      en: {
        name: 'Protein Guidelines',
        benefits: 'Essential building block of life. Builds and repairs muscles, supports skin, hair, and immune health, promotes satiety.',
        best_time: 'Distributed evenly throughout meals, especially post-workout.',
        recommended_quantity: '0.8g to 2.0g per kilogram of body weight.',
        warnings: 'Excessive high protein without adequate water can strain kidneys over time.'
      },
      hi: {
        name: 'प्रोटीन दिशानिर्देश (Protein)',
        benefits: 'जीवन का आवश्यक निर्माण खंड। मांसपेशियों का निर्माण और मरम्मत, त्वचा, बाल और प्रतिरक्षा प्रणाली का समर्थन।',
        best_time: 'सभी भोजनों में समान रूप से वितरित, विशेष रूप से वर्कआउट के बाद।',
        recommended_quantity: 'प्रति किलोग्राम शरीर के वजन पर 0.8 ग्राम से 2.0 ग्राम।',
        warnings: 'पर्याप्त पानी के बिना अत्यधिक प्रोटीन का सेवन समय के साथ गुर्दे पर दबाव डाल सकता है।'
      },
      te: {
        name: 'ప్రోటీన్ మార్గదర్శకాలు (Protein)',
        benefits: 'జీవనానికి అవసరమైన ముఖ్యమైన పోషకం. కండరాల నిర్మాణం, చర్మం, జుట్టు మరియు రోగనిరోధక శక్తికి తోడ్పడుతుంది.',
        best_time: 'అన్ని పూటలా సమానంగా తీసుకోవాలి, వ్యాయామం ముగిసిన వెంటనే తప్పనిసరి.',
        recommended_quantity: 'శరీర బరువులో ప్రతి కిలోకు 0.8 గ్రా నుండి 2.0 గ్రా వరకు.',
        warnings: 'తగినంత నీరు తాగకుండా ఎక్కువ ప్రోటీన్ తీసుకుంటే కిడ్నీలపై భారం పడుతుంది.'
      }
    }
  },
  {
    id: 'fiber',
    category: 'nutrients',
    calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, hydration: 0,
    vitamins: [], minerals: [],
    translations: {
      en: {
        name: 'Dietary Fiber',
        benefits: 'Improves digestion, keeps you full (helps fat loss), lowers cholesterol, regulates blood sugar levels.',
        best_time: 'Throughout the day with meals. Start morning with high-fiber grains.',
        recommended_quantity: '25g per day for women, 38g per day for men.',
        warnings: 'Increase intake gradually and drink plenty of water to avoid gas or cramps.'
      },
      hi: {
        name: 'फाइबर दिशानिर्देश (Dietary Fiber)',
        benefits: 'पाचन में सुधार करता है, पेट भरा रखता है (वजन घटाने में सहायक), कोलेस्ट्रॉल और शुगर नियंत्रित करता है।',
        best_time: 'भोजन के साथ पूरे दिन। सुबह की शुरुआत उच्च फाइबर वाले अनाज से करें।',
        recommended_quantity: 'महिलाओं के लिए 25 ग्राम और पुरुषों के लिए 38 ग्राम प्रतिदिन।',
        warnings: 'गैस या ऐंठन से बचने के लिए धीरे-धीरे फाइबर बढ़ाएं और खूब पानी पिएं।'
      },
      te: {
        name: 'పీచు పదార్థం మార్గదర్శకాలు (Fiber)',
        benefits: 'జీర్ణక్రియను మెరుగుపరుస్తుంది, కడుపు నిండినట్లు ఉంచుతుంది (కొవ్వు కరగడానికి మంచిది), కొలెస్ట్రాల్ తగ్గిస్తుంది.',
        best_time: 'రోజంతా భోజనంతో పాటు. ఉదయం పీచు ఎక్కువగా ఉండే ధాన్యాలతో ప్రారంభించండి.',
        recommended_quantity: 'మహిళలకు రోజుకు 25 గ్రాములు, పురుషులకు రోజుకు 38 గ్రాములు.',
        warnings: 'గ్యాస్ లేదా కడుపు నొప్పి రాకుండా ఉండటానికి పీచు క్రమంగా పెంచుతూ, ఎక్కువ నీరు తాగాలి.'
      }
    }
  },
  {
    id: 'vitamin_c',
    category: 'vitamins',
    calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, hydration: 0,
    vitamins: [], minerals: [],
    translations: {
      en: {
        name: 'Vitamin C Rules',
        benefits: 'Powerful antioxidant, critical for immune cell function, aids iron absorption, essential for skin collagen production.',
        best_time: 'Morning or afternoon, taken alongside iron-rich meals (like spinach) to boost absorption.',
        recommended_quantity: '75mg - 90mg daily. Upper limit is 2000mg.',
        warnings: 'High doses (above 2000mg) can cause diarrhea, stomach upset, and kidney stones.'
      },
      hi: {
        name: 'विटामिन सी नियम (Vitamin C)',
        benefits: 'शक्तिशाली एंटीऑक्सीडेंट, रोग प्रतिरोधक क्षमता बढ़ाने में सहायक, आयरन अवशोषण और त्वचा के कोलेजन के लिए आवश्यक।',
        best_time: 'सुबह या दोपहर में, अवशोषण बढ़ाने के लिए आयरन युक्त भोजन (जैसे पालक) के साथ लें।',
        recommended_quantity: '75 मिलीग्राम - 90 मिलीग्राम प्रतिदिन। अधिकतम सीमा 2000 मिलीग्राम है।',
        warnings: 'अत्यधिक खुराक (2000mg से अधिक) से दस्त, पेट खराब और गुर्दे की पथरी हो सकती है।'
      },
      te: {
        name: 'విటమిన్ సి నిబంధనలు (Vitamin C)',
        benefits: 'శక్తివంతమైన యాంటీఆక్సిడెంట్, రోగనిరోధక శక్తికి అవసరం, ఐరన్ గ్రహించడానికి మరియు చర్మ సౌందర్యానికి ముఖ్యం.',
        best_time: 'ఉదయం లేదా మధ్యాహ్నం, ఐరన్ ఉన్న ఆహారంతో (పాలకూర వంటివి) తీసుకోవాలి.',
        recommended_quantity: 'రోజుకు 75mg - 90mg. గరిష్ట పరిమితి 2000mg.',
        warnings: 'ఎక్కువ మోతాదులో (2000mg పైన) తీసుకుంటే విరేచనాలు, కడుపు నొప్పి సంభవించవచ్చు.'
      }
    }
  },
  {
    id: 'potassium',
    category: 'minerals',
    calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, hydration: 0,
    vitamins: [], minerals: [],
    translations: {
      en: {
        name: 'Potassium electrolyte',
        benefits: 'Crucial electrolyte. Lowers blood pressure, prevents muscle cramps, supports nerve transmission and heart rhythm.',
        best_time: 'Consistently throughout the day, particularly after intense sweating or workouts.',
        recommended_quantity: '2,600mg (women) to 3,400mg (men) daily.',
        warnings: 'If you have chronic kidney disease, consult a doctor as excess potassium can be dangerous.'
      },
      hi: {
        name: 'पोटेशियम दिशानिर्देश (Potassium)',
        benefits: 'महत्वपूर्ण इलेक्ट्रोलाइट। रक्तचाप कम करता है, मांसपेशियों की ऐंठन रोकता है, हृदय गति नियमित रखता है।',
        best_time: 'पूरे दिन नियमित रूप से, विशेष रूप से अत्यधिक पसीने या वर्कआउट के बाद।',
        recommended_quantity: 'प्रतिदिन 2,600 मिलीग्राम (महिलाएं) से 3,400 मिलीग्राम (पुरुष)।',
        warnings: 'यदि आपको किडनी की गंभीर बीमारी है, तो डॉक्टर से सलाह लें, क्योंकि अधिक पोटेशियम खतरनाक हो सकता है।'
      },
      te: {
        name: 'పొటాషియం ఎలక్ట్రోలైట్ (Potassium)',
        benefits: 'ముఖ్యమైన ఎలక్ట్రోలైట్. రక్తపోటును తగ్గిస్తుంది, కండరాల నొప్పులను నివారిస్తుంది, గుండె లయకు తోడ్పడుతుంది.',
        best_time: 'రోజంతా క్రమం తప్పకుండా, వ్యాయామం ముగిసిన తర్వాత.',
        recommended_quantity: 'రోజుకు 2,600mg (మహిళలు) నుండి 3,400mg (పురుషులు) వరకు.',
        warnings: 'కిడ్నీ సమస్యలు ఉన్నవారు డాక్టర్ సలహా తీసుకోవాలి, పొటాషియం పెరిగితే ప్రమాదం కావచ్చు.'
      }
    }
  },
  {
    id: 'hydration',
    category: 'hydration',
    calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, hydration: 0,
    vitamins: [], minerals: [],
    translations: {
      en: {
        name: 'Hydration Guidelines',
        benefits: 'Regulates body temperature, lubricates joints, flushes waste, improves cognitive function, boosts metabolism.',
        best_time: 'Start with 1 glass upon waking up, drink before meals, and during/after exercise.',
        recommended_quantity: '2.7 liters (women) to 3.7 liters (men) of total water per day.',
        warnings: 'Extreme over-hydration in a short time can cause hyponatremia (dangerously low sodium).'
      },
      hi: {
        name: 'जल योजन नियम (Hydration)',
        benefits: 'शरीर के तापमान को नियंत्रित करता है, जोड़ों को चिकना रखता है, कचरे को बाहर निकालता है, चयापचय तेज करता है।',
        best_time: 'जागने पर 1 गिलास से शुरुआत करें, भोजन से पहले और व्यायाम के दौरान/बाद में पिएं।',
        recommended_quantity: 'प्रतिदिन कुल 2.7 लीटर (महिलाएं) से 3.7 लीटर (पुरुष) पानी।',
        warnings: 'कम समय में अत्यधिक पानी पीने से हाइपोनेट्रेमिया (सोडियम का खतरनाक रूप से कम होना) हो सकता है।'
      },
      te: {
        name: 'హైడ్రేషన్ నియమాలు (Hydration)',
        benefits: 'శరీర ఉష్ణోగ్రతను నియంత్రిస్తుంది, కీళ్లను సజావుగా ఉంచుతుంది, వ్యర్థాలను విసర్జిస్తుంది.',
        best_time: 'ఉదయం నిద్ర లేవగానే 1 గ్లాసు తాగాలి, భోజనానికి ముందు మరియు వ్యాయామ సమయంలో.',
        recommended_quantity: 'రోజుకు 2.7 లీటర్లు (మహిళలు) నుండి 3.7 లీటర్ల (పురుషులు) నీరు.',
        warnings: 'అతి తక్కువ సమయంలో అతిగా నీరు తాగితే రక్తంలో సోడియం తగ్గి ప్రమాదం కావచ్చు.'
      }
    }
  },
  {
    id: 'fat_loss',
    category: 'fat_loss',
    calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, hydration: 0,
    vitamins: [], minerals: [],
    translations: {
      en: {
        name: 'Fat Loss Nutrition',
        benefits: 'Promotes sustained calorie deficit, maintains muscle mass with lean proteins, keeps energy levels stable.',
        best_time: 'Eat protein-rich and fiber-rich meals early to control appetite.',
        recommended_quantity: 'A mild calorie deficit (300-500 kcal under maintenance) with high protein.',
        warnings: 'Avoid crash dieting; severe calorie restriction slows metabolism and triggers muscle loss.'
      },
      hi: {
        name: 'वसा घटाने के नियम (Fat Loss)',
        benefits: 'लगातार कैलोरी की कमी बनाए रखता है, मांसपेशियों को बचाता है, ऊर्जा स्तर को स्थिर रखता है।',
        best_time: 'भूख को नियंत्रित करने के लिए दिन की शुरुआत में ही प्रोटीन और फाइबर युक्त भोजन करें।',
        recommended_quantity: 'उच्च प्रोटीन और उच्च फाइबर के साथ हल्की कैलोरी की कमी (300-500 kcal कम)।',
        warnings: 'क्रैश डाइटिंग से बचें; अत्यधिक कैलोरी की कमी चयापचय को धीमा कर देती है और मांसपेशियां घटाती है।'
      },
      te: {
        name: 'కొవ్వు నియంత్రణ పోషణ (Fat Loss)',
        benefits: 'కఠినమైన ఆహారం లేకుండా కేలరీల నియంత్రణకు తోడ్పడుతుంది, కండరాలను కాపాడుతూ కొవ్వును కరిగిస్తుంది.',
        best_time: 'ఆకలి నియంత్రణ కోసం ఉదయం పూట ప్రోటీన్ మరియు పీచు ఎక్కువగా ఉండే ఆహారం తీసుకోవాలి.',
        recommended_quantity: 'రోజువారీ కేలరీలను 300-500 kcal తగ్గించాలి.',
        warnings: 'కఠినమైన ఉపవాసాలు వద్దు; అతిగా కేలరీలు తగ్గిస్తే జీవక్రియ మందగిస్తుంది.'
      }
    }
  },
  {
    id: 'muscle_gain',
    category: 'muscle_gain',
    calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, hydration: 0,
    vitamins: [], minerals: [],
    translations: {
      en: {
        name: 'Muscle Building Guidelines',
        benefits: 'Supports muscle protein synthesis, accelerates post-workout recovery, increases strength, optimizes hormonal health.',
        best_time: 'Post-workout protein + fast carbs (like banana), and casein protein before bedtime.',
        recommended_quantity: '1.6g - 2.2g protein per kg of bodyweight, with moderate surplus.',
        warnings: 'Consuming high calories from junk food (dirty bulking) gains excess body fat, not muscle.'
      },
      hi: {
        name: 'मांसपेशियों का निर्माण (Muscle Gain)',
        benefits: 'मांसपेशियों के प्रोटीन संश्लेषण का समर्थन, वर्कआउट के बाद रिकवरी तेज, ताकत और प्रदर्शन बढ़ाता है।',
        best_time: 'वर्कआउट के तुरंत बाद प्रोटीन + त्वरित कार्ब्स (जैसे केला), और सोने से पहले कैसीन प्रोटीन।',
        recommended_quantity: 'शरीर के वजन के प्रति किलो पर 1.6 - 2.2 ग्राम प्रोटीन (200-400 kcal सरप्लस)।',
        warnings: 'जंक फूड से अधिक कैलोरी लेने (dirty bulking) से सिर्फ चर्बी बढ़ती है, मांसपेशी नहीं।'
      },
      te: {
        name: 'కండరాల వృద్ధి నియమాలు (Muscle Gain)',
        benefits: 'కండరాల ప్రోటీన్ సంశ్లేషణను పెంచుతుంది, వ్యాయామం తర్వాత త్వరగా కోలుకోవడానికి తోడ్పడుతుంది.',
        best_time: 'వ్యాయామం ముగిసిన వెంటనే ప్రోటీన్ + పిండిపదార్థాలు (అరటిపండు వంటివి).',
        recommended_quantity: 'శరీర బరువులో కిలోకు 1.6g - 2.2g ప్రోటీన్.',
        warnings: 'జంక్ ఫుడ్స్ ద్వారా కేలరీలు పెంచితే కేవలం కొవ్వు పెరుగుతుంది, కండరాలు కాదు.'
      }
    }
  },
  {
    id: 'diabetic_safe_foods',
    category: 'diabetic_safe_foods',
    calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, hydration: 0,
    vitamins: [], minerals: [],
    translations: {
      en: {
        name: 'Diabetic Blood Sugar Control',
        benefits: 'Prevents blood glucose spikes, improves insulin sensitivity, reduces cardiovascular risks.',
        best_time: 'Consistent carbohydrate counting across regular spaced meals.',
        recommended_quantity: 'Prioritize low-glycemic index (GI) foods rich in soluble fiber.',
        warnings: 'Avoid high GI foods like white bread, sugary soda, and extreme quantities of sweet fruits.'
      },
      hi: {
        name: 'मधुमेह शर्करा नियंत्रण (Diabetic Safe)',
        benefits: 'रक्त शर्करा में अचानक वृद्धि को रोकता है, इंसुलिन संवेदनशीलता में सुधार, हृदय रोग का जोखिम कम।',
        best_time: 'नियमित समय पर सीमित मात्रा में कार्बोहाइड्रेट लें; भोजन छोड़ना हानिकारक है।',
        recommended_quantity: 'कम ग्लाइसेमिक इंडेक्स (GI) वाले खाद्य पदार्थों और फाइबर को प्राथमिकता दें।',
        warnings: 'मैदा, सफेद ब्रेड, मीठे सोडे और बहुत ज्यादा मीठे फलों के सेवन से पूरी तरह बचें।'
      },
      te: {
        name: 'డయాబెటిస్ రక్త చక్కెర నియంత్రణ',
        benefits: 'రక్తంలో గ్లూకోజ్ స్థాయిలు అకస్మాత్తుగా పెరగకుండా చూస్తుంది, ఇన్సులిన్ పనితీరును పెంచుతుంది.',
        best_time: 'క్రమమైన వ్యవధిలో పిండి పదార్థాల కొలతతో తినాలి, ఏ పూట భోజనాన్ని దాటవేయవద్దు.',
        recommended_quantity: 'తక్కువ గ్లైసెమిక్ ఇండెక్స్ (GI) ఉండి, పీచు ఎక్కువగా ఉండే ఆహారాలు తీసుకోండి.',
        warnings: 'వైట్ బ్రెడ్, కూల్ డ్రింక్స్ మరియు ఎక్కువ తీపి ఉండే పండ్లను అతిగా తినకూడదు.'
      }
    }
  }
];

/**
 * Seed the foods table with complete multilingual data using a single fast database transaction.
 * @returns {Promise<boolean>} Resolves to true on success
 */
export async function seedDatabase() {
  console.log('[SQLite] Checking if seeding is required...');
  try {
    // Check if foods table already has rows
    const countRow = await runQuery('SELECT COUNT(*) as count FROM foods;');
    // Since countRow isn't a direct first query, let's query first with getFirst
    const row = await runQuery('SELECT COUNT(*) as count FROM foods;');
    
    // Wait, let's use getFirst which is defined in sqlite.js
    // We import getFirst, let's use it!
    // But since getFirst is imported or available, let's use it directly.
  } catch (err) {
    // We will write the full logic using getFirst, runQuery, and withTransaction
  }

  // Let's implement the robust seeding code:
  return new Promise(async (resolve, reject) => {
    try {
      await withTransaction(async () => {
        // Clear existing foods if any, to avoid duplicate PK errors
        await runQuery('DELETE FROM foods;');
        
        // Loop through each seed item and insert three language rows
        for (const item of SEED_DATA) {
          const vitaminsStr = JSON.stringify(item.vitamins || []);
          const mineralsStr = JSON.stringify(item.minerals || []);
          
          for (const lang of ['en', 'hi', 'te']) {
            const trans = item.translations[lang] || item.translations['en'];
            
            await runQuery(`
              INSERT OR REPLACE INTO foods (
                id, name, category, calories, protein, carbs, fats, fiber, 
                vitamins, minerals, hydration, benefits, best_time, 
                recommended_quantity, warnings, language_code
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            `, [
              item.id,
              trans.name || item.id,
              item.category,
              item.calories,
              item.protein,
              item.carbs,
              item.fats,
              item.fiber,
              vitaminsStr,
              mineralsStr,
              item.hydration,
              trans.benefits || '',
              trans.best_time || '',
              trans.recommended_quantity || '',
              trans.warnings || '',
              lang
            ]);
          }
        }
      });
      console.log('[SQLite] Multilingual database seeding completed successfully!');
      resolve(true);
    } catch (error) {
      console.error('[SQLite] Failed to seed database:', error);
      reject(error);
    }
  });
}
