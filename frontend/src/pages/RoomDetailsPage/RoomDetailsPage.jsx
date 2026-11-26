import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const tabs = ["Overview", "Members", "Expenses", "Chores"];
const personId = (person) => typeof person === "string" ? person : person?._id || person?.id;
const formatCurrency = (amount) => new Intl.NumberFormat(undefined, { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(amount) || 0);
const formatDate = (date) => date ? new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "No due date";

function RoomDetailsPage() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const [tab, setTab] = useState("Overview");
  const [room, setRoom] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [chores, setChores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [expenseForm, setExpenseForm] = useState({ title: "", amount: "", category: "General" });
  const [choreForm, setChoreForm] = useState({ title: "", assignedTo: "", dueDate: "" });
  const [busy, setBusy] = useState(false);

  const loadExpenses = useCallback(async () => {
    const response = await api.get(`/transaction/${roomId}`, { params: { limit: 100, sort: "latest" } });
    setExpenses(response.data?.data?.transactions ?? []);
  }, [roomId]);

  const loadChores = useCallback(async () => {
    const response = await api.get(`/chore/${roomId}`);
    setChores(response.data?.data?.chores ?? []);
  }, [roomId]);

  const loadRoomData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [roomResponse] = await Promise.all([
        api.get(`/room/${roomId}`),
        loadExpenses(),
        loadChores(),
      ]);
      setRoom(roomResponse.data?.data ?? null);
    } catch (requestError) {
      setError(requestError.response?.data?.msg || "Unable to load this room.");
    } finally {
      setLoading(false);
    }
  }, [roomId, loadExpenses, loadChores]);

  useEffect(() => { loadRoomData(); }, [loadRoomData]);

  const members = room?.members ?? [];
  const totalSpent = useMemo(() => expenses.reduce((total, expense) => total + Number(expense.amount || 0), 0), [expenses]);
  const myBalance = useMemo(() => expenses.reduce((total, expense) => {
    const myShare = expense.splitAmong?.find((split) => personId(split.userId) === user?.id);
    return total + (myShare ? Number(myShare.debtAmount || 0) - Number(myShare.paidAmount || 0) : 0);
  }, 0), [expenses, user?.id]);

  const createExpense = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api.post(`/transaction/${roomId}`, {
        ...expenseForm,
        amount: Number(expenseForm.amount),
        splitType: "allRoomMember",
      });
      setExpenseForm({ title: "", amount: "", category: "General" });
      await loadExpenses();
      setMessage("Expense added.");
    } catch (requestError) {
      setError(requestError.response?.data?.msg || "Unable to add this expense.");
    } finally {
      setBusy(false);
    }
  };

  const createChore = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api.post(`/chore/${roomId}`, {
        ...choreForm,
        assignedTo: choreForm.assignedTo || null,
        dueDate: choreForm.dueDate || null,
      });
      setChoreForm({ title: "", assignedTo: "", dueDate: "" });
      await loadChores();
      setMessage("Chore added.");
    } catch (requestError) {
      setError(requestError.response?.data?.msg || "Unable to add this chore.");
    } finally {
      setBusy(false);
    }
  };

  const updateChoreStatus = async (chore) => {
    const status = chore.status === "Completed" ? "Pending" : "Completed";
    try {
      await api.patch(`/chore/${roomId}/${chore._id}`, { status });
      await loadChores();
    } catch (requestError) {
      setError(requestError.response?.data?.msg || "Unable to update this chore.");
    }
  };

  const removeChore = async (choreId) => {
    try {
      await api.delete(`/chore/${roomId}/${choreId}`);
      await loadChores();
    } catch (requestError) {
      setError(requestError.response?.data?.msg || "Unable to delete this chore.");
    }
  };

  const copyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(room.roomCode);
      setMessage("Invite code copied.");
    } catch {
      setError("Clipboard access is unavailable in this browser.");
    }
  };

  return (
    <div className="bg-background p-container-margin md:p-xl">
      <div className="mx-auto w-full max-w-[1200px] space-y-xl">
        <div className="flex items-center justify-between">
          <Link to="/my-rooms" className="inline-flex min-h-[44px] items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-primary hover:bg-surface-container">
            <span className="material-symbols-outlined text-lg">arrow_back</span> My Rooms
          </Link>
        </div>
            {loading && <p className="text-on-surface-variant">Loading room…</p>}
            {!loading && error && !room && <div role="alert" className="rounded-xl bg-error-container p-5 text-on-error-container">{error}</div>}
            {room && (
              <>
                <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                  <div>
                    <p className="mb-2 text-sm font-semibold text-primary">SHARED SPACE</p>
                    <h2 className="break-words font-display text-display font-bold">{room.name}</h2>
                    <p className="mt-2 text-on-surface-variant">{members.length} members · Created {formatDate(room.createdAt)}</p>
                  </div>
                  <button type="button" onClick={copyInviteCode} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-on-primary hover:bg-surface-tint">
                    <span className="material-symbols-outlined">person_add</span> Copy invite code
                  </button>
                </section>

                <nav aria-label="Room sections" className="flex gap-lg overflow-x-auto border-b border-surface-container-highest">
                  {tabs.map((item) => (
                    <button key={item} type="button" onClick={() => setTab(item)} aria-current={tab === item ? "page" : undefined} className={`shrink-0 border-b-2 px-1 pb-3 font-label-md text-label-md transition-colors ${tab === item ? "border-primary font-bold text-primary" : "border-transparent text-on-surface-variant hover:border-primary-container hover:text-primary"}`}>
                      {item}
                    </button>
                  ))}
                </nav>

                {(error || message) && <p role={error ? "alert" : "status"} className={error ? "text-sm text-error" : "text-sm text-primary"}>{error || message}</p>}

                {tab === "Overview" && (
                  <section className="space-y-lg">
                    <div className="grid grid-cols-1 gap-md sm:grid-cols-2 xl:grid-cols-4">
                      {[
                        ["Total expenses", formatCurrency(totalSpent), "payments"],
                        ["Your outstanding", formatCurrency(myBalance), "account_balance_wallet"],
                        ["Members", String(members.length), "group"],
                        ["Open chores", String(chores.filter((chore) => chore.status !== "Completed").length), "task_alt"],
                      ].map(([label, value, icon]) => (
                        <article key={label} className="rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-lg shadow-sm">
                          <span className="material-symbols-outlined text-primary">{icon}</span>
                          <p className="mt-4 text-sm text-on-surface-variant">{label}</p>
                          <p className="mt-1 text-2xl font-bold">{value}</p>
                        </article>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 gap-lg lg:grid-cols-2">
                      <section className="rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-lg shadow-sm">
                        <div className="mb-4 flex items-center justify-between gap-3"><h3 className="font-headline-md text-headline-md font-semibold">Recent expenses</h3><button type="button" onClick={() => setTab("Expenses")} className="text-sm font-semibold text-primary">View all</button></div>
                        {expenses.length === 0 ? <p className="text-sm text-on-surface-variant">No expenses yet.</p> : <div className="divide-y divide-surface-variant">{expenses.slice(0, 4).map((expense) => <ExpenseRow key={expense._id} expense={expense} />)}</div>}
                      </section>
                      <section className="rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-lg shadow-sm">
                        <div className="mb-4 flex items-center justify-between gap-3"><h3 className="font-headline-md text-headline-md font-semibold">Chores</h3><button type="button" onClick={() => setTab("Chores")} className="text-sm font-semibold text-primary">View all</button></div>
                        {chores.length === 0 ? <p className="text-sm text-on-surface-variant">No chores have been added.</p> : <div className="space-y-3">{chores.filter((chore) => chore.status !== "Completed").slice(0, 4).map((chore) => <div key={chore._id} className="flex items-center justify-between gap-3"><span className="truncate font-medium">{chore.title}</span><span className="shrink-0 text-xs text-on-surface-variant">{formatDate(chore.dueDate)}</span></div>)}</div>}
                      </section>
                    </div>
                  </section>
                )}

                {tab === "Members" && (
                  <section className="grid grid-cols-1 gap-md lg:grid-cols-12">
                    <article className="rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-lg shadow-sm lg:col-span-4">
                      <div className="mb-5 flex h-36 items-end rounded-xl bg-gradient-to-br from-primary/15 via-surface-container to-secondary-container/40 p-4">
                        <div><p className="font-headline-md text-headline-md font-bold">{room.name}</p><p className="text-sm text-on-surface-variant">{members.length} members</p></div>
                      </div>
                      <p className="text-sm text-on-surface-variant">Invite your roommates with the room code.</p>
                      <div className="mt-5 flex items-center justify-between gap-3 border-t border-surface-variant pt-4"><span className="font-mono font-semibold">{room.roomCode}</span><button type="button" onClick={copyInviteCode} className="text-sm font-semibold text-primary">Copy</button></div>
                      <p className="mt-4 border-t border-surface-variant pt-4 text-xs text-on-surface-variant">Created {formatDate(room.createdAt)}</p>
                    </article>
                    <article className="rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-lg shadow-sm lg:col-span-8">
                      <h3 className="mb-4 font-headline-md text-headline-md font-semibold">Room members</h3>
                      <div className="divide-y divide-surface-variant">
                        {members.map((member) => <div key={personId(member.user)} className="flex items-center gap-3 py-4">
                          <Avatar name={member.user?.name || "Room member"} />
                          <div className="min-w-0 flex-1"><p className="truncate font-semibold">{member.user?.name || "Room member"}{personId(member.user) === user?.id ? " (You)" : ""}</p><p className="text-sm text-on-surface-variant">{member.user?.email || "Room member"}</p></div>
                          <span className="rounded-full bg-surface-container px-3 py-1 text-xs font-semibold capitalize text-on-surface-variant">{member.role}</span>
                        </div>)}
                      </div>
                    </article>
                  </section>
                )}

                {tab === "Expenses" && (
                  <section className="grid grid-cols-1 gap-lg xl:grid-cols-[minmax(0,1fr)_20rem]">
                    <article className="min-w-0 rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-lg shadow-sm">
                      <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h3 className="font-headline-md text-headline-md font-semibold">Expenses</h3><p className="mt-1 text-sm text-on-surface-variant">{expenses.length} transactions · {formatCurrency(totalSpent)} total</p></div></div>
                      {expenses.length === 0 ? <EmptyPanel icon="receipt_long" title="No expenses yet" description="Add the first shared expense for this room." /> : <div className="divide-y divide-surface-variant">{expenses.map((expense) => <ExpenseRow key={expense._id} expense={expense} detailed />)}</div>}
                    </article>
                    <form onSubmit={createExpense} className="h-fit space-y-4 rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-lg shadow-sm">
                      <div><h3 className="font-headline-md text-headline-md font-semibold">Add expense</h3><p className="mt-1 text-sm text-on-surface-variant">Split evenly between all room members.</p></div>
                      <Field label="Description"><input required maxLength={120} value={expenseForm.title} onChange={(event) => setExpenseForm({ ...expenseForm, title: event.target.value })} placeholder="Groceries, rent…" className={inputClass} /></Field>
                      <Field label="Amount"><input required type="number" min="0.01" step="0.01" value={expenseForm.amount} onChange={(event) => setExpenseForm({ ...expenseForm, amount: event.target.value })} placeholder="0.00" className={inputClass} /></Field>
                      <Field label="Category"><select value={expenseForm.category} onChange={(event) => setExpenseForm({ ...expenseForm, category: event.target.value })} className={inputClass}><option>General</option><option>Rent</option><option>Utilities</option><option>Groceries</option><option>Transport</option><option>Other</option></select></Field>
                      <button disabled={busy} className={primaryButtonClass}>{busy ? "Saving…" : "Add expense"}</button>
                    </form>
                  </section>
                )}

                {tab === "Chores" && (
                  <section className="grid grid-cols-1 gap-lg xl:grid-cols-[minmax(0,1fr)_20rem]">
                    <article className="min-w-0 rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-lg shadow-sm">
                      <div className="mb-5"><h3 className="font-headline-md text-headline-md font-semibold">Shared chores</h3><p className="mt-1 text-sm text-on-surface-variant">Keep track of what needs doing around the room.</p></div>
                      {chores.length === 0 ? <EmptyPanel icon="checklist" title="No chores yet" description="Add a chore and assign it to a roommate." /> : <div className="divide-y divide-surface-variant">{chores.map((chore) => <div key={chore._id} className="flex flex-wrap items-center gap-3 py-4">
                        <input type="checkbox" checked={chore.status === "Completed"} onChange={() => updateChoreStatus(chore)} aria-label={`Mark ${chore.title} ${chore.status === "Completed" ? "pending" : "completed"}`} className="h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary" />
                        <div className="min-w-0 flex-1"><p className={`break-words font-semibold ${chore.status === "Completed" ? "text-on-surface-variant line-through" : ""}`}>{chore.title}</p><p className="mt-1 text-sm text-on-surface-variant">{chore.assignedTo?.name || "Unassigned"} · Due {formatDate(chore.dueDate)}</p></div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${chore.status === "Completed" ? "bg-primary/10 text-primary" : "bg-secondary-container/30 text-secondary"}`}>{chore.status}</span>
                        <button type="button" onClick={() => removeChore(chore._id)} aria-label={`Delete ${chore.title}`} className="rounded-lg p-2 text-on-surface-variant hover:bg-error-container hover:text-error"><span className="material-symbols-outlined">delete</span></button>
                      </div>)}</div>}
                    </article>
                    <form onSubmit={createChore} className="h-fit space-y-4 rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-lg shadow-sm">
                      <div><h3 className="font-headline-md text-headline-md font-semibold">Add chore</h3><p className="mt-1 text-sm text-on-surface-variant">Assign a task and set an optional due date.</p></div>
                      <Field label="Chore"><input required maxLength={120} value={choreForm.title} onChange={(event) => setChoreForm({ ...choreForm, title: event.target.value })} placeholder="Take out the recycling" className={inputClass} /></Field>
                      <Field label="Assign to"><select value={choreForm.assignedTo} onChange={(event) => setChoreForm({ ...choreForm, assignedTo: event.target.value })} className={inputClass}><option value="">Unassigned</option>{members.map((member) => <option key={personId(member.user)} value={personId(member.user)}>{member.user?.name || "Room member"}</option>)}</select></Field>
                      <Field label="Due date"><input type="date" value={choreForm.dueDate} onChange={(event) => setChoreForm({ ...choreForm, dueDate: event.target.value })} className={inputClass} /></Field>
                      <button disabled={busy} className={primaryButtonClass}>{busy ? "Saving…" : "Add chore"}</button>
                    </form>
                  </section>
                )}
              </>
            )}
          </div>
    </div>
  );
}

const inputClass = "w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 text-on-surface outline-none focus:border-primary";
const primaryButtonClass = "w-full rounded-xl bg-primary px-4 py-3 font-semibold text-on-primary hover:bg-surface-tint disabled:opacity-60";

function Field({ label, children }) {
  return <label className="block space-y-1.5 text-sm font-medium text-on-surface">{label}{children}</label>;
}

function Avatar({ name }) {
  const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">{initials}</div>;
}

function EmptyPanel({ icon, title, description }) {
  return <div className="rounded-xl border border-dashed border-outline-variant px-5 py-12 text-center"><span className="material-symbols-outlined text-4xl text-primary">{icon}</span><h4 className="mt-3 font-semibold">{title}</h4><p className="mt-1 text-sm text-on-surface-variant">{description}</p></div>;
}

function ExpenseRow({ expense, detailed = false }) {
  return <div className="flex flex-wrap items-center gap-3 py-4">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container text-primary"><span className="material-symbols-outlined">payments</span></div>
    <div className="min-w-0 flex-1"><p className="truncate font-semibold">{expense.title}</p><p className="mt-1 text-sm text-on-surface-variant">Paid by {expense.paidBy?.name || "Room member"}{detailed ? ` · ${expense.category || "General"} · ${formatDate(expense.createdAt)}` : ""}</p></div>
    <p className="font-semibold">{formatCurrency(expense.amount)}</p>
    {detailed && <p className="basis-full pl-[3.25rem] text-xs text-on-surface-variant">{expense.splitAmong?.length || 0} members · {expense.splitAmong?.map((split) => split.userId?.name || "Member").join(", ")}</p>}
  </div>;
}

export default RoomDetailsPage;
