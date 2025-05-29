// App.js
import React from "react";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Testimonials from "./components/Testimonials";
import Footer from "./components/Footer";
import "./styles.css";

function App() {
    return (
        <>
            <Hero />
            <Features />
            <Testimonials />
            <Footer />
        </>
    );
}

export default App;
