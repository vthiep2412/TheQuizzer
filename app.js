// ==========================================================================
// CONFIGURATION & STATIC SUBJECTS LIST
// ==========================================================================
const SUBJECTS = [
  { id: "atk-aerodynamics", name: "ATK - Aerodynamics", file: "question_bank/ATK-Aerodynamics.json" },
  { id: "air-law", name: "Air Law", file: "question_bank/Air-Law.json" },
  { id: "human-factor-hpl", name: "Human Factor (HPL)", file: "question_bank/Human-Factor-HPL.json" },
  { id: "meteorology", name: "Meteorology", file: "question_bank/Meteorology.json" },
  { id: "navigation-flight-planning", name: "Navigation & Flight Prep", file: "question_bank/Navigation-Flight-Planning.json" },
  { id: "vfr-comunications-frto", name: "VFR Communications (FRTO)", file: "question_bank/VFR-Comunications-FRTO.json" }
];

// ==========================================================================
// APP STATE MANAGEMENT
// ==========================================================================
let appState = {
  rawQuestions: [],        // Raw parsed question list from JSON
  bankName: "",            // Title of current subject
  activeSubjectId: "",     // ID of current subject
  quizQuestions: [],       // Active questions for current quiz (sliced/shuffled)
  currentIndex: 0,         // Active question index (0-based)
  userAnswers: [],         // User selected option IDs (1-4, or null)
  flaggedQuestions: [],    // Boolean array of flagged states
  checkedAnswers: [],      // Practice Mode (on-the-fly): whether question is already graded
  
  // Settings
  selectedMode: "practice", // practice | exam
  onTheFly: true,          // Immediate feedback in practice mode
  shuffleQuestions: true,
  shuffleOptions: true,
  language: "en",          // en | vi
  
  // Timer state
  timerInterval: null,
  timeSpent: 0,            // In seconds
  timeRemaining: 0,        // In seconds (Exam mode only)
  totalExamTime: 60 * 60,  // In seconds (defaults to 60 mins)
  isTimeUp: false
};

// ==========================================================================
// DOM ELEMENT CACHING
// ==========================================================================
const DOM = {
  themeToggle: document.getElementById("theme-toggle"),
  langToggle: document.getElementById("lang-toggle"),
  
  // Screens
  screenWelcome: document.getElementById("screen-welcome"),
  screenSetup: document.getElementById("screen-setup"),
  screenQuiz: document.getElementById("screen-quiz"),
  screenResults: document.getElementById("screen-results"),
  
  // Welcome screen
  subjectsGrid: document.getElementById("subjects-grid"),
  
  // Setup screen
  btnSetupBack: document.getElementById("btn-setup-back"),
  setupSubjectTitle: document.getElementById("setup-subject-title"),
  setupSubjectMeta: document.getElementById("setup-subject-meta"),
  timerLimitSelect: document.getElementById("timer-limit"),
  timerSettingWrapper: document.getElementById("timer-setting-wrapper"),
  questionLimitSelect: document.getElementById("question-limit"),
  questionSettingWrapper: document.getElementById("question-setting-wrapper"),
  passMarkSelect: document.getElementById("pass-mark"),
  onTheFlyCheckbox: document.getElementById("toggle-on-the-fly"),
  onTheFlyWrapper: document.getElementById("on-the-fly-wrapper"),
  shuffleQuestionsCheckbox: document.getElementById("shuffle-questions"),
  shuffleOptionsCheckbox: document.getElementById("shuffle-options"),
  btnStartQuiz: document.getElementById("btn-start-quiz"),
  
  // Quiz screen
  btnQuizQuit: document.getElementById("btn-quiz-quit"),
  quizProgressLabel: document.getElementById("quiz-progress-label"),
  quizTimer: document.getElementById("quiz-timer"),
  timerText: document.getElementById("timer-text"),
  quizProgressBar: document.getElementById("quiz-progress-bar"),
  btnFlagQuestion: document.getElementById("btn-flag-question"),
  questionText: document.getElementById("question-text"),
  questionMainLayout: document.querySelector(".question-main-layout"),
  questionImageContainer: document.getElementById("question-image-container"),
  optionsGrid: document.getElementById("options-grid"),
  explanationBox: document.getElementById("explanation-box"),
  explanationStatus: document.getElementById("explanation-status"),
  explanationText: document.getElementById("explanation-text"),
  btnQuizPrev: document.getElementById("btn-quiz-prev"),
  btnQuizNext: document.getElementById("btn-quiz-next"),
  btnQuizPrevMobile: document.getElementById("btn-quiz-prev-mobile"),
  btnQuizNextMobile: document.getElementById("btn-quiz-next-mobile"),
  btnQuizSubmit: document.getElementById("btn-quiz-submit"),
  btnQuizCheck: document.getElementById("btn-quiz-check"),
  questionMapGrid: document.getElementById("question-map-grid"),
  quizMapSummary: document.getElementById("quiz-map-summary"),
  
  // Results screen
  ringFill: document.getElementById("ring-fill"),
  resultPercent: document.getElementById("result-percent"),
  resultRatio: document.getElementById("result-ratio"),
  resultVerdict: document.getElementById("result-verdict"),
  resultStatSubject: document.getElementById("result-stat-subject"),
  resultStatTime: document.getElementById("result-stat-time"),
  btnResultsRetry: document.getElementById("btn-results-retry"),
  btnResultsHome: document.getElementById("btn-results-home"),
  accordionList: document.getElementById("review-accordion-list"),
  countAll: document.getElementById("count-all"),
  countCorrect: document.getElementById("count-correct"),
  countIncorrect: document.getElementById("count-incorrect"),
  countFlagged: document.getElementById("count-flagged"),
  reviewFilters: document.querySelector(".review-filters"),
  
  // History elements
  historyContainer: document.getElementById("session-history-container"),
  historyList: document.getElementById("history-list"),
  historySelectBtn: document.getElementById("btn-history-select"),
  historySelectActions: document.getElementById("history-select-actions"),
  btnSelectAll: document.getElementById("btn-history-select-all"),
  btnUnselectAll: document.getElementById("btn-history-unselect-all"),
  btnCancelSelect: document.getElementById("btn-history-cancel"),
  historyStickyBar: document.getElementById("history-sticky-bar"),
  stickyCountText: document.getElementById("history-selected-count"),
  btnStickyCancel: document.getElementById("btn-sticky-cancel"),
  btnStickyDelete: document.getElementById("btn-sticky-delete"),
  
  // Lightbox elements
  lightboxModal: document.getElementById("image-lightbox-modal"),
  lightboxImg: document.getElementById("lightbox-img"),
  lightboxViewport: document.getElementById("lightbox-viewport"),
  btnLightboxClose: document.getElementById("btn-lightbox-close")
};

// ==========================================================================
// SYSTEM INITIALIZATION & THEME
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initLanguage();
  populateSubjectsGrid();
  initCustomSelects();
  initHistory();
  initLightbox();
  setupEventListeners();
});

// ==========================================================================
// TRANSLATION SYSTEM (i18n)
// ==========================================================================
const TRANSLATIONS = {
  en: {
    welcome_title: "Select Question Bank",
    welcome_subtitle: "A simple, premium tool to master aviation exams with your friends.",
    btn_change_subject: "← Change Subject",
    setup_study_mode: "1. Study Mode",
    mode_practice_title: "Practice Mode",
    mode_practice_desc: "No pressure, learn with immediate solutions & explanations.",
    mode_exam_title: "Exam Mode",
    mode_exam_desc: "Simulated exam conditions. Strict timer. Scores revealed at the end.",
    setup_customize: "2. Customize Sessions",
    time_limit: "Time Limit",
    question_limit: "Question Limit",
    pass_mark_label: "Pass Mark",
    limit_all: "All Questions",
    shuffle_questions: "Shuffle questions",
    shuffle_options: "Shuffle answer choices",
    immediate_grading: "Immediate grading",
    btn_start_quiz: "Start Quiz",
    btn_quit: "Quit",
    btn_prev: "Previous",
    btn_next: "Next",
    btn_submit: "Submit Exam",
    btn_end_practice: "End Practice",
    btn_check: "Check Answer",
    keyboard_tip: "Tip: Keyboard A-D / 1-4 to select • Enter to check  Arrow keys to navigate • F to flag",
    results_title: "Quiz Complete!",
    stat_subject: "Subject",
    stat_time: "Time Spent",
    stat_pass_mark: "Pass Mark",
    btn_retry: "Retake Quiz",
    btn_home: "Home Screen",
    review_title: "Review Questions",
    filter_all: "All",
    filter_correct: "Correct",
    filter_incorrect: "Incorrect",
    filter_flagged: "Flagged",
    
    // Legend & History keys
    history_title: "Practice & Exam History",
    btn_history_select_delete: "Select Delete",
    btn_history_select_all: "Select All",
    btn_history_unselect_all: "Unselect All",
    btn_history_cancel: "Cancel",
    btn_history_delete: "Delete",
    history_empty: "No quiz history recorded yet. Complete a quiz to view past sessions!",
    lightbox_tip: "Scroll wheel to Zoom • Drag to Pan • Click outside to Close",
    question_limit_all: "All Questions",
    question_limit_unit: "Questions",
    legend_unanswered: "Unanswered",
    legend_answered: "Answered",
    legend_correct: "Correct",
    legend_incorrect: "Incorrect",
    legend_flagged: "Flagged",
    
    // Dynamic / JS-only strings
    badge_multiple_choice: "Multiple Choice",
    flag_question: "Flag Question",
    flagged: "Flagged",
    question: "Question",
    correct_explanation: "Correct!",
    incorrect_explanation: "Incorrect Answer",
    no_explanation: "No explanation details provided for this question.",
    your_option: "Your Option",
    correct_option: "Correct Option",
    unanswered: "Unanswered",
    answered: "Answered",
    results_pass: "PASS",
    results_fail: "FAIL",
    confirm_quit: "Are you sure you want to quit? All progress in this session will be lost.",
    confirm_submit: "Are you sure you want to submit your quiz?",
    time_up: "Time is up! Submitting your exam automatically.",
    skipped: "Skipped",
    explanation: "Explanation",
    subjects: {
      "atk-aerodynamics": "ATK - Aerodynamics",
      "air-law": "Air Law",
      "human-factor-hpl": "Human Factor (HPL)",
      "meteorology": "Meteorology",
      "navigation-flight-planning": "Navigation & Flight Prep",
      "vfr-comunications-frto": "VFR Communications (FRTO)"
    }
  },
  vi: {
    welcome_title: "Chọn Kho Câu Hỏi",
    welcome_subtitle: "Công cụ đơn giản, cao cấp để ôn thi hàng không cùng bạn bè.",
    btn_change_subject: "← Chọn Môn Khác",
    setup_study_mode: "1. Chế Độ Học",
    mode_practice_title: "Luyện Tập",
    mode_practice_desc: "Không áp lực, xem giải thích và kết quả ngay sau mỗi câu.",
    mode_exam_title: "Thi Thử",
    mode_exam_desc: "Giả lập phòng thi. Giới hạn thời gian. Điểm số công bố khi nộp bài.",
    setup_customize: "2. Tùy Chọn Phiên",
    time_limit: "Thời Gian Làm Bài",
    question_limit: "Số lượng câu hỏi",
    pass_mark_label: "Điểm Đạt",
    limit_all: "Tất cả câu hỏi",
    shuffle_questions: "Xáo trộn câu hỏi",
    shuffle_options: "Xáo trộn các đáp án",
    immediate_grading: "Hiển thị đáp án ngay",
    btn_start_quiz: "Bắt Đầu",
    btn_quit: "Thoát",
    btn_prev: "Câu Trước",
    btn_next: "Câu Tiếp",
    btn_submit: "Nộp Bài",
    btn_end_practice: "Kết thúc luyện tập",
    btn_check: "Kiểm tra",
    keyboard_tip: "Mẹo: Phím A-D / 1-4 để chọn • Enter để kiểm tra • Phím mũi tên để chuyển • Phím F để đánh dấu",
    results_title: "Hoàn Thành!",
    stat_subject: "Môn Học",
    stat_time: "Thời Gian",
    stat_pass_mark: "Điểm Đạt",
    btn_retry: "Luyện Lại",
    btn_home: "Trang Chủ",
    review_title: "Xem Lại Câu Hỏi",
    filter_all: "Tất Cả",
    filter_correct: "Đúng",
    filter_incorrect: "Sai",
    filter_flagged: "Đã Lưu",
    
    // Legend & History keys
    history_title: "Lịch Sử Thi & Luyện Tập",
    btn_history_select_delete: "Chọn Xóa",
    btn_history_select_all: "Chọn Tất Cả",
    btn_history_unselect_all: "Bỏ Chọn Tất Cả",
    btn_history_cancel: "Hủy",
    btn_history_delete: "Xóa",
    history_empty: "Chưa có lịch sử làm bài. Hãy hoàn thành một bài thi để xem lại!",
    lightbox_tip: "Cuộn chuột để Phóng to • Kéo để Di chuyển • Nhấp bên ngoài để Đóng",
    question_limit_all: "Tất cả câu hỏi",
    question_limit_unit: "Câu hỏi",
    legend_unanswered: "Chưa trả lời",
    legend_answered: "Đã trả lời",
    legend_correct: "Đúng",
    legend_incorrect: "Sai",
    legend_flagged: "Đã lưu",
    
    // Dynamic / JS-only strings
    badge_multiple_choice: "Trắc Nghiệm",
    flag_question: "Đánh Dấu",
    flagged: "Đã Đánh Dấu",
    question: "Câu hỏi",
    correct_explanation: "Chính Xác!",
    incorrect_explanation: "Chưa Chính Xác",
    no_explanation: "Không có giải thích chi tiết cho câu hỏi này.",
    your_option: "Lựa chọn của bạn",
    correct_option: "Đáp án đúng",
    unanswered: "Chưa làm",
    answered: "Đã làm",
    results_pass: "ĐẠT",
    results_fail: "TRƯỢT",
    confirm_quit: "Bạn có chắc muốn thoát? Tiến trình luyện tập hiện tại sẽ không được lưu.",
    confirm_submit: "Bạn có chắc chắn muốn nộp bài thi?",
    time_up: "Hết giờ làm bài! Hệ thống đang tự động nộp bài.",
    skipped: "Bỏ qua",
    explanation: "Giải thích",
    subjects: {
      "atk-aerodynamics": "ATK - Khí động học",
      "air-law": "Luật Hàng không",
      "human-factor-hpl": "Yếu tố con người (HPL)",
      "meteorology": "Khí tượng học",
      "navigation-flight-planning": "Dẫn đường & Lập kế hoạch bay",
      "vfr-comunications-frto": "Thông tin liên lạc VFR (FRTO)"
    }
  }
};

function initLanguage() {
  const savedLang = localStorage.getItem("quiz-lang") || "en";
  appState.language = savedLang;
  DOM.langToggle.textContent = savedLang.toUpperCase();
  updateLanguageUI();
}

function toggleLanguage() {
  const newLang = appState.language === "en" ? "vi" : "en";
  appState.language = newLang;
  localStorage.setItem("quiz-lang", newLang);
  DOM.langToggle.textContent = newLang.toUpperCase();
  updateLanguageUI();
  populateSubjectsGrid(); // Re-render subjects to update translated names
  if (DOM.screenSetup.classList.contains("active")) {
    transitionToSetup(); // Re-translate setup metadata dynamically
  }
}

function updateLanguageUI() {
  const lang = appState.language;
  
  // Set the dynamic attribute for the submit button in the sidebar based on active mode
  const submitSpan = DOM.btnQuizSubmit ? DOM.btnQuizSubmit.querySelector("span") : null;
  if (submitSpan) {
    if (appState.selectedMode === "exam") {
      submitSpan.setAttribute("data-i18n", "btn_submit");
    } else {
      submitSpan.setAttribute("data-i18n", "btn_end_practice");
    }
  }

  document.querySelectorAll("[data-i18n]").forEach(elem => {
    const key = elem.getAttribute("data-i18n");
    if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
      const svgChild = elem.querySelector("svg");
      if (svgChild) {
        let updated = false;
        elem.childNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() !== "") {
            node.nodeValue = " " + TRANSLATIONS[lang][key];
            updated = true;
          }
        });
        if (!updated) {
          elem.appendChild(document.createTextNode(" " + TRANSLATIONS[lang][key]));
        }
      } else {
        elem.textContent = TRANSLATIONS[lang][key];
      }
    }
  });
  
  updateTimerDropdownTexts();
  updateQuestionDropdownTexts();
  updateMapLegend();
  renderHistoryGrid();

  // Dynamically refresh progress label if currently on quiz screen
  if (DOM.screenQuiz.classList.contains("active") && appState.quizQuestions.length > 0) {
    const idx = appState.currentIndex;
    DOM.quizProgressLabel.textContent = lang === "vi"
      ? `Câu hỏi ${idx + 1}/${appState.quizQuestions.length}`
      : `Question ${idx + 1}/${appState.quizQuestions.length}`;
  }

  // Dynamically refresh results screen if currently on results screen
  if (DOM.screenResults && DOM.screenResults.classList.contains("active")) {
    if (DOM.resultVerdict) {
      const isPass = DOM.resultVerdict.classList.contains("pass");
      DOM.resultVerdict.textContent = isPass ? TRANSLATIONS[lang].results_pass : TRANSLATIONS[lang].results_fail;
    }
    buildReviewAccordion(appState.activeReviewFilter || "all");
    setupReviewFilters();
  }
}

function updateTimerDropdownTexts() {
  const lang = appState.language;
  const isVi = lang === "vi";
  const customSelect = document.getElementById("timer-custom-select");
  if (!customSelect) return;
  
  const options = customSelect.querySelectorAll(".select-option");
  options.forEach(opt => {
    const val = opt.getAttribute("data-value");
    opt.textContent = `${val} ${isVi ? "Phút" : "Minutes"}`;
  });
  
  const triggerText = customSelect.querySelector(".select-trigger-text");
  const hiddenInput = customSelect.querySelector("input[type='hidden']");
  if (triggerText && hiddenInput) {
    triggerText.textContent = `${hiddenInput.value} ${isVi ? "Phút" : "Minutes"}`;
  }
}

function updateQuestionDropdownTexts() {
  const lang = appState.language || "en";
  const customSelect = document.getElementById("question-custom-select");
  if (!customSelect) return;
  
  const allText = TRANSLATIONS[lang].question_limit_all || "All Questions";
  const unitText = TRANSLATIONS[lang].question_limit_unit || "Questions";

  const options = customSelect.querySelectorAll(".select-option");
  options.forEach(opt => {
    const val = opt.getAttribute("data-value");
    if (val === "all") {
      opt.textContent = allText;
    } else {
      opt.textContent = `${val} ${unitText}`;
    }
  });
  
  const triggerText = customSelect.querySelector(".select-trigger-text");
  const hiddenInput = customSelect.querySelector("input[type='hidden']");
  if (triggerText && hiddenInput) {
    const val = hiddenInput.value;
    if (val === "all") {
      triggerText.textContent = allText;
    } else {
      triggerText.textContent = `${val} ${unitText}`;
    }
  }
}

function updateMapLegend() {
  const lang = appState.language || "en";
  const isImmediate = appState.selectedMode === "practice" && appState.onTheFly;
  
  if (!DOM.quizMapSummary) return;
  
  if (isImmediate) {
    DOM.quizMapSummary.innerHTML = `
      <div class="summary-item"><span class="swatch unanswered"></span> ${TRANSLATIONS[lang].legend_unanswered}</div>
      <div class="summary-item"><span class="swatch correct"></span> ${TRANSLATIONS[lang].legend_correct}</div>
      <div class="summary-item"><span class="swatch incorrect"></span> ${TRANSLATIONS[lang].legend_incorrect}</div>
      <div class="summary-item"><span class="swatch flagged"></span> ${TRANSLATIONS[lang].legend_flagged}</div>
    `;
  } else {
    DOM.quizMapSummary.innerHTML = `
      <div class="summary-item"><span class="swatch unanswered"></span> ${TRANSLATIONS[lang].legend_unanswered}</div>
      <div class="summary-item"><span class="swatch answered"></span> ${TRANSLATIONS[lang].legend_answered}</div>
      <div class="summary-item"><span class="swatch flagged"></span> ${TRANSLATIONS[lang].legend_flagged}</div>
    `;
  }
}

// Theme Setup
function initTheme() {
  const savedTheme = localStorage.getItem("quiz-theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("quiz-theme", newTheme);
}

// Custom Designed Select Dropdowns with Animated Arrow
function initCustomSelects() {
  const customSelects = document.querySelectorAll(".custom-select");
  
  customSelects.forEach(select => {
    const trigger = select.querySelector(".select-trigger");
    const triggerText = select.querySelector(".select-trigger-text");
    const optionsContainer = select.querySelector(".select-options");
    const options = select.querySelectorAll(".select-option");
    const hiddenInput = select.querySelector("input[type='hidden']");
    
    // Toggle dropdown visibility on trigger click
    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = select.classList.contains("open");
      
      // Close all other dropdowns
      document.querySelectorAll(".custom-select").forEach(other => {
        other.classList.remove("open");
      });
      
      if (!isOpen) {
        select.classList.add("open");
      }
    });
    
    // Select option click event handler
    options.forEach(opt => {
      opt.addEventListener("click", (e) => {
        e.stopPropagation();
        
        // Clear selection highlights
        options.forEach(o => o.classList.remove("selected"));
        opt.classList.add("selected");
        
        // Update input values
        const val = opt.getAttribute("data-value");
        hiddenInput.value = val;
        triggerText.textContent = opt.textContent;
        
        // Close select trigger
        select.classList.remove("open");
      });
    });
  });
  
  // Close any custom dropdown when clicking outside
  document.addEventListener("click", () => {
    document.querySelectorAll(".custom-select").forEach(select => {
      select.classList.remove("open");
    });
  });
}

// Populate Subjects Grid from Static List
function populateSubjectsGrid() {
  DOM.subjectsGrid.innerHTML = "";
  SUBJECTS.forEach(subject => {
    const btn = document.createElement("button");
    btn.className = "btn btn-outline btn-block btn-lg subject-btn";
    btn.style.textAlign = "left";
    btn.style.justifyContent = "space-between";
    btn.style.marginBottom = "12px";
    
    const titleSpan = document.createElement("span");
    const displayName = subject.name;
    titleSpan.textContent = displayName;
    
    const arrowSpan = document.createElement("span");
    arrowSpan.textContent = "➔";
    arrowSpan.style.opacity = "0.7";
    
    btn.appendChild(titleSpan);
    btn.appendChild(arrowSpan);
    
    btn.addEventListener("click", () => {
      appState.activeSubjectId = subject.id; // Store subject key
      loadSubjectFromFile(subject.file);
    });
    DOM.subjectsGrid.appendChild(btn);
  });
}

// ==========================================================================
// FILE PARSING & LOADING
// ==========================================================================
async function loadSubjectFromFile(filePath) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error("Failed to load question bank file.");
    const data = await response.json();
    processQuestionBank(data);
  } catch (error) {
    alert("Error loading subject: " + error.message);
  }
}

function processQuestionBank(jsonArray) {
  if (!Array.isArray(jsonArray) || jsonArray.length < 2) {
    alert("Invalid question bank format. Make sure it was converted correctly.");
    return;
  }
  
  // Extract bankName from the first object
  const headerObj = jsonArray[0];
  appState.bankName = headerObj.bankName || "Aviation Quiz";
  
  // Extract questions
  appState.rawQuestions = jsonArray.slice(1).filter(q => q.question);
  
  if (appState.rawQuestions.length === 0) {
    alert("No questions found in this question bank.");
    return;
  }
  
  // Trigger transition to setup screen
  transitionToSetup();
}



// ==========================================================================
// NAVIGATION / SCREEN ROUTER
// ==========================================================================
function showScreen(screenElement) {
  [DOM.screenWelcome, DOM.screenSetup, DOM.screenQuiz, DOM.screenResults].forEach(screen => {
    screen.classList.remove("active");
  });
  screenElement.classList.add("active");
  window.scrollTo(0, 0);
}

function transitionToSetup() {
  const lang = appState.language || "en";
  const displayName = TRANSLATIONS[lang]?.subjects?.[appState.activeSubjectId] || appState.bankName;
  DOM.setupSubjectTitle.textContent = displayName;
  
  const questionsCount = appState.rawQuestions.length;
  DOM.setupSubjectMeta.textContent = lang === "vi" 
    ? `Có sẵn ${questionsCount} câu hỏi` 
    : `${questionsCount} Questions available`;
  
  // Align setting block visibilities with default radio checks
  const modeRadio = document.querySelector('input[name="quiz-mode"]:checked');
  const currentMode = modeRadio ? modeRadio.value : "practice";
  appState.selectedMode = currentMode;
  if (currentMode === "exam") {
    DOM.timerSettingWrapper.style.display = "";
    if (DOM.questionSettingWrapper) DOM.questionSettingWrapper.style.display = "";
    DOM.onTheFlyWrapper.style.display = "none";
  } else {
    DOM.timerSettingWrapper.style.display = "none";
    if (DOM.questionSettingWrapper) DOM.questionSettingWrapper.style.display = "none";
    DOM.onTheFlyWrapper.style.display = "";
  }
  
  showScreen(DOM.screenSetup);
}

// ==========================================================================
// LISTENERS & EVENT REGISTRATION
// ==========================================================================
function setupEventListeners() {
  // Language Toggle
  DOM.langToggle.addEventListener("click", toggleLanguage);

  // Theme Toggle
  DOM.themeToggle.addEventListener("click", toggleTheme);
  
  // Setup back button
  DOM.btnSetupBack.addEventListener("click", () => {
    showScreen(DOM.screenWelcome);
  });
  
  // Mode toggle (practice vs exam settings changes)
  document.querySelectorAll('input[name="quiz-mode"]').forEach(radio => {
    radio.addEventListener("change", (e) => {
      appState.selectedMode = e.target.value;
      if (appState.selectedMode === "exam") {
        DOM.timerSettingWrapper.style.display = "";
        if (DOM.questionSettingWrapper) DOM.questionSettingWrapper.style.display = "";
        DOM.onTheFlyWrapper.style.display = "none";
      } else {
        DOM.timerSettingWrapper.style.display = "none";
        if (DOM.questionSettingWrapper) DOM.questionSettingWrapper.style.display = "none";
        DOM.onTheFlyWrapper.style.display = "";
      }
    });
  });
  
  // Start quiz button
  DOM.btnStartQuiz.addEventListener("click", startQuiz);
  
  // Quiz controls
  DOM.btnQuizPrev.addEventListener("click", () => navigateQuestion(-1));
  DOM.btnQuizNext.addEventListener("click", () => navigateQuestion(1));
  if (DOM.btnQuizPrevMobile) DOM.btnQuizPrevMobile.addEventListener("click", () => navigateQuestion(-1));
  if (DOM.btnQuizNextMobile) DOM.btnQuizNextMobile.addEventListener("click", () => navigateQuestion(1));
  DOM.btnQuizQuit.addEventListener("click", quitQuiz);
  DOM.btnQuizSubmit.addEventListener("click", () => {
    const lang = appState.language || "en";
    const msg = appState.selectedMode === "exam"
      ? (lang === "vi" ? "Bạn có chắc chắn muốn nộp bài thi?" : "Are you sure you want to submit your exam?")
      : (lang === "vi" ? "Bạn có chắc chắn muốn kết thúc luyện tập?" : "Are you sure you want to end your practice?");
    if (confirm(msg)) {
      submitQuiz();
    }
  });
  DOM.btnQuizCheck.addEventListener("click", checkAnswer);
  
  // Flag toggle
  DOM.btnFlagQuestion.addEventListener("click", toggleFlag);
  
  // Results buttons
  DOM.btnResultsRetry.addEventListener("click", startQuiz);
  DOM.btnResultsHome.addEventListener("click", () => {
    clearInterval(appState.timerInterval);
    showScreen(DOM.screenWelcome);
  });
  
  // Keyboard accessibility helper
  document.addEventListener("keydown", handleKeyboardControls);
}

// Keyboard controls handler
function handleKeyboardControls(e) {
  // Ignore modifier key combinations (Ctrl+A, Alt+A, Cmd+A)
  if (e.ctrlKey || e.altKey || e.metaKey) return;
  
  // Allow key repeat ONLY for ArrowRight and ArrowLeft keys
  if (e.repeat && !["ArrowRight", "ArrowLeft"].includes(e.key)) return;

  // Ignore quiz shortcuts while the image lightbox is open
  if (DOM.lightboxModal && !DOM.lightboxModal.classList.contains("hide")) return;

  // Only register inputs when the quiz screen is active
  if (!DOM.screenQuiz.classList.contains("active")) return;
  
  const key = e.key;
  const keyLower = key.toLowerCase();
  
  // Numbers 1-4 or Letters A-D selects options
  if (["1", "2", "3", "4"].includes(key)) {
    const idx = parseInt(key) - 1;
    const optionButtons = DOM.optionsGrid.querySelectorAll(".option-btn");
    if (optionButtons[idx] && !optionButtons[idx].disabled) {
      optionButtons[idx].click();
    }
  } else if (["a", "b", "c", "d"].includes(keyLower)) {
    const idx = ["a", "b", "c", "d"].indexOf(keyLower);
    const optionButtons = DOM.optionsGrid.querySelectorAll(".option-btn");
    if (optionButtons[idx] && !optionButtons[idx].disabled) {
      optionButtons[idx].click();
    }
  }
  
  // Arrow keys / Space / Enter
  if (key === "Enter") {
    if (!DOM.btnQuizCheck.classList.contains("hide") && !DOM.btnQuizCheck.disabled) {
      e.preventDefault();
      DOM.btnQuizCheck.click();
    }
  } else if (key === "ArrowRight") {
    if (!DOM.btnQuizNext.classList.contains("hide")) {
      DOM.btnQuizNext.click();
    } else if (!DOM.btnQuizSubmit.classList.contains("hide")) {
      // Don't auto submit on ArrowRight to prevent accidents, just focus
      DOM.btnQuizSubmit.focus();
    }
  } else if (key === "ArrowLeft") {
    DOM.btnQuizPrev.click();
  } else if (key.toLowerCase() === "f") {
    DOM.btnFlagQuestion.click();
  }
}

// ==========================================================================
// SHUFFLE / RANDOMIZATION HELPER (CRYPTO RANDOM)
// ==========================================================================
function getRandomInt(max) {
  if (max <= 0) return 0;
  if (window.crypto && window.crypto.getRandomValues) {
    const randomArray = new Uint32Array(1);
    const maxUint32 = 4294967296;
    const limit = maxUint32 - (maxUint32 % max);
    let val;
    do {
      window.crypto.getRandomValues(randomArray);
      val = randomArray[0];
    } while (val >= limit);
    return val % max;
  }
  // Fallback to Math.random
  return Math.floor(Math.random() * max);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = getRandomInt(i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// ==========================================================================
// QUIZ CORE RUNTIME
// ==========================================================================
function startQuiz() {
  // Read Configurations
  const modeRadio = document.querySelector('input[name="quiz-mode"]:checked');
  appState.selectedMode = modeRadio ? modeRadio.value : "practice";
  appState.shuffleQuestions = DOM.shuffleQuestionsCheckbox.checked;
  appState.shuffleOptions = DOM.shuffleOptionsCheckbox.checked;
  appState.onTheFly = DOM.onTheFlyCheckbox.checked;
  
  let baseQuestions = [...appState.rawQuestions];
  
  // 1. Shuffle ENTIRE question bank using crypto random if shuffle questions is enabled
  if (appState.shuffleQuestions) {
    shuffleArray(baseQuestions);
  }
  
  // 2. Apply question limit (Exam Mode only) after full-bank shuffle
  if (appState.selectedMode === "exam" && DOM.questionLimitSelect) {
    const limitVal = DOM.questionLimitSelect.value;
    if (limitVal !== "all") {
      const limit = parseInt(limitVal);
      baseQuestions = baseQuestions.slice(0, limit);
    }
  }
  
  // 3. Load questions
  appState.quizQuestions = baseQuestions;
  
  // 4. Shuffle Options within each question if configured
  appState.quizQuestions = appState.quizQuestions.map(q => {
    // Clone choices array
    let choices = [...q.options];
    if (appState.shuffleOptions) {
      shuffleArray(choices);
    }
    return { ...q, options: choices };
  });
  
  // Initialize user answers state arrays
  const totalQ = appState.quizQuestions.length;
  appState.userAnswers = new Array(totalQ).fill(null);
  appState.flaggedQuestions = new Array(totalQ).fill(false);
  appState.checkedAnswers = new Array(totalQ).fill(false);
  appState.currentIndex = 0;
  appState.timeSpent = 0;
  appState.isTimeUp = false;
  
  // Set up timer variables
  if (appState.selectedMode === "exam") {
    const minutes = parseInt(DOM.timerLimitSelect.value);
    appState.timeRemaining = minutes * 60;
    appState.totalExamTime = minutes * 60;
    DOM.quizTimer.classList.remove("warning");
  }
  
  // Reset and trigger timer interval
  clearInterval(appState.timerInterval);
  updateTimerUI();
  appState.timerInterval = setInterval(tickTimer, 1000);
  
  // Setup Quiz screen components
  updateLanguageUI();
  updateMapLegend();
  buildQuestionMap();
  renderQuestion(0, true);
  showScreen(DOM.screenQuiz);
}

// Timer clock updates
function tickTimer() {
  appState.timeSpent++;
  
  if (appState.selectedMode === "exam") {
    appState.timeRemaining--;
    
    // Warning state when timer is low (< 60s)
    if (appState.timeRemaining <= 60) {
      DOM.quizTimer.classList.add("warning");
    }
    
    if (appState.timeRemaining <= 0) {
      appState.isTimeUp = true;
      clearInterval(appState.timerInterval);
      const lang = appState.language || "en";
      alert(TRANSLATIONS[lang].time_up);
      submitQuiz();
      return;
    }
  }
  
  updateTimerUI();
}

function updateTimerUI() {
  let displaySeconds = 0;
  if (appState.selectedMode === "exam") {
    displaySeconds = appState.timeRemaining;
  } else {
    displaySeconds = appState.timeSpent;
  }
  
  const m = Math.floor(displaySeconds / 60).toString().padStart(2, "0");
  const s = (displaySeconds % 60).toString().padStart(2, "0");
  DOM.timerText.textContent = `${m}:${s}`;
}

// Render Question to layout
function renderQuestion(index, shouldScroll = false) {
  if (index < 0 || index >= appState.quizQuestions.length) return;
  
  appState.currentIndex = index;
  const question = appState.quizQuestions[index];
  const lang = appState.language || "en";
  
  // Label and progress metrics
  DOM.quizProgressLabel.textContent = lang === "vi"
    ? `Câu hỏi ${index + 1}/${appState.quizQuestions.length}`
    : `Question ${index + 1}/${appState.quizQuestions.length}`;
  const percent = ((index + 1) / appState.quizQuestions.length) * 100;
  DOM.quizProgressBar.style.width = `${percent}%`;
  
  // Translate badge
  const badge = DOM.screenQuiz.querySelector(".question-badge");
  if (badge) {
    badge.textContent = TRANSLATIONS[lang].badge_multiple_choice;
  }
  
  // Flag states styling
  if (appState.flaggedQuestions[index]) {
    DOM.btnFlagQuestion.classList.add("flagged");
    DOM.btnFlagQuestion.querySelector(".flag-text").textContent = TRANSLATIONS[lang].flagged;
  } else {
    DOM.btnFlagQuestion.classList.remove("flagged");
    DOM.btnFlagQuestion.querySelector(".flag-text").textContent = TRANSLATIONS[lang].flag_question;
  }
  
  // Text content
  DOM.questionText.textContent = `${index + 1}. ${question.question}`;
  
  // Handle Question Image & 2-column Layout Space Allocation
  const questionContainer = DOM.screenQuiz.querySelector(".question-container");
  if (question.img && question.img.trim() !== "") {
    if (questionContainer) questionContainer.classList.add("has-image");
    if (DOM.questionImageContainer) {
      DOM.questionImageContainer.classList.remove("hide");
      DOM.questionImageContainer.innerHTML = "";
      const imgEl = document.createElement("img");
      imgEl.src = question.img;
      imgEl.className = "question-img-el";
      imgEl.alt = "Question Diagram";
      imgEl.title = "Click to view larger image";
      imgEl.style.cursor = "zoom-in";
      imgEl.addEventListener("click", (e) => openLightbox(question.img, e.currentTarget));
      DOM.questionImageContainer.appendChild(imgEl);
    }
  } else {
    if (questionContainer) questionContainer.classList.remove("has-image");
    if (DOM.questionImageContainer) {
      DOM.questionImageContainer.classList.add("hide");
      DOM.questionImageContainer.innerHTML = "";
    }
  }
  
  // Build and render Choice Options
  DOM.optionsGrid.innerHTML = "";
  const selectedAnswer = appState.userAnswers[index];
  const isChecked = appState.checkedAnswers[index];
  
  question.options.forEach((opt, arrayIdx) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.dataset.optionId = opt.id;
    
    const indexSpan = document.createElement("span");
    indexSpan.className = "option-index";
    // Standard visual alphabet ordering: always display A, B, C, D top-to-bottom
    const indexLetters = ["A", "B", "C", "D"];
    indexSpan.textContent = indexLetters[arrayIdx] || (arrayIdx + 1);
    
    const textSpan = document.createElement("span");
    textSpan.className = "option-text";
    textSpan.textContent = opt.text;
    
    btn.appendChild(indexSpan);
    btn.appendChild(textSpan);
    
    // Check click selection matching
    if (selectedAnswer === opt.id) {
      btn.classList.add("selected");
    }
    
    // PRACTICE MODE (ON-THE-FLY FEEDBACK DISPLAY)
    if (appState.selectedMode === "practice" && appState.onTheFly) {
      if (isChecked) {
        btn.disabled = true; // lock options after click selection
        
        // Show correct / incorrect colors
        if (opt.id === question.answer) {
          btn.classList.add("correct");
        } else if (selectedAnswer === opt.id) {
          btn.classList.add("incorrect");
        }
      }
    }
    
    btn.addEventListener("click", () => selectOption(opt.id));
    DOM.optionsGrid.appendChild(btn);
  });
  
  // Render Practice Mode Explanation Block
  if (appState.selectedMode === "practice" && appState.onTheFly && isChecked) {
    DOM.explanationBox.classList.remove("hide");
    
    // Status text (Correct / Incorrect)
    const isCorrect = selectedAnswer === question.answer;
    DOM.explanationBox.className = "explanation-box card glass " + (isCorrect ? "success" : "error");
    DOM.explanationStatus.textContent = isCorrect 
      ? TRANSLATIONS[lang].correct_explanation 
      : TRANSLATIONS[lang].incorrect_explanation;
    
    // Resolve explanation texts
    let expText = question.explanation || "";
    
    // Check if options have unique explanations
    const selectedOptionObj = question.options.find(o => o.id === selectedAnswer);
    const correctOptionObj = question.options.find(o => o.id === question.answer);
    
    let optExplanation = "";
    if (selectedOptionObj && selectedOptionObj.explanation) {
      optExplanation += `<strong>${TRANSLATIONS[lang].your_option}:</strong> ${selectedOptionObj.explanation}<br>`;
    }
    if (!isCorrect && correctOptionObj && correctOptionObj.explanation) {
      optExplanation += `<strong>${TRANSLATIONS[lang].correct_option}:</strong> ${correctOptionObj.explanation}<br>`;
    }
    
    if (optExplanation) {
      expText = optExplanation + (expText ? `<br>${expText}` : "");
    }
    
    DOM.explanationText.innerHTML = expText || TRANSLATIONS[lang].no_explanation;
  } else {
    DOM.explanationBox.classList.add("hide");
  }
  
  // Navigation controls visibility & disabled conditions
  DOM.btnQuizPrev.disabled = index === 0;
  if (DOM.btnQuizPrevMobile) DOM.btnQuizPrevMobile.disabled = index === 0;
  
  const isLast = index === appState.quizQuestions.length - 1;
  if (isLast) {
    DOM.btnQuizNext.classList.add("hide");
    if (DOM.btnQuizNextMobile) DOM.btnQuizNextMobile.classList.add("hide");
  } else {
    DOM.btnQuizNext.classList.remove("hide");
    if (DOM.btnQuizNextMobile) DOM.btnQuizNextMobile.classList.remove("hide");
  }
  
  // Manage Check Answer button visibility
  DOM.btnQuizCheck.classList.add("hide");
  DOM.btnQuizCheck.disabled = true;
  if (appState.selectedMode === "practice" && appState.onTheFly) {
    if (!isChecked) {
      DOM.btnQuizCheck.classList.remove("hide");
      if (selectedAnswer !== null) {
        DOM.btnQuizCheck.disabled = false;
      }
      DOM.btnQuizCheck.disabled = (selectedAnswer === null);
    } else {
      DOM.btnQuizCheck.classList.add("hide");
      DOM.btnQuizCheck.disabled = true;
    }
  } else {
    DOM.btnQuizCheck.classList.add("hide");
    DOM.btnQuizCheck.disabled = true;
  }
  
  // Sidebar submit button is always visible during active quiz
  DOM.btnQuizSubmit.classList.remove("hide");
  
  // Active Question Map button highlights
  const mapButtons = DOM.questionMapGrid.querySelectorAll(".map-grid-btn");
  mapButtons.forEach(btn => btn.classList.remove("active"));
  const currentMapBtn = mapButtons[index];
  if (currentMapBtn) {
    currentMapBtn.classList.add("active");
    if (shouldScroll) {
      currentMapBtn.scrollIntoView({ behavior: "smooth", block: "nearest" });
      scrollQuestionMapToActive(index);
    }
  }
}

// Scroll question map grid internally without moving the document window
function scrollQuestionMapToActive(index) {
  const grid = DOM.questionMapGrid;
  if (!grid) return;
  const currentMapBtn = grid.querySelectorAll(".map-grid-btn")[index];
  if (!currentMapBtn) return;
  
  // Only scroll internally inside the grid if the grid container itself is scrollable (e.g. desktop sidebar)
  // Never scroll document window
  if (grid.scrollHeight > grid.clientHeight) {
    const topPos = currentMapBtn.offsetTop - grid.offsetTop;
    grid.scrollTo({
      top: topPos - grid.clientHeight / 2 + currentMapBtn.clientHeight / 2,
      behavior: "smooth"
    });
  }
}

// Option selection trigger
function selectOption(optionId) {
  const idx = appState.currentIndex;
  
  // Practice Mode on-the-fly feedback is locked once checked
  if (appState.selectedMode === "practice" && appState.onTheFly && appState.checkedAnswers[idx]) {
    return;
  }
  
  // Toggle deselect: clicking the already-selected option deselects it
  if (appState.userAnswers[idx] === optionId) {
    appState.userAnswers[idx] = null;
  } else {
    appState.userAnswers[idx] = optionId;
  }
  
  // Re-render display layout and sidebar updates
  renderQuestion(idx, false);
  const currentAnswer = appState.userAnswers[idx];
  
  // Update option button styles in-place without rebuilding DOM
  const optionButtons = DOM.optionsGrid.querySelectorAll(".option-btn");
  optionButtons.forEach(btn => {
    const isSelected = currentAnswer !== null && String(btn.dataset.optionId) === String(currentAnswer);
    btn.classList.toggle("selected", isSelected);
  });
  
  // Update Practice Mode Check Answer button state
  if (appState.selectedMode === "practice" && appState.onTheFly) {
    DOM.btnQuizCheck.disabled = (currentAnswer === null);
  }
  
  // Update Question Map sidebar node
  updateQuestionMapNode(idx);
}

// Check answer trigger
function checkAnswer() {
  const idx = appState.currentIndex;
  if (appState.userAnswers[idx] !== null) {
    appState.checkedAnswers[idx] = true;
    renderQuestion(idx, false);
    updateQuestionMapNode(idx);
  }
}

// Navigation back and forth
function navigateQuestion(direction) {
  const nextIdx = appState.currentIndex + direction;
  if (nextIdx < 0 || nextIdx >= appState.quizQuestions.length) return;
  
  renderQuestion(nextIdx, true);
  
  // Keep question visible at the top on mobile view if scrolled
  if (window.innerWidth <= 768) {
    const nav = DOM.screenQuiz.querySelector(".quiz-navbar");
    if (nav) {
      const topOffset = nav.getBoundingClientRect().top + window.scrollY;
      if (window.scrollY > topOffset) {
        window.scrollTo({ top: topOffset - 12, behavior: "smooth" });
      }
    }
  }
}

// Bookmark / Flag toggle
function toggleFlag() {
  const idx = appState.currentIndex;
  const lang = appState.language || "en";
  appState.flaggedQuestions[idx] = !appState.flaggedQuestions[idx];
  
  // Rerender flag button display using current language
  if (appState.flaggedQuestions[idx]) {
    DOM.btnFlagQuestion.classList.add("flagged");
    DOM.btnFlagQuestion.querySelector(".flag-text").textContent = TRANSLATIONS[lang].flagged;
  } else {
    DOM.btnFlagQuestion.classList.remove("flagged");
    DOM.btnFlagQuestion.querySelector(".flag-text").textContent = TRANSLATIONS[lang].flag_question;
  }
  
  updateQuestionMapNode(idx);
}

// ==========================================================================
// QUESTION MAP (SIDEBAR GRID) BUILD & SYNC
// ==========================================================================
function buildQuestionMap() {
  DOM.questionMapGrid.innerHTML = "";
  
  const FLAG_SVG = `<svg class="map-flag-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
  
  appState.quizQuestions.forEach((_, idx) => {
    const btn = document.createElement("button");
    btn.className = "map-grid-btn";
    btn.setAttribute("title", `Jump to Question ${idx + 1}`);
    
    const numSpan = document.createElement("span");
    numSpan.textContent = idx + 1;
    btn.appendChild(numSpan);
    
    // Flag icon (hidden by default, shown via CSS when .flagged)
    const flagWrap = document.createElement("span");
    flagWrap.className = "map-flag-wrap";
    flagWrap.innerHTML = FLAG_SVG;
    btn.appendChild(flagWrap);
    
    btn.addEventListener("click", () => renderQuestion(idx, true));
    btn.addEventListener("click", () => {
      renderQuestion(idx, true);
      if (window.innerWidth <= 900) {
        const nav = DOM.screenQuiz.querySelector(".quiz-navbar");
        if (nav) {
          const topOffset = nav.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({ top: topOffset - 12, behavior: "smooth" });
        }
      }
    });
    
    DOM.questionMapGrid.appendChild(btn);
    syncQuestionMapNodeStyle(btn, idx);
  });
}

function updateQuestionMapNode(index) {
  const mapButtons = DOM.questionMapGrid.querySelectorAll(".map-grid-btn");
  const btn = mapButtons[index];
  if (btn) {
    syncQuestionMapNodeStyle(btn, index);
  }
}

function syncQuestionMapNodeStyle(btn, idx) {
  const isAnswered = appState.userAnswers[idx] !== null;
  const isFlagged = appState.flaggedQuestions[idx];
  const question = appState.quizQuestions[idx];
  const isChecked = appState.checkedAnswers[idx];
  
  // Reset classes
  btn.className = "map-grid-btn";
  if (idx === appState.currentIndex) {
    btn.classList.add("active");
  }
  
  // Add flagged circle marker helper
  if (isFlagged) {
    btn.classList.add("flagged");
  }
  
  // Apply answer styling conditions
  if (isAnswered) {
    if (appState.selectedMode === "practice" && appState.onTheFly) {
      if (isChecked) {
        const isCorrect = appState.userAnswers[idx] === question.answer;
        btn.classList.add(isCorrect ? "correct" : "incorrect");
      }
    } else {
      btn.classList.add("answered");
    }
  }
}

// Quit active session
function quitQuiz() {
  const lang = appState.language || "en";
  if (confirm(TRANSLATIONS[lang].confirm_quit)) {
    clearInterval(appState.timerInterval);
    transitionToSetup();
  }
}

// ==========================================================================
// SCORING & FINAL RESULTS SCREEN
// ==========================================================================
function submitQuiz() {
  clearInterval(appState.timerInterval);
  
  let correctCount = 0;
  appState.quizQuestions.forEach((q, idx) => {
    if (appState.userAnswers[idx] === q.answer) {
      correctCount++;
    }
  });
  
  const totalQuestions = appState.quizQuestions.length;
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  
  // Verdict details — read pass mark from dropdown (default 75)
  const passMark = DOM.passMarkSelect ? parseInt(DOM.passMarkSelect.value) || 75 : 75;
  const isPass = scorePercent >= passMark;
  const lang = appState.language || "en";
  DOM.resultVerdict.textContent = isPass ? TRANSLATIONS[lang].results_pass : TRANSLATIONS[lang].results_fail;
  DOM.resultVerdict.className = "result-verdict " + (isPass ? "pass" : "fail");
  
  // Text details
  DOM.resultPercent.textContent = `${scorePercent}%`;
  DOM.resultRatio.textContent = `${correctCount} / ${totalQuestions}`;
  
  const currentSubjectObj = SUBJECTS.find(s => s.id === appState.activeSubjectId);
  const displayName = currentSubjectObj ? currentSubjectObj.name : appState.bankName;
  DOM.resultStatSubject.textContent = displayName;
  
  // Show the selected pass mark in the results stat
  const passMarkStatEl = document.querySelector(".stat-value[data-stat='pass-mark']");
  if (passMarkStatEl) passMarkStatEl.textContent = `${passMark}%`;
  
  // Format spent time m:s
  const mins = Math.floor(appState.timeSpent / 60).toString().padStart(2, "0");
  const secs = (appState.timeSpent % 60).toString().padStart(2, "0");
  DOM.resultStatTime.textContent = `${mins}:${secs}`;
  
  // Animate Radial SVG ring loader details
  // Circle circumference is exactly 2 * PI * r = 2 * 3.14159 * 54 = 339.292
  const circ = 339.292;
  const offset = circ - (circ * scorePercent) / 100;
  DOM.ringFill.style.strokeDasharray = `${circ}`;
  DOM.ringFill.style.strokeDashoffset = `${offset}`;
  
  // Save session record to LocalStorage
  saveQuizToHistory({
    subjectId: appState.activeSubjectId,
    bankName: displayName,
    mode: appState.selectedMode,
    isPass: isPass,
    scorePercent: scorePercent,
    correctCount: correctCount,
    totalQuestions: totalQuestions,
    timeSpent: appState.timeSpent,
    passMark: passMark,
    quizQuestions: appState.quizQuestions,
    userAnswers: appState.userAnswers,
    flaggedQuestions: appState.flaggedQuestions,
    timestamp: new Date().toISOString()
  });
  
  // Build Accordion question review list
  const activeFilter = appState.activeReviewFilter || "all";
  buildReviewAccordion(activeFilter);
  setupReviewFilters();
  
  showScreen(DOM.screenResults);
}

// Review filters click triggers
function setupReviewFilters() {
  let correct = 0;
  let incorrect = 0;
  let flagged = 0;
  
  appState.quizQuestions.forEach((q, idx) => {
    const isCorrect = appState.userAnswers[idx] === q.answer;
    if (isCorrect) correct++;
    else if (appState.userAnswers[idx] !== null) incorrect++; // only count answered incorrect
    
    // Also include unanswered in incorrect for final grades
    if (appState.userAnswers[idx] === null) incorrect++; 
    
    if (appState.flaggedQuestions[idx]) flagged++;
  });
  
  DOM.countAll.textContent = appState.quizQuestions.length;
  DOM.countCorrect.textContent = correct;
  DOM.countIncorrect.textContent = incorrect;
  DOM.countFlagged.textContent = flagged;
  
  // Event listeners on review filters tab pills
  const filters = DOM.reviewFilters.querySelectorAll(".filter-pill");
  filters.forEach(pill => {
    // Remove existing event listeners to avoid duplicates
    const newPill = pill.cloneNode(true);
    pill.parentNode.replaceChild(newPill, pill);
    
    newPill.addEventListener("click", () => {
      DOM.reviewFilters.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
      newPill.classList.add("active");
      const selectedFilter = newPill.getAttribute("data-filter") || "all";
      appState.activeReviewFilter = selectedFilter;
      buildReviewAccordion(selectedFilter);
    });
  });
}

// Accordion list builders
function buildReviewAccordion(filter = "all") {
  DOM.accordionList.innerHTML = "";
  
  appState.quizQuestions.forEach((q, idx) => {
    const userAnswer = appState.userAnswers[idx];
    const isCorrect = userAnswer === q.answer;
    const isFlagged = appState.flaggedQuestions[idx];
    
    // Filter matching conditions
    if (filter === "correct" && !isCorrect) return;
    if (filter === "incorrect" && isCorrect) return;
    if (filter === "flagged" && !isFlagged) return;
    
    const item = document.createElement("div");
    item.className = "accordion-item " + (isCorrect ? "correct-item" : "incorrect-item");
    
    // Header
    const header = document.createElement("div");
    header.className = "accordion-header";
    
    const titleBox = document.createElement("div");
    titleBox.className = "accordion-title-box";
    
    const qNum = document.createElement("span");
    qNum.className = "accordion-q-num";
    qNum.textContent = `Q${idx + 1}`;
    
    const qText = document.createElement("span");
    qText.className = "accordion-q-text";
    qText.textContent = q.question;
    
    titleBox.appendChild(qNum);
    titleBox.appendChild(qText);
    
    const metaBox = document.createElement("div");
    metaBox.className = "accordion-meta-box";
    
    const lang = appState.language || "en";
    
    if (isFlagged) {
      const flagLabel = document.createElement("span");
      flagLabel.className = "verdict-badge";
      flagLabel.style.backgroundColor = "var(--color-flag-bg)";
      flagLabel.style.color = "var(--color-flag)";
      flagLabel.innerHTML = `<svg class="accordion-flag-svg" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>`;
      metaBox.appendChild(flagLabel);
    }
    
    const verdict = document.createElement("span");
    verdict.className = "verdict-badge";
    let verdictText = TRANSLATIONS[lang].incorrect;
    if (isCorrect) {
      verdictText = lang === "vi" ? "Đúng" : "Correct";
    } else if (userAnswer === null) {
      verdictText = TRANSLATIONS[lang].skipped;
    } else {
      verdictText = lang === "vi" ? "Sai" : "Incorrect";
    }
    verdict.textContent = verdictText;
    metaBox.appendChild(verdict);
    
    const arrow = document.createElement("span");
    arrow.className = "accordion-arrow";
    arrow.innerHTML = `<svg class="accordion-chevron" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
    metaBox.appendChild(arrow);
    
    header.appendChild(titleBox);
    header.appendChild(metaBox);
    
    // Content body
    const content = document.createElement("div");
    content.className = "accordion-content";
    
    const body = document.createElement("div");
    body.className = "accordion-body";
    
    const questionFull = document.createElement("p");
    questionFull.className = "review-question-full";
    questionFull.textContent = q.question;
    body.appendChild(questionFull);
    
    // Options inside body review list
    const optionsList = document.createElement("div");
    optionsList.className = "review-options-list";
    
    const indexLetters = ["A", "B", "C", "D"];
    q.options.forEach((opt, optIdxVal) => {
      const optDiv = document.createElement("div");
      optDiv.className = "review-option";
      
      const optIdx = document.createElement("span");
      optIdx.className = "review-option-idx";
      optIdx.textContent = indexLetters[optIdxVal] || (optIdxVal + 1);
      
      const optTxt = document.createElement("span");
      optTxt.textContent = opt.text;
      
      optDiv.appendChild(optIdx);
      optDiv.appendChild(optTxt);
      
      // Color-coding option cards
      if (opt.id === q.answer) {
        optDiv.classList.add("correct");
      } else if (userAnswer === opt.id) {
        optDiv.classList.add("incorrect");
      }
      
      optionsList.appendChild(optDiv);
    });
    body.appendChild(optionsList);
    
    // Review explanation block
    const explanationDiv = document.createElement("div");
    explanationDiv.className = "review-explanation";
    
    const expTitle = document.createElement("div");
    expTitle.className = "explanation-title";
    expTitle.textContent = TRANSLATIONS[lang].explanation;
    
    const expText = document.createElement("div");
    let explanationContent = q.explanation || "";
    
    // Include choice descriptions
    const userOptObj = q.options.find(o => o.id === userAnswer);
    const correctOptObj = q.options.find(o => o.id === q.answer);
    
    let optExplanationStr = "";
    if (userOptObj && userOptObj.explanation) {
      optExplanationStr += `<strong>${TRANSLATIONS[lang].your_option}:</strong> ${userOptObj.explanation}<br>`;
    }
    if (!isCorrect && correctOptObj && correctOptObj.explanation) {
      optExplanationStr += `<strong>${TRANSLATIONS[lang].correct_option}:</strong> ${correctOptObj.explanation}<br>`;
    }
    
    if (optExplanationStr) {
      explanationContent = optExplanationStr + (explanationContent ? `<br>${explanationContent}` : "");
    }
    
    expText.innerHTML = explanationContent || TRANSLATIONS[lang].no_explanation;
    
    explanationDiv.appendChild(expTitle);
    explanationDiv.appendChild(expText);
    body.appendChild(explanationDiv);
    
    content.appendChild(body);
    item.appendChild(header);
    item.appendChild(content);
    
    // Toggle accordion state
    header.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      
      // Close other accordions in list for clean visuals
      DOM.accordionList.querySelectorAll(".accordion-item").forEach(other => {
        other.classList.remove("open");
        other.querySelector(".accordion-content").style.maxHeight = null;
      });
      
      if (!isOpen) {
        item.classList.add("open");
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
    
    DOM.accordionList.appendChild(item);
  });
}

// ==========================================================================
// INTERACTIVE IMAGE LIGHTBOX (PAN & SCROLL ZOOM)
// ==========================================================================
let lightboxState = {
  scale: 1,
  panX: 0,
  panY: 0,
  isDragging: false,
  startX: 0,
  startY: 0
};

let lastActiveElement = null;

function initLightbox() {
  if (!DOM.lightboxModal) return;

  // Prevent default browser drag ghost image preview
  if (DOM.lightboxImg) {
    DOM.lightboxImg.addEventListener("dragstart", (e) => e.preventDefault());
  }

  // Close triggers
  if (DOM.btnLightboxClose) {
    DOM.btnLightboxClose.addEventListener("click", closeLightbox);
  }
  
  const overlay = DOM.lightboxModal.querySelector(".lightbox-overlay");
  if (overlay) {
    overlay.addEventListener("click", closeLightbox);
  }
  
  // Close on Escape key press & trap Tab key inside modal
  document.addEventListener("keydown", (e) => {
    if (DOM.lightboxModal.classList.contains("hide")) return;
    if (e.key === "Escape") {
      closeLightbox();
    } else if (e.key === "Tab") {
      const focusable = DOM.lightboxModal.querySelectorAll("button, [tabindex]:not([tabindex='-1'])");
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // Mouse wheel zoom (center-based)
  if (DOM.lightboxViewport) {
    DOM.lightboxViewport.addEventListener("wheel", (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
      const newScale = Math.min(Math.max(1, lightboxState.scale * zoomFactor), 4);

      if (newScale !== lightboxState.scale) {
        lightboxState.scale = newScale;
        if (newScale === 1) {
          lightboxState.panX = 0;
          lightboxState.panY = 0;
        }
        clampLightboxPan();
        applyLightboxTransform();
      }
    }, { passive: false });

    // Drag / Pan mouse events
    DOM.lightboxViewport.addEventListener("mousedown", (e) => {
      if (lightboxState.scale > 1) {
        lightboxState.isDragging = true;
        lightboxState.startX = e.clientX - lightboxState.panX;
        lightboxState.startY = e.clientY - lightboxState.panY;
        if (DOM.lightboxImg) DOM.lightboxImg.classList.add("is-panning");
      }
    });

    window.addEventListener("mousemove", (e) => {
      if (lightboxState.isDragging && lightboxState.scale > 1) {
        lightboxState.panX = e.clientX - lightboxState.startX;
        lightboxState.panY = e.clientY - lightboxState.startY;
        clampLightboxPan();
        applyLightboxTransform();
      }
    });

    window.addEventListener("mouseup", () => {
      lightboxState.isDragging = false;
      if (DOM.lightboxImg) DOM.lightboxImg.classList.remove("is-panning");
    });
  }
}

function clampLightboxPan() {
  if (lightboxState.scale <= 1) {
    lightboxState.panX = 0;
    lightboxState.panY = 0;
    return;
  }
  if (!DOM.lightboxViewport) return;
  const rect = DOM.lightboxViewport.getBoundingClientRect();
  const maxPanX = (rect.width * (lightboxState.scale - 1)) / 2;
  const maxPanY = (rect.height * (lightboxState.scale - 1)) / 2;
  lightboxState.panX = Math.min(Math.max(-maxPanX, lightboxState.panX), maxPanX);
  lightboxState.panY = Math.min(Math.max(-maxPanY, lightboxState.panY), maxPanY);
}

function openLightbox(imgSrc, triggerEl = null) {
  if (!DOM.lightboxModal || !DOM.lightboxImg) return;
  lastActiveElement = triggerEl || document.activeElement;
  DOM.lightboxImg.src = imgSrc;
  lightboxState = { scale: 1, panX: 0, panY: 0, isDragging: false, startX: 0, startY: 0 };
  applyLightboxTransform();
  DOM.lightboxModal.classList.remove("hide");
  DOM.lightboxModal.setAttribute("aria-hidden", "false");
  if (DOM.btnLightboxClose) DOM.btnLightboxClose.focus();
}

function closeLightbox() {
  if (!DOM.lightboxModal) return;
  DOM.lightboxModal.classList.add("hide");
  DOM.lightboxModal.setAttribute("aria-hidden", "true");
  if (lastActiveElement && typeof lastActiveElement.focus === "function") {
    lastActiveElement.focus();
  }
}

function applyLightboxTransform() {
  if (DOM.lightboxImg) {
    DOM.lightboxImg.style.transform = `translate(${lightboxState.panX}px, ${lightboxState.panY}px) scale(${lightboxState.scale})`;
  }
}
// ==========================================================================
// SESSION HISTORY & BATCH DELETION MANAGEMENT
// ==========================================================================
const HISTORY_STORAGE_KEY = "thequizzer_history_v1";

let historyState = {
  isSelectionMode: false,
  selectedIndices: new Set()
};

function initHistory() {
  if (DOM.historySelectBtn) {
    DOM.historySelectBtn.addEventListener("click", () => enterHistorySelectionMode());
  }
  if (DOM.btnSelectAll) {
    DOM.btnSelectAll.addEventListener("click", () => selectAllHistory());
  }
  if (DOM.btnUnselectAll) {
    DOM.btnUnselectAll.addEventListener("click", () => unselectAllHistory());
  }
  if (DOM.btnCancelSelect) {
    DOM.btnCancelSelect.addEventListener("click", () => exitHistorySelectionMode());
  }
  if (DOM.btnStickyCancel) {
    DOM.btnStickyCancel.addEventListener("click", () => exitHistorySelectionMode());
  }
  if (DOM.btnStickyDelete) {
    DOM.btnStickyDelete.addEventListener("click", () => deleteSelectedHistory());
  }
  renderHistoryGrid();
}

function enterHistorySelectionMode() {
  historyState.isSelectionMode = true;
  historyState.selectedIndices.clear();
  if (DOM.historySelectBtn) DOM.historySelectBtn.classList.add("hide");
  if (DOM.historySelectActions) DOM.historySelectActions.classList.remove("hide");
  renderHistoryGrid();
  updateStickyBarUI();
}

function exitHistorySelectionMode() {
  historyState.isSelectionMode = false;
  historyState.selectedIndices.clear();
  if (DOM.historySelectBtn) DOM.historySelectBtn.classList.remove("hide");
  if (DOM.historySelectActions) DOM.historySelectActions.classList.add("hide");
  if (DOM.historyStickyBar) DOM.historyStickyBar.classList.add("hide");
  renderHistoryGrid();
}

function selectAllHistory() {
  const history = getStoredHistory();
  historyState.selectedIndices.clear();
  history.forEach((_, idx) => historyState.selectedIndices.add(idx));
  renderHistoryGrid();
  updateStickyBarUI();
}

function unselectAllHistory() {
  historyState.selectedIndices.clear();
  renderHistoryGrid();
  updateStickyBarUI();
}

function updateStickyBarUI() {
  if (!DOM.historyStickyBar) return;
  const count = historyState.selectedIndices.size;
  const lang = appState.language || "en";

  if (historyState.isSelectionMode && count > 0) {
    DOM.historyStickyBar.classList.remove("hide");
    if (DOM.stickyCountText) {
      DOM.stickyCountText.textContent = lang === "vi" 
        ? `${count} Đã chọn` 
        : `${count} Selected`;
    }
  } else {
    DOM.historyStickyBar.classList.add("hide");
  }
}

function deleteSelectedHistory() {
  const count = historyState.selectedIndices.size;
  if (count === 0) return;

  const lang = appState.language || "en";
  const confirmMsg = lang === "vi"
    ? `Bạn có chắc chắn muốn xóa ${count} mục lịch sử đã chọn?`
    : `Are you sure you want to delete ${count} selected history item(s)?`;

  if (confirm(confirmMsg)) {
    const history = getStoredHistory();
    const remainingHistory = history.filter((_, idx) => !historyState.selectedIndices.has(idx));
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(remainingHistory));
    } catch (e) {
      console.warn("Error updating history in localStorage", e);
    }
    exitHistorySelectionMode();
  }
}

function getStoredHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveQuizToHistory(sessionRecord) {
  let history = getStoredHistory();
  
  // Clean minimal questions payload
  const cleanQuestions = (sessionRecord.quizQuestions || []).map(q => ({
    id: q.id,
    question: q.question,
    options: q.options,
    answer: q.answer,
    explanation: q.explanation,
    img: q.img
  }));

  const minimalRecord = { ...sessionRecord, quizQuestions: cleanQuestions };
  history.unshift(minimalRecord);
  history = history.slice(0, 30);

  let saved = false;
  while (history.length > 0 && !saved) {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
      saved = true;
    } catch (e) {
      history.pop(); // Remove oldest entry on quota error and retry
    }
  }

  if (!saved) {
    console.warn("Unable to save session history to localStorage due to quota limits");
  }

  renderHistoryGrid();
}

function renderHistoryGrid() {
  if (!DOM.historyList) return;
  const history = getStoredHistory();
  const lang = appState.language || "en";
  DOM.historyList.innerHTML = "";

  if (history.length === 0) {
    if (DOM.historySelectBtn) DOM.historySelectBtn.classList.add("hide");
    if (DOM.historySelectActions) DOM.historySelectActions.classList.add("hide");
    if (DOM.historyStickyBar) DOM.historyStickyBar.classList.add("hide");
    historyState.isSelectionMode = false;
    DOM.historyList.innerHTML = `<p class="history-empty-text" data-i18n="history_empty">${TRANSLATIONS[lang].history_empty}</p>`;
    return;
  }

  if (!historyState.isSelectionMode) {
    if (DOM.historySelectBtn) DOM.historySelectBtn.classList.remove("hide");
    if (DOM.historySelectActions) DOM.historySelectActions.classList.add("hide");
  } else {
    if (DOM.historySelectBtn) DOM.historySelectBtn.classList.add("hide");
    if (DOM.historySelectActions) DOM.historySelectActions.classList.remove("hide");
  }

  history.forEach((record, index) => {
    const btn = document.createElement("button");
    const isSelected = historyState.selectedIndices.has(index);
    btn.className = "history-item-btn" + (isSelected ? " selected" : "");

    const modeText = record.mode === "exam" 
      ? (lang === "vi" ? "Thi Thử" : "Exam Mode") 
      : (lang === "vi" ? "Luyện Tập" : "Practice Mode");
    const verdictText = record.isPass ? TRANSLATIONS[lang].results_pass : TRANSLATIONS[lang].results_fail;

    const formattedDate = record.timestamp 
      ? new Date(record.timestamp).toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) 
      : "";

    const flexLeft = document.createElement("div");
    flexLeft.style.display = "flex";
    flexLeft.style.alignItems = "center";

    if (historyState.isSelectionMode) {
      const squircleBox = document.createElement("div");
      squircleBox.className = "history-squircle-check";
      squircleBox.innerHTML = `<svg class="history-squircle-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
      flexLeft.appendChild(squircleBox);
    }

    const itemLeft = document.createElement("div");
    itemLeft.className = "history-item-left";

    const bankNameSpan = document.createElement("span");
    bankNameSpan.className = "history-bank-name";
    bankNameSpan.textContent = record.bankName || "";

    const itemSub = document.createElement("span");
    itemSub.className = "history-item-sub";

    const modeSpan = document.createElement("span");
    modeSpan.textContent = modeText;

    const dotSpan = document.createElement("span");
    dotSpan.textContent = "•";

    const dateSpan = document.createElement("span");
    dateSpan.textContent = formattedDate;

    itemSub.appendChild(modeSpan);
    itemSub.appendChild(dotSpan);
    itemSub.appendChild(dateSpan);

    itemLeft.appendChild(bankNameSpan);
    itemLeft.appendChild(itemSub);
    flexLeft.appendChild(itemLeft);

    const itemRight = document.createElement("div");
    itemRight.className = "history-item-right";

    const verdictChip = document.createElement("span");
    verdictChip.className = `history-verdict-chip ${record.isPass ? "pass" : "fail"}`;
    verdictChip.textContent = verdictText;

    const scorePercentSpan = document.createElement("span");
    scorePercentSpan.className = "history-score-percent";
    scorePercentSpan.textContent = `${record.scorePercent}%`;

    itemRight.appendChild(verdictChip);
    itemRight.appendChild(scorePercentSpan);

    btn.appendChild(flexLeft);
    btn.appendChild(itemRight);

    btn.addEventListener("click", () => {
      if (historyState.isSelectionMode) {
        if (historyState.selectedIndices.has(index)) {
          historyState.selectedIndices.delete(index);
        } else {
          historyState.selectedIndices.add(index);
        }
        renderHistoryGrid();
        updateStickyBarUI();
      } else {
        loadHistorySessionView(record);
      }
    });

    DOM.historyList.appendChild(btn);
  });
}

function loadHistorySessionView(record) {
  // Load session state into appState and trigger submission/review display matching picture 3
  appState.activeSubjectId = record.subjectId;
  appState.bankName = record.bankName;
  appState.selectedMode = record.mode;
  appState.quizQuestions = record.quizQuestions || [];
  appState.userAnswers = record.userAnswers || [];
  appState.flaggedQuestions = record.flaggedQuestions || [];
  appState.checkedAnswers = new Array(appState.quizQuestions.length).fill(true);
  appState.timeSpent = record.timeSpent || 0;

  const lang = appState.language || "en";
  DOM.resultVerdict.textContent = record.isPass ? TRANSLATIONS[lang].results_pass : TRANSLATIONS[lang].results_fail;
  DOM.resultVerdict.className = "result-verdict " + (record.isPass ? "pass" : "fail");

  DOM.resultPercent.textContent = `${record.scorePercent}%`;
  DOM.resultRatio.textContent = `${record.correctCount} / ${record.totalQuestions}`;
  DOM.resultStatSubject.textContent = record.bankName;

  const passMarkStatEl = document.querySelector(".stat-value[data-stat='pass-mark']");
  if (passMarkStatEl) passMarkStatEl.textContent = `${record.passMark || 75}%`;

  const mins = Math.floor((record.timeSpent || 0) / 60).toString().padStart(2, "0");
  const secs = ((record.timeSpent || 0) % 60).toString().padStart(2, "0");
  DOM.resultStatTime.textContent = `${mins}:${secs}`;

  const circ = 339.292;
  const offset = circ - (circ * record.scorePercent) / 100;
  DOM.ringFill.style.strokeDasharray = `${circ}`;
  DOM.ringFill.style.strokeDashoffset = `${offset}`;

  appState.activeReviewFilter = "all";
  if (DOM.reviewFilters) {
    DOM.reviewFilters.querySelectorAll(".filter-pill").forEach(p => {
      p.classList.toggle("active", p.getAttribute("data-filter") === "all");
    });
  }

  buildReviewAccordion("all");
  setupReviewFilters();
  updateLanguageUI();
  showScreen(DOM.screenResults);
}