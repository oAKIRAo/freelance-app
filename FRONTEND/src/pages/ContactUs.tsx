import '../styles/ContactUs.css';
import Navbar from '@/components/navbar';
import Footer from '@/components/Footer';

const ContactUs = () => {
  return (
    <>
    <Navbar />
    <div className="contact-container">
      <div className="contact-hero">
        <h1 className="contact-title">Contact Us</h1>
        <p className="contact-subtitle">If you have any issues or need help, please reach out to our admin.</p>
      </div>

      <div className="contact-content">
        <h2>Support & Assistance</h2>
        <p>
          We're here to ensure your experience with our freelance appointment and planning platform is smooth and stress-free.
        </p>
        <p>
          For any problems, questions, or feedback, please don't hesitate to get in touch with our administrator.
        </p>

        <p className="contact-email">
          📧 <strong>Email:</strong> <a href="mailto:admin@admin.gmail.com" className="contact-link">admin@admin.gmail.com</a>
        </p>
      </div>
    </div>

    </>
  );
};

export default ContactUs;
