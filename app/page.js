"use client";
import { useState, useRef } from "react";

import { motion } from "framer-motion";
import Sidebar from "./components/Sidebar";
import Invoices from "./components/Invoices";
import Products from "./components/Products";
import Customers from "./components/Customers";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { addInvoice } from "../redux/invoiceSlice";





export default function Home() {
  const [activeTab, setActiveTab] = useState("");
  const [files, setFiles] = useState([]);
  const [isExtractEnabled, setIsExtractEnabled] = useState(false); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false); 
  const [isPopupVisible, setIsPopupVisible] = useState(false);
const [popupMessage, setPopupMessage] = useState("");

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prevFiles) => {
      const newFiles = [...prevFiles, ...droppedFiles];
      setIsExtractEnabled(newFiles.length > 0);
      return newFiles;
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prevFiles) => {
      const newFiles = [...prevFiles, ...selectedFiles];
      setIsExtractEnabled(newFiles.length > 0);
      return newFiles;
    });
  };

  

  const handleExtractClick = async () => {
    if (files.length === 0) return;
  
    // Separate the files into PDFs and images
    const pdfFiles = files.filter((file) => file.type === "application/pdf");
    const imageFiles = files.filter((file) => file.type.startsWith("image"));
    const excelFiles = files.filter((file) => file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    try {
      setIsLoading(true);
      if (pdfFiles.length > 0) {
        const formData = new FormData();
        pdfFiles.forEach((file) => {
          formData.append("file", file); 
        });
        formData.append("prompt", `I want data in image in this json format. give only json donot give nay text
          {
            bill_no: '',
            date: '',
            customer_name: '',
            phone_number: '',
            gstin: '',
            total_items: 0,
            igst: '',
            CGST:'',
            igst_amount: 0,
            total_amount: 0,
            products: [
              {
                name: '',
                quantity: 0,
                unit_price: 0,
                discount: 0,
                price_with_tax: 0,
              },
            ],
          }`);
       
  
        
          const response = await fetch("/api/processPdf", {
            method: "POST",
            body: formData, 
          });
        
  
        const rawData = await response.json();
  
        if (response.ok) {
          const parsedResults = rawData.results.map((result) => {
            const cleanedString = result.replace(/```json\n|```/g, "");
            return JSON.parse(cleanedString);
          });
  
          const formattedData = parsedResults.map((item) => ({
            bill_no: item.bill_no,
            date: item.date,
            customer_name: item.customer_name,
            phone_number: item.phone_number,
            gstin: item.gstin,
            total_items: item.total_items,
            igst: item.igst,
            igst_amount: item.igst_amount,
            total_amount: item.total_amount,
            products: item.products.map((product) => ({
              name: product.name,
              quantity: product.quantity,
              unit_price: product.unit_price,
              discount: product.discount,
              price_with_tax: product.price_with_tax,
            })),
          }));
          formattedData.forEach((data) => {
            dispatch(addInvoice(data));
          });
        }
      }
  
      
      if (imageFiles.length > 0) {
        const imageBase64Files = await Promise.all(imageFiles.map((file) => convertToBase64(file)));
  
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ files: imageBase64Files }),
        });
  
        const rawData = await response.json();
  
        if (response.ok) {
          const parsedResults = rawData.results.map((result) => {
            const cleanedString = result.replace(/```json\n|```/g, "");
            return JSON.parse(cleanedString);
          });
  
          const formattedData = parsedResults.map((item) => ({
            bill_no: item.bill_no,
            date: item.date,
            customer_name: item.customer_name,
            phone_number: item.phone_number,
            gstin: item.gstin,
            total_items: item.total_items,
            igst: item.igst,
            igst_amount: item.igst_amount,
            total_amount: item.total_amount,
            products: item.products.map((product) => ({
              name: product.name,
              quantity: product.quantity,
              unit_price: product.unit_price,
              discount: product.discount,
              price_with_tax: product.price_with_tax,
            })),
          }));
          formattedData.forEach((data) => {
            dispatch(addInvoice(data));
          });
        }
      }
      if (excelFiles.length > 0) {
        const formData = new FormData();
        excelFiles.forEach((file) => {
          formData.append("file", file); 
        });
    
        const response = await fetch("/api/ExcelExtract", {
          method: "POST",
          body: formData, 
        });
    
        const rawData = await response.json();
        console.log(rawData);
    
        if (response.ok) {
          const formattedData = [];
    
          
          const allData = rawData.results.reduce((acc, fileData) => {
            if (fileData.data && Array.isArray(fileData.data)) {
              acc.push(...fileData.data);
            }
            return acc;
          }, []);
    
          console.log("Combined Data:", allData);
    
          
          const groupedData = allData.reduce((acc, item) => {
            const serialNumber = item["Serial Number"];
            if (serialNumber) { 
              if (!acc[serialNumber]) {
                acc[serialNumber] = [];
              }
              acc[serialNumber].push(item);
            }
            return acc;
          }, {});
    
          console.log("Grouped Data:", groupedData);
    
          
          for (const serialNumber in groupedData) {
            const items = groupedData[serialNumber];
    
            const totalAmount = items.reduce(
              (sum, item) => sum + parseFloat(item["Item Total Amount"] || 0),
              0
            );
    
            
            formattedData.push({
              bill_no: serialNumber,
              date: items[0]["Invoice Date"] || '',
              customer_name: items[0]["Party Name"] || '',
              phone_number: items[0]["Phone Number"] || '',
              gstin: '', 
              total_items: items.reduce((sum, item) => sum + parseFloat(item["Qty"] || 0), 0),
              igst: '', 
              CGST: '', 
              igst_amount: 0, 
              total_amount: totalAmount,
              status: items[0]["Status"] || '',
              products: items.map((item) => ({
                name: item["Product Name"] || '',
                quantity: parseFloat(item["Qty"] || 0),
                unit_price: parseFloat(item["Price with Tax"] || 0),
                discount: 0, 
                price_with_tax: parseFloat(item["Price with Tax"] || 0),
              })),
            });
          }
    
          
          formattedData.forEach((data) => {
            dispatch(addInvoice(data));
          });
        }
      }
    setPopupMessage("Extraction completed successfully!");
    setIsPopupVisible(true);
      
    } catch (error) {
      console.log("Error uploading files:", error);
    }
    finally {
      setFiles([]);
      setIsLoading(false); 
    }
  };

  
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  const convertBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result); 
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
 
  const handleClose = () => {
    setActiveTab("");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "invoices":
        return <Invoices />;
      case "products":
        return <Products />;
      case "customers":
        return <Customers />;
      default:
        return (
          <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center">
              <h1 className="text-3xl font-semibold mb-4">Invoice Extractor</h1>
              <p className="text-lg text-gray-600 mb-8">
                Upload your invoices to extract details
              </p>

              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-4 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-between relative w-[400px] h-[300px] mx-auto"
              >
                {files.length === 0 ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 mx-auto text-gray-500 dark:text-gray-400 mb-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <p className="text-gray-500 mb-4">Drag and drop your files here</p>
                  </>
                ) : (
                  <div className="w-full mb-6 max-h-24 overflow-y-auto">
                    <ul className="list-disc pl-4 text-gray-600 text-sm">
                      {files.map((file, index) => (
                        <li key={index}>{file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={handleUploadClick}
                  className="py-2 px-6 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                >
                  Upload Files
                </button>

                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              <div className="mt-6">
                <button
                  onClick={handleExtractClick}
                  className={`py-2 px-6 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors ${
                    isExtractEnabled ? "" : "opacity-50 cursor-not-allowed"
                  }`}
                  disabled={!isExtractEnabled}
                >
                  {isLoading ? "Extracting..." : "Extract"}
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex">
      
      <div
        className={`fixed z-50 
        }`}
      >
        <Sidebar
          setActiveTab={setActiveTab}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      </div>

     
      <button
        className="fixed top-4 left-4 z-50 p-2 bg-gray-700 text-white rounded md:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? "Close" : "Menu"}
      </button>

      
      {isPopupVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-80 text-center shadow-lg">
              <h2 className="text-xl font-semibold mb-4">{popupMessage}</h2>
              <button
                onClick={() => setIsPopupVisible(false)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        )};
      <motion.div
        className="ml-0 md:ml-64 flex-grow p-8 bg-gray-100 min-h-screen"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.4 }}
      >
        {activeTab !== "" && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
        {renderContent()}
      </motion.div>
    </div>
  );
}