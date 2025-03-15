import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { GET_EXPENSE_CATEGORIES } from "../graphql/queries/expenseCategory.query";
import {
  UPDATE_EXPENSE_CATEGORY,
  DELETE_EXPENSE_CATEGORY,
  RESTORE_EXPENSE_CATEGORY,
} from "../graphql/mutations/expenseCategory.mutation";
import toast from "react-hot-toast";

const CategoryManager = ({
  onClose,
  onCategorySelected,
  initialCategoryId,
}) => {
  const [categories, setCategories] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);

  // GraphQL queries and mutations
  const { data, loading, refetch } = useQuery(GET_EXPENSE_CATEGORIES, {
    variables: {
      limit: 100,
      includeDeleted: showDeleted,
    },
    fetchPolicy: "network-only",
  });

  const [updateCategory, { loading: updateLoading }] = useMutation(
    UPDATE_EXPENSE_CATEGORY
  );
  const [deleteCategory, { loading: deleteLoading }] = useMutation(
    DELETE_EXPENSE_CATEGORY
  );
  const [restoreCategory, { loading: restoreLoading }] = useMutation(
    RESTORE_EXPENSE_CATEGORY
  );

  useEffect(() => {
    if (data?.getExpenseCategories?.docs) {
      setCategories(data.getExpenseCategories.docs);

      // If initialCategoryId is provided, select that category
      if (initialCategoryId) {
        const initialCategory = data.getExpenseCategories.docs.find(
          (cat) => cat._id === initialCategoryId
        );
        if (initialCategory) {
          setSelectedCategory(initialCategory);
          setNameInput(initialCategory.name);
        }
      }
    }
  }, [data, initialCategoryId]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setNameInput(category.name);
    if (!editMode) {
      onCategorySelected(category);
      onClose();
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();

    if (!nameInput.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    try {
      const { data } = await updateCategory({
        variables: {
          input: {
            _id: selectedCategory._id,
            name: nameInput.trim(),
          },
        },
      });

      toast.success("Category updated successfully");
      refetch();
      setEditMode(false);
    } catch (error) {
      toast.error(error.message || "Failed to update category");
    }
  };

  const handleDeleteCategory = async () => {
    const isConfirmed = window.confirm(
      "Siz rostdan ham o'chirishni istaysizmi?"
    );
    if (!isConfirmed) return;
    if (!selectedCategory) return;

    try {
      await deleteCategory({
        variables: {
          id: selectedCategory._id,
        },
      });

      toast.success("Category deleted successfully");
      refetch();
      setSelectedCategory(null);
      setNameInput("");
      setEditMode(false);
    } catch (error) {
      toast.error(error.message || "Failed to delete category");
    }
  };

  const handleRestoreCategory = async () => {
    if (!selectedCategory) return;

    try {
      await restoreCategory({
        variables: {
          id: selectedCategory._id,
        },
      });

      toast.success("Category restored successfully");
      refetch();
    } catch (error) {
      toast.error(error.message || "Failed to restore category");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 w-full max-w-md rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">
            {editMode ? "Edit Category" : "Select Category"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            &times;
          </button>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-3 py-1 rounded ${
                editMode ? "bg-pink-600" : "bg-gray-600"
              } text-white mr-2`}
            >
              {editMode ? "Cancel Edit" : "Edit Mode"}
            </button>

            <label className="flex items-center text-white ml-2">
              <input
                type="checkbox"
                checked={showDeleted}
                onChange={() => setShowDeleted(!showDeleted)}
                className="mr-2"
              />
              Show Deleted
            </label>
          </div>
        </div>

        {editMode && selectedCategory && (
          <form onSubmit={handleUpdateCategory} className="mb-4">
            <div className="mb-3">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
                placeholder="Category name"
              />
            </div>
            <div className="flex justify-between">
              <button
                type="submit"
                disabled={updateLoading}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                {updateLoading ? "Saving..." : "Save Changes"}
              </button>
              {selectedCategory.isDeleted ? (
                <button
                  type="button"
                  onClick={handleRestoreCategory}
                  disabled={restoreLoading}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {restoreLoading ? "Restoring..." : "Restore"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDeleteCategory}
                  disabled={deleteLoading}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  {deleteLoading ? "Deleting..." : "Delete"}
                </button>
              )}
            </div>
          </form>
        )}

        <div className="max-h-60 overflow-y-auto">
          {loading ? (
            <p className="text-white">Loading categories...</p>
          ) : categories.length === 0 ? (
            <p className="text-white">No categories found</p>
          ) : (
            <ul className="divide-y divide-gray-700">
              {categories.map((category) => (
                <li
                  key={category._id}
                  onClick={() => handleCategoryClick(category)}
                  className={`py-2 px-3 cursor-pointer hover:bg-gray-700 rounded ${
                    selectedCategory?._id === category._id ? "bg-gray-700" : ""
                  } ${
                    category.isDeleted
                      ? "text-gray-500 line-through"
                      : "text-white"
                  }`}
                >
                  {category.name}
                  {category.isDeleted && " (Deleted)"}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
