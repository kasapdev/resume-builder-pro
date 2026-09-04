/* =====================================================================
   Resume Builder — app.js
   Form-driven CV/resume builder with a live-updating preview, two
   distinct visual themes, print-friendly output, and localStorage
   autosave. Classic script (no modules). Depends on window.WUS.
   ===================================================================== */
(function () {
  'use strict';

  var WUS = window.WUS;
  var STORE_KEY = 'resume.state';

  /* ----------------------------- DOM refs ---------------------------- */
  var cName = document.getElementById('cName');
  var cTitle = document.getElementById('cTitle');
  var cEmail = document.getElementById('cEmail');
  var cPhone = document.getElementById('cPhone');
  var cLocation = document.getElementById('cLocation');
  var cWebsite = document.getElementById('cWebsite');
  var cSummary = document.getElementById('cSummary');

  var experienceForm = document.getElementById('experienceForm');
  var experienceRowTpl = document.getElementById('experienceRowTpl');
  var educationForm = document.getElementById('educationForm');
  var educationRowTpl = document.getElementById('educationRowTpl');

  var skillInput = document.getElementById('skillInput');
  var skillTags = document.getElementById('skillTags');

  var resumeDoc = document.getElementById('resumeDoc');
  var themeClassicBtn = document.getElementById('themeClassic');
  var themeModernBtn = document.getElementById('themeModern');

  var statusBadge = document.getElementById('statusBadge');
  var statusText = document.getElementById('statusText');

  /* Preview refs */
  var rName = document.getElementById('rName');
  var rTitle = document.getElementById('rTitle');
  var rContact = document.getElementById('rContact');
  var rSummarySection = document.getElementById('rSummarySection');
  var rSummary = document.getElementById('rSummary');
  var rExperienceSection = document.getElementById('rExperienceSection');
  var rExperience = document.getElementById('rExperience');
  var rEducationSection = document.getElementById('rEducationSection');
  var rEducation = document.getElementById('rEducation');
  var rSkillsSection = document.getElementById('rSkillsSection');
  var rSkills = document.getElementById('rSkills');

  var skills = [];
  var theme = 'classic';

  /* =================================================================
     REPEATABLE ENTRIES (experience / education)
     ================================================================= */
  function addEntryRow(container, tpl, data, fields) {
    data = data || {};
    var frag = tpl.content.cloneNode(true);
    var row = frag.querySelector('[data-entry-row]');
    fields.forEach(function (f) {
      var el = row.querySelector('[data-field="' + f + '"]');
      if (el) el.value = data[f] || '';
    });
    row.querySelectorAll('input, textarea').forEach(function (inp) {
      inp.addEventListener('input', function () { renderPreview(); persistDebounced(); });
    });
    row.querySelector('[data-entry-remove]').addEventListener('click', function () {
      row.remove();
      renderPreview();
      persist();
    });
    container.appendChild(row);
    return row;
  }

  var EXP_FIELDS = ['role', 'company', 'start', 'end', 'desc'];
  var EDU_FIELDS = ['degree', 'school', 'start', 'end', 'notes'];

  function addExperience(data) { return addEntryRow(experienceForm, experienceRowTpl, data, EXP_FIELDS); }
  function addEducation(data) { return addEntryRow(educationForm, educationRowTpl, data, EDU_FIELDS); }

  function readEntries(container, fields) {
    return Array.prototype.slice.call(container.querySelectorAll('[data-entry-row]')).map(function (row) {
      var obj = {};
      fields.forEach(function (f) {
        var el = row.querySelector('[data-field="' + f + '"]');
        obj[f] = el ? el.value : '';
      });
      return obj;
    });
  }

  /* =================================================================
     SKILL TAGS
     ================================================================= */
  function renderSkillTags() {
    skillTags.innerHTML = '';
    skills.forEach(function (skill, idx) {
      var tag = document.createElement('span');
      tag.className = 'tag';
      var label = document.createElement('span');
      label.textContent = skill;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Remove ' + skill);
      btn.textContent = '×';
      btn.addEventListener('click', function () {
        skills.splice(idx, 1);
        renderSkillTags();
        renderPreview();
        persist();
      });
      tag.appendChild(label);
      tag.appendChild(btn);
      skillTags.appendChild(tag);
    });
  }

  function addSkillFromInput() {
    var v = skillInput.value.trim();
    if (!v) return;
    if (skills.some(function (s) { return s.toLowerCase() === v.toLowerCase(); })) {
      WUS.toast('Skill already added', 'error');
    } else {
      skills.push(v);
      renderSkillTags();
      renderPreview();
      persist();
    }
    skillInput.value = '';
  }

  skillInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkillFromInput();
    } else if (e.key === 'Backspace' && !skillInput.value && skills.length) {
      skills.pop();
      renderSkillTags();
      renderPreview();
      persist();
    }
  });

  /* =================================================================
     THEME
     ================================================================= */
  function setTheme(next) {
    theme = next === 'modern' ? 'modern' : 'classic';
    resumeDoc.classList.toggle('theme-classic', theme === 'classic');
    resumeDoc.classList.toggle('theme-modern', theme === 'modern');
    themeClassicBtn.classList.toggle('is-active', theme === 'classic');
    themeClassicBtn.setAttribute('aria-selected', theme === 'classic' ? 'true' : 'false');
    themeModernBtn.classList.toggle('is-active', theme === 'modern');
    themeModernBtn.setAttribute('aria-selected', theme === 'modern' ? 'true' : 'false');
  }

  /* =================================================================
     PREVIEW RENDERING
     ================================================================= */
  function renderPreview() {
    rName.textContent = cName.value.trim() || 'Your Name';
    rTitle.textContent = cTitle.value.trim();
    rTitle.style.display = cTitle.value.trim() ? '' : 'none';

    var contactParts = [cEmail.value.trim(), cPhone.value.trim(), cLocation.value.trim(), cWebsite.value.trim()].filter(Boolean);
    rContact.textContent = '';
    contactParts.forEach(function (part, idx) {
      if (idx > 0) rContact.appendChild(document.createTextNode(' · '));
      rContact.appendChild(document.createTextNode(part));
    });

    var summary = cSummary.value.trim();
    rSummary.textContent = summary;
    rSummarySection.classList.toggle('is-empty', !summary);

    var exp = readEntries(experienceForm, EXP_FIELDS).filter(function (e) { return e.role || e.company || e.desc; });
    rExperience.innerHTML = '';
    exp.forEach(function (e) {
      var div = document.createElement('div');
      div.className = 'r-entry';
      div.innerHTML =
        '<div class="r-entry-head">' +
        '<div><div class="r-entry-title">' + WUS.escapeHtml(e.role || 'Role') + (e.company ? ' <span class="r-entry-sub">— ' + WUS.escapeHtml(e.company) + '</span>' : '') + '</div></div>' +
        '<div class="r-entry-date">' + WUS.escapeHtml([e.start, e.end].filter(Boolean).join(' – ')) + '</div>' +
        '</div>' +
        (e.desc ? '<p class="r-entry-desc">' + WUS.escapeHtml(e.desc) + '</p>' : '');
      rExperience.appendChild(div);
    });
    rExperienceSection.classList.toggle('is-empty', exp.length === 0);

    var edu = readEntries(educationForm, EDU_FIELDS).filter(function (e) { return e.degree || e.school; });
    rEducation.innerHTML = '';
    edu.forEach(function (e) {
      var div = document.createElement('div');
      div.className = 'r-entry';
      div.innerHTML =
        '<div class="r-entry-head">' +
        '<div><div class="r-entry-title">' + WUS.escapeHtml(e.degree || 'Degree') + (e.school ? ' <span class="r-entry-sub">— ' + WUS.escapeHtml(e.school) + '</span>' : '') + '</div></div>' +
        '<div class="r-entry-date">' + WUS.escapeHtml([e.start, e.end].filter(Boolean).join(' – ')) + '</div>' +
        '</div>' +
        (e.notes ? '<p class="r-entry-desc">' + WUS.escapeHtml(e.notes) + '</p>' : '');
      rEducation.appendChild(div);
    });
    rEducationSection.classList.toggle('is-empty', edu.length === 0);

    rSkills.innerHTML = '';
    skills.forEach(function (s) {
      var pill = document.createElement('span');
      pill.className = 'r-skill-pill';
      pill.textContent = s;
      rSkills.appendChild(pill);
    });
    rSkillsSection.classList.toggle('is-empty', skills.length === 0);
  }

  /* =================================================================
     SERIALIZATION / PERSISTENCE
     ================================================================= */
  function serialize() {
    return {
      contact: {
        name: cName.value, title: cTitle.value, email: cEmail.value, phone: cPhone.value,
        location: cLocation.value, website: cWebsite.value
      },
      summary: cSummary.value,
      experience: readEntries(experienceForm, EXP_FIELDS),
      education: readEntries(educationForm, EDU_FIELDS),
      skills: skills.slice(),
      theme: theme
    };
  }

  function applyState(state) {
    cName.value = state.contact && state.contact.name || '';
    cTitle.value = state.contact && state.contact.title || '';
    cEmail.value = state.contact && state.contact.email || '';
    cPhone.value = state.contact && state.contact.phone || '';
    cLocation.value = state.contact && state.contact.location || '';
    cWebsite.value = state.contact && state.contact.website || '';
    cSummary.value = state.summary || '';

    experienceForm.innerHTML = '';
    (state.experience && state.experience.length ? state.experience : [{}]).forEach(function (e) { addExperience(e); });

    educationForm.innerHTML = '';
    (state.education && state.education.length ? state.education : [{}]).forEach(function (e) { addEducation(e); });

    skills = Array.isArray(state.skills) ? state.skills.slice() : [];
    renderSkillTags();

    setTheme(state.theme);
    renderPreview();
  }

  function markSaved() { statusText.textContent = 'Saved'; }
  function persist() { WUS.store.set(STORE_KEY, serialize()); markSaved(); }
  var persistDebounced = WUS.debounce(persist, 400);

  function clearAll() {
    if (!window.confirm('Clear all resume data? This cannot be undone.')) return;
    WUS.store.remove(STORE_KEY);
    skills = [];
    applyState({ theme: 'classic', experience: [{}], education: [{}] });
    WUS.toast('All data cleared');
  }

  /* =================================================================
     WIRING
     ================================================================= */
  [cName, cTitle, cEmail, cPhone, cLocation, cWebsite, cSummary].forEach(function (elm) {
    elm.addEventListener('input', function () { renderPreview(); persistDebounced(); });
  });

  document.getElementById('btnAddExperience').addEventListener('click', function () { addExperience(); renderPreview(); persist(); });
  document.getElementById('btnAddEducation').addEventListener('click', function () { addEducation(); renderPreview(); persist(); });
  document.getElementById('btnPrint').addEventListener('click', function () { window.print(); });
  document.getElementById('btnClearAll').addEventListener('click', clearAll);
  themeClassicBtn.addEventListener('click', function () { setTheme('classic'); persist(); });
  themeModernBtn.addEventListener('click', function () { setTheme('modern'); persist(); });

  /* =================================================================
     SHORTCUTS HELP MODAL
     ================================================================= */
  var helpBackdrop = document.getElementById('helpBackdrop');
  var helpClose = document.getElementById('helpClose');
  var shortcutRows = document.getElementById('shortcutRows');

  var SHORTCUTS = [
    { keys: ['mod', 'P'], desc: 'Print / Save as PDF' },
    { keys: ['?'], desc: 'Show this help' },
    { keys: ['Esc'], desc: 'Close dialog' }
  ];
  function buildShortcutTable() {
    var html = '';
    SHORTCUTS.forEach(function (s) {
      var kbds = s.keys.map(function (k) { return '<kbd>' + WUS.escapeHtml(k) + '</kbd>'; }).join('');
      html += '<tr><td>' + WUS.escapeHtml(s.desc) + '</td><td>' + kbds + '</td></tr>';
    });
    shortcutRows.innerHTML = html;
  }
  function openHelp() { helpBackdrop.hidden = false; helpClose.focus(); }
  function closeHelp() { helpBackdrop.hidden = true; }
  helpClose.addEventListener('click', closeHelp);
  helpBackdrop.addEventListener('click', function (e) { if (e.target === helpBackdrop) closeHelp(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !helpBackdrop.hidden) closeHelp(); });
  var helpBtns = document.querySelectorAll('[data-shortcut-help]');
  for (var i = 0; i < helpBtns.length; i++) helpBtns[i].addEventListener('click', openHelp);

  WUS.registerShortcut('?', function () { openHelp(); }, 'Show shortcuts');

  /* =================================================================
     INIT
     ================================================================= */
  buildShortcutTable();
  var saved = WUS.store.get(STORE_KEY, null);
  if (saved) {
    applyState(saved);
  } else {
    applyState({
      contact: { name: '', title: '', email: '', phone: '', location: '', website: '' },
      summary: '',
      experience: [{}],
      education: [{}],
      skills: [],
      theme: 'classic'
    });
  }
})();
