import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OrderEditModal from '../components/OrderEditModal';

const OrderEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    navigate('/orders');
  };

  return (
    <OrderEditModal 
      isOpen={isModalOpen} 
      onClose={handleCloseModal} 
      orderId={id} 
    />
  );
};

export default OrderEditPage;
