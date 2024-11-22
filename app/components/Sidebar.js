
"use client";
import React, { useState } from "react";
import classNames from "classnames";

const Sidebar = ({ setActiveTab, isSidebarOpen, setIsSidebarOpen }) => {
  const [activePath, setActivePath] = useState("dashboard");

  const menuItems = [
    { label: "Invoices", icon: "M16.975 11H10V4.025...", path: "invoices" },
    { label: "Products", icon: "M6.143 0H1.857...", path: "products" },
    { label: "Customers", icon: "M17.418 3.623...", path: "customers" },
  ];

  const handleLinkClick = (path) => {
    setActivePath(path);
    setActiveTab(path);
    setIsSidebarOpen(false);
  };

  return (
    <div className="position: fixed top: 0 left: 0 h-full">
      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600 z-50"
      >
        <span className="sr-only">Open sidebar</span>
        <svg
          className="w-6 h-6"
          aria-hidden="true"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clipRule="evenodd"
            fillRule="evenodd"
            d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
          />
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        id="default-sidebar"
        className={classNames(
          "fixed top-0 left-0 z-40 w-64 h-screen transition-transform",
          { "-translate-x-full sm:translate-x-0": !isSidebarOpen }
        )}
        aria-label="Sidebar"

      >
       
          
       
        <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
          <ul className="space-y-2 font-medium">
          <h1 className="text-2xl font-bold">Invoice Extractor</h1>
            {menuItems.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => handleLinkClick(item.path)}
                  className={classNames(
                    "flex items-center p-2 rounded-lg group",
                    {
                      "text-gray-900 bg-gray-100 dark:bg-gray-700 dark:text-white":
                        activePath === item.path,
                      "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400":
                        activePath !== item.path,
                    }
                  )}
                >
                  <svg
                    className="flex-shrink-0 w-5 h-5 transition duration-75 group-hover:text-gray-900 dark:group-hover:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d={item.icon} />
                  </svg>
                  <span className="ms-3">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
