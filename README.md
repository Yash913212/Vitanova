# 🥗 VitaNova AI

**AI-Powered Nutrition Assistant** — Scan food with your camera, get instant nutrition insights, and receive personalized diet guidance powered by AI.

![React Native](https://img.shields.io/badge/React_Native-0.81.5-blue?logo=react)
![Expo](https://img.shields.io/badge/Expo_SDK-54-000020?logo=expo)
![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS%20%7C%20Web-green)
![License](https://img.shields.io/badge/License-Private-red)

---

## ✨ Features

### 📷 Smart Food Scanner
- **Camera & Gallery** — Take a photo or pick from gallery
- **AI Vision Recognition** — OpenRouter vision models identify food items instantly
- **Auto-Crop & Analyze** — Cropping triggers analysis automatically (no extra button)
- **Object Description** — Non-food items get a detailed AI description instead of "unknown"

### ✍️ Describe a Food
- Type any food name on the home screen to get instant nutrition data
- Works **fully offline** — no internet required
- Shows calories, macros, vitamins, benefits, and personalized recommendations

### 🤖 Multilingual AI Assistant
- Conversational AI chatbot for nutrition, diet, and health questions
- **3 languages supported**: English 🇬🇧, Hindi 🇮🇳, Telugu 🇮🇳
- Animated language switcher with spring transitions
- Voice waveform visualization during speech
- Word-by-word animated subtitle reveal
- Translation indicator animation when switching languages
- **Offline fallback** — rule-based answers when API is unavailable

### 🥗 Personalized Diet Plans
- Goal-based meal plans: Fat Loss, Muscle Gain, Weight Gain, Balanced
- Timed meal schedules with food suggestions
- Searchable food explorer with category filters (Fruit, Vegetable, Grain, Protein, Dairy, Nut)
- Macro breakdown pills (Protein, Carbs, Fats, Fiber)

### 📋 Scan History
- All scans saved with timestamps, images, and nutrition snapshots
- Persistent storage via AsyncStorage

### ⚙️ Settings & Profile
- Fitness goal, diet preference, allergy configuration
- Auto TTS toggle, language selection
- Profile-driven AI recommendations

### 🔊 Voice Interaction
- Text-to-Speech using Expo Speech
- Multilingual TTS (English, Hindi, Telugu)
- Auto-speak scan results (configurable)
- Voice waveform animations during playback

### 📡 Offline-First Architecture
- 42-item local nutrition database with full macro/vitamin data
- Rule-based guidance engine for offline diet advice
- Manual food lookup when AI is unavailable
- Automatic online/offline detection with graceful fallback

---

### 🔬 RAG Nutrition Intelligence (Retrieval-Augmented Generation)
- **Memory-Resident Vector Store** — Custom TF-IDF similarity database indexes key health entries on startup in milliseconds.
- **Dual Matching Search Fallback** — Combines direct keyword exact matches with vector space cosine similarities to capture user intent.
- **Multilingual Tokenizer Engine** — Full tokenization support including English, Hindi (`\u0900-\u097F`), and Telugu (`\u0C00-\u0C7F`) Unicode character sets.
- **Target-Tuned Prompt Orchestration** — Dynamically injects physical attributes, user fitness targets (e.g. calories for `fat_loss`, post-workout protein for `muscle_gain`), and strict dietary preference boundaries (e.g. `vegan` egg-free or `vegetarian` meat-free compliance).
- **RAG-Powered Detail Widgets** — Renders verified `🛡️ Verified Source` bubble badges, caution health banners, comprehensive verified insights, and scrollable related foods carousels.

---

## 🏗️ Architecture

```
VitaNova/
├── app/                          # Expo Router (file-based routing)
│   ├── _layout.jsx               # Root layout with providers
│   ├── nutrition-details.jsx     # Nutrition detail screen
│   ├── profile.jsx               # User profile screen
│   └── (tabs)/                   # Bottom tab navigation
│       ├── _layout.jsx           # Tab config (icons only, no labels)
│       ├── index.jsx             # 📷 Scan — Camera, Gallery, Food Search
│       ├── diet.jsx              # 🥗 Diet — Meal plans & food explorer
│       ├── assistant.jsx         # 🤖 Assistant — Multilingual AI chat
│       ├── history.jsx           # 📋 History — Scan log
│       └── settings.jsx          # ⚙️ Settings — Preferences
│
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── AnimatedSubtitle.jsx  # Word-by-word subtitle reveal
│   │   ├── ChatBubble.jsx        # Animated chat bubble with 🛡️ RAG badges
│   │   ├── EmptyState.jsx        # Empty list placeholder
│   │   ├── HistoryCard.jsx       # Scan history entry card
│   │   ├── ImagePreview.jsx      # Image preview with remove button
│   │   ├── LanguageSwitcher.jsx  # EN/HI/TE animated pill selector
│   │   ├── LoadingOverlay.jsx    # Full-screen loading spinner
│   │   ├── NutritionCard.jsx     # Macro & vitamin display card
│   │   ├── ObjectDescriptionCard.jsx  # Non-food item description
│   │   ├── ScanResultCard.jsx    # AI scan result display
│   │   ├── SettingRow.jsx        # Settings toggle/picker row
│   │   ├── TranslationIndicator.jsx   # Spinning translation animation
│   │   ├── VoiceButton.jsx       # TTS trigger button
│   │   └── VoiceWaveform.jsx     # Animated audio bars
│   │
│   ├── providers/                # 6 React Context providers
│   │   ├── AIProvider.jsx        # AI state + RAG routing + online/offline detection
│   │   ├── HistoryProvider.jsx   # Scan history (AsyncStorage)
│   │   ├── KnowledgeProvider.jsx # RAG active scanned food memory (Context)
│   │   ├── NutritionProvider.jsx # Food lookup + guidance
│   │   ├── ProfileProvider.jsx   # User profile (AsyncStorage)
│   │   └── SettingsProvider.jsx  # App preferences (AsyncStorage)
│   │
│   ├── services/                 # Service modules
│   │   ├── rag/                  # 🔬 Local RAG System Suite
│   │   │   ├── embeddings.js     # Multilingual Tokenizer & Similarity math
│   │   │   ├── knowledgeBase.js  # Local localized nutrition datasets (EN, HI, TE)
│   │   │   ├── promptBuilder.js  # Goal-Based Prompt Adaptations
│   │   │   ├── ragService.js     # Hybrid online/offline orchestrator
│   │   │   ├── retriever.js      # Dual Keyword & Semantic search algorithm
│   │   │   └── vectorStore.js    # Memory-Resident TF-IDF vector index
│   │   ├── aiService.js          # OpenRouter API (vision + chat)
│   │   ├── guidanceService.js    # Rule-based diet guidance engine
│   │   ├── nutritionService.js   # Fuzzy food name matching
│   │   ├── storageService.js     # AsyncStorage wrapper
│   │   └── voiceService.js       # Expo Speech TTS adapter
│   │
│   ├── hooks/
│   │   └── useNetworkStatus.js   # NetInfo connectivity hook
│   │
│   ├── data/
│   │   └── nutritionDB.js        # 42 foods with full nutrition data
│   │
│   └── utils/
│       ├── config.js             # API key & model configuration
│       ├── constants.js          # App-wide constants
│       ├── helpers.js            # Image base64, formatting utils
│       └── theme.js              # Colors, typography, spacing tokens
│
├── app.json                      # Expo configuration
├── babel.config.js               # Babel preset (babel-preset-expo)
├── index.js                      # Entry point (expo-router/entry)
├── package.json                  # Dependencies
└── .env                          # API key (not committed)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Expo CLI** — installed globally or via `npx`
- **Expo Go** app on your phone (for quick testing)
- **OpenRouter API Key** — [Get one here](https://openrouter.ai/keys)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/Vitanova.git
cd Vitanova

# 2. Install dependencies
npm install

# 3. Add your API key
echo "EXPO_PUBLIC_OPENROUTER_API_KEY=your_key_here" > .env

# 4. Start the development server
npx expo start
```

### Running on Device

| Method | Command |
|--------|---------|
| Expo Go (scan QR) | `npx expo start` |
| Android emulator | `npx expo start --android` |
| iOS simulator | `npx expo start --ios` |
| Web browser | `npx expo start --web` |

> **Note:** Camera features require a physical device or development build.

---

## 🔑 Environment Variables

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

The `EXPO_PUBLIC_` prefix is required by Expo SDK 49+ to expose variables to client-side code.

---

## 🤖 AI Models Used

| Purpose | Model | Provider |
|---------|-------|----------|
| Food Recognition (Vision) | `google/gemini-2.0-flash-001` | OpenRouter |
| Chat Assistant | `google/gemini-2.0-flash-001` | OpenRouter |

Configured in `src/utils/config.js`. Models can be swapped to any OpenRouter-supported model.

---

## 📊 Nutrition Database

The app includes a **local database of 42 food items** across 6 categories:

| Category | Items | Examples |
|----------|-------|---------|
| 🍎 Fruits | 13 | Apple, Banana, Mango, Orange, Watermelon, Avocado |
| 🥬 Vegetables | 12 | Spinach, Broccoli, Carrot, Potato, Beetroot, Mushroom |
| 🌾 Grains | 4 | Rice, Wheat, Oats, Corn |
| 🥩 Proteins | 7 | Chicken, Egg, Fish, Paneer, Tofu, Lentils, Chickpeas |
| 🥛 Dairy | 2 | Milk, Yogurt |
| 🥜 Nuts | 2 | Almonds, Walnuts |

Each entry includes: calories, protein, carbs, fats, fiber, vitamins, minerals, benefits, best time to eat, recommended quantity, and hydration percentage.

---

## 🌐 Multilingual Support

| Language | Code | AI Chat | TTS | UI Labels |
|----------|------|---------|-----|-----------|
| English | `en` | ✅ | ✅ | ✅ |
| Hindi | `hi` | ✅ | ✅ | ✅ |
| Telugu | `te` | ✅ | ✅ | ✅ |

---

## 📦 Dependencies

### Core
| Package | Version | Purpose |
|---------|---------|---------|
| `react` | 19.1.0 | UI library |
| `react-native` | 0.81.5 | Mobile framework |
| `expo` | ~54.0.33 | Development platform |
| `expo-router` | ~6.0.23 | File-based routing |

### Native Modules
| Package | Purpose |
|---------|---------|
| `expo-camera` | Camera access for food scanning |
| `expo-image-picker` | Gallery access + image cropping |
| `expo-speech` | Text-to-Speech (multilingual) |
| `expo-constants` | App configuration access |
| `expo-linking` | Deep linking support |
| `expo-dev-client` | Development build support |

### Data & State
| Package | Purpose |
|---------|---------|
| `@react-native-async-storage/async-storage` | Persistent local storage |
| `@react-native-community/netinfo` | Network connectivity detection |

### Navigation & UI
| Package | Purpose |
|---------|---------|
| `react-native-safe-area-context` | Safe area insets |
| `react-native-screens` | Native screen optimization |
| `react-native-gesture-handler` | Touch gesture handling |

---

## 📱 App Screens

| Tab | Icon | Screen | Description |
|-----|------|--------|-------------|
| 1 | 📷 | **Scan** | Camera/Gallery capture, AI analysis, food search by name |
| 2 | 🥗 | **Diet** | Goal-based meal plans, food explorer with filters |
| 3 | 🤖 | **Assistant** | Multilingual AI chatbot with voice & animations |
| 4 | 📋 | **History** | Chronological scan log |
| 5 | ⚙️ | **Settings** | Profile, preferences, language, TTS toggle |

---

## 🔒 Security

- API keys are stored in `.env` and **never committed** to version control
- `.env` is included in `.gitignore`
- No server-side storage — all user data stays on-device via AsyncStorage
- OpenRouter API calls use HTTPS with proper headers

---

## 🛠️ Development

```bash
# Start with cache cleared
npx expo start --clear

# Run on specific platform
npx expo start --android
npx expo start --ios
npx expo start --web
```

### Project Stats
- **Language**: JavaScript / JSX (no TypeScript)
- **Total Files**: ~40 source files
- **Components**: 14 reusable components
- **Providers**: 5 context providers
- **Services**: 5 service modules

---

## 📄 License

Private project. All rights reserved.

---

<p align="center">
  Built with ❤️ using React Native, Expo, and OpenRouter AI
</p>
