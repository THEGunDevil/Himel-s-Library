import { useAuth } from "@/contexts/authContext";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";

function UpdateBook() {
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
    const res = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/books/${data.id}`,
      {
        title: data.title || null,
        author: data.author || null,
        published_year: data.published_year ? parseInt(data.published_year) : null,
        isbn: data.isbn || null,
        total_copies: data.total_copies ? parseInt(data.total_copies) : null,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("✅ Updating successful:", res.data);
  } catch (error) {
    console.error("❌ Updating failed:", error.response?.data || error.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="w-full max-w-lg m-auto bg-white shadow-md p-6 mt-10">
      <h2 className="text-2xl font-bold text-center mb-6">Update Book</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">ID</label>
          <input
            type="text"
            {...register("id", {
              required: "ID is required",
            })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="c129b8a8-e7cc-4f0e-8eda-bbcd9798eb2c"
          />
          {errors.id && (
            <p className="text-red-500 text-sm mt-1">{errors.id.message}</p>
          )}
          <p className="text-gray-500 text-sm">NOTE: ID is required to update a book.</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            {...register("title", {
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
          <label className="block text-sm font-medium mb-1">Book Cover</label>
          <input
            type="file"
            accept="image/*"
            {...register("image", {
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
          {loading ? "Updating..." : "Update Book"}
        </button>
      </form>
    </div>
  );
}

export default UpdateBook;
