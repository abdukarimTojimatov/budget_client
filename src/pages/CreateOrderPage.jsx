import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OrderModal from "../components/OrderModal";

const CreateOrderPage = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(true);

  // When modal is closed, navigate back to orders page
  const handleClose = () => {
    setIsModalOpen(false);
    navigate("/orders");
  };

  // Redirect if modal is closed
  useEffect(() => {
    if (!isModalOpen) {
      navigate("/orders");
    }
  }, [isModalOpen, navigate]);

  return (
    <div className="max-w-4xl mx-auto">
      <OrderModal isOpen={isModalOpen} onClose={handleClose} />
    </div>


  );
};

export default CreateOrderPage;
