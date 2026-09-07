import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';

import useAuthStore from "./store/authStore";
import useAdminAuthStore from "./store/adminAuthStore";

import ProtectedRoute from "./components/ProtectedRoutes";

// Pages
import { HeroSection } from "./pages/starter/HeroSection";
import { SignupPage } from "./pages/signup/SignupPage";
import { LoginPage } from "./pages/login/LoginPage";
import { ForgotPasswordPage } from "./pages/login/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/login/ResetPasswordPage";
import { Unauthorized } from "./pages/Unauthorized";
import { GrowthZones } from "./pages/groth_zones/GrowthZones";
import { Home } from "./pages/home/Home";

// Study Zone
import { StudyZone } from "./pages/study_zone/StudyZone";
import { CrashCourses } from "./pages/study_zone/crash_courses/CrashCourses";
import { VideoPlayerPage } from "./pages/study_zone/crash_courses/VideoPlayerPage";
import { AllTopics } from "./pages/study_zone/all_topics/AllTopics";
import { TopicDetails } from "./pages/study_zone/topic_details/TopicDetails";
import { SubtopicDetails } from "./pages/study_zone/subtopic_details/SubtopicDetails";
import { TopicDrill } from "./pages/study_zone/pediatrics/TopicDrill";
import { PeriorityPractice } from "./pages/study_zone/periority_practice/PeriorityPractice";
import { BehavioralHealth } from "./pages/study_zone/behavioral_health/BehavioralHealth";
import { BehavioralDrill } from "./pages/study_zone/behavioral_health/BehavioralDrill";
import { AdminBehavioralHealth } from "./pages/admin/behavioral_health/AdminBehavioralHealth";
import { CustomQuizzes } from "./pages/study_zone/custom_quizzes/CustomQuizzes";
import { QuizPage } from "./pages/study_zone/quiz/QuizPage";
import { QuizResult } from "./pages/study_zone/quiz/QuizResult";
import { PriorityPracticePlayer } from "./pages/study_zone/priority_practice_player/PriorityPracticePlayer";
import { NclexSimulatorDashboard } from "./pages/study_zone/nclex_simulator/NclexSimulatorDashboard";
import { NclexExamInterface } from "./pages/study_zone/nclex_simulator/NclexExamInterface";
import { NclexResultScreen } from "./pages/study_zone/nclex_simulator/NclexResultScreen";

// Strategy Zone
import { StrategyZone } from "./pages/strategy_zone/StrategyZone";
import { PeriorityFramworks } from "./pages/strategy_zone/priority_frameworks/PeriorityFramworks";
import { EliminationTechniques } from "./pages/strategy_zone/elimination_techniques/EliminationTechniques";
import { NeclexLanguage } from "./pages/strategy_zone/nclex_language/NeclexLanguage";
import { SataBootCamp } from "./pages/strategy_zone/sata_bootcamp/SataBootCamp";
import { CriticalThinking } from "./pages/strategy_zone/critical_thinking/CriticalThinking";
import { FlaggedQuestions } from "./pages/flagged_questions/FlaggedQuestions";
import { ReviewQuestion } from "./pages/flagged_questions/ReviewQuestion";
import { PeriorityPatient } from "./pages/strategy_zone/priority_patient/PeriorityPatient";
import { AdvancedPriorityRules } from "./pages/strategy_zone/priority_patient/AdvancedPriorityRules";
import { PharmaHacks } from "./pages/strategy_zone/pharma_hacks/PharmaHacks";
import { FivePharmShortcutRules } from "./pages/strategy_zone/pharma_hacks/FivePharmShortcutRules";
import { TestDayMindset } from "./pages/strategy_zone/test_day_mindset/TestDayMindset";
import { StrategyDrill } from "./pages/strategy_zone/components/StrategyDrill";

// Community
import { Community } from "./pages/community/Community";
import { MotivationMonday } from "./pages/community/monday_motivation/MotivationMonday";
import { StudyBuddyRequests } from "./pages/community/study_buddy_requests/StudyBuddyRequests";
import { CreateStudyRequest } from "./pages/community/study_buddy_requests/CreateStudyRequest";
import { StudyBuddyChat } from "./pages/community/study_buddy_requests/StudyBuddyChat";
import { StudyBuddyInbox } from "./pages/community/study_buddy_requests/StudyBuddyInbox";
import { PsychNursingTips } from "./pages/community/psych_nursing_tips/PsychNursingTips";
import { AskaQuestion } from "./pages/community/psych_nursing_tips/AskaQuestion";

// Mind RX
import { MindRx } from "./pages/mind_rx/MindRx";
import { VisualizationRoom } from "./pages/mind_rx/visualization_room/VisualizationRoom";
import { ScriptingSpace } from "./pages/mind_rx/scripting_space/ScriptingSpace";
import { SubliminalStudy } from "./pages/mind_rx/subliminal_study/SubliminalStudy";
import { ManifestationCalendar } from "./pages/mind_rx/manifestation_calender/ManifestationCalendar";
import { AddAffirmation } from "./pages/mind_rx/manifestation_calender/AddAffirmation";
import { MyMoment } from "./pages/mind_rx/my_moment/MyMoment";

// Michelle AI
import { MichelleAI } from "./pages/michelle_ai/MichelleAI";

// Progress
import { Progress } from "./pages/progress/Progress";
import { ViewTreatmentPlan } from "./pages/progress/treatment_plan/ViewTreatmentPlan";

// Resources Rx
import { ResourcesRx } from "./pages/resources_rx/ResourcesRx";

// Profile
import { Profile } from "./pages/profile/Profile";

// Admin
import AdminLayout from "./pages/admin/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/dashboard/AdminDashboard";
import AdminAnalytics from "./pages/admin/analytics/AdminAnalytics";
import AdminUsers from "./pages/admin/users/AdminUsers";
import AdminCrashCourses from "./pages/admin/crash_courses/AdminCrashCourses";
import AdminSubliminalAudio from "./pages/admin/subliminal_audio/AdminSubliminalAudio";
import AdminPriorityPractice from "./pages/admin/piriorityPractice/AdminPriorityPractice";
import AdminPriorityPracticeGenerator from "./pages/admin/piriorityPractice/AdminPriorityPracticeGenerator";
import AdminTopics from "./pages/admin/topics/AdminTopics";
import AdminVisualizations from "./pages/admin/visualizations/AdminVisualizations";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

import { SearchResults } from "./pages/search/SearchResults";

// Components
import Pharmacology from "./components/Pharmacology";
import FlashCard from "./components/FlashCard";
import MichelAIButton from "./components/MichelAIButton";



import { Toaster } from 'react-hot-toast';
import LoadingScreen from './components/common/loading/LoadingScreen';
import RedirectAuthenticatedUser from "./components/RedirectAuthenticatedUser";



const App = () => {
    const checkAuth = useAuthStore((state) => state.checkAuth);
    const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);
    const isLoading = useAuthStore((state) => state.isLoading);
    const loadingText = useAuthStore((state) => state.loadingText);

    const checkAdminAuth = useAdminAuthStore((state) => state.checkAdminAuth);
    const isCheckingAdminAuth = useAdminAuthStore((state) => state.isCheckingAuth);

    useEffect(() => {
        checkAuth();
        checkAdminAuth();
    }, [checkAuth, checkAdminAuth]);

    const ConditionalMichelButton = () => {
        const location = useLocation();
        return location.pathname !== '/michelle-ai' ? <MichelAIButton /> : null;
    };

    // Block ALL route rendering until both auth checks are done
    if (isCheckingAuth || isCheckingAdminAuth) {
        return <LoadingScreen text="Loading..." />;
    }

    return (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <Router>
                {isLoading && <LoadingScreen text={loadingText} />}
                <Toaster
                    position="top-center"
                    reverseOrder={false}
                />
                <ConditionalMichelButton />
                <div className="App">
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<HeroSection />} />

                        <Route element={<RedirectAuthenticatedUser />}>
                            <Route path="/signup" element={<SignupPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                        </Route>

                        <Route path="/unauthorized" element={<Unauthorized />} />

                        {/* Protected Routes */}
                        <Route element={<ProtectedRoute />}>
                            <Route path="/home" element={<Home />} />
                            <Route path="/search" element={<SearchResults />} />
                            <Route path="/growth-zones" element={<GrowthZones />} />

                            {/* Study Zone */}
                            <Route path="/study-zone" element={<StudyZone />} />
                            <Route path="/study-zone/crash-courses" element={<CrashCourses />} />
                            <Route path="/study-zone/crash-courses/:videoSlug" element={<VideoPlayerPage />} />
                            <Route path="/study-zone/all-topics" element={<AllTopics />} />
                            <Route path="/study-zone/periority-practice" element={<PeriorityPractice />} />
                            <Route path="/study-zone/behavioral-health" element={<BehavioralHealth />} />
                            <Route path="/study-zone/behavioral-health/drill" element={<BehavioralDrill />} />
                            <Route path="/study-zone/custom-quizzes" element={<CustomQuizzes />} />
                            <Route path="/study-zone/quiz" element={<QuizPage />} />
                            <Route path="/study-zone/quiz-result" element={<QuizResult />} />
                            <Route path="/study-zone/priority-practice-player" element={<PriorityPracticePlayer />} />
                            <Route path="/study-zone/priority-practice-result" element={<QuizResult />} />
                            <Route path="/study-zone/topic/:topicSlug" element={<TopicDetails />} />
                            <Route path="/study-zone/subtopic/:subtopicSlug" element={<SubtopicDetails />} />
                            <Route path="/study-zone/topic-drill" element={<TopicDrill />} />
                            <Route path="/study-zone/nclex-simulator" element={<NclexSimulatorDashboard />} />
                            <Route path="/study-zone/nclex-simulator/exam" element={<NclexExamInterface />} />
                            <Route path="/study-zone/nclex-simulator/result" element={<NclexResultScreen />} />

                            {/* Strategy Zone */}
                            <Route path="/strategy-zone" element={<StrategyZone />} />
                            <Route path="/strategy-zone/periority-framworks" element={<PeriorityFramworks />} />
                            <Route path="/strategy-zone/elimination-techniques" element={<EliminationTechniques />} />
                            <Route path="/strategy-zone/neclex-language" element={<NeclexLanguage />} />
                            <Route path="/strategy-zone/periority-patients" element={<PeriorityPatient />} />
                            <Route path="/strategy-zone/advanced-priority-rules" element={<AdvancedPriorityRules />} />
                            <Route path="/strategy-zone/critical-thinking" element={<CriticalThinking />} />
                            <Route path="/flagged-questions" element={<FlaggedQuestions />} />
                            <Route path="/review-question" element={<ReviewQuestion />} />
                            <Route path="/strategy-zone/pharma-hacks" element={<PharmaHacks />} />
                            <Route path="/strategy-zone/five-pharm-shortcut-rules" element={<FivePharmShortcutRules />} />
                            <Route path="/strategy-zone/sata-boot-camp" element={<SataBootCamp />} />
                            <Route path="/strategy-zone/test-day-mindset" element={<TestDayMindset />} />
                            <Route path="/strategy-zone/drill" element={<StrategyDrill />} />

                            {/* Community */}
                            <Route path="/community" element={<Community />} />
                            <Route path="/community/motivation-monday" element={<MotivationMonday />} />
                            <Route path="/community/study-buddy-requests" element={<StudyBuddyRequests />} />
                            <Route path="/community/study-buddy-requests/create-study-request" element={<CreateStudyRequest />} />
                            <Route path="/community/study-buddy-requests/chat/:requestId" element={<StudyBuddyChat />} />
                            <Route path="/community/study-buddy-requests/inbox/:requestId" element={<StudyBuddyInbox />} />
                            <Route path="/community/psych-nursing-tips" element={<PsychNursingTips />} />
                            <Route path="/community/psych-nursing-tips/aska-question" element={<AskaQuestion />} />

                            {/* Mind RX */}
                            <Route path="/mind-rx" element={<MindRx />} />
                            <Route path="/mind-rx/visualization-room" element={<VisualizationRoom />} />
                            <Route path="/mind-rx/scripting-space" element={<ScriptingSpace />} />
                            <Route path="/mind-rx/subliminal-study" element={<SubliminalStudy />} />
                            <Route path="/mind-rx/manifestation-calendar" element={<ManifestationCalendar />} />
                            <Route path="/mind-rx/manifestation-calendar/add-affirmation" element={<AddAffirmation />} />
                            <Route path="/mind-rx/my-moment" element={<MyMoment />} />

                            {/* Michelle AI */}
                            <Route path="/michelle-ai" element={<MichelleAI />} />

                            <Route path="/pharmacology" element={<Pharmacology />} />
                            <Route path="/flashcard" element={<FlashCard />} />

                            {/* Progress */}
                            <Route path="/progress" element={<Progress />} />
                            <Route path="/progress/view-treatment-plan" element={<ViewTreatmentPlan />} />


                            <Route path="/resources-rx" element={<ResourcesRx />} />

                            <Route path="/profile" element={<Profile />} />
                        </Route>

                        {/* Admin Routes */}
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route element={<AdminProtectedRoute />}>
                            <Route path="/admin" element={<AdminLayout />}>
                                <Route index element={<AdminDashboard />} />
                                <Route path="dashboard" element={<AdminDashboard />} />
                                <Route path="analytics" element={<AdminAnalytics />} />
                                <Route path="users" element={<AdminUsers />} />
                                <Route path="crash-courses" element={<AdminCrashCourses />} />
                                <Route path="crash-courses/create" element={<AdminCrashCourses />} />
                                <Route path="crash-courses/edit" element={<AdminCrashCourses />} />
                                <Route path="subliminal-audio" element={<AdminSubliminalAudio />} />
                                <Route path="priority-practice" element={<AdminPriorityPractice />} />
                                <Route path="priority-practice/create" element={<AdminPriorityPractice />} />
                                <Route path="priority-practice/edit" element={<AdminPriorityPractice />} />
                                <Route path="priority-practice/generate" element={<AdminPriorityPracticeGenerator />} />
                                <Route path="visualizations" element={<AdminVisualizations />} />
                                <Route path="topics" element={<AdminTopics />} />
                                <Route path="behavioral-health" element={<AdminBehavioralHealth />} />
                            </Route>
                        </Route>
                    </Routes>
                </div>
            </Router>
        </GoogleOAuthProvider>
    );
}

export default App;
