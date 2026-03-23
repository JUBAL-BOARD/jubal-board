export type TransactionStatus = "Debit" | "Credit" | "Reversed" | "Pending";

export interface Transaction {
  id: number;
  details: string;
  paymentMethod: string;
  date: string;
  time: string;
  amount: string;
  status: TransactionStatus;
}

export const walletSummary = {
  availableBalance: "$5,000.00",
  totalCredit:      "$25,000.00",
  totalSpent:       "$20,000.00",
};

export const transactions: Transaction[] = [
  { id: 1,  details: "Logo Design for Luxury Boutique",   paymentMethod: "Paypal", date: "20 Nov, 2025", time: "10:00am", amount: "-$100",  status: "Debit" },
  { id: 2,  details: "Transaction Process (Fund Wallet)", paymentMethod: "Paypal", date: "20 Nov, 2025", time: "10:00am", amount: "+$1000", status: "Credit" },
  { id: 3,  details: "Transaction Process (Fund Wallet)", paymentMethod: "Paypal", date: "20 Nov, 2025", time: "10:00am", amount: "+$1000", status: "Reversed" },
  { id: 4,  details: "Logo Design for Luxury Boutique",   paymentMethod: "Paypal", date: "20 Nov, 2025", time: "10:00am", amount: "-$100",  status: "Pending" },
  { id: 5,  details: "Logo Design for Luxury Boutique",   paymentMethod: "Paypal", date: "20 Nov, 2025", time: "10:00am", amount: "-$100",  status: "Debit" },
  { id: 6,  details: "Transaction Process (Fund Wallet)", paymentMethod: "Paypal", date: "20 Nov, 2025", time: "10:00am", amount: "+$1000", status: "Credit" },
  { id: 7,  details: "Transaction Process (Fund Wallet)", paymentMethod: "Paypal", date: "20 Nov, 2025", time: "10:00am", amount: "+$1000", status: "Credit" },
  { id: 8,  details: "Transaction Process (Fund Wallet)", paymentMethod: "Paypal", date: "20 Nov, 2025", time: "10:00am", amount: "+$1000", status: "Credit" },
  { id: 9,  details: "Transaction Process (Fund Wallet)", paymentMethod: "Paypal", date: "20 Nov, 2025", time: "10:00am", amount: "+$1000", status: "Credit" },
  { id: 10, details: "Transaction Process (Fund Wallet)", paymentMethod: "Paypal", date: "20 Nov, 2025", time: "10:00am", amount: "+$1000", status: "Credit" },
];