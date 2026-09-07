import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./TestDayMindset.module.css";
import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import { Topbar } from "../../../components/common/topbar/Topbar";
import { HeaderCard } from "../../../components/common/HeaderCard";
import { BackButton } from "../../../components/common/BackButton";
import BreathingSVG from '../../../assets/breathing-reset.png'; // Make sure path is correct relative to new location
import { strategyPrompts } from "../strategyPrompts";

const mindsetCards = [
  {
    id: 1,
    title: "What to do when your mind blanks",
    buttonText: "3 Step panic reset",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="10" fill="#00A5B7" />
        <path d="M21.2503 8.75C26.1003 8.75 30.0003 12.675 30.0003 17.5C30.0003 21 27.9628 23.9875 25.0003 25.3875V31.25H16.2503V27.5H15.0003C13.6128 27.5 12.5003 26.3875 12.5003 25V21.25H10.6253C10.1003 21.25 9.80026 20.625 10.1003 20.2375L12.5003 17.075C12.6104 14.8291 13.5805 12.7117 15.2096 11.1618C16.8387 9.61188 19.0017 8.74826 21.2503 8.75ZM17.9003 14.2375H20.3128C20.3253 13.8625 20.4378 13.575 20.6628 13.375C20.8942 13.1831 21.1871 13.081 21.4878 13.0875C21.8753 13.0875 22.2003 13.2125 22.4253 13.4375C22.6503 13.675 22.7503 14 22.7503 14.375C22.7503 14.775 22.6628 15.1125 22.4628 15.4C22.2878 15.6875 22.0253 15.9375 21.7003 16.1375C21.0628 16.5625 20.6253 16.9375 20.3878 17.275C20.1378 17.6 20.0003 18.125 20.0003 18.75H22.5003C22.5003 18.3625 22.5503 18.05 22.6628 17.825C22.7753 17.5875 22.9878 17.375 23.3003 17.175C23.8628 16.875 24.3253 16.5125 24.6878 16.0125C25.0503 15.5125 25.2378 15 25.2378 14.375C25.2378 13.425 24.9003 12.6625 24.2253 12.1C23.5628 11.5375 22.6503 11.25 21.4878 11.25C20.4003 11.25 19.5253 11.5 18.8503 11.9875C18.2003 12.5 17.8753 13.2125 17.8878 14.2L17.9003 14.2375ZM20.0003 22.5H22.5003V20H20.0003V22.5ZM21.2503 6.25C15.5128 6.25 10.7628 10.525 10.0753 16.125L8.12526 18.75H8.08776L8.06276 18.7875C7.37526 19.7375 7.28776 20.9875 7.82526 22.025C8.27526 22.8875 9.07526 23.4875 10.0003 23.675V25C10.0003 27.3125 11.6003 29.275 13.7503 29.8375V33.75H27.5003V26.875C30.6253 24.7875 32.5003 21.325 32.5003 17.5C32.5003 11.2875 27.4503 6.25 21.2503 6.25Z" fill="white" />
        </svg>
    ),
  },
  {
    id: 2,
    title: "90-Second Breathing Reset",
    buttonText: "90 Second Breathing Reset",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="10" fill="#00A5B7" />
        <path d="M8.96568 14.5343C11.5862 12.2843 13.6562 10.5053 19.2737 13.6793C21.9722 15.2033 24.1487 15.7793 25.9592 15.7763C29.1317 15.7763 31.1882 14.0123 32.9657 12.4868C33.2708 12.2214 33.4605 11.8476 33.4947 11.4447C33.5288 11.0417 33.4047 10.6413 33.1487 10.3283C33.0238 10.1747 32.8693 10.0478 32.6945 9.95491C32.5197 9.86205 32.328 9.8052 32.1308 9.78772C31.9336 9.77023 31.7349 9.79248 31.5465 9.85313C31.358 9.91378 31.1837 10.0116 31.0337 10.1408C28.4147 12.3938 26.3432 14.1728 20.7257 10.9958C13.3037 6.80633 9.82668 9.79133 7.03368 12.1913C6.72881 12.457 6.53935 12.8309 6.50547 13.2338C6.47159 13.6367 6.59595 14.037 6.85218 14.3498C6.97717 14.5032 7.13164 14.6298 7.30645 14.7224C7.48127 14.815 7.67288 14.8715 7.86994 14.8887C8.067 14.9059 8.26551 14.8834 8.45373 14.8226C8.64194 14.7617 8.81602 14.6637 8.96568 14.5343ZM31.0337 17.8013C28.4147 20.0513 26.3432 21.8333 20.7257 18.6563C13.3037 14.4638 9.82668 17.4503 7.03368 19.8488C6.72881 20.1145 6.53935 20.4884 6.50547 20.8913C6.47159 21.2942 6.59595 21.6945 6.85218 22.0073C6.97695 22.1609 7.13126 22.2878 7.30596 22.3807C7.48067 22.4735 7.67223 22.5303 7.8693 22.5478C8.06637 22.5653 8.26494 22.5431 8.45327 22.4824C8.64159 22.4218 8.81583 22.324 8.96568 22.1948C11.5862 19.9433 13.6562 18.1643 19.2737 21.3368C21.9722 22.8638 24.1487 23.4368 25.9592 23.4368C29.1317 23.4368 31.1882 21.6728 32.9657 20.1443C33.271 19.8794 33.461 19.5058 33.4951 19.103C33.5293 18.7002 33.405 18.2999 33.1487 17.9873C33.0238 17.8337 32.8693 17.7067 32.6944 17.6138C32.5195 17.521 32.3278 17.4642 32.1305 17.4469C31.9333 17.4295 31.7346 17.4519 31.5462 17.5128C31.3577 17.5737 31.1835 17.6718 31.0337 17.8013ZM31.0337 25.4603C28.4147 27.7133 26.3432 29.4923 20.7257 26.3183C13.3037 22.1258 9.82668 25.1108 7.03368 27.5108C6.72881 27.7765 6.53935 28.1504 6.50547 28.5533C6.47159 28.9562 6.59595 29.3565 6.85218 29.6693C6.97704 29.8228 7.13147 29.9497 7.30629 30.0424C7.48111 30.1351 7.67276 30.1917 7.86988 30.2089C8.06701 30.2261 8.26558 30.2035 8.45381 30.1425C8.64205 30.0816 8.81611 29.9834 8.96568 29.8538C11.5862 27.6038 13.6562 25.8263 19.2737 28.9988C21.9722 30.5228 24.1487 31.0988 25.9592 31.0988C29.1317 31.0988 31.1882 29.3318 32.9657 27.8063C33.2708 27.5409 33.4605 27.1671 33.4947 26.7642C33.5288 26.3612 33.4047 25.9608 33.1487 25.6478C33.0234 25.4948 32.8688 25.3683 32.694 25.2758C32.5192 25.1833 32.3276 25.1266 32.1306 25.1092C31.9336 25.0917 31.7351 25.1138 31.5467 25.1741C31.3584 25.2344 31.1839 25.3317 31.0337 25.4603Z" fill="white" />
      </svg>
    ),
  },
  {
    id: 3,
    title: "Mindset Moment",
    buttonText: null,
    icon: null,
    content: (
      <div className={styles["tdm-affirmation"]}>
        <span className={styles["tdm-affirmation-icon"]}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="10" fill="#00A5B7" />
            <mask id="mask0_205_6970" maskUnits="userSpaceOnUse" x="6" y="6" width="28" height="28">
              <path d="M20 32.5C26.9037 32.5 32.5 26.9037 32.5 20C32.5 13.0963 26.9037 7.5 20 7.5C13.0963 7.5 7.5 13.0963 7.5 20C7.5 26.9037 13.0963 32.5 20 32.5Z" fill="white" stroke="white" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M17.5 19.9999V15.6699L21.25 17.8349L25 19.9999L21.25 22.1649L17.5 24.3299V19.9999Z" fill="black" stroke="black" strokeWidth="2.5" strokeLinejoin="round" />
            </mask>
            <g mask="url(#mask0_205_6970)">
              <path d="M5 5H35V35H5V5Z" fill="white" />
            </g>
          </svg>
        </span>
        <span className={styles["tdm-affirmation-text"]}>
          I am calm, capable <br />
          and ready to succeed
        </span>
      </div>
    )
  }
];

export const TestDayMindset = () => {
  const [activeModalCard, setActiveModalCard] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleStartDrill = () => {
      const prompt = strategyPrompts['Test Day Mindset'];
      navigate('/strategy-zone/drill', {
          state: {
              strategyTab: "Test Day Mindset",
              subCategory: "Test Day Mindset",
              promptInstructions: prompt,
              isDynamic: true
          }
      });
  };

  const handleButtonClick = (cardId) => {
    setActiveModalCard(cardId);
  };

  const handleCloseModal = () => {
    setActiveModalCard(null);
  };

  return (
    <div className={styles["tdm-container"]}>
      <Sidebar sidebarOpen={sidebarOpen} />

      <div className={styles["tdm-main-area"]}>
        <Topbar pageTitle="Strategy Zone" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className={styles["tdm-content"]}>
          {/* BACK BUTTON */}
          <div className={styles["tdm-back-btn-container"]}>
              <BackButton to="/strategy-zone" />
          </div>

          <HeaderCard
            title="Test Day Mindset"
            subtitle={
              <>
                Your final prep! Use these immediate tools to manage stress
                <br />
                and panic when the test pressure hits.
              </>
            }
            className={styles["tdm-header-card"]}
          />


          <div className={styles["tdm-video-grid"]}>
            {mindsetCards.map((card) => (
              <div key={card.id} className={styles["tdm-video-card"]}>
                {card.icon && <span className={styles["tdm-icon"]}>{card.icon}</span>}
                <h4>{card.title}</h4>

                <div className={styles["tdm-card-content"]}>
                  {card.content}
                </div>

                {card.buttonText && (
                  <button
                    className={styles["tdm-message-btn"]}
                    onClick={() => handleButtonClick(card.id)}
                  >
                    {card.buttonText}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* MODALS */}
          {activeModalCard === 1 && (
            <div className={styles["tdm-modal-overlay"]} onClick={handleCloseModal}>
              <div className={styles["tdm-modal-content"]} onClick={(e) => e.stopPropagation()}>
                <h3>3 Sequential Steps to Reset Panic</h3>
                <div className={styles["tdm-modal-step"]}>
                  <strong>Step 1:</strong>
                  <p><span className={styles["tdm-highlight"]}>STOP:</span> Pause and close your eyes. Take one slow, deep breath and focus on the air moving in and out for 5 seconds.</p>
                </div>
                <div className={styles["tdm-modal-step"]}>
                  <strong>Step 2:</strong>
                  <p><span className={styles["tdm-highlight"]}>READ:</span> Reread the stem only. Do not look at the answers. Identify the patient, situation, and core problem.</p>
                </div>
                <div className={styles["tdm-modal-step"]}>
                  <strong>Step 3:</strong>
                  <p><span className={styles["tdm-highlight"]}>FRAMEWORK:</span> Pick your priority. Apply the best framework: ABCs? Maslow’s? Assess vs. intervene?</p>
                </div>
                <button className={styles["tdm-close-btn"]} onClick={handleCloseModal}>Close</button>
              </div>
            </div>
          )}

          {activeModalCard === 2 && (
            <div className={styles["tdm-modal-overlay"]} onClick={handleCloseModal}>
              <div className={styles["tdm-modal-content"]} onClick={(e) => e.stopPropagation()}>
                <div className={styles["tdm-breathing-modal"]}>
                  <img src={BreathingSVG} alt="Breathing Exercise" className={styles["tdm-breathing-img"]} />
                  <p className={styles["tdm-breathing-text"]}>
                    4 sec. Inhale → 4 sec. Hold → 4 sec. Exhale
                  </p>
                  <span className={styles["tdm-breathing-subtext"]}>Repeat for 90 seconds.</span>
                </div>
                <button className={styles["tdm-close-btn"]} onClick={handleCloseModal}>Close</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
