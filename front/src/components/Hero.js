import React from "react";
import { useTranslation } from "react-i18next";
import "./Hero.css";

const Hero = () => {
  const { t } = useTranslation();

  return (
    <section className="hero">
      <div className="overlay"></div>
      <div className="hero-content">
        <h1>{t('secure_your_business_with', { name: 'SecuSME' })}</h1>
        <p>{t('automated_cybersecurity_risk_assessment')}</p>
        <button className="btn">{t('get_started')}</button>
      </div>
    </section>
  );
};

export default Hero;