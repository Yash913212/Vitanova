/**
 * VitaNova AI — Premium Nutrition Assistant
 * A highly restricted, intelligent, and beautiful conversational partner.
 * strictly restricted to food, diet, nutrition, and wellness.
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView,
  Platform, StyleSheet, ScrollView, Animated, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAI } from '../../src/providers/AIProvider';
import { useProfile } from '../../src/providers/ProfileProvider';
import { useSettings } from '../../src/providers/SettingsProvider';
import { useNutrition } from '../../src/providers/NutritionProvider';
import { speak, stop } from '../../src/services/voiceService';
import { checkTopicGuard } from '../../src/services/topicGuard';
import ChatBubble from '../../src/components/ChatBubble';
import EmptyState from '../../src/components/EmptyState';
import VoiceWaveform from '../../src/components/VoiceWaveform';
import LanguageSwitcher from '../../src/components/LanguageSwitcher';
import AnimatedSubtitle from '../../src/components/AnimatedSubtitle';
import TranslationIndicator from '../../src/components/TranslationIndicator';
import TabTransitionWrapper from '../../src/components/TabTransitionWrapper';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../src/utils/theme';
import { useAppTheme } from '../../src/hooks/useAppTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const WELCOME = {
  en: "Hello! I'm VitaNova AI, your supportive personal nutrition coach 🥗 Ask me anything about healthy eating, meal plans, or macro advice! Let's hit your wellness goals together.",
  hi: "नमस्ते! मैं VitaNova AI हूँ, आपका व्यक्तिगत पोषण कोच 🥗 स्वस्थ खान-पान, भोजन योजना या पोषण तथ्यों के बारे में कुछ भी पूछें!",
  te: "హాయ్! నేను VitaNova AI, మీ పోషణ కోచ్ 🥗 ఆరోగ్యకరమైన ఆహారాలు, భోజన ప్రణాళిక లేదా పోషకాహారాల గురించి నన్ను ఏదైనా అడగండి!",
};

const PLACEHOLDER = {
  en: 'Ask about food, diet, or nutrition...',
  hi: 'भोजन या पोषण के बारे में पूछें...',
  te: 'ఆహారం లేదా పోషణ గురించి అడగండి...',
};

const SUGGESTED_CHIPS = {
  en: [
    { label: "🥚 High Protein", query: "Which foods have high protein?" },
    { label: "🍌 Pre-Workout Fuel", query: "Best foods to eat before a workout?" },
    { label: "🥗 Fat Loss Plan", query: "Healthy meal plan for weight loss" },
    { label: "🍎 Daily Banana?", query: "Can I eat a banana daily?" },
    { label: "💧 Hydration Goal", query: "How much water should I drink?" },
  ],
  hi: [
    { label: "🥚 उच्च प्रोटीन भोजन", query: "किन खाद्य पदार्थों में प्रोटीन सबसे ज्यादा होता है?" },
    { label: "🍌 वर्कआउट ईंधन", query: "कसरत से पहले क्या खाना सबसे अच्छा है?" },
    { label: "🥗 वजन घटाना", query: "वजन कम करने के लिए डाइट प्लान बताएं" },
    { label: "🍎 रोजाना फल", query: "क्या मैं रोज सेब खा सकता हूँ?" },
  ],
  te: [
    { label: "🥚 హై ప్రోటీన్", query: "ఏ ఆహారంలో ఎక్కువ ప్రోటీన్ ఉంటుంది?" },
    { label: "🍌 వ్యాయామానికి ముందు", query: "వర్కౌట్ ముందు ఏ ఆహారం తీసుకోవాలి?" },
    { label: "🥗 కొవ్వు నియంత్రణ", query: "బరువు తగ్గడానికి ఏ రకమైన ఆహారం తినాలి?" },
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

  // Welcome banner message setup
  const welcomeMsg = { role: 'assistant', content: WELCOME[activeLang] || WELCOME.en };
  const allMessages = [welcomeMsg, ...messages];

  const handleLanguageSwitch = useCallback((langCode) => {
    if (langCode === activeLang) return;
    setPrevLang(activeLang);
    setIsTranslating(true);

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

    const wordCount = text.split(' ').length;
    const duration = Math.max(wordCount * 360, 2000);
    setTimeout(() => {
      setIsSpeakingNow(false);
      setSubtitle('');
    }, duration);
  }, [isSpeakingNow, activeLang]);

  // Fallback offline handler
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

    // Add user message to display
    const userMsg = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // ==========================================
    // CLIENT-SIDE TOPIC GUARD (STRICT SAFETY)
    // ==========================================
    const guard = checkTopicGuard(text, activeLang);
    if (!guard.allowed) {
      setTimeout(() => {
        const refusalMsg = {
          role: 'assistant',
          content: guard.refusalMessage,
          isBlocked: true,
        };
        setMessages((prev) => [...prev, refusalMsg]);
        setIsTyping(false);
      }, 700); // Small delay to simulate AI thinking
      return;
    }

    try {
      let response;

      // Online route (OpenRouter)
      if (isOnline) {
        try {
          const chatHistory = [...messages, userMsg]
            .filter((m) => m.role !== 'system')
            .slice(-10)
            .map((m) => ({ role: m.role, content: m.content }));

          response = await chat(chatHistory, {
            profile,
            language: activeLang,
          });
        } catch (apiError) {
          console.warn('[Assistant] Online chat failed, falling back offline:', apiError.message);
          response = getOfflineResponse(text);
          response = `📡 **[Offline Mode — Local Database]**\n\n${response}`;
        }
      } else {
        // Offline route
        response = getOfflineResponse(text);
        response = `📡 **[Offline Mode — Local Database]**\n\n${response}`;
      }

      // Check if response contains typical database content to flag as RAG
      const isRagResponse = response.includes('According to the local database') ||
                            response.includes('स्थानीय डेटाबेस') ||
                            response.includes('Verified') ||
                            response.includes('📡') ||
                            response.includes('per 100g');

      const aiMsg = { role: 'assistant', content: response, isRAG: isRagResponse };
      setMessages((prev) => [...prev, aiMsg]);

      if (settings.autoTTS) {
        handleSpeak(response);
      }
    } catch (e) {
      const errMsg = {
        role: 'assistant',
        content: `I couldn't complete the request. Let's focus on healthy eating: ask me about foods like apple, spinach, or general diet planning!`,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  }, [input, messages, chat, profile, settings, activeLang, getOfflineResponse, handleSpeak, isOnline]);

  // Handle queries passed from details screen or navigation search
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
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
          <View style={styles.headerLeft}>
            <View style={[styles.botIconWrap, { backgroundColor: colors.primary + '12' }]}>
              <Text style={styles.headerIcon}>🌱</Text>
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>VitaNova AI</Text>
              <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
                {isOnline ? '🟢 Connected Coach' : '📡 Offline Database'}
              </Text>
            </View>
          </View>
          <View style={[styles.badge, { backgroundColor: isOnline ? '#10B98115' : '#F59E0B15' }]}>
            <Text style={[styles.badgeText, { color: isOnline ? '#10B981' : '#F59E0B' }]}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </Text>
          </View>
        </View>

        {/* Translation Indicator */}
        {isTranslating && (
          <View style={styles.translationWrap}>
            <TranslationIndicator
              isTranslating={isTranslating}
              fromLang={prevLang}
              toLang={activeLang}
            />
          </View>
        )}

        {/* Conversation List */}
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
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <EmptyState icon="💬" title="Start your coaching session" message="Ask about healthy recipes, calorie counts, or protein amounts" />
          }
        />

        {/* Voice Playback Overlay */}
        {isSpeakingNow && (
          <View style={[styles.voiceOverlay, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <VoiceWaveform isActive={true} language={activeLang} size="medium" />
            <AnimatedSubtitle text={subtitle} language={activeLang} visible={true} />
            <TouchableOpacity style={styles.stopBtn} onPress={() => handleSpeak('')}>
              <Text style={styles.stopText}>⏹ Stop Coach Voice</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Typing / Thinking Indicator */}
        {isTyping && (
          <View style={styles.typingWrap}>
            <View style={[styles.dotAnimWrap, { backgroundColor: colors.surfaceAlt }]}>
              <Text style={styles.typingEmoji}>🤔</Text>
              <Text style={[styles.typingText, { color: colors.textSecondary }]}>VitaNova AI is thinking...</Text>
            </View>
          </View>
        )}

        {/* Input area & quick chips */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          style={styles.keyboardContainer}
        >
          {/* Quick Suggestions Chips */}
          <View style={[styles.pillsWrap, { backgroundColor: colors.glassBg, borderTopColor: colors.borderLight }]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pillsScrollContainer}
            >
              {(SUGGESTED_CHIPS[activeLang] || SUGGESTED_CHIPS.en).map((pill, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.pill, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
                  onPress={() => sendMessage(pill.query)}
                  disabled={isTyping}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, { color: colors.primary }]}>{pill.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Language Switcher Bar */}
          <View style={[styles.languageSwitcherContainer, { backgroundColor: colors.glassBg }]}>
            <Text style={[styles.langBarTitle, { color: colors.textSecondary }]}>Preferred Language:</Text>
            <LanguageSwitcher
              activeLanguage={activeLang}
              onSelect={handleLanguageSwitch}
            />
          </View>

          {/* Typing input */}
          <View style={[styles.inputRow, { backgroundColor: colors.surface, borderTopColor: colors.borderLight }]}>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceAlt, color: colors.textPrimary }]}
              value={input}
              onChangeText={setInput}
              placeholder={PLACEHOLDER[activeLang] || PLACEHOLDER.en}
              placeholderTextColor={colors.textTertiary}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={() => sendMessage()}
            />
            <TouchableOpacity
              style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
              onPress={() => sendMessage()}
              disabled={!input.trim() || isTyping}
            >
              <Text style={styles.sendIcon}>▲</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TabTransitionWrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  keyboardContainer: { paddingBottom: Platform.OS === 'ios' ? 44 : 54 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    ...SHADOWS.sm,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  botIconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  headerIcon: { fontSize: 22 },
  headerTitle: { fontSize: 16, fontWeight: '700' },
  headerSub: { fontSize: 10, marginTop: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.full },
  badgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  translationWrap: { paddingVertical: SPACING.xs, alignItems: 'center' },
  msgList: { padding: SPACING.md, paddingBottom: 120 },
  voiceOverlay: {
    margin: SPACING.md,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.sm,
    borderWidth: 1,
    ...SHADOWS.lg,
    position: 'absolute',
    bottom: 220,
    left: 0,
    right: 0,
    zIndex: 99,
  },
  stopBtn: {
    alignSelf: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.error + '18',
  },
  stopText: { fontSize: 11, color: COLORS.error, fontWeight: '700' },
  typingWrap: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    alignSelf: 'flex-start',
  },
  dotAnimWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
  },
  typingEmoji: { fontSize: 14 },
  typingText: { fontSize: 11, fontStyle: 'italic' },
  pillsWrap: { borderTopWidth: 1 },
  pillsScrollContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    gap: SPACING.xs,
    flexDirection: 'row',
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: { fontSize: 11, fontWeight: '700' },
  languageSwitcherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    paddingBottom: 6,
  },
  langBarTitle: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.poppinsBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 10,
    fontSize: 13,
    maxHeight: 80,
    marginRight: SPACING.sm,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  sendBtnDisabled: { backgroundColor: COLORS.border },
  sendIcon: { fontSize: 16, color: COLORS.textInverse, fontWeight: 'bold' },
});
