import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn, FaYoutube } from "react-icons/fa";

export default function FooterSimple() {
  return (
    <footer
      className="w-full"
      style={{
        background: 'linear-gradient(to right, rgba(132, 250, 176, 1), rgba(143, 211, 244, 1))',
      }}
    >
      <div className="container mx-auto px-4 md:px-6 2xl:max-w-[1400px] flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-gray-600 md:text-left">
            Helping you manage your time better.

          </p>
        </div>

        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          <nav className="flex gap-4 md:gap-6">
            <Link
              to="#"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              Terms
            </Link>
            <Link
              to="#"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              Privacy
            </Link>
            <Link
              to="#"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <FaFacebookF className="w-4 h-4 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer" />
            <FaInstagram className="w-4 h-4 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer" />
            <FaTwitter className="w-4 h-4 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer" />
            <FaLinkedinIn className="w-4 h-4 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer" />
            <FaYoutube className="w-4 h-4 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer" />
            <span className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer">🇬🇧</span>
          </div>

          <p className="text-center text-sm text-gray-500 md:text-left">
            &copy; {new Date().getFullYear()} kalender. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
