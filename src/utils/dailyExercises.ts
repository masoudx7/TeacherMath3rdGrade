import { ChapterId, QuestionDifficulty, QuizQuestion } from '../types';
import { CHAPTERS, SAMPLE_QUIZZES } from '../data/curriculum';
import { getOfflineQuestions } from './offlineQuestionBank';

export interface DailyExerciseAttempt {
  questionId: string;
  selectedIndex: number | null;
  wrongIndices: number[];
  isSolved: boolean;
  solvedFirstTry: boolean;
  completedAt?: string;
}

export interface DailyHabitState {
  date: string; // YYYY-MM-DD (local time)
  questionIds: string[];
  attempts: Record<string, DailyExerciseAttempt>;
  bonusAwarded: boolean;
  habitStreakDays: number;
  lastCompletedHabitDate?: string;
  recentQuestionIds: string[];
}

export interface DailyExerciseItem {
  slotIndex: number; // 0, 1, 2
  question: QuizQuestion;
  chapterTitle: string;
  difficultyLabel: string;
}

const DAILY_HABIT_STORAGE_KEY = 'ostad_dana_daily_habit_v1';
const MAX_RECENT_HISTORY = 45;

export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateKey(date: Date = new Date()): string {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return getLocalDateKey(d);
}

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededRandom(seed: number): () => number {
  let state = seed || 1;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function shuffleWithSeed<T>(items: T[], seed: number): T[] {
  const copy = [...items];
  const rand = seededRandom(seed);
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function getDifficultyLabel(diff?: QuestionDifficulty): string {
  if (diff === 'easy') return 'آسان';
  if (diff === 'hard') return 'چالشی';
  return 'متوسط';
}

export function getChapterTitle(chapterId: ChapterId): string {
  return CHAPTERS.find((c) => c.id === chapterId)?.title || 'ریاضی سوم';
}

function isShortValidQuestion(q: QuizQuestion): boolean {
  return Boolean(
    q &&
      q.id &&
      q.question &&
      Array.isArray(q.options) &&
      q.options.length >= 2 &&
      typeof q.correctAnswerIndex === 'number' &&
      q.correctAnswerIndex >= 0 &&
      q.correctAnswerIndex < q.options.length
  );
}

/**
 * Selects 3 short and varied questions from 3 different chapters for a given local date.
 */
export function selectThreeDailyQuestions(
  pool: QuizQuestion[],
  dateKey: string,
  recentIds: string[] = []
): QuizQuestion[] {
  const validPool = pool.filter(isShortValidQuestion);
  if (validPool.length === 0) return [];

  const recentSet = new Set(recentIds);
  const baseSeed = hashSeed(`ostad_dana_daily_${dateKey}`);

  // Prefer short questions (<= 165 chars) and not recently shown
  const nonRecentShort = validPool.filter(
    (q) => !recentSet.has(q.id) && q.question.trim().length <= 165
  );
  const nonRecentAny = validPool.filter((q) => !recentSet.has(q.id));
  const candidatePool =
    nonRecentShort.length >= 6
      ? nonRecentShort
      : nonRecentAny.length >= 3
      ? nonRecentAny
      : validPool;

  // Pick 3 distinct chapters deterministically for today
  const shuffledChapters = shuffleWithSeed(
    CHAPTERS.map((c) => c.id),
    baseSeed
  );

  // Target progressive daily rhythm: easy -> medium -> hard (or best available)
  const targetDifficulties: QuestionDifficulty[] = ['easy', 'medium', 'hard'];
  const picked: QuizQuestion[] = [];
  const usedIds = new Set<string>();
  const usedChapters = new Set<ChapterId>();

  for (let slot = 0; slot < 3; slot++) {
    const desiredDiff = targetDifficulties[slot];
    let chosen: QuizQuestion | undefined;

    for (const chId of shuffledChapters) {
      if (usedChapters.has(chId)) continue;
      const chapterCandidates = shuffleWithSeed(
        candidatePool.filter((q) => q.chapterId === chId && !usedIds.has(q.id)),
        baseSeed + slot * 97
      );
      if (chapterCandidates.length === 0) continue;

      chosen =
        chapterCandidates.find((q) => q.difficulty === desiredDiff && q.question.length <= 150) ||
        chapterCandidates.find((q) => q.difficulty === desiredDiff) ||
        chapterCandidates.find((q) => q.question.length <= 150) ||
        chapterCandidates[0];

      if (chosen) break;
    }

    // Fallback if fewer than 3 chapters had items
    if (!chosen) {
      const remaining = shuffleWithSeed(
        candidatePool.filter((q) => !usedIds.has(q.id)),
        baseSeed + slot * 131
      );
      chosen = remaining[0];
    }

    if (chosen) {
      picked.push(chosen);
      usedIds.add(chosen.id);
      usedChapters.add(chosen.chapterId);
    }
  }

  return picked;
}

export function loadDailyHabitState(todayKey: string = getLocalDateKey()): DailyHabitState {
  const defaultState: DailyHabitState = {
    date: todayKey,
    questionIds: [],
    attempts: {},
    bonusAwarded: false,
    habitStreakDays: 0,
    recentQuestionIds: [],
  };

  try {
    const raw = localStorage.getItem(DAILY_HABIT_STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<DailyHabitState>;

    const yesterdayKey = getYesterdayDateKey();
    const lastDate = parsed.lastCompletedHabitDate;
    // Keep streak alive if completed today or yesterday; otherwise reset to 0 until today is done
    const activeStreak =
      lastDate === todayKey || lastDate === yesterdayKey ? parsed.habitStreakDays || 0 : 0;

    if (parsed.date === todayKey) {
      return {
        date: todayKey,
        questionIds: Array.isArray(parsed.questionIds) ? parsed.questionIds : [],
        attempts: parsed.attempts && typeof parsed.attempts === 'object' ? parsed.attempts : {},
        bonusAwarded: Boolean(parsed.bonusAwarded),
        habitStreakDays: activeStreak,
        lastCompletedHabitDate: parsed.lastCompletedHabitDate,
        recentQuestionIds: Array.isArray(parsed.recentQuestionIds)
          ? parsed.recentQuestionIds.slice(-MAX_RECENT_HISTORY)
          : [],
      };
    }

    // New day: preserve streak metadata and carry over yesterday's shown IDs into recent history
    const prevIds = Array.isArray(parsed.questionIds) ? parsed.questionIds : [];
    const mergedRecent = Array.from(
      new Set([...(parsed.recentQuestionIds || []), ...prevIds])
    ).slice(-MAX_RECENT_HISTORY);

    return {
      date: todayKey,
      questionIds: [],
      attempts: {},
      bonusAwarded: false,
      habitStreakDays: activeStreak,
      lastCompletedHabitDate: parsed.lastCompletedHabitDate,
      recentQuestionIds: mergedRecent,
    };
  } catch {
    return defaultState;
  }
}

export function saveDailyHabitState(state: DailyHabitState): void {
  try {
    localStorage.setItem(DAILY_HABIT_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('[dailyExercises] Failed to persist daily habit state:', err);
  }
}

/**
 * Synchronously resolves today's 3 exercises from built-in curriculum so initial render has zero delay.
 */
export function getSyncDailyExercises(todayKey: string = getLocalDateKey()): {
  items: DailyExerciseItem[];
  state: DailyHabitState;
} {
  const state = loadDailyHabitState(todayKey);
  const builtInPool = Object.values(SAMPLE_QUIZZES).flat().filter(isShortValidQuestion);

  let selected: QuizQuestion[] = [];
  if (state.questionIds.length === 3) {
    const byId = new Map(builtInPool.map((q) => [q.id, q]));
    const resolved = state.questionIds.map((id) => byId.get(id)).filter(Boolean) as QuizQuestion[];
    if (resolved.length === 3) {
      selected = resolved;
    }
  }

  if (selected.length < 3) {
    selected = selectThreeDailyQuestions(builtInPool, todayKey, state.recentQuestionIds);
    return {
      items: selected.map((q, idx) => ({
        slotIndex: idx,
        question: q,
        chapterTitle: getChapterTitle(q.chapterId),
        difficultyLabel: getDifficultyLabel(q.difficulty),
      })),
      state,
    };
  }

  return {
    items: selected.map((q, idx) => ({
      slotIndex: idx,
      question: q,
      chapterTitle: getChapterTitle(q.chapterId),
      difficultyLabel: getDifficultyLabel(q.difficulty),
    })),
    state,
  };
}

/**
 * Loads full offline bank (including up to 5,000 IndexedDB questions) and resolves today's 3 questions.
 */
export async function loadDailyExercises(todayKey: string = getLocalDateKey()): Promise<{
  items: DailyExerciseItem[];
  state: DailyHabitState;
}> {
  const state = loadDailyHabitState(todayKey);
  const offlinePool = await getOfflineQuestions();
  const validPool =
    offlinePool.length > 0
      ? offlinePool.filter(isShortValidQuestion)
      : Object.values(SAMPLE_QUIZZES).flat().filter(isShortValidQuestion);

  let selected: QuizQuestion[] = [];

  if (state.questionIds.length === 3) {
    const byId = new Map(validPool.map((q) => [q.id, q]));
    const resolved = state.questionIds.map((id) => byId.get(id)).filter(Boolean) as QuizQuestion[];
    if (resolved.length === 3) {
      selected = resolved;
    }
  }

  if (selected.length < 3) {
    selected = selectThreeDailyQuestions(validPool, todayKey, state.recentQuestionIds);
    const updatedState: DailyHabitState = {
      ...state,
      questionIds: selected.map((q) => q.id),
    };
    saveDailyHabitState(updatedState);
    return {
      items: selected.map((q, idx) => ({
        slotIndex: idx,
        question: q,
        chapterTitle: getChapterTitle(q.chapterId),
        difficultyLabel: getDifficultyLabel(q.difficulty),
      })),
      state: updatedState,
    };
  }

  return {
    items: selected.map((q, idx) => ({
      slotIndex: idx,
      question: q,
      chapterTitle: getChapterTitle(q.chapterId),
      difficultyLabel: getDifficultyLabel(q.difficulty),
    })),
    state,
  };
}

/**
 * Replaces a single daily exercise slot with a fresh, non-duplicate short question
 * when the student answers incorrectly.
 */
export async function replaceDailyExerciseAtSlot(
  todayKey: string,
  slotIndex: number,
  missedQuestion: QuizQuestion
): Promise<{
  items: DailyExerciseItem[];
  state: DailyHabitState;
  newQuestion: QuizQuestion;
}> {
  const state = loadDailyHabitState(todayKey);
  const offlinePool = await getOfflineQuestions();
  const validPool =
    offlinePool.length > 0
      ? offlinePool.filter(isShortValidQuestion)
      : Object.values(SAMPLE_QUIZZES).flat().filter(isShortValidQuestion);

  const currentIds =
    state.questionIds.length === 3
      ? [...state.questionIds]
      : selectThreeDailyQuestions(validPool, todayKey, state.recentQuestionIds).map((q) => q.id);

  const updatedRecent = Array.from(
    new Set([...state.recentQuestionIds, missedQuestion.id])
  ).slice(-MAX_RECENT_HISTORY);

  const excludedIds = new Set<string>([...currentIds, ...updatedRecent, missedQuestion.id]);
  const targetDifficulties: QuestionDifficulty[] = ['easy', 'medium', 'hard'];
  const desiredDiff = targetDifficulties[slotIndex] || missedQuestion.difficulty || 'medium';
  const swapSeed = hashSeed(`swap_${todayKey}_${slotIndex}_${missedQuestion.id}_${Date.now()}`);

  // 1. Prefer fresh short question from the same chapter & not recently seen
  let candidates = shuffleWithSeed(
    validPool.filter(
      (q) =>
        !excludedIds.has(q.id) &&
        q.chapterId === missedQuestion.chapterId &&
        q.question.length <= 165
    ),
    swapSeed
  );

  // 2. Fallback to any fresh question from another chapter
  if (candidates.length === 0) {
    candidates = shuffleWithSeed(
      validPool.filter((q) => !excludedIds.has(q.id)),
      swapSeed
    );
  }

  // 3. Fallback allowing previously seen questions (excluding currently displayed 3)
  if (candidates.length === 0) {
    const activeSet = new Set<string>([...currentIds, missedQuestion.id]);
    candidates = shuffleWithSeed(
      validPool.filter((q) => !activeSet.has(q.id)),
      swapSeed
    );
  }

  const replacement =
    candidates.find((q) => q.difficulty === desiredDiff) ||
    candidates[0] ||
    missedQuestion;

  currentIds[slotIndex] = replacement.id;
  const nextAttempts = { ...state.attempts };
  delete nextAttempts[missedQuestion.id];
  delete nextAttempts[replacement.id];

  const nextState: DailyHabitState = {
    ...state,
    questionIds: currentIds,
    attempts: nextAttempts,
    recentQuestionIds: updatedRecent,
  };
  saveDailyHabitState(nextState);

  const byId = new Map(validPool.map((q) => [q.id, q]));
  const items: DailyExerciseItem[] = currentIds
    .map((id, idx) => {
      const q = byId.get(id) || (idx === slotIndex ? replacement : undefined);
      if (!q) return null;
      return {
        slotIndex: idx,
        question: q,
        chapterTitle: getChapterTitle(q.chapterId),
        difficultyLabel: getDifficultyLabel(q.difficulty),
      };
    })
    .filter(Boolean) as DailyExerciseItem[];

  return {
    items,
    state: nextState,
    newQuestion: replacement,
  };
}

