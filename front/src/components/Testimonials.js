import React from "react";
import { useTranslation } from "react-i18next";
import "./Testimonials.css";

const testimonialsData = [
  { name: "John Doe", text: "SecuSME significantly improved our security!", img: "https://randomuser.me/api/portraits/men/1.jpg" },
  { name: "Jane Smith", text: "The automated scanning is a game-changer.", img: "https://randomuser.me/api/portraits/women/2.jpg" },
  { name: "Robert Brown", text: "Quick, reliable, and effective cybersecurity.", img: "https://randomuser.me/api/portraits/men/3.jpg" }
];

const Testimonials = () => {
  const { t } = useTranslation();

  return (
    <div className="testimonials">
      <h2>{t('what_our_clients_say')}</h2>
      <div className="testimonial-container">
        {testimonialsData.map((testimonial, index) => (
          <div className="testimonial" key={index}>
            <img src={testimonial.img} alt={testimonial.name} className="testimonial-img" />
            <p>"{testimonial.text}"</p>
            <h4>- {testimonial.name}</h4>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;