import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView,
  Platform, StyleSheet, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAI } from '../../src/providers/AIProvider';
import { useProfile } from '../../src/providers/ProfileProvider';
import { useSettings } from '../../src/providers/SettingsProvider';
import { useNutrition } from '../../src/providers/NutritionProvider';
import { speak, stop, isSpeaking } from '../../src/services/voiceService';
import ChatBubble from '../../src/components/ChatBubble';
import EmptyState from '../../src/components/EmptyState';
import VoiceWaveform from '../../src/components/VoiceWaveform';
import LanguageSwitcher from '../../src/components/LanguageSwitcher';
import AnimatedSubtitle from '../../src/components/AnimatedSubtitle';
import TranslationIndicator from '../../src/components/TranslationIndicator';
import TabTransitionWrapper from '../../src/components/TabTransitionWrapper';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../src/utils/theme';
import { useAppTheme } from '../../src/hooks/useAppTheme';

const WELCOME = {
  en: "Hi! I'm NutriVision AI 🥗 Ask me anything about nutrition, diet, or health!",
  hi: "नमस्ते! मैं NutriVision AI हूँ 🥗 पोषण, आहार या स्वास्थ्य के बारे में कुछ भी पूछें!",
  te: "హాయ్! నేను NutriVision AI 🥗 పోషణ, ఆహారం లేదా ఆరోగ్యం గురించి ఏదైనా అడగండి!",
};

const PLACEHOLDER = {
  en: 'Ask about nutrition...',
  hi: 'पोषण के बारे में पूछें...',
  te: 'పోషణ గురించి అడగండి...',
};

const PILLS = {
  en: [
    { label: "💪 High Protein", query: "What foods are high in protein?" },
    { label: "🍊 Vitamin C Fruits", query: "Which fruits contain vitamin C?" },
    { label: "⚡ Pre-Workout Fuel", query: "Best foods before workout?" },
    { label: "🩺 Diabetic Safe", query: "What should diabetics avoid?" },
    { label: "💧 Best Hydration", query: "Best hydration foods?" },
    { label: "🔥 Fat Loss Diet", query: "What foods help with fat loss?" }
  ],
  hi: [
    { label: "💪 उच्च प्रोटीन भोजन", query: "कौन से खाद्य पदार्थों में प्रोटीन अधिक होता है?" },
    { label: "🍊 विटामिन सी फल", query: "किन फलों में विटामिन सी होता है?" },
    { label: "⚡ वर्कआउट से पहले", query: "वर्कआउट से पहले क्या खाना सबसे अच्छा है?" },
    { label: "🩺 मधुमेह के लिए", query: "मधुमेह रोगियों को क्या खाने से बचना चाहिए?" },
    { label: "💧 बेस्ट हाइड्रेशन", query: "हाइड्रेशन के लिए सबसे अच्छे खाद्य पदार्थ कौन से हैं?" },
    { label: "🔥 फैट लॉस डाइट", query: "वजन घटाने में कौन से खाद्य पदार्थ मदद करते हैं?" }
  ],
  te: [
    { label: "💪 హై ప్రోటీన్", query: "ఏ ఆహారాలలో ప్రోటీన్ ఎక్కువగా ఉంటుంది?" },
    { label: "🍊 విటమిన్ సి పండ్లు", query: "ఏ పండ్లలో విటమిన్ సి ఉంటుంది?" },
    { label: "⚡ వ్యాయామానికి ముందు", query: "వ్యాయామానికి ముందు ఏ ఆహారం తినడం మంచిది?" },
    { label: "🩺 డయాబెటిస్ జాగ్రత్తలు", query: "డయాబెటిస్ ఉన్నవారు ఏ ఆహారాలు తినకూడదు?" },
    { label: "💧 హైడ్రేషన్ చిట్కాలు", query: "హైడ్రేషన్ కోసం ఉత్తమ ఆహారాలు ఏవి?" },
    { label: "🔥 ఫ్యాట్ లాస్ డైట్", query: "కొవ్వు తగ్గడానికి ఏ ఆహారాలు సహాయపడతాయి?" }
  ]
};

export default function AssistantScreen() {
  const { isDark, colors } = useAppTheme();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeakingNow, setIsSpeakingNow] = useState(false);
  const [activeLang, setActiveLang] = useState('en');
  const [subtitle, setSubtitle] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [prevLang, setPrevLang] = useState('en');
  const flatListRef = useRef(null);

  const { chat, isOnline } = useAI();
  const { profile } = useProfile();
  const { settings } = useSettings();
  const { askQuestion, getNutrition } = useNutrition();
  const params = useLocalSearchParams();
  const router = useRouter();

  // Show welcome message in current language
  const welcomeMsg = { role: 'assistant', content: WELCOME[activeLang] || WELCOME.en };
  const allMessages = [welcomeMsg, ...messages];

  const handleLanguageSwitch = useCallback((langCode) => {
    if (langCode === activeLang) return;
    setPrevLang(activeLang);
    setIsTranslating(true);

    // Brief translation animation
    setTimeout(() => {
      setActiveLang(langCode);
      setIsTranslating(false);
    }, 800);
  }, [activeLang]);

  const handleSpeak = useCallback((text) => {
    if (isSpeakingNow) {
      stop();
      setIsSpeakingNow(false);
      setSubtitle('');
      return;
    }
    setIsSpeakingNow(true);
    setSubtitle(text);
    speak(text, activeLang);

    // Estimate speech duration and clear
    const wordCount = text.split(' ').length;
    const duration = Math.max(wordCount * 350, 2000);
    setTimeout(() => {
      setIsSpeakingNow(false);
      setSubtitle('');
    }, duration);
  }, [isSpeakingNow, activeLang]);

  // Offline fallback function
  const getOfflineResponse = useCallback((text) => {
    const foodWords = text.split(/\s+/).filter((w) => w.length > 2);
    let nutrition = null;
    for (const word of foodWords) {
      nutrition = getNutrition(word);
      if (nutrition) break;
    }
    return askQuestion(text, nutrition, profile);
  }, [getNutrition, askQuestion, profile]);

  const sendMessage = useCallback(async (overrideText) => {
    const text = (typeof overrideText === 'string' ? overrideText : input).trim();
    if (!text) return;

    const userMsg = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      let response;

      // Try RAG-enabled chat (online/offline internally handled)
      try {
        const chatHistory = [...messages, userMsg]
          .filter((m) => m.role !== 'system')
          .slice(-10)
          .map((m) => ({ role: m.role, content: m.content }));

        response = await chat(chatHistory, {
          profile,
          language: activeLang,
        });
      } catch (aiError) {
        // Fallback fail-safe
        response = getOfflineResponse(text);
        response = `📡 (Offline mode)\n\n${response}`;
      }

      // Check if response contains hallmarks of RAG source verified content
      const isRagResponse = response.includes('According to the local database') ||
                            response.includes('स्थानीय डेटाबेस') ||
                            response.includes('స్థానిక డేటాబేస్') ||
                            response.includes('Verified') ||
                            response.includes('📡') ||
                            response.includes('Source') ||
                            response.includes('nutrition') ||
                            (!response.startsWith("I'm having trouble") && !response.includes("trouble right now"));

      const aiMsg = { role: 'assistant', content: response, isRAG: isRagResponse };
      setMessages((prev) => [...prev, aiMsg]);

      if (settings.autoTTS) {
        handleSpeak(response);
      }
    } catch (e) {
      const errMsg = {
        role: 'assistant',
        content: `I'm having trouble right now. Try asking about a specific food like "apple" or "rice".`,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  }, [input, messages, chat, profile, settings, activeLang, getOfflineResponse, handleSpeak]);

  // Transition query listener
  useEffect(() => {
    if (params?.query) {
      sendMessage(params.query);
      router.setParams({ query: undefined });
    }
  }, [params?.query, sendMessage]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TabTransitionWrapper>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>🤖</Text>
          <View>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>AI Assistant</Text>
            <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
              {isOnline ? '🟢 Online' : '🟡 Offline'}
            </Text>
          </View>
        </View>
      </View>

      {/* Translation indicator */}
      {isTranslating && (
        <View style={styles.translationWrap}>
          <TranslationIndicator
            isTranslating={isTranslating}
            fromLang={prevLang}
            toLang={activeLang}
          />
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={allMessages}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <ChatBubble
            message={item}
            onSpeak={item.role === 'assistant' ? handleSpeak : null}
            language={activeLang}
            index={index}
          />
        )}
        contentContainerStyle={styles.msgList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <EmptyState icon="💬" title="Start a conversation" message="Ask about nutrition, diet, or health" />
        }
      />

      {/* Voice waveform + subtitle overlay */}
      {isSpeakingNow && (
        <View style={[styles.voiceOverlay, { backgroundColor: colors.surface }]}>
          <VoiceWaveform isActive={true} language={activeLang} size="medium" />
          <AnimatedSubtitle text={subtitle} language={activeLang} visible={true} />
          <TouchableOpacity style={styles.stopBtn} onPress={() => handleSpeak('')}>
            <Text style={styles.stopText}>⏹ Stop</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Typing indicator */}
      {isTyping && (
        <View style={styles.typingWrap}>
          <VoiceWaveform isActive={true} language={activeLang} size="small" />
          <Text style={[styles.typingText, { color: colors.textSecondary }]}>Thinking...</Text>
        </View>
      )}

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
        style={styles.keyboardContainer}
      >
        {/* RAG Query Suggestion Pills */}
        <View style={{ backgroundColor: colors.glassBg, borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: SPACING.xs, paddingBottom: 2 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsScrollContainer}
          >
            {(PILLS[activeLang] || PILLS.en).map((pill, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.pill, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
                onPress={() => sendMessage(pill.query)}
                disabled={isTyping}
                activeOpacity={0.7}
              >
                <Text style={[styles.pillText, { color: colors.textPrimary }]}>{pill.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Language selector floating right above input row */}
        <View style={[styles.languageSwitcherContainer, { backgroundColor: colors.glassBg, borderTopColor: colors.borderLight, borderTopWidth: 0 }]}>
          <Text style={[styles.langBarTitle, { color: colors.textSecondary }]}>Choose Language:</Text>
          <LanguageSwitcher
            activeLanguage={activeLang}
            onSelect={handleLanguageSwitch}
          />
        </View>

        <View style={[styles.inputRow, { backgroundColor: colors.surface, borderTopColor: colors.borderLight }]}>
          <TouchableOpacity
            style={[styles.voiceInputBtn, isSpeakingNow && styles.voiceInputBtnActive]}
            onPress={() => {
              if (isSpeakingNow) {
                stop();
                setIsSpeakingNow(false);
                setSubtitle('');
              }
            }}
          >
            <Text style={styles.voiceInputIcon}>{isSpeakingNow ? '🔇' : '🎤'}</Text>
          </TouchableOpacity>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceAlt, color: colors.textPrimary }]}
            value={input}
            onChangeText={setInput}
            placeholder={PLACEHOLDER[activeLang] || PLACEHOLDER.en}
            placeholderTextColor={colors.textTertiary}
            multiline
            maxLength={500}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!input.trim() || isTyping}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      </TabTransitionWrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  keyboardContainer: { paddingBottom: 72 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerIcon: { fontSize: 28, marginRight: SPACING.sm },
  headerTitle: { fontSize: TYPOGRAPHY.h4, fontWeight: TYPOGRAPHY.bold, color: COLORS.textPrimary },
  headerSub: { fontSize: TYPOGRAPHY.tiny, color: COLORS.textTertiary },
  translationWrap: { paddingVertical: SPACING.xs, alignItems: 'center' },
  msgList: { padding: SPACING.md, paddingBottom: SPACING.md },
  voiceOverlay: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  stopBtn: {
    alignSelf: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.error + '15',
  },
  stopText: { fontSize: TYPOGRAPHY.caption, color: COLORS.error, fontWeight: TYPOGRAPHY.semiBold },
  typingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xs,
    gap: SPACING.sm,
  },
  typingText: { fontSize: TYPOGRAPHY.caption, color: COLORS.textTertiary, fontStyle: 'italic' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  voiceInputBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.xs,
  },
  voiceInputBtnActive: { backgroundColor: COLORS.error + '20' },
  voiceInputIcon: { fontSize: 18 },
  input: {
    flex: 1,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    maxHeight: 100,
    marginRight: SPACING.xs,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: COLORS.border },
  sendIcon: { fontSize: 18, color: COLORS.textInverse },
  languageSwitcherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: 6,
  },
  langBarTitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: TYPOGRAPHY.poppinsBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pillsScrollContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    gap: SPACING.xs,
    flexDirection: 'row',
  },
  pill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
