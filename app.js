// To‑Do PWA — accessible, with localStorage, filters, parallax & install button
const KEY = 'todos_v1';
let todos = [];
// Filter state: 'toutes' | 'actives' | 'terminees'
let currentFilter = 'toutes';

// Elements
const addForm = document.getElementById('addForm');
const todoInput = document.getElementById('todoInput');
const prioritySelect = document.getElementById('prioritySelect');
const todoList = document.getElementById('todoList');
const todoCount = document.getElementById('todoCount');
const filterButtons = Array.from(document.querySelectorAll('.filters .chip'));
const installBtn = document.getElementById('installBtn');

// ---------- Storage ----------
function load(){ try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } }
function save(){ localStorage.setItem(KEY, JSON.stringify(todos)); }

// ---------- Utils ----------
function pluralize(n){
  return n + ' ' + (n === 1 ? 'tâche' : 'tâches');
}
function byFilter(list, filter){
  if(filter === 'actives') return list.filter(t => !t.done);
  if(filter === 'terminees') return list.filter(t => t.done);
  return list;
}

// ---------- Render ----------
function render(){
  const filtered = byFilter(todos, currentFilter);
  todoList.innerHTML = '';
  for(const t of filtered){
    const li = document.createElement('li');
    li.className = 'item' + (t.done ? ' done' : '');
    li.dataset.id = t.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = t.done;
    checkbox.addEventListener('change', () => toggle(t.id));

    const content = document.createElement('div');
    const badge = document.createElement('span');
    badge.className = 'badge ' + t.priority;
    badge.textContent = t.priority.charAt(0).toUpperCase() + t.priority.slice(1);

    const p = document.createElement('p');
    p.className = 'text' + (t.done ? ' done' : '');
    p.textContent = t.text;

    content.appendChild(badge);
    content.appendChild(p);

    const actions = document.createElement('div');
    actions.className = 'actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'iconbtn';
    editBtn.type = 'button';
    editBtn.textContent = 'Éditer';
    editBtn.addEventListener('click', () => inlineEdit(t.id, p));

    const delBtn = document.createElement('button');
    delBtn.className = 'iconbtn';
    delBtn.type = 'button';
    delBtn.textContent = 'Supprimer';
    delBtn.addEventListener('click', () => remove(t.id));

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    li.appendChild(checkbox);
    li.appendChild(content);
    li.appendChild(actions);

    todoList.appendChild(li);
  }
  const remaining = todos.filter(t => !t.done).length;
  todoCount.textContent = pluralize(remaining);
}

// ---------- CRUD ----------
function addTodo(text, priority='normale'){
  const t = { id: crypto.randomUUID(), text: text.trim(), priority, done:false, createdAt: Date.now() };
  todos = [t, ...todos];
  save(); render();
}
function toggle(id){
  todos = todos.map(t => t.id === id ? { ...t, done: !t.done } : t);
  save(); render();
}
function remove(id){
  todos = todos.filter(t => t.id !== id);
  save(); render();
}
function inlineEdit(id, pEl){
  const t = todos.find(x => x.id === id);
  if(!t) return;
  const input = document.createElement('input');
  input.type = 'text';
  input.value = t.text;
  input.maxLength = 200;
  input.className = 'text';
  pEl.replaceWith(input);
  input.focus();
  const confirm = () => {
    t.text = input.value.trim() || t.text;
    save(); render();
  };
  input.addEventListener('blur', confirm, { once:true });
  input.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter') { e.preventDefault(); input.blur(); }
    if(e.key === 'Escape') { e.preventDefault(); render(); }
  });
}

// ---------- Events ----------
addForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const text = todoInput.value.trim();
  if(!text) return;
  addTodo(text, prioritySelect.value);
  addForm.reset();
  todoInput.focus();
});

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
    btn.classList.add('active'); btn.setAttribute('aria-selected','true');
    currentFilter = btn.dataset.filter;
    render();
  });
});

// ---------- Parallax (with rAF + passive) ----------
const hero = document.querySelector('[data-parallax]');
let ticking = false;
function updateParallax(){
  const y = window.scrollY || 0;
  // Move overlay content slightly for depth
  hero.style.transform = `translateY(${y * 0.25}px)`;
  ticking = false;
}
if(hero){
  window.addEventListener('scroll', () => {
    if(!ticking){ requestAnimationFrame(updateParallax); ticking = true; }
  }, { passive: true });
}

// ---------- PWA: Service Worker ----------
if('serviceWorker' in navigator){
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(console.error);
  });
}

// ---------- PWA: Install button ----------
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.hidden = false;
});

installBtn?.addEventListener('click', async () => {
  if(!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.hidden = true;
});

// ---------- Init ----------
todos = load();
render();
