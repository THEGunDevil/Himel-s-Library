import { useAuth } from "@/contexts/authContext";
import axios from "axios";
import { ClipboardPaste } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

function UpdateBook() {
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const { accessToken } = useAuth();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/books/${data.id}`,
        {
          title: data.title || null,
          author: data.author || null,
          published_year: data.published_year
            ? parseInt(data.published_year)
            : null,
          isbn: data.isbn || null,
          total_copies: data.total_copies ? parseInt(data.total_copies) : null,
          genre: data.genre || null,
          description: data.description || null,
          image_url: data.image_url[0] || null,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log("✅ Updating successful:", res.data);
    } catch (error) {
      console.error(
        "❌ Updating failed:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-8">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
          Update Book
        </h2>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-8 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0"
        >
          {/* Section 1: Book Details */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-700 border-b border-gray-200 pb-2">
              Book Details
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  {...register("id", { required: "ID is required" })}
                  className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                  placeholder="c129b8a8-e7cc-4f0e-8eda-bbcd9798eb2c"
                />
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      setValue("id", text); // from react-hook-form
                    } catch {
                      alert("Failed to read clipboard!");
                    }
                  }}
                  className="absolute inset-y-0 right-3 cursor-pointer text-gray-500"
                >
                  <ClipboardPaste size={18}/> 
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                {...register("title")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                placeholder="Kafka on the Shore"
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-2">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Author
              </label>
              <input
                type="text"
                {...register("author")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                placeholder="Haruki Murakami"
              />
              {errors.author && (
                <p className="text-red-500 text-xs mt-2">
                  {errors.author.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Published Year
              </label>
              <input
                type="number"
                min={1900}
                max={2099}
                {...register("published_year")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
              />
              {errors.published_year && (
                <p className="text-red-500 text-xs mt-2">
                  {errors.published_year.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ISBN
              </label>
              <input
                type="text"
                {...register("isbn")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                placeholder="1-84343-110-6"
              />
              {errors.isbn && (
                <p className="text-red-500 text-xs mt-2">
                  {errors.isbn.message}
                </p>
              )}
            </div>
          </div>

          {/* Section 2: Additional Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-700 border-b border-gray-200 pb-2">
              Additional Information
            </h3>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Total Copies
              </label>
              <input
                type="number"
                min={1}
                max={10}
                {...register("total_copies")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                placeholder="1"
              />
              {errors.total_copies && (
                <p className="text-red-500 text-xs mt-2">
                  {errors.total_copies.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Genre
              </label>
              <input
                type="text"
                {...register("genre")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                placeholder="Classic Romance"
              />
              {errors.genre && (
                <p className="text-red-500 text-xs mt-2">
                  {errors.genre.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows={4}
                {...register("description")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 resize-y"
                placeholder="Write a short summary about the book..."
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-2">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Book Cover
              </label>
              <input
                type="file"
                accept="image/*"
                {...register("image")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-600 file:font-medium hover:file:bg-indigo-100"
              />
              {errors.image && (
                <p className="text-red-500 text-xs mt-2">
                  {errors.image.message}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold text-lg hover:bg-indigo-700 transition duration-200 disabled:bg-indigo-400 disabled:cursor-not-allowed lg:col-span-2"
          >
            {loading ? "Updating..." : "Update Book"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UpdateBook;
