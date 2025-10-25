"use client";
import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);
    alert("Thanks for reaching out! We'll get back to you soon.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <section className="md:pt-36 pt-32 min-h-screen flex flex-col items-center justify-center px-6 py-20 text-gray-800">
      <div className="max-w-3xl w-full text-center space-y-10">
        <h1 className="text-4xl text-blue-400 md:text-5xl font-bold">Contact Us</h1>
        <p className="text-lg">
          Have a question, suggestion, or feedback? We’d love to hear from you.
        </p>

        <div className="grid md:grid-cols-2 gap-10 mt-8">
          {/* Contact Info */}
          <div className="space-y-6 text-left">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary" />
              <span>support@booklibrary.com</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-primary" />
              <span>+880 1700-000000</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary" />
              <span>Dhaka, Bangladesh</span>
            </div>
          </div>

          {/* Contact Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col space-y-4 p-6 shadow-md transition-all hover:shadow-lg"
          >
            <input
              placeholder="Your Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full bg-transparent border-b-2 border-gray-300 dark:border-gray-600 
    focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors duration-300 py-2 text-sm md:text-base"
            />

            <input
              type="email"
              placeholder="Your Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full bg-transparent border-b-2 border-gray-300 dark:border-gray-600 
    focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors duration-300 py-2 text-sm md:text-base"
            />

            <textarea
              placeholder="Your Message"
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
              className="w-full bg-transparent border-b-2 border-gray-300 dark:border-gray-600 
    focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors duration-300 py-2 resize-none text-sm md:text-base"
            />

            <button
              type="submit"
              className="mt-2 cursor-pointer bg-primary py-2 rounded-lg hover:opacity-90 transition-all duration-200"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
