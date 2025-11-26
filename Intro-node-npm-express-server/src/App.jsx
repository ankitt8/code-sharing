import { useEffect, useState } from 'react';

const initialForm = { name: '', email: '' };

function App() {
  const [form, setForm] = useState(initialForm);
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState({ type: 'idle', message: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setStatus({ type: 'loading', message: 'Loading users…' });
      const res = await fetch('http://localhost:3000/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data.data || []);
      setStatus({ type: 'success', message: `Loaded ${data.count || 0} users.` });
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: error.message });
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setStatus({ type: 'error', message: 'Both name and email are required.' });
      return;
    }

    try {
      setStatus({ type: 'loading', message: 'Saving user…' });
      const res = await fetch('http://localhost:3000/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save user');
      }

      const data = await res.json();
      setStatus({ type: 'success', message: data.message || 'Saved!' });
      setForm(initialForm);
      fetchUsers();
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: error.message });
    }
  };

  return (
    <div className="app">
      <header>
        <h1>React + Express + MongoDB Demo</h1>
        <p>Submit users and view the list, all served from the same Node app.</p>
      </header>

      <section className="card">
        <h2>Add a user</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Name
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Jane Doe"
            />
          </label>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="jane@example.com"
            />
          </label>
          <button type="submit" disabled={status.type === 'loading'}>
            {status.type === 'loading' ? 'Saving…' : 'Save user'}
          </button>
        </form>
        {status.message && (
          <p className={`status ${status.type}`}>{status.message}</p>
        )}
      </section>

      <section className="card">
        <div className="card-header">
          <h2>Saved users</h2>
          <button type="button" onClick={fetchUsers} disabled={status.type === 'loading'}>
            Refresh
          </button>
        </div>
        {users.length === 0 ? (
          <p>No users yet. Add one above!</p>
        ) : (
          <ul className="user-list">
            {users.map((user) => (
              <li key={user._id}>
                <p className="user-name">{user.name}</p>
                <p className="user-email">{user.email}</p>
                <p className="user-date">
                  {new Date(user.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default App;

