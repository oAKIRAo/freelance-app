import React from 'react';
import '../styles/AboutUs.css';
import { Link } from 'react-router-dom';
import Navbar from '@/components/navbar';

const AboutUs = () => {
  return (
    <>
    <Navbar />
    <div className="about-container">
      <section className="about-hero">
        <h1 className="about-title">About Kalender</h1>
        <p className="about-subtitle">Your Partner for Better Planning & Appointment Management</p>
      </section>

      <section className="about-content">
        <h2>Who Are We?</h2>
        <p>
          Kalender is designed for freelancers and service providers to simplify scheduling,
          appointments, and planning. Managing multiple clients and deadlines shouldn’t feel chaotic,
          and we’re here to help.
        </p>

        <h2>What We Do</h2>
        <p>
          Our platform helps you stay organized with tools for:
        </p>
        <ul>
          <li>Managing appointments easily</li>
          <li>Visual weekly and monthly scheduling</li>
          <li>Reducing no-shows and last-minute changes</li>
          <li>Tracking important deadlines</li>
        </ul>

        <h2>Why Kalender?</h2>
        <p>
          Kalender is simple, intuitive, and designed to support freelancers:
        </p>
        <ul>
          <li>Clear calendar views</li>
          <li>Appointment reminders</li>
          <li>Dedicated spaces for freelancers and clients</li>
          <li>Modern, responsive design</li>
        </ul>

        <p className="about-cta">
          Ready to simplify your workflow?{' '}
          <Link to="/register" className="about-link">
            Get started today.
          </Link>
        </p>
      </section>
    </div>
    </>
  );
};

export default AboutUs;
