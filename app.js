// app.js

const STORAGE_KEY = 'notes_app';

export function getNotes() {
  const json = localStorage.getItem(STORAGE_KEY);
  return json ? JSON.parse(json) : [];
}

export function saveNotes(notes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export function generateId() {
  return Date.now().toString();
}

export function addNote({ title, content }) {
  const notes = getNotes();
  const newNote = { id: generateId(), title, content };
  notes.push(newNote);
  saveNotes(notes);
  return newNote;
}

export function updateNote(id, { title, content }) {
  const notes = getNotes().map(n =>
    n.id === id ? { ...n, title, content } : n
  );
  saveNotes(notes);
}

export function deleteNote(id) {
  const notes = getNotes().filter(n => n.id !== id);
  saveNotes(notes);
}

export function validateNote({ title }) {
  const errors = {};
  if (!title || !title.trim()) {
    errors.title = 'El título es obligatorio.';
  }
  return errors;
}

function renderList() {
  const app = document.getElementById('app');
  const notes = getNotes();

  app.innerHTML = `
    <h2>Mis Notas</h2>
    <ul class="note-list">
      ${notes.map(n => `
        <li class="note-item">
          <span>${n.title}</span>
          <div class="actions">
            <button data-id="${n.id}" class="edit" title="Editar">
              <i class="fas fa-pen"></i>
            </button>
            <button data-id="${n.id}" class="delete" title="Eliminar">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </li>
      `).join('')}
    </ul>
  `;

  app.querySelectorAll('button.edit').forEach(btn =>
    btn.addEventListener('click', () =>
      location.hash = `#/edit/${btn.dataset.id}`
    )
  );
  app.querySelectorAll('button.delete').forEach(btn =>
    btn.addEventListener('click', () => {
      if (confirm('¿Eliminar nota?')) {
        deleteNote(btn.dataset.id);
        renderList();
      }
    })
  );
}

function renderForm(mode = 'add', note = {}) {
  const isEdit = mode === 'edit';
  const app = document.getElementById('app');

  app.innerHTML = `
    <h2>${isEdit ? 'Editar Nota' : 'Nueva Nota'}</h2>
    <form id="note-form">
      <div>
        <label for="title">Título</label>
        <input type="text" id="title" name="title" value="${note.title || ''}" />
        <div class="error" id="error-title"></div>
      </div>
      <div>
        <label for="content">Contenido</label>
        <textarea id="content" name="content">${note.content || ''}</textarea>
      </div>
      <button type="submit">${isEdit ? 'Actualizar' : 'Crear'}</button>
    </form>
  `;

  document.getElementById('note-form').addEventListener('submit', e => {
    e.preventDefault();
    const data = {
      title: e.target.title.value,
      content: e.target.content.value
    };
    const errors = validateNote(data);
    document.getElementById('error-title').textContent = errors.title || '';

    if (Object.keys(errors).length === 0) {
      if (isEdit) {
        updateNote(note.id, data);
      } else {
        addNote(data);
      }
      location.hash = '#/';
    }
  });
}

function router() {
  const hash = location.hash || '#/';
  if (hash === '#/add') {
    renderForm('add');
  } else if (hash.startsWith('#/edit/')) {
    const id = hash.split('/')[2];
    const existing = getNotes().find(n => n.id === id) || {};
    renderForm('edit', existing);
  } else {
    renderList();
  }
}

window.addEventListener('load', router);
window.addEventListener('hashchange', router);
