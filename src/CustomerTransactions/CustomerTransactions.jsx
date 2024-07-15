import React, { useEffect, useState } from 'react';
import { Table, Input, Button } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CustomerTransactions = () => {
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [searchAmount, setSearchAmount] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage] = useState(7);


  // Fetch customers data from JSON
  const getCustomers = async () => {
    try {
      const response = await fetch("../customers.json");
      if (response.ok) {
        const data = await response.json();
          //save  all customer from json file
        setCustomers(data?.customers);
      } else {
        console.error("Response was not ok:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  // Fetch transactions data from JSON
  const getTransactions = async () => {
    try {
      const response = await fetch("../transactions.json");
      if (response.ok) {
        const data = await response.json();
        //save  all transactions from json file
        setTransactions(data?.transactions);
        setFilteredTransactions(data?.transactions);
      } else {
        console.error("Response was not ok:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  useEffect(() => {
    getTransactions();
    getCustomers();
  }, []);
  


// Search customer name or amount transaction value
const handleSearch = () => {
  let filtered = transactions;

  if (searchName) {
    const matchingCustomers = customers.filter((c) =>
      c.name.toLowerCase().includes(searchName.toLowerCase())
    );

    if (matchingCustomers.length > 0) {
      const matchingCustomerIds = matchingCustomers.map((c) => c.id);
      filtered = filtered.filter((t) => matchingCustomerIds.includes(t.customer_id));
    } else {
      filtered = []; // If no customers match the name, clear the filtered results
    }
  }

  if (searchAmount) {
    filtered = filtered.filter((t) =>
      t.amount.toString().includes(searchAmount)
    );
  }

  setFilteredTransactions(filtered);
  setCurrentPage(1);
};



   // select specific customer to display graph
   const handleSelectCustomer = (customerId) => {
     setSelectedCustomer(customerId); // Update selectedCustomer state
   };
  
   // graph
  const getTotalTransactionsByDate = () => {
    if (!selectedCustomer) return [];


    // data customer selected
    const customerTransactions = transactions.filter(
      (transaction) => transaction.customer_id === selectedCustomer
    );
    const totalsByDate = customerTransactions.reduce((acc, curr) => {
      const date = curr.date;
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += curr.amount;
      return acc;
    }, {});

    return Object.keys(totalsByDate).map((date) => ({
      date,
      total: totalsByDate[date],
    }));
  };

  // Logic for displaying transactions calculate number of page
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );

  const totalPages = Math.ceil(
    filteredTransactions.length / transactionsPerPage
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

 

  return (
    <div className="container py-5">
      <h1 className="text-center pb-3">Customer Transactions</h1>
      <div style={{ marginBottom: 20 }} className="d-flex justify-content-end align-items-end">
      <div>
        <Input
          placeholder="Search by Customer Name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          style={{ width: 200, marginRight: 10 }}
          className="my-1"
        />
        <Input
          placeholder="Search by Transaction Amount"
          value={searchAmount}
          onChange={(e) => setSearchAmount(e.target.value)}
          style={{ width: 200, marginRight: 10 } } className="my-1"
        />
        <Button onClick={handleSearch} className="my-1">Search</Button>
        </div>
      </div>

      <div className="pt-3">
        <table className="table border-1">
          <thead >
            <tr>
             <th className="col-1 text-bg-info text-center text-light fs-4">
                No.
              </th>
              <th className="col-3 text-bg-info text-center text-light fs-4">
                Customer Name
              </th>
              <th className="col-3 text-bg-info text-center text-light fs-4">
                Transaction Date
              </th>
              <th className="col-3 text-bg-info text-center text-light fs-4">
                Transaction Amount
              </th>
            </tr>
          </thead>
          <tbody>
         {currentTransactions.length === 0 ? (
              <tr><td colSpan="4" className="fs-3 py-2 text-center">No Data</td></tr>
            ) : (
              currentTransactions.map((transaction, index) => {
                const customer = customers.find(
                  (customer) => customer.id === transaction.customer_id
                );
                return (
                  <tr
                    key={transaction.id}
                    onClick={() => handleSelectCustomer(transaction.customer_id)}
                    className="pointer text-center"
                  >
                    <td className="col-1 text-center">
                      {index + 1 + (currentPage - 1) * transactionsPerPage}
                    </td>
                    <td className="col-3">
                      {customer ? customer.name : "Unknown"}
                    </td>
                    <td className="col-3">{transaction.date}</td>
                    <td className="col-3">{transaction.amount}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div className="pagination py-3 d-flex justify-content-center align-items-center">
          <div>
            {Array.from({ length: totalPages }, (_, index) => (
              <Button
                className="mx-1"
                key={index + 1}
                onClick={() => paginate(index + 1)}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {selectedCustomer && (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={getTotalTransactionsByDate()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default CustomerTransactions;
