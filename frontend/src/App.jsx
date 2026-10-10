import { useState, useEffect } from 'react';

const API = '/api/todos';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      setTodos(await res.json());
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addTodo = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (res.ok) {
      setTodos([await res.json(), ...todos]);
      setText('');
    } else {
      setError('Could not add the todo');
    }
  };

  const toggleTodo = async (todo) => {
    const res = await fetch(`${API}/${todo._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !todo.completed }),
    });
    if (res.ok) setTodos(todos.map((t) => (t._id === todo._id ? await res.json() : t)));
  };

  const deleteTodo = async (id) => {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
    if (res.ok) setTodos(todos.filter((t) => t._id !== id));
  };

  return (
    <main className="app">
      <h1>Todos</h1>
      <form onSubmit={addTodo}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What needs doing?"
        />
        <button type="submit">Add</button>
      </form>

      {error && <p className="error">{error}</p>}
      {loading && <p>Loading…</p>}
      {!loading && !error && todos.length === 0 && <p>Nothing yet — add one above.</p>}

      <ul>
        {todos.map((todo) => (
          <li key={todo._id} className={todo.completed ? 'done' : ''}>
            <label>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo)}
              />
              {todo.text}
            </label>
            <button onClick={() => deleteTodo(todo._id)}>✕</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
