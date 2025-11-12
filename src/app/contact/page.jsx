"use client";
import { useAuth } from "@/contexts/authContext";
import axios from "axios";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

export default function Contact() {
  const { accessToken, user, loading, error } = useAuth();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const [sending, setSending] = useState(false);
  const onSubmit = async (formData) => {
    setSending(true);

    // Map frontend form fields to backend field names
    const data = {
      name: formData.user_name,
      email: formData.user_email,
      subject: formData.subject,
      message: formData.message,
    };
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/contact/send`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      toast.success("Email sent successfully");
    } catch (error) {
      toast.error("There was an issue sending the email");
      console.error(
        "❌There was an issue sending the email:",
        error.response?.data || error.message
      );
    } finally {
      setSending(false);
    }
  };
  useEffect(() => {
    if (user?.email) {
      setValue("user_email", user?.email);
    }
  }, [user?.email, setValue]);
  return (
    <section className="md:pt-36 pt-32 min-h-screen flex flex-col items-center justify-center px-6 py-20 text-gray-800">
      <div className="max-w-3xl w-full text-center space-y-10">
        <h1 className="text-4xl text-blue-400 md:text-5xl font-bold">
          Contact Us
        </h1>
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
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col space-y-4 p-6 shadow-md transition-all hover:shadow-lg"
          >
            <input
              type="text"
              placeholder="Your Name"
              {...register("user_name", { required: "name is required" })}
              className="w-full bg-transparent border-b-2 border-gray-300 dark:border-gray-600 
    focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors duration-300 py-2 text-sm md:text-base"
            />
            {errors.user_name && (
              <p className="text-red-500 text-sm mt-1">
                {errors.user_name.message}
              </p>
            )}
            <input
              type="text"
              placeholder="Subject"
              {...register("subject", { required: "Subject is required" })}
              className="w-full bg-transparent border-b-2 border-gray-300 dark:border-gray-600 
    focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors duration-300 py-2 text-sm md:text-base"
            />
            {errors.subject && (
              <p className="text-red-500 text-sm mt-1">
                {errors.subject.message}
              </p>
            )}
            <input
              readOnly={true}
              type="email"
              placeholder="Your Email"
              defaultValue={user?.email}
              {...register("user_email", {
                required: "email is required",
                pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
              })}
              className="w-full bg-transparent cursor-not-allowed border-b-2 border-b-blue-500 text-gray-500 focus:outline-none py-2 text-sm md:text-base"
            />

            {errors.user_email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.user_email.message}
              </p>
            )}
            <textarea
              placeholder="Your Message"
              rows={4}
              {...register("message", { required: "message is required" })}
              className="w-full bg-transparent border-b-2 border-gray-300 dark:border-gray-600 
    focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors duration-300 py-2 resize-none text-sm md:text-base"
            />
            {errors.message && (
              <p className="text-red-500 text-sm mt-1">
                {errors.message.message}
              </p>
            )}

            {!error ? (
              <button
                disabled={!user?.email || loading || sending} // ← Changed: disabled when NO email
                type="submit"
                className="mt-2 group flex items-center gap-1.5 hover:text-blue-500 w-fit mx-auto cursor-pointer py-1 px-4 font-semibold border-b-3 border-b-black transition-colors duration-300 hover:border-b-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? "Sending Email..." : "Send Email"}{" "}
                <Send
                  size={17}
                  className="text-black transition-colors duration-300 group-hover:text-blue-500"
                />
              </button>
            ) : (
              <button
                disabled = {error}
                type="button"
                className="mt-2 group flex items-center gap-1.5 w-fit mx-auto cursor-not-allowed py-1 px-4 font-semibold border-b-3 border-b-red-500"
              >
                <span className="text-red-400">Email Error - Cannot Send</span>
                <Send size={17} className="text-red-400" />
              </button>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
