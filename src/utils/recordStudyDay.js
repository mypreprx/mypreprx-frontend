import api from "../config/axiosInstance";

/**
 * Record a submitted answer for Progress / Treatment Plan.
 * Always send isCorrect when known so questions + accuracy update.
 *
 * @param {string} source
 * @param {{ isCorrect?: boolean, questionId?: string, topicId?: string, topicTitle?: string, userAnswer?: string, timeSpentSeconds?: number }} answer
 */
export const recordStudyDayAlways = (source = "study", answer = null) => {
  const payload = { source: String(source || "study") };

  if (answer && typeof answer.isCorrect === "boolean") {
    payload.isCorrect = answer.isCorrect;
    if (answer.questionId) payload.questionId = answer.questionId;
    if (answer.topicId) payload.topicId = answer.topicId;
    if (answer.topicTitle) payload.topicTitle = answer.topicTitle;
    if (answer.userAnswer) payload.userAnswer = answer.userAnswer;
    if (typeof answer.timeSpentSeconds === "number" && answer.timeSpentSeconds > 0) {
      payload.timeSpentSeconds = Math.round(answer.timeSpentSeconds);
    }
  }

  api.post("/user/record-study-day", payload).catch((err) => {
    console.error("Failed to record study day:", err?.response?.data || err.message);
  });
};

/** @deprecated use recordStudyDayAlways */
export const recordStudyDay = (source = "study") => recordStudyDayAlways(source);
