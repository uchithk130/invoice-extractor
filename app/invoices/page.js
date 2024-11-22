//for testing purpose
'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addInvoice } from '../../redux/invoiceSlice';
import InvoicesTable from '../components/Invoices';

const AddInvoicePage = () => {
  const dispatch = useDispatch();
  const invoices = useSelector((state) => state.invoices.invoices);

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const randomInvoice = {
    bill_no: 'RAY/23-24/286',
    date: '12 Nov 2024',
    customer_name: 'Shounak',
    phone_number: '356247247',
    gstin: 'ABCDE1234567890',
    total_items: 3,
    igst: '18%',
    igst_amount: 1458.37,
    total_amount: 94782.67,
    products: [
      {
        name: 'iPhone 16',
        quantity: 1,
        unit_price: 79990.0,
        discount: 5599.3,
        price_with_tax: 69183.35,
      },
      {
        name: 'iPhone 16 Cover',
        quantity: 1,
        unit_price: 4599.0,
        discount: 321.93,
        price_with_tax: 3977.68,
      },
      {
        name: 'Beats Pro X',
        quantity: 1,
        unit_price: 24999.0,
        discount: 1749.93,
        price_with_tax: 21621.64,
      },
    ],
  };

  const handleAddInvoice = () => {
    dispatch(addInvoice(randomInvoice));
    setShowSuccessPopup(true);
    console.log("Invoices after addition: ", invoices);

    setTimeout(() => setShowSuccessPopup(false), 3000);
  };

  return (
    <div>
      <h1>Add Invoice</h1>
      <button onClick={handleAddInvoice}>Add Invoice</button>

      {showSuccessPopup && (
        <div className="popup">
          <p>Invoice added successfully!</p>
        </div>
      )}

      <InvoicesTable />

      <style jsx>{`
        .popup {
          position: fixed;
          top: 20%;
          left: 50%;
          transform: translateX(-50%);
          padding: 10px;
          background-color: #4caf50;
          color: white;
          border-radius: 5px;
          z-index: 999;
        }
      `}</style>
    </div>
  );
};

export default AddInvoicePage;
