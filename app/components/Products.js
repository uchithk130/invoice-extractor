"use client";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateInvoice } from "../../redux/invoiceSlice"; 
import { AiOutlineEdit, AiOutlineCheck } from "react-icons/ai";

const ProductsTable = () => {
  const invoices = useSelector((state) => state.invoices.invoices);
  const dispatch = useDispatch();

  const products = invoices.flatMap((invoice, invoiceIndex) =>
    invoice.products
      .filter((product) => product.name?.trim()) 
      .map((product, productIndex) => ({
        ...product,
        invoiceIndex,
        productIndex,
      }))
  );
  

  const [editing, setEditing] = useState({
    index: null,
    field: null,
    value: "",
  });

  const handleEditClick = (index, field, value) => {
    setEditing({
      index,
      field,
      value,
    });
  };

  const handleSaveClick = () => {
    if (editing.index !== null && editing.field !== null) {
      const { invoiceIndex, productIndex } = products[editing.index];
  
      // Create a deep copy of the invoice and its products array
      const updatedInvoice = {
        ...invoices[invoiceIndex],
        products: invoices[invoiceIndex].products.map((product, index) =>
          index === productIndex
            ? { ...product, [editing.field]: editing.value }
            : { ...product }
        ),
      };
  
      // Dispatch action to update the invoice in Redux store
      dispatch(updateInvoice(updatedInvoice));
  
      // Reset editing state
      setEditing({
        index: null,
        field: null,
        value: "",
      });
    }
  };
  

  const handleChange = (e) => {
    setEditing((prev) => ({
      ...prev,
      value: e.target.value,
    }));
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
        <thead className="bg-gray-100 text-gray-600">
          <tr>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Quantity</th>
            <th className="py-2 px-4 border-b">Unit Price</th>
            <th className="py-2 px-4 border-b">Price with Tax</th>
            <th className="py-2 px-4 border-b">Discount</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={index} className="border-b text-center hover:bg-gray-50">
              {[
                { field: "name", value: product.name },
                { field: "quantity", value: product.quantity },
                { field: "unit_price", value: product.unit_price },
                { field: "price_with_tax", value: product.price_with_tax },
                { field: "discount", value: product.discount },
              ].map(({ field, value }) => (
                <td key={field} className="py-2 px-4 relative group">
                  {editing.index === index && editing.field === field ? (
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={editing.value}
                        onChange={handleChange}
                        className="border p-1 rounded w-full"
                      />
                      <button
                        onClick={handleSaveClick}
                        className="ml-2 text-green-500"
                      >
                        <AiOutlineCheck size={18} />
                      </button>
                    </div>
                  ) : (
                    <>
                      {value}
                      <button
                        onClick={() => handleEditClick(index, field, value)}
                        className="absolute top-2 right-2 text-blue-500 hidden group-hover:block"
                      >
                        <AiOutlineEdit size={16} />
                      </button>
                    </>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsTable;
