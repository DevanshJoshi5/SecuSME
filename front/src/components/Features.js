import React from "react";
import { FaShieldAlt, FaSearch, FaChartBar } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import "./Features.css";

const Features = () => {
  const { t } = useTranslation();

  return (
    <div className="features">
      <h2>{t('why_choose_secusme')}</h2>
      <div className="feature-container">
        <div className="feature-card">
          <FaSearch className="feature-icon" />
          <h3>{t('automated_scanning')}</h3>
          <p>{t('real_time_vulnerability_detection')}</p>
        </div>
        <div className="feature-card">
          <FaShieldAlt className="feature-icon" />
          <h3>{t('risk_assessment')}</h3>
          <p>{t('identify_and_mitigate_security_risks')}</p>
        </div>
        <div className="feature-card">
          <FaChartBar className="feature-icon" />
          <h3>{t('security_insights')}</h3>
          <p>{t('get_detailed_reports_and_analytics')}</p>
        </div>
      </div>
    </div>
  );
};

export default Features;