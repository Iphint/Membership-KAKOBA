import React, { useState } from "react";
import {
  Search,
  Plus,
  Trash2,
  X,
  Check,
  BookOpenText,
  ScanLine,
} from "lucide-react";

import { Transaction, User } from "../types";

import {
  getTransactions,
  createTransaction,
  deleteTransaction,
  scanReceiptTransaction,
} from "@/api/transaction";
import { getUsers } from "@/api/user";

import Pagination from "@/components/Pagination";

const PAGE_SIZE = 10;

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(v);

type TransactionInputItem = {
  name_product_transaction: string;
  price_product_transaction: string;
  quantity_product_transaction: string;
};

type OcrPreview = {
  raw_text?: string;
  items?: TransactionInputItem[];
  total?: number;
  suggested_point?: number;
  data?: Transaction;
};

const emptyItem = (): TransactionInputItem => ({
  name_product_transaction: "",
  price_product_transaction: "",
  quantity_product_transaction: "1",
});

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: PAGE_SIZE,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [inputMode, setInputMode] = useState<"manual" | "ocr">("manual");
  const [loading, setLoading] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [manualItems, setManualItems] = useState<TransactionInputItem[]>([
    emptyItem(),
  ]);
  const [ocrPreview, setOcrPreview] = useState<OcrPreview | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const [form, setForm] = useState({
    user_id: "",
    point_transaction: "",
    type: "earn",
  });

  const fetchTransactions = async (page = 1) => {
    try {
      setLoading(true);

      const result = await getTransactions(page, PAGE_SIZE);

      setTransactions(Array.isArray(result.data) ? result.data : []);

      setPagination(result.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const result = await getUsers(1, 100);
      setUsers(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    fetchTransactions();
  }, []);

  React.useEffect(() => {
    if (showModal && users.length === 0) {
      fetchUsers();
    }
  }, [showModal, users.length]);

  const resetForm = () => {
    setForm({
      user_id: "",
      point_transaction: "",
      type: "earn",
    });

    setManualItems([emptyItem()]);
    setReceiptFile(null);
    setOcrPreview(null);
    setInputMode("manual");
    setUserSearch("");
    setSelectedUser(null);
    setUserDropdownOpen(false);
  };

  const selectUser = (user: User) => {
    setSelectedUser(user);
    setUserSearch(`${user.username}`);
    setUserDropdownOpen(false);
    setForm((prev) => ({
      ...prev,
      user_id: String(user.id),
    }));
  };

  const handleCreate = async () => {
    try {
      if (!form.user_id) {
        alert("Pilih user terlebih dahulu");
        return;
      }

      if (!form.point_transaction || Number(form.point_transaction) <= 0) {
        alert("Points wajib diisi");
        return;
      }

      const items =
        inputMode === "manual"
          ? manualItems
              .map((item) => ({
                name_product_transaction: item.name_product_transaction.trim(),
                price_product_transaction: Number(
                  item.price_product_transaction
                ),
                quantity_product_transaction: Number(
                  item.quantity_product_transaction
                ),
              }))
              .filter(
                (item) =>
                  item.name_product_transaction &&
                  item.price_product_transaction > 0 &&
                  item.quantity_product_transaction > 0
              )
          : (ocrPreview?.items || []).map((item) => ({
              name_product_transaction: item.name_product_transaction.trim(),
              price_product_transaction: Number(item.price_product_transaction),
              quantity_product_transaction: Number(
                item.quantity_product_transaction
              ),
            }));

      if (items.length === 0) {
        alert("Minimal 1 item transaksi wajib diisi");
        return;
      }

      const payload = {
        user_id: Number(form.user_id),
        items,
        point_transaction: Number(form.point_transaction),
        type: "earn",
      };

      await createTransaction(payload);
      await fetchTransactions(1);

      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const handleScanReceipt = async () => {
    try {
      if (!form.user_id) {
        alert("Pilih user terlebih dahulu");
        return;
      }

      if (!receiptFile) {
        alert("File struk wajib dipilih");
        return;
      }

      setLoading(true);
      setOcrPreview(null);

      const formData = new FormData();
      formData.append("user_id", form.user_id);
      formData.append("receipt", receiptFile);

      const result = await scanReceiptTransaction(formData);

      setOcrPreview(result);

      setForm((prev) => ({
        ...prev,
        point_transaction: String(result.suggested_point || 0),
      }));
    } catch (err: any) {
      console.error(err);
      alert(
        err?.response?.data?.message || err.message || "Failed to scan receipt"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateManualItem = (
    index: number,
    key: keyof TransactionInputItem,
    value: string
  ) => {
    setManualItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      )
    );
  };

  const addManualItem = () => {
    setManualItems((prev) => [...prev, emptyItem()]);
  };

  const removeManualItem = (index: number) => {
    setManualItems((prev) =>
      prev.length === 1
        ? prev
        : prev.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const filtered = transactions.filter((t) => {
    const q = search.toLowerCase();

    const user = (t.user?.username || "").toLowerCase();

    const itemMatch = (t.items || []).some((i) =>
      (i.name_product_transaction || "").toLowerCase().includes(q)
    );

    return (
      (filterType === "ALL" || t.type === filterType) &&
      (user.includes(q) || itemMatch)
    );
  });

  const filteredUsers = users
    .filter((user) => {
      const query = userSearch.toLowerCase().trim();

      if (!query || selectedUser?.id === user.id) return true;

      return [user.username, user.email, user.no_telp, String(user.id)]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
    })
    .slice(0, 8);

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <input
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-slate-200 rounded-xl px-3"
          >
            <option value="ALL">All</option>
            <option value="earn">Earn</option>
            <option value="redeem">Redeem</option>
          </select>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="ml-3 bg-orange-500 text-white px-4 py-2.5 rounded-xl flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Transaction
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Points</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length > 0 ? (
                filtered.map((tx) => (
                  <tr key={tx.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">
                      {tx.items?.[0]?.name_product_transaction || "-"}
                    </td>
                    <td className="px-4 py-3">{tx.user?.username || "-"}</td>
                    <td className="px-4 py-3">{tx.point_transaction} pts</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-orange-50 text-orange-600">
                        {tx.type || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* DETAIL */}
                        <button
                          type="button"
                          onClick={() => setSelectedTx(tx)}
                          className="text-slate-500 hover:text-orange-600 transition-colors"
                        >
                          <BookOpenText className="w-4 h-4" />
                        </button>

                        {/* DELETE */}
                        <button
                          type="button"
                          onClick={async () => {
                            if (
                              window.confirm(
                                "Are you sure you want to delete this transaction?"
                              )
                            ) {
                              await deleteTransaction(tx.id);
                              await fetchTransactions(pagination.currentPage);
                            }
                          }}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-sm text-slate-400"
                  >
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          meta={pagination}
          itemLabel="transactions"
          onPageChange={fetchTransactions}
        />
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Add Transaction</h3>

              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* CONTENT */}
            <div className="p-6 space-y-4">
              {/* MODE */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setInputMode("manual");
                    setOcrPreview(null);
                  }}
                  className={`py-2.5 rounded-xl border text-sm font-semibold ${
                    inputMode === "manual"
                      ? "bg-orange-500 text-white border-orange-500"
                      : "border-slate-200"
                  }`}
                >
                  Manual
                </button>

                <button
                  onClick={() => setInputMode("ocr")}
                  className={`py-2.5 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 ${
                    inputMode === "ocr"
                      ? "bg-orange-500 text-white border-orange-500"
                      : "border-slate-200"
                  }`}
                >
                  <ScanLine className="w-4 h-4" />
                  OCR Scan
                </button>
              </div>

              {/* USER SEARCH */}
              <div>
                <label className="text-sm font-medium block mb-1">
                  User
                </label>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    placeholder="Cari username, email, atau no telp"
                    value={userSearch}
                    onFocus={() => setUserDropdownOpen(true)}
                    onChange={(e) => {
                      setUserSearch(e.target.value);
                      setUserDropdownOpen(true);
                      setSelectedUser(null);
                      setForm((prev) => ({
                        ...prev,
                        user_id: "",
                      }));
                    }}
                    className="w-full border border-slate-200 rounded-xl pl-10 pr-3 py-2.5"
                  />

                  {userDropdownOpen && (
                    <div className="absolute z-20 mt-2 w-full bg-white border border-slate-100 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => selectUser(user)}
                            className="w-full px-3 py-2.5 text-left hover:bg-orange-50 flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-700 truncate">
                                {user.username}
                              </p>
                              <p className="text-xs text-slate-400 truncate">
                                {user.email}
                              </p>
                            </div>

                            <span className="text-xs font-semibold text-orange-500 bg-orange-50 rounded-lg px-2 py-1 flex-shrink-0">
                              #{user.id}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-4 text-center text-sm text-slate-400">
                          User tidak ditemukan
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {selectedUser && (
                  <div className="mt-2 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-slate-400">Selected user</p>
                      <p className="text-sm font-semibold text-slate-700 truncate">
                        {selectedUser.username}
                      </p>
                    </div>

                    <span className="text-xs font-semibold text-slate-500 flex-shrink-0">
                      user_id: {selectedUser.id}
                    </span>
                  </div>
                )}
              </div>

              {/* MANUAL */}
              {inputMode === "manual" && (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-700">
                        Items
                      </p>

                      <button
                        type="button"
                        onClick={addManualItem}
                        className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                      >
                        + Add Item
                      </button>
                    </div>

                    {manualItems.map((item, index) => (
                      <div
                        key={index}
                        className="border border-slate-100 rounded-xl p-3 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-400">
                            Item {index + 1}
                          </p>

                          <button
                            type="button"
                            onClick={() => removeManualItem(index)}
                            disabled={manualItems.length === 1}
                            className="text-xs text-red-500 disabled:text-slate-300"
                          >
                            Remove
                          </button>
                        </div>

                        <div>
                          <label className="text-sm font-medium block mb-1">
                            Product Name
                          </label>

                          <input
                            placeholder="Kopi Susu"
                            value={item.name_product_transaction}
                            onChange={(e) =>
                              updateManualItem(
                                index,
                                "name_product_transaction",
                                e.target.value
                              )
                            }
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-medium block mb-1">
                              Price
                            </label>

                            <input
                              type="number"
                              placeholder="18000"
                              value={item.price_product_transaction}
                              onChange={(e) =>
                                updateManualItem(
                                  index,
                                  "price_product_transaction",
                                  e.target.value
                                )
                              }
                              className="w-full border border-slate-200 rounded-xl px-3 py-2.5"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium block mb-1">
                              Quantity
                            </label>

                            <input
                              type="number"
                              placeholder="1"
                              value={item.quantity_product_transaction}
                              onChange={(e) =>
                                updateManualItem(
                                  index,
                                  "quantity_product_transaction",
                                  e.target.value
                                )
                              }
                              className="w-full border border-slate-200 rounded-xl px-3 py-2.5"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* OCR */}
              {inputMode === "ocr" && (
                <>
                  <div>
                    <label className="text-sm font-medium block mb-1">
                      Upload Receipt
                    </label>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        setReceiptFile(e.target.files?.[0] || null);
                        setOcrPreview(null);
                      }}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5"
                    />
                  </div>

                  <button
                    onClick={handleScanReceipt}
                    disabled={loading || !!ocrPreview?.data}
                    className="w-full bg-slate-800 text-white py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading
                      ? "Scanning..."
                      : ocrPreview?.data
                      ? "Receipt Scanned"
                      : "Scan Receipt & Create Transaction"}
                  </button>

                  {ocrPreview?.items && ocrPreview.items.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">OCR Preview</p>

                        <span className="text-xs text-emerald-600 font-semibold">
                          Transaction created
                        </span>
                      </div>

                      {ocrPreview.items.map((item, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-12 gap-2 border border-slate-100 rounded-xl p-3"
                        >
                          <input
                            value={item.name_product_transaction}
                            readOnly
                            className="col-span-6 border border-slate-200 rounded-lg px-2 py-1 text-xs"
                          />

                          <input
                            value={item.price_product_transaction}
                            readOnly
                            className="col-span-4 border border-slate-200 rounded-lg px-2 py-1 text-xs"
                          />

                          <input
                            value={item.quantity_product_transaction}
                            readOnly
                            className="col-span-2 border border-slate-200 rounded-lg px-2 py-1 text-xs"
                          />
                        </div>
                      ))}

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-slate-50 rounded-xl p-3">
                          <p className="text-xs text-slate-400">Total</p>
                          <p className="font-semibold text-slate-700">
                            {formatCurrency(ocrPreview.total || 0)}
                          </p>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-3">
                          <p className="text-xs text-slate-400">
                            Suggested Points
                          </p>
                          <p className="font-semibold text-slate-700">
                            {ocrPreview.suggested_point || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* POINT */}
              <div>
                <label className="text-sm font-medium block mb-1">Points</label>

                <input
                  placeholder="18"
                  value={form.point_transaction}
                  disabled={inputMode === "ocr" && !!ocrPreview?.data}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      point_transaction: e.target.value,
                    }))
                  }
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="flex-1 border border-slate-200 rounded-xl py-2.5"
              >
                Cancel
              </button>

              <button
                onClick={handleCreate}
                disabled={
                  loading ||
                  !form.user_id ||
                  (inputMode === "ocr" &&
                    (!ocrPreview?.items || ocrPreview.items.length === 0))
                }
                className="flex-1 bg-orange-500 text-white rounded-xl py-2.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-800">Transaction Detail</h3>

                <p className="text-xs text-slate-400 mt-1">
                  Transaction ID #{selectedTx.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedTx(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* CONTENT */}
            <div className="p-6 space-y-5">
              {/* USER */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-1">Username</p>

                  <p className="font-semibold text-slate-700">
                    {selectedTx.user?.username || "-"}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-1">Points</p>

                  <p className="font-semibold text-slate-700">
                    {selectedTx.point_transaction} pts
                  </p>
                </div>
              </div>

              {/* ITEMS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">
                    Transaction Items
                  </p>

                  <span className="text-xs text-slate-400">
                    {selectedTx.items?.length || 0} items
                  </span>
                </div>

                {selectedTx.items?.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="border border-slate-100 rounded-xl p-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-slate-700">
                        {item.name_product_transaction}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        Qty: {item.quantity_product_transaction}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-slate-700">
                        {formatCurrency(item.price_product_transaction)}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        Total:{" "}
                        {formatCurrency(
                          item.price_product_transaction *
                            item.quantity_product_transaction
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* SUMMARY */}
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">Total Transaction</p>

                  <p className="text-lg font-bold text-slate-800">
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
            </div>

            {/* FOOTER */}
            <div className="px-6 pb-6">
              <button
                onClick={() => setSelectedTx(null)}
                className="w-full border border-slate-200 rounded-xl py-2.5 hover:bg-slate-50"
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
