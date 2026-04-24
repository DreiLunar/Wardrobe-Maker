<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Wardrobe Maker — AOOP Project</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=Syne:wght@400;600;700&display=swap" rel="stylesheet" />
  <style>
    /* ── Reset & Base ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --green:       #2d5a3d;
      --green-mid:   #4a8c62;
      --green-light: #e8f2ec;
      --green-pale:  #f4f9f6;
      --ink:         #1a1a18;
      --muted:       #6b6b65;
      --subtle:      #9a9a92;
      --bg:          #faf9f6;
      --surface:     #ffffff;
      --border:      rgba(0,0,0,0.08);
      --border-em:   rgba(0,0,0,0.14);
      --serif:       'DM Serif Display', Georgia, serif;
      --sans:        'Syne', system-ui, sans-serif;
      --mono:        'DM Mono', 'Courier New', monospace;
      --radius:      12px;
      --radius-sm:   8px;
    }
    html { scroll-behavior: smooth; }
    body {
      font-family: var(--sans);
      background: var(--bg);
      color: var(--ink);
      line-height: 1.6;
      min-height: 100vh;
    }

    /* ── Layout ── */
    .page { max-width: 860px; margin: 0 auto; padding: 0 1.5rem 5rem; }

    /* ── Hero ── */
    .hero {
      background: var(--green);
      color: white;
      padding: 3.5rem 3rem 3rem;
      border-radius: var(--radius);
      margin: 2rem 0 1.5rem;
      position: relative;
      overflow: hidden;
    }
    .hero::before {
      content: '';
      position: absolute;
      top: -70px; right: -70px;
      width: 280px; height: 280px;
      border-radius: 50%;
      background: rgba(255,255,255,0.06);
      pointer-events: none;
    }
    .hero::after {
      content: '';
      position: absolute;
      bottom: -50px; left: 40px;
      width: 160px; height: 160px;
      border-radius: 50%;
      background: rgba(255,255,255,0.04);
      pointer-events: none;
    }
    .hero-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .badge-row { display: flex; gap: .5rem; flex-wrap: wrap; }
    .badge {
      display: inline-block;
      background: rgba(255,255,255,0.15);
      color: rgba(255,255,255,0.92);
      font-family: var(--mono);
      font-size: 10px;
      letter-spacing: .1em;
      text-transform: uppercase;
      padding: 3px 10px;
      border-radius: 20px;
    }
    .badge.outline {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.3);
    }
    .hero h1 {
      font-family: var(--serif);
      font-size: clamp(2rem, 5vw, 2.8rem);
      font-weight: 400;
      line-height: 1.05;
      margin-bottom: .6rem;
    }
    .hero-sub {
      font-size: 14px;
      color: rgba(255,255,255,0.72);
      max-width: 520px;
      line-height: 1.7;
    }
    .hero-meta {
      margin-top: 1.4rem;
      display: flex;
      gap: .75rem;
      flex-wrap: wrap;
    }
    .meta-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 20px;
      padding: 5px 12px;
      font-size: 12px;
      color: rgba(255,255,255,0.88);
    }
    .meta-pill svg { width: 13px; height: 13px; flex-shrink: 0; }

    /* ── Section ── */
    .section {
      background: var(--surface);
      border: 0.5px solid var(--border-em);
      border-radius: var(--radius);
      padding: 1.75rem 2rem;
      margin-bottom: 1rem;
    }
    .section-label {
      font-family: var(--mono);
      font-size: 10px;
      font-weight: 500;
      letter-spacing: .12em;
      text-transform: uppercase;
      color: var(--subtle);
      margin-bottom: .9rem;
    }
    .section-title {
      font-family: var(--serif);
      font-size: 1.4rem;
      font-weight: 400;
      margin-bottom: .6rem;
      color: var(--ink);
    }
    .section p {
      font-size: 14px;
      color: var(--muted);
      line-height: 1.75;
    }
    .section p + p { margin-top: .75rem; }

    /* ── Diagrams ── */
    .diagram-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    @media (max-width: 580px) { .diagram-grid { grid-template-columns: 1fr; } }

    .diagram-slot {
      border: 1.5px dashed var(--border-em);
      border-radius: var(--radius-sm);
      overflow: hidden;
      position: relative;
      cursor: pointer;
      transition: border-color .2s, background .2s;
      min-height: 180px;
      display: flex;
      flex-direction: column;
    }
    .diagram-slot:hover { border-color: var(--green-mid); background: var(--green-pale); }
    .diagram-slot.has-image { border-style: solid; border-color: var(--green); }

    .slot-placeholder {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      gap: .5rem;
      text-align: center;
    }
    .slot-placeholder svg {
      width: 32px; height: 32px;
      stroke: var(--subtle);
      fill: none;
      stroke-width: 1.5;
      margin-bottom: .25rem;
    }
    .slot-placeholder .slot-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--ink);
    }
    .slot-placeholder .slot-hint {
      font-size: 11px;
      color: var(--subtle);
    }

    .slot-image-wrap { display: none; }
    .slot-image-wrap.visible { display: block; }
    .slot-image-wrap img {
      width: 100%;
      height: auto;
      display: block;
    }
    .slot-footer {
      display: none;
      align-items: center;
      justify-content: space-between;
      padding: .5rem .75rem;
      border-top: 0.5px solid var(--border);
      background: var(--green-pale);
    }
    .slot-footer.visible { display: flex; }
    .slot-footer-name {
      font-size: 11px;
      font-family: var(--mono);
      color: var(--green);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 140px;
    }
    .slot-footer button {
      font-size: 11px;
      color: #a32d2d;
      background: none;
      border: none;
      cursor: pointer;
      font-family: var(--sans);
      padding: 2px 6px;
      border-radius: 4px;
    }
    .slot-footer button:hover { background: #fcebeb; }

    input[type=file] { display: none; }

    /* ── Class List ── */
    .class-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: .6rem;
    }
    .cls-item {
      display: flex;
      align-items: center;
      gap: .6rem;
      padding: .65rem .9rem;
      background: var(--bg);
      border: 0.5px solid var(--border-em);
      border-radius: var(--radius-sm);
    }
    .cls-badge {
      font-family: var(--mono);
      font-size: 9px;
      font-weight: 500;
      letter-spacing: .05em;
      padding: 2px 7px;
      border-radius: 4px;
      white-space: nowrap;
    }
    .cls-badge.abstract { background: #e8f2ec; color: #2d5a3d; }
    .cls-badge.class    { background: #e6f1fb; color: #185fa5; }
    .cls-name { font-family: var(--mono); font-size: 13px; font-weight: 500; color: var(--ink); }

    /* ── Features ── */
    .feat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: .75rem;
    }
    .feat {
      background: var(--bg);
      border: 0.5px solid var(--border-em);
      border-radius: var(--radius-sm);
      padding: 1rem 1.1rem;
    }
    .feat-icon {
      width: 28px; height: 28px;
      background: var(--green-light);
      border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: .6rem;
    }
    .feat-icon svg { width: 14px; height: 14px; stroke: var(--green); fill: none; stroke-width: 2; }
    .feat h4 { font-size: 13px; font-weight: 600; margin-bottom: 3px; color: var(--ink); }
    .feat p  { font-size: 12px; color: var(--muted); line-height: 1.5; }

    /* ── OOP Principles ── */
    .principles { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
    @media (max-width: 520px) { .principles { grid-template-columns: 1fr; } }
    .principle {
      padding: 1rem 1.25rem;
      border-radius: var(--radius-sm);
      border-left: 3px solid var(--green);
      background: var(--green-pale);
    }
    .principle h4 { font-size: 13px; font-weight: 600; color: var(--green); margin-bottom: 3px; }
    .principle p  { font-size: 12px; color: var(--muted); line-height: 1.5; }

    /* ── Team ── */
    .team-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: .75rem;
    }
    @media (max-width: 480px) { .team-grid { grid-template-columns: 1fr; } }
    .member {
      background: var(--bg);
      border: 0.5px solid var(--border-em);
      border-radius: var(--radius);
      padding: 1.25rem 1rem;
      text-align: center;
      transition: border-color .2s, transform .2s;
    }
    .member:hover { border-color: var(--green-mid); transform: translateY(-2px); }
    .avatar {
      width: 48px; height: 48px;
      border-radius: 50%;
      margin: 0 auto .7rem;
      display: flex; align-items: center; justify-content: center;
      font-size: 15px; font-weight: 700;
    }
    .av1 { background: #e8f2ec; color: #2d5a3d; }
    .av2 { background: #e6f1fb; color: #185fa5; }
    .av3 { background: #faeeda; color: #854f0b; }
    .member-name { font-size: 13px; font-weight: 700; color: var(--ink); margin-bottom: 2px; }
    .member-role { font-size: 11px; color: var(--muted); margin-bottom: .6rem; }
    .gh-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      font-family: var(--mono);
      color: var(--green);
      text-decoration: none;
      background: var(--green-light);
      padding: 4px 10px;
      border-radius: 20px;
      transition: background .2s;
    }
    .gh-btn:hover { background: #d0e8da; }
    .gh-btn svg { width: 12px; height: 12px; fill: currentColor; }

    /* ── Footer ── */
    .footer {
      margin-top: 2.5rem;
      text-align: center;
      font-size: 12px;
      color: var(--subtle);
      font-family: var(--mono);
    }
    .footer a { color: var(--green-mid); text-decoration: none; }

    /* ── Instruction banner ── */
    .info-banner {
      background: #faeeda;
      border: 0.5px solid #ef9f27;
      border-radius: var(--radius-sm);
      padding: .75rem 1rem;
      font-size: 12px;
      color: #633806;
      margin-bottom: 1.5rem;
      display: flex;
      gap: .5rem;
      align-items: flex-start;
    }
    .info-banner svg { width: 14px; height: 14px; stroke: #854f0b; fill:none; stroke-width:2; flex-shrink:0; margin-top:1px; }
    .info-banner strong { font-weight: 700; }

    /* Fade in animation */
    @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    .hero        { animation: fadeUp .5s ease both; }
    .info-banner { animation: fadeUp .5s .05s ease both; }
    .section     { animation: fadeUp .5s .1s ease both; }
  </style>
</head>
<body>
<div class="page">

  <!-- Hero -->
  <div class="hero">
    <div class="hero-top">
      <div class="badge-row">
        <span class="badge">AOOP · Group Project</span>
        <span class="badge outline">C# · .NET</span>
      </div>
    </div>
    <h1>Wardrobe<br><i>Manager</i></h1>
    <p class="hero-sub">
      An Advanced Object-Oriented Programming project implementing a clothing inventory system
      using inheritance, abstraction, polymorphism, and encapsulation principles.
    </p>
    <div class="hero-meta">
      <span class="meta-pill">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        Clothing Inventory
      </span>
      <span class="meta-pill">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
        Laundry Tracker
      </span>
      <span class="meta-pill">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
        Outfit Builder
      </span>
    </div>
  </div>

  <!-- How to add images instruction -->
  <div class="info-banner">
    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    <span>
      <strong>How to add your diagrams:</strong>
      Click either diagram box below to preview an image from your computer.
      To make it permanent in your GitHub repo, place your files as
      <code>images/uml-diagram.png</code> and <code>images/flowchart.png</code>
      then update the <code>src</code> attributes in the HTML.
    </span>
  </div>

  <!-- About -->
  <div class="section">
    <div class="section-label">Overview</div>
    <div class="section-title">About the Project</div>
    <p>
      Wardrobe Manager is a desktop application that lets users organize their personal clothing inventory,
      construct outfits, and monitor laundry status. The system demonstrates real-world application of
      AOOP concepts through a meaningful, everyday problem domain.
    </p>
    <p>
      The architecture centers on an abstract <code>ClothingItem</code> base class which <code>Top</code>,
      <code>Bottom</code>, and <code>Footwear</code> extend — each overriding <code>GetDetails()</code>
      to demonstrate polymorphism. The <code>WardrobeManager</code> class coordinates inventory and lookbook
      management, while <code>Outfit</code> composes the three clothing subtypes into a schedulable ensemble.
    </p>
  </div>

  <!-- Diagrams -->
  <div class="section">
    <div class="section-label">Diagrams</div>

    <div class="diagram-grid">
      <!-- UML Slot -->
      <div>
        <p style="font-size:12px;color:var(--muted);margin-bottom:.5rem;font-family:var(--mono);">UML Class Diagram</p>
        <div class="diagram-slot" id="slot-uml" onclick="triggerUpload('file-uml')">
          <input type="file" id="file-uml" accept="image/*"
                 onchange="loadImage(event,'slot-uml','prev-uml','wrap-uml','footer-uml','name-uml')">
          <div class="slot-placeholder" id="ph-uml">
            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
            <span class="slot-title">UML Class Diagram</span>
            <span class="slot-hint">Click to upload · PNG, JPG, SVG</span>
          </div>
          <div class="slot-image-wrap" id="wrap-uml">
            <img id="prev-uml" alt="UML Class Diagram" />
          </div>
          <div class="slot-footer" id="footer-uml">
            <span class="slot-footer-name" id="name-uml"></span>
            <button onclick="removeImage(event,'slot-uml','prev-uml','wrap-uml','footer-uml','ph-uml','file-uml')">Remove</button>
          </div>
        </div>
      </div>

      <!-- Flowchart Slot -->
      <div>
        <p style="font-size:12px;color:var(--muted);margin-bottom:.5rem;font-family:var(--mono);">Flowchart</p>
        <div class="diagram-slot" id="slot-flow" onclick="triggerUpload('file-flow')">
          <input type="file" id="file-flow" accept="image/*"
                 onchange="loadImage(event,'slot-flow','prev-flow','wrap-flow','footer-flow','name-flow')">
          <div class="slot-placeholder" id="ph-flow">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="2"/><path d="M12 7v3M8 13h8M12 10v3M9 13l-1.5 4M15 13l1.5 4"/></svg>
            <span class="slot-title">Flowchart</span>
            <span class="slot-hint">Click to upload · PNG, JPG, SVG</span>
          </div>
          <div class="slot-image-wrap" id="wrap-flow">
            <img id="prev-flow" alt="Flowchart" />
          </div>
          <div class="slot-footer" id="footer-flow">
            <span class="slot-footer-name" id="name-flow"></span>
            <button onclick="removeImage(event,'slot-flow','prev-flow','wrap-flow','footer-flow','ph-flow','file-flow')">Remove</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- OOP Principles -->
  <div class="section">
    <div class="section-label">Design Patterns</div>
    <div class="section-title">OOP Principles Applied</div>
    <br>
    <div class="principles">
      <div class="principle">
        <h4>Abstraction</h4>
        <p><code>ClothingItem</code> is declared abstract, hiding implementation details and enforcing a contract that all clothing types must fulfill via <code>GetDetails()</code>.</p>
      </div>
      <div class="principle">
        <h4>Inheritance</h4>
        <p><code>Top</code>, <code>Bottom</code>, and <code>Footwear</code> inherit shared attributes like <code>ItemID</code>, <code>Name</code>, <code>Tags</code>, and <code>IsClean</code> from <code>ClothingItem</code>.</p>
      </div>
      <div class="principle">
        <h4>Polymorphism</h4>
        <p>Each subclass overrides <code>GetDetails()</code> to return type-specific descriptions (e.g., sleeve type for tops, fit type for bottoms).</p>
      </div>
      <div class="principle">
        <h4>Encapsulation</h4>
        <p>Fields are exposed through public properties, and state changes (like laundry toggling) are mediated through methods like <code>ToggleLaundryStatus()</code>.</p>
      </div>
    </div>
  </div>

  <!-- Class Structure -->
  <div class="section">
    <div class="section-label">Architecture</div>
    <div class="section-title">Class Structure</div>
    <br>
    <div class="class-grid">
      <div class="cls-item">
        <span class="cls-badge class">class</span>
        <span class="cls-name">WardrobeManager</span>
      </div>
      <div class="cls-item">
        <span class="cls-badge abstract">abstract</span>
        <span class="cls-name">ClothingItem</span>
      </div>
      <div class="cls-item">
        <span class="cls-badge class">class</span>
        <span class="cls-name">Top</span>
      </div>
      <div class="cls-item">
        <span class="cls-badge class">class</span>
        <span class="cls-name">Bottom</span>
      </div>
      <div class="cls-item">
        <span class="cls-badge class">class</span>
        <span class="cls-name">Footwear</span>
      </div>
      <div class="cls-item">
        <span class="cls-badge class">class</span>
        <span class="cls-name">Outfit</span>
      </div>
    </div>
  </div>

  <!-- Features -->
  <div class="section">
    <div class="section-label">Functionality</div>
    <div class="section-title">Key Features</div>
    <br>
    <div class="feat-grid">
      <div class="feat">
        <div class="feat-icon">
          <svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
        </div>
        <h4>Clothing Inventory</h4>
        <p>Add, browse, and manage clothing items organized by type and tags.</p>
      </div>
      <div class="feat">
        <div class="feat-icon">
          <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 12h8M12 8v8"/></svg>
        </div>
        <h4>Outfit Builder</h4>
        <p>Compose outfits by pairing a top, bottom, and footwear item.</p>
      </div>
      <div class="feat">
        <div class="feat-icon">
          <svg viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
        </div>
        <h4>Laundry Tracker</h4>
        <p>Toggle clean or dirty status on any clothing item with one click.</p>
      </div>
      <div class="feat">
        <div class="feat-icon">
          <svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        </div>
        <h4>Lookbook</h4>
        <p>Save outfit combinations with optional schedule dates.</p>
      </div>
      <div class="feat">
        <div class="feat-icon">
          <svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
        </div>
        <h4>Data Persistence</h4>
        <p>Save and reload inventory state between sessions.</p>
      </div>
      <div class="feat">
        <div class="feat-icon">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <h4>Tag Filtering</h4>
        <p>Filter and generate outfits by color, style, and custom tags.</p>
      </div>
    </div>
  </div>

  <!-- Team -->
  <div class="section">
    <div class="section-label">Team</div>
    <div class="section-title">Group Members</div>
    <br>
    <div class="team-grid">
      <div class="member">
        <div class="avatar av1">DL</div>
        <div class="member-name">DreiLunar</div>
        <div class="member-role">Developer</div>
        <a class="gh-btn" href="https://github.com/DreiLunar" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.38 7.86 10.9.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.19a11.1 11.1 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.5 3.17-1.19 3.17-1.19.63 1.58.23 2.75.11 3.04.74.8 1.19 1.82 1.19 3.08 0 4.43-2.7 5.41-5.27 5.69.42.36.79 1.07.79 2.15v3.19c0 .31.21.67.8.56C20.21 21.38 23.5 17.08 23.5 12 23.5 5.73 18.27.5 12 .5z"/></svg>
          @DreiLunar
        </a>
      </div>
      <div class="member">
        <div class="avatar av2">TI</div>
        <div class="member-name">tinintinti</div>
        <div class="member-role">Developer</div>
        <a class="gh-btn" href="https://github.com/tinintinti" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.38 7.86 10.9.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.19a11.1 11.1 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.5 3.17-1.19 3.17-1.19.63 1.58.23 2.75.11 3.04.74.8 1.19 1.82 1.19 3.08 0 4.43-2.7 5.41-5.27 5.69.42.36.79 1.07.79 2.15v3.19c0 .31.21.67.8.56C20.21 21.38 23.5 17.08 23.5 12 23.5 5.73 18.27.5 12 .5z"/></svg>
          @tinintinti
        </a>
      </div>
      <div class="member">
        <div class="avatar av3">RJ</div>
        <div class="member-name">Rjay29</div>
        <div class="member-role">Developer</div>
        <a class="gh-btn" href="https://github.com/Rjay29" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.38 7.86 10.9.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.19a11.1 11.1 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.5 3.17-1.19 3.17-1.19.63 1.58.23 2.75.11 3.04.74.8 1.19 1.82 1.19 3.08 0 4.43-2.7 5.41-5.27 5.69.42.36.79 1.07.79 2.15v3.19c0 .31.21.67.8.56C20.21 21.38 23.5 17.08 23.5 12 23.5 5.73 18.27.5 12 .5z"/></svg>
          @Rjay29
        </a>
      </div>
    </div>
  </div>

  <div class="footer">
    Built for Advanced Object-Oriented Programming &nbsp;·&nbsp;
    <a href="https://github.com/DreiLunar" target="_blank">GitHub</a>
  </div>

</div>

<script>
  function triggerUpload(fileId) {
    document.getElementById(fileId).click();
  }

  function loadImage(event, slotId, previewId, wrapId, footerId, nameId) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById(previewId).src = e.target.result;
      document.getElementById(wrapId).classList.add('visible');
      document.getElementById(footerId).classList.add('visible');
      document.getElementById(nameId).textContent = file.name;
      document.getElementById('ph-' + slotId.split('-')[1]).style.display = 'none';
      const slot = document.getElementById(slotId);
      slot.classList.add('has-image');
    };
    reader.readAsDataURL(file);
  }

  function removeImage(event, slotId, previewId, wrapId, footerId, phId, fileId) {
    event.stopPropagation();
    document.getElementById(previewId).src = '';
    document.getElementById(wrapId).classList.remove('visible');
    document.getElementById(footerId).classList.remove('visible');
    document.getElementById(phId).style.display = '';
    document.getElementById(fileId).value = '';
    document.getElementById(slotId).classList.remove('has-image');
  }
</script>
</body>
</html>
