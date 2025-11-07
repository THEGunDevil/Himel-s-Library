import { useAuth } from "@/contexts/authContext";
import axios from "axios";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

function AddBook() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const { accessToken } = useAuth();

  const imageRegister = register("image", { required: "Book cover is required" });

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleImageChange = (e) => {
    imageRegister.onChange(e);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const file = e.target.files?.[0] || null;
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("author", data.author);
      formData.append("published_year", data.published_year);
      formData.append("isbn", data.isbn);
      formData.append("total_copies", data.total_copies);
      formData.append("genre", data.genre);
      formData.append("description", data.description);

      if (data.image && data.image.length > 0) {
        formData.append("image", data.image[0]);
      }

       await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/books/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      toast.success("Adding successful")
    } catch (error) {
      console.error("❌ Adding failed:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-8">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">Add New Book</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0">
          {/* Section 1: Book Details */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-700 border-b border-gray-200 pb-2">Book Details</h3>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
              <input
                type="text"
                {...register("title", { required: "Title is required" })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                placeholder="Kafka on the Shore"
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-2">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Author</label>
              <input
                type="text"
                {...register("author", { required: "Author is required" })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                placeholder="Haruki Murakami"
              />
              {errors.author && (
                <p className="text-red-500 text-xs mt-2">{errors.author.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Published Year</label>
              <input
                type="number"
                min={1900}
                max={2099}
                {...register("published_year", { required: "Published year is required" })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
              />
              {errors.published_year && (
                <p className="text-red-500 text-xs mt-2">{errors.published_year.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ISBN</label>
              <input
                type="text"
                {...register("isbn", { required: "ISBN is required" })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                placeholder="1-84343-110-6"
              />
              {errors.isbn && (
                <p className="text-red-500 text-xs mt-2">{errors.isbn.message}</p>
              )}
            </div>
          </div>

          {/* Section 2: Additional Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-700 border-b border-gray-200 pb-2">Additional Information</h3>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Total Copies</label>
              <input
                type="number"
                min={1}
                max={10}
                {...register("total_copies", { required: "Total Copies is required" })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                placeholder="1"
              />
              {errors.total_copies && (
                <p className="text-red-500 text-xs mt-2">{errors.total_copies.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Genre</label>
              <input
                type="text"
                {...register("genre", { required: "Genre is required" })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                placeholder="Classic Romance"
              />
              {errors.genre && (
                <p className="text-red-500 text-xs mt-2">{errors.genre.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                rows={4}
                {...register("description")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 resize-y"
                placeholder="Write a short summary about the book..."
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-2">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Book Cover</label>
              <input
                type="file"
                accept="image/*"
                ref={imageRegister.ref}
                name={imageRegister.name}
                onBlur={imageRegister.onBlur}
                onChange={handleImageChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-600 file:font-medium hover:file:bg-indigo-100"
              />
              {errors.image && (
                <p className="text-red-500 text-xs mt-2">{errors.image.message}</p>
              )}
              {previewUrl && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-center">
                    <img
                      src={previewUrl}
                      alt="Book cover preview"
                      className="max-w-xs h-64 object-cover rounded-lg shadow-md"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold text-lg hover:bg-indigo-700 transition duration-200 disabled:bg-indigo-400 disabled:cursor-not-allowed lg:col-span-2"
          >
            {loading ? "Adding..." : "Add Book"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddBook;