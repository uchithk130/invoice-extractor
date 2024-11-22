"use client";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateInvoice } from "../../redux/invoiceSlice";
import { AiOutlineEdit, AiOutlineCheck } from "react-icons/ai";

const InvoicesTable = () => {
  const invoices = useSelector((state) => state.invoices.invoices);
  const dispatch = useDispatch();

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
      const updatedInvoice = { ...invoices[editing.index] };
      updatedInvoice[editing.field] = editing.value;

      dispatch(updateInvoice(updatedInvoice));

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
      <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg ">
        <thead className="bg-gray-100 text-gray-600">
          <tr>
            <th className="py-2 px-4 border-b">Bill No.</th>
            <th className="py-2 px-4 border-b">Customer Name</th>
            <th className="py-2 px-4 border-b">Products</th>
            <th className="py-2 px-4 border-b">Total Quantity</th>
            <th className="py-2 px-4 border-b">Tax</th>
            <th className="py-2 px-4 border-b">Total Amount</th>
            <th className="py-2 px-4 border-b">Date</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice, index) => (
            <tr key={index} className="border-b text-center hover:bg-gray-50">
              {[
                { field: "bill_no", value: invoice.bill_no },
                { field: "customer_name", value: invoice.customer_name },
                {
                  field: "products",
                  value: invoice.products,
                  isProducts: true,
                },
                { field: "total_quantity", value: invoice.total_items },
                { field: "tax", value: invoice.igst },
                { field: "total_amount", value: invoice.total_amount },
                { field: "date", value: invoice.date },
              ].map(({ field, value, isProducts }) => (
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
                  ) : isProducts ? (
                    <>
                      <ol className="list-decimal pl-5">
                        {value.map((product, i) => (
                          <li key={i}>{product.name}</li>
                        ))}
                      </ol>
                     
                    </>
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

export default InvoicesTable;

