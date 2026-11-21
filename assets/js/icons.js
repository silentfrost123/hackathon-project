/* JISR icon sprite (Lucide-style 24px stroke icons). Injected once; use with
   <svg class="icon" aria-hidden="true"><use href="#i-name"></use></svg> */
(function () {
  var P = {
    bridge: '<path d="M3 17h18"/><path d="M5 17c0-5 3-8 7-8s7 3 7 8"/><path d="M9 17v-4"/><path d="M15 17v-4"/>',
    check: '<path d="M5 12l5 5 9-10"/>',
    'check-circle': '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.7 2.7L16 9.5"/>',
    'arrow-right': '<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>',
    menu: '<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/>',
    x: '<path d="M6 6l12 12"/><path d="M18 6L6 18"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18z"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/>',
    flask: '<path d="M9 3h6"/><path d="M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3"/><path d="M7 15h10"/>',
    bulb: '<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"/>',
    rocket: '<path d="M5 19l3-3"/><path d="M14.5 4.5c3-1 5 1 4 4L13 14l-3-3 4.5-6.5z"/><path d="M10 11l-4 .5L4 14l4 1"/><path d="M13 14l-.5 4L10 20l-1-4"/><circle cx="15.5" cy="8.5" r="1.3"/>',
    shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6l8-3z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    unlock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.8-1.2"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.4 3.3-5.5 6.5-5.5s5.9 2.1 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8"/><path d="M18 14.8c1.9.7 3.2 2.5 3.5 5.2"/>',
    'user-plus': '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.4 3.3-5.5 6.5-5.5s5.9 2.1 6.5 5.5"/><path d="M19 8v6"/><path d="M16 11h6"/>',
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z"/><path d="M14 3v5h5"/><path d="M9 13h6"/><path d="M9 17h4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/><path d="M19 16l.7 1.8 1.8.7-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7L19 16z"/>',
    star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    pin: '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    lang: '<path d="M4 5h9"/><path d="M8.5 3v2"/><path d="M11 5c-.8 4-3.5 7-7 8.5"/><path d="M6 9c1 1.8 2.7 3.3 5 4.2"/><path d="M13 21l4-10 4 10"/><path d="M14.5 17.5h5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 7.5v.5"/>',
    alert: '<path d="M12 4l9 16H3l9-16z"/><path d="M12 10v4"/><path d="M12 17v.5"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17"/><path d="M8 3v4"/><path d="M16 3v4"/>',
    download: '<path d="M12 4v11"/><path d="M7 10l5 5 5-5"/><path d="M5 20h14"/>',
    refresh: '<path d="M20 12a8 8 0 0 1-14.3 4.9"/><path d="M4 12A8 8 0 0 1 18.3 7.1"/><path d="M18 3v4.5h-4.5"/><path d="M6 21v-4.5h4.5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4 4-6.5 8-6.5s7.2 2.5 8 6.5"/>',
    building: '<rect x="4" y="3" width="12" height="18" rx="1.5"/><path d="M16 9h3a1 1 0 0 1 1 1v11"/><path d="M8 7h4"/><path d="M8 11h4"/><path d="M8 15h4"/><path d="M2 21h20"/>',
    cap: '<path d="M2 9l10-5 10 5-10 5L2 9z"/><path d="M6 11v5c2 2 10 2 12 0v-5"/><path d="M22 9v5"/>',
    coins: '<ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v4c0 1.7 2.7 3 6 3s6-1.3 6-3V7"/><path d="M9 14v3c0 1.7 2.7 3 6 3s6-1.3 6-3v-4c0-1.7-2.7-3-6-3"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    trash: '<path d="M4 7h16"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M6 7l1 13h10l1-13"/><path d="M9 7V4h6v3"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/>',
    chart: '<path d="M4 20V4"/><path d="M4 20h16"/><path d="M8 16v-5"/><path d="M12 16V8"/><path d="M16 16v-3"/>',
    bookmark: '<path d="M6 3h12v18l-6-4-6 4V3z"/>',
    handshake: '<path d="M2 11l4-4 4 2 3-2 4 1 5 4"/><path d="M6 7v7l5 4c.8.6 2 .4 2.6-.4l3.4-4.6"/><path d="M13 7l-3 3.5c-.5.6-.3 1.5.4 1.8 1 .5 2.1.2 2.8-.6L16 9"/>',
    video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
    send: '<path d="M21 3L10 14"/><path d="M21 3l-7 18-4-7-7-4 18-7z"/>',
    message: '<path d="M4 5h16v11H9l-5 4V5z"/>',
    chevron: '<path d="M9 6l6 6-6 6"/>',
    'chevron-down': '<path d="M6 9l6 6 6-6"/>',
    filter: '<path d="M4 5h16l-6 7.5V19l-4 2v-8.5L4 5z"/>',
    sort: '<path d="M7 4v16"/><path d="M3 8l4-4 4 4"/><path d="M17 20V4"/><path d="M13 16l4 4 4-4"/>',
    hash: '<path d="M5 9h14"/><path d="M4 15h14"/><path d="M10 3L8 21"/><path d="M16 3l-2 18"/>',
    award: '<circle cx="12" cy="9" r="6"/><path d="M8.5 14.5L7 22l5-3 5 3-1.5-7.5"/><path d="M9.5 9l1.7 1.7L14.5 7.5"/>',
    vault: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="12" cy="12" r="3.5"/><path d="M12 8.5V7"/><path d="M15.5 12H17"/><path d="M6 20v1.5"/><path d="M18 20v1.5"/>'
  };
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">';
  for (var k in P) svg += '<symbol id="i-' + k + '" viewBox="0 0 24 24">' + P[k] + '</symbol>';
  svg += '</svg>';
  document.body.insertAdjacentHTML('afterbegin', svg);
})();

/* Small helper used by app.js when rendering markup */
window.icon = function (name, cls) {
  return '<svg class="icon' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><use href="#i-' + name + '"></use></svg>';
};
