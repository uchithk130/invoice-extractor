import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  invoices: [], // Holds the list of invoices
};

const invoiceSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    addInvoice: (state, action) => {
      console.log('Before Update:', JSON.stringify(state.invoices, null, 2));
      state.invoices.push(action.payload);
      console.log('After Update:', JSON.stringify(state.invoices, null, 2));
    },

    updateInvoice: (state, action) => {
      const index = state.invoices.findIndex(
        (invoice) => invoice.bill_no === action.payload.bill_no
      );
      if (index !== -1) {
        state.invoices[index] = action.payload;
      }
    },

    deleteInvoice: (state, action) => {
      state.invoices = state.invoices.filter(
        (invoice) => invoice.bill_no !== action.payload
      );
    },
  },
});

export const { addInvoice, updateInvoice, deleteInvoice } = invoiceSlice.actions;

export default invoiceSlice.reducer;
