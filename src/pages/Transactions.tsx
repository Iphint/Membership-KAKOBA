import React, { useState } from "react";
import {
  Search,
  Plus,
  Trash2,
  ShoppingCart,
  Award,
  X,
  Check,
  ChevronDown,
  BookOpenText,
} from "lucide-react";
import { Transaction } from "../types";
import {
  getTransactions,
  createTransaction,
  deleteTransaction,
  deleteAllTransactions,
} from "@/api/transaction";

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(v);

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState<string>("");
  const [_, setLoading] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [filterType, setFilterType] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteAll, setDeleteAll] = useState(false);
  const [form, setForm] = useState({
    name_product_transaction: "",
    price_product_transaction: "",
    quantity_product_transaction: "",
    point_transaction: "",
    username: "",
    type: "purchase" as "purchase" | "redeem",
  });

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await getTransactions();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTransactions();
  }, []);

  const handleCreate = async () => {
    try {
      const payload = {
        name_product_transaction: form.name_product_transaction,
        price_product_transaction: Number(form.price_product_transaction),
        quantity_product_transaction: Number(form.quantity_product_transaction),
        point_transaction: Number(form.point_transaction),
        username: form.username,
        type: form.type,
      };

      await createTransaction(payload);

      await fetchTransactions();

      setShowModal(false);
      setForm({
        name_product_transaction: "",
        price_product_transaction: "",
        quantity_product_transaction: "",
        point_transaction: "",
        username: "",
        type: "purchase",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      setDeleteId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllTransactions();
      setTransactions([]);
      setDeleteAll(false);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = transactions.filter((t) => {
    const q = (search ?? "").toLowerCase();

    const user = (t.user?.username ?? "").toLowerCase();

    const itemMatch = (t.items || []).some((i) =>
      (i.name_product_transaction ?? "").toLowerCase().includes(q)
    );

    return (
      (filterType === "ALL" || t.type === filterType) &&
      (user.includes(q) || itemMatch)
    );
  });

  const purchaseTransactions = transactions.filter(
    (t) => t.type === "purchase"
  );

  const redeemTransactions = transactions.filter((t) => t.type === "redeem");

  const totalRevenue = transactions.reduce((sum, tx) => {
    const txTotal = (tx.items || []).reduce((s, item) => {
      return (
        s +
        (item.price_product_transaction || 0) *
          (item.quantity_product_transaction || 1)
      );
    }, 0);

    return sum + txTotal;
  }, 0);

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-3 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400"
            />
          </div>
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 cursor-pointer"
            >
              <option value="ALL">All Types</option>
              <option value="earn">Earn</option>
              <option value="redeem">Redeem</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setDeleteAll(true)}
            className="flex items-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete All</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm shadow-orange-500/20 transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm text-center">
          <p className="text-2xl font-bold text-slate-800">
            {transactions.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Total Transactions</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm text-center">
          <p className="text-base font-bold text-emerald-600">
            {formatCurrency(totalRevenue)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Total Revenue</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm text-center">
          <p className="text-2xl font-bold text-orange-600">
            {purchaseTransactions.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Purchases</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm text-center">
          <p className="text-2xl font-bold text-purple-600">
            {redeemTransactions.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Redeems</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                  Product
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">
                  User
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                  Points
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                  Type
                </th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((tx) => (
                <tr
                  key={tx.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          tx.type === "redeem"
                            ? "bg-purple-100"
                            : "bg-orange-100"
                        }`}
                      >
                        {tx.type === "redeem" ? (
                          <Award className="w-4 h-4 text-purple-500" />
                        ) : (
                          <ShoppingCart className="w-4 h-4 text-orange-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          {tx.name_product_transaction}
                        </p>
                        <p className="text-xs text-slate-400">
                          {tx.created_at}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-sm text-slate-600">
                      {tx.user?.username || "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-sm font-bold ${
                        tx.type === "redeem"
                          ? "text-red-500"
                          : "text-emerald-500"
                      }`}
                    >
                      {tx.type === "redeem" ? "-" : "+"}
                      {tx.point_transaction} pts
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        tx.type === "redeem"
                          ? "bg-purple-50 text-purple-600"
                          : "bg-orange-50 text-orange-600"
                      }`}
                    >
                      {tx.type === "redeem" ? "Redeem" : "Earn"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="px-2.5 py-1 text-xs rounded-lg hover:bg-slate-200 text-slate-600 hover:text-red-500"
                      >
                        <BookOpenText className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(tx.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No transactions found</p>
            </div>
          )}
        </div>
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
          <p className="text-xs text-slate-400">
            Showing {filtered.length} of {transactions.length} transactions
          </p>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white">
              <h3 className="font-bold text-slate-800">Add Transaction</h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                {
                  label: "Product Name",
                  key: "name_product_transaction",
                  placeholder: "Product name",
                },
                {
                  label: "Price (IDR)",
                  key: "price_product_transaction",
                  placeholder: "21000",
                },
                {
                  label: "Quantity",
                  key: "quantity_product_transaction",
                  placeholder: "1",
                },
                {
                  label: "Points",
                  key: "point_transaction",
                  placeholder: "300",
                },
                {
                  label: "Username",
                  key: "username",
                  placeholder: "user name",
                },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-sm font-medium text-slate-700 block mb-1">
                    {f.label}
                  </label>
                  <input
                    placeholder={f.placeholder}
                    value={(form as any)[f.key]}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, [f.key]: e.target.value }))
                    }
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400"
                  />
                </div>
              ))}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      type: e.target.value as any,
                    }))
                  }
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400"
                >
                  <option value="purchase">Purchase</option>
                  <option value="redeem">Redeem</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 py-2.5 bg-linear-to-r from-orange-500 to-orange-600 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-bold text-slate-800 mb-2">
              Delete Transaction?
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 rounded-xl text-sm font-medium text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All confirm */}
      {deleteAll && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-bold text-slate-800 mb-2">
              Delete All Transactions?
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              All {transactions.length} transactions will be permanently
              removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteAll(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAll}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 rounded-xl text-sm font-medium text-white"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail transaction */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-bold text-slate-800">Transaction Detail</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  #ID : {selectedTx.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* User Info */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-orange-500">
                    {selectedTx.user?.username?.charAt(0).toUpperCase() || "?"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {selectedTx.user?.username || "-"}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {selectedTx.user?.email || "-"}
                  </p>
                </div>
                {/* Badge type */}
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 ${
                    selectedTx.type === "redeem"
                      ? "bg-purple-50 text-purple-600"
                      : selectedTx.type === "earn"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-orange-50 text-orange-600"
                  }`}
                >
                  {selectedTx.type === "earn"
                    ? "Earn"
                    : selectedTx.type === "redeem"
                    ? "Redeem"
                    : "Purchase"}
                </span>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Items ({selectedTx.items?.length || 0})
                </p>
                <div className="space-y-2">
                  {selectedTx.items?.map((item: any, index: number) => (
                    <div
                      key={item.id ?? index}
                      className="flex items-start gap-3 p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      {/* Index */}
                      <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-orange-500">
                          {index + 1}
                        </span>
                      </div>

                      {/* Name & price */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700 leading-tight">
                          {item.name_product_transaction}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {formatCurrency(item.price_product_transaction)} ×{" "}
                          {item.quantity_product_transaction}
                        </p>
                      </div>

                      {/* Subtotal */}
                      <p className="text-sm font-bold text-slate-800 shrink-0">
                        {formatCurrency(
                          item.price_product_transaction *
                            item.quantity_product_transaction
                        )}
                      </p>
                    </div>
                  ))}

                  {(!selectedTx.items || selectedTx.items.length === 0) && (
                    <div className="text-center py-6 text-slate-300">
                      <ShoppingCart className="w-8 h-8 mx-auto mb-1 opacity-50" />
                      <p className="text-xs">No items</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-dashed border-slate-200" />

              {/* Summary */}
              <div className="space-y-2">
                {/* Total harga */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">Subtotal</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {formatCurrency(
                      selectedTx.items?.reduce(
                        (acc: number, item: any) =>
                          acc +
                          item.price_product_transaction *
                            item.quantity_product_transaction,
                        0
                      ) || 0
                    )}
                  </p>
                </div>

                {/* Points */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">Points</p>
                  <p
                    className={`text-sm font-bold ${
                      selectedTx.point_transaction >= 0
                        ? "text-emerald-500"
                        : "text-red-500"
                    }`}
                  >
                    {selectedTx.point_transaction >= 0 ? "+" : ""}
                    {selectedTx.point_transaction} pts
                  </p>
                </div>
              </div>

              {/* Total highlight */}
              <div className="flex items-center justify-between bg-linear-to-r from-orange-500 to-orange-600 rounded-xl px-4 py-3">
                <p className="text-sm text-white/80 font-medium">Total</p>
                <p className="text-base font-bold text-white">
                  {formatCurrency(
                    selectedTx.items?.reduce(
                      (acc: number, item: any) =>
                        acc +
                        item.price_product_transaction *
                          item.quantity_product_transaction,
                      0
                    ) || 0
                  )}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6">
              <button
                onClick={() => setSelectedTx(null)}
                className="w-full py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
