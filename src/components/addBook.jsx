import { useAuth } from "@/contexts/authContext";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";

function AddBook() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
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

      // File input: data.image is a FileList
      if (data.image && data.image.length > 0) {
        formData.append("image", data.image[0]); // must match backend name
      }

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/books/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Adding successful:", res.data);
    } catch (error) {
      console.error("❌ Adding failed:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="w-full max-w-lg m-auto bg-white shadow-md p-6 my-1">
      <h2 className="text-2xl font-bold text-center mb-6">Add Book</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            {...register("title", {
              required: "title is required",
            })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Kafka on the Shore"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Author</label>
          <input
            type="text"
            {...register("author", {
              required: "Author is required",
            })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Haruki Murakami"
          />
          {errors.author && (
            <p className="text-red-500 text-sm mt-1">{errors.author.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Published Year
          </label>
          <input
            type="number"
            min={1900}
            max={2099}
            {...register("published_year", {
              required: "Published year is required",
            })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.published_year && (
            <p className="text-red-500 text-sm mt-1">
              {errors.published_year.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">ISBN </label>
          <input
            type="text"
            {...register("isbn", {
              required: "ISBN is required",
            })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="1-84343-110-6"
          />
          {errors.isbn && (
            <p className="text-red-500 text-sm mt-1">{errors.isbn.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Total Copies</label>
          <input
            type="number"
            min={1}
            max={10}
            {...register("total_copies", {
              required: "Total Copies is required",
            })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="1"
          />
          {errors.total_copies && (
            <p className="text-red-500 text-sm mt-1">
              {errors.total_copies.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Genre</label>
          <input
            type="text"
            {...register("genre", {
              required: "genre is required",
            })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Classic Romance"
          />
          {errors.genre && (
            <p className="text-red-500 text-sm mt-1">{errors.genre.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            rows={4}
            {...register("description")}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write a short summary about the book..."
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Book Cover</label>
          <input
            type="file"
            accept="image/*"
            {...register("image", {
              required: "Book cover is required",
            })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.book_cover && (
            <p className="text-red-500 text-sm mt-1">
              {errors.book_cover.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full cursor-pointer py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          {loading ? "Adding..." : "Add Book"}
        </button>
      </form>
    </div>
  );
}

export default AddBook;
