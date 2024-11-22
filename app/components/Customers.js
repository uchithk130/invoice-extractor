"use client";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AiOutlineEdit, AiOutlineCheck } from "react-icons/ai";
import { updateInvoice } from "../../redux/invoiceSlice";

const CustomersTable = () => {
  const invoices = useSelector((state) => state.invoices.invoices);
  const dispatch = useDispatch();

  // Aggregate customer data
  const customers = invoices.map((invoice) => ({
    bill_no: invoice.bill_no,
    name: invoice.customer_name,
    phone_number: invoice.phone_number,
    total_purchase_amount: invoice.total_amount,
  }));

  // Remove duplicates
  const uniqueCustomers = Array.from(
    new Set(customers.map((customer) => customer.name))
  ).map((name) => {
    return customers.find((customer) => customer.name === name);
  });

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
      const customer = uniqueCustomers[editing.index];

      // Update the corresponding invoice in Redux
      const updatedInvoice = {
        ...invoices.find((invoice) => invoice.customer_name === customer.name),
        [editing.field === "name"
          ? "customer_name"
          : editing.field]: editing.value,
      };

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
            <th className="py-2 px-4 border-b text-center">Customer Name</th>
            <th className="py-2 px-4 border-b text-center">Phone Number</th>
            <th className="py-2 px-4 border-b text-center">
              Total Purchase Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {uniqueCustomers.map((customer, index) => (
            <tr key={index} className="border-b hover:bg-gray-50">
              {[
                { field: "name", value: customer.name },
                { field: "phone_number", value: customer.phone_number },
                { field: "total_purchase_amount", value: customer.total_purchase_amount },
              ].map(({ field, value }) => (
                <td key={field} className="py-2 px-4 text-center relative group">
                  {editing.index === index && editing.field === field ? (
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={editing.value}
                        onChange={handleChange}
                        className="border p-1 rounded w-full text-center"
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

export default CustomersTable;
