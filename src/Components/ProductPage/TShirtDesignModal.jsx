import React, { useState, useRef, useCallback, useEffect } from "react";
import API from "../../api";
import "./TShirtDesignModal.css";

// ─── Pure canvas background-removal (flood-fill from corners + tolerance) ───
const removeBackground = (imageUrl, tolerance) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const w = canvas.width;
      const h = canvas.height;

      const sampleCorners = () => {
        const corners = [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]];
        let r = 0, g = 0, b = 0;
        corners.forEach(([x, y]) => {
          const idx = (y * w + x) * 4;
          r += data[idx]; g += data[idx + 1]; b += data[idx + 2];
        });
        return { r: Math.round(r / 4), g: Math.round(g / 4), b: Math.round(b / 4) };
      };

      const bgColor = sampleCorners();

      const colorDistance = (idx) => {
        const dr = data[idx] - bgColor.r;
        const dg = data[idx + 1] - bgColor.g;
        const db = data[idx + 2] - bgColor.b;
        return Math.sqrt(dr * dr + dg * dg + db * db);
      };

      const visited = new Uint8Array(w * h);
      const queue = [];

      const addIfSimilar = (x, y) => {
        if (x < 0 || x >= w || y < 0 || y >= h) return;
        const pixIdx = y * w + x;
        if (visited[pixIdx]) return;
        const dataIdx = pixIdx * 4;
        if (colorDistance(dataIdx) <= tolerance) {
          visited[pixIdx] = 1;
          queue.push([x, y]);
        }
      };

      [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]].forEach(([x, y]) => {
        const pixIdx = y * w + x;
        visited[pixIdx] = 1;
        queue.push([x, y]);
      });

      let i = 0;
      while (i < queue.length) {
        const [cx, cy] = queue[i++];
        const dataIdx = (cy * w + cx) * 4;
        data[dataIdx + 3] = 0;
        addIfSimilar(cx + 1, cy); addIfSimilar(cx - 1, cy);
        addIfSimilar(cx, cy + 1); addIfSimilar(cx, cy - 1);
      }

      for (let j = 0; j < w * h; j++) {
        const idx = j * 4;
        if (data[idx + 3] > 0 && colorDistance(idx) <= tolerance * 1.5) {
          data[idx + 3] = Math.max(0, data[idx + 3] - 80);
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("Could not load image for processing."));
    img.src = imageUrl;
  });
};

const TShirtDesignModal = ({ product, selectedColor, selectedSize, garmentImage, onSave, onClose }) => {
  const [elements, setElements] = useState([]);
  const [activeId, setActiveId] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [bgRemoving, setBgRemoving] = useState(false);
  const [bgTolerance, setBgTolerance] = useState(40);

  const studioRef = useRef(null);

  // Tabs & Design Library State
  const [rightTab, setRightTab] = useState("library"); // "library" | "edit"
  const [categories, setCategories] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [selectedCat, setSelectedCat] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingDesigns, setLoadingDesigns] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await API.get("/design-categories");
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error("Error fetching categories", err);
      }
    };
    fetchCats();
  }, []);

  // Fetch designs with filters
  useEffect(() => {
    const fetchDesigns = async () => {
      setLoadingDesigns(true);
      try {
        const res = await API.get("/print-designs", {
          params: {
            category_id: selectedCat,
            search: searchQuery,
            page: currentPage,
            limit: 8
          }
        });
        if (res.data.success) {
          setDesigns(res.data.designs.data);
          setTotalPages(res.data.designs.last_page);
        }
      } catch (err) {
        console.error("Error fetching designs", err);
      } finally {
        setLoadingDesigns(false);
      }
    };
    fetchDesigns();
  }, [selectedCat, searchQuery, currentPage]);

  // Autotoggle tab based on active selection
  useEffect(() => {
    if (activeId) {
      setRightTab("edit");
    } else {
      setRightTab("library");
    }
  }, [activeId]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // ── Element Actions ──
  const addText = () => {
    const newEl = {
      id: generateId(),
      type: "text",
      text: "New Text",
      color: "#000000",
      fontSize: 24,
      fontWeight: "bold",
      fontFamily: "Outfit",
      strokeColor: "#ffffff",
      strokeWidth: 0,
      x: 0,
      y: 0,
      scale: 1,
      rotate: 0,
      opacity: 1
    };
    setElements([...elements, newEl]);
    setActiveId(newEl.id);
  };

  const handleUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please upload an image file."); return; }

    setUploading(true);
    setError("");

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const localUrl = ev.target.result;
      const newEl = {
        id: generateId(),
        type: "image",
        url: localUrl,
        originalUrl: localUrl, // For BG restore
        serverUrl: null,       // Set after upload
        x: 0,
        y: 0,
        scale: 0.5,
        rotate: 0,
        opacity: 1,
        filter: "none",
        bgRemoved: false
      };

      setElements((prev) => [...prev, newEl]);
      setActiveId(newEl.id);

      try {
        const formData = new FormData();
        formData.append("image", file);
        const res = await API.post("/custom-design/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        if (res.data.success) {
          setElements((prev) => prev.map(el =>
            el.id === newEl.id ? { ...el, serverUrl: res.data.url } : el
          ));
        }
      } catch (err) {
        console.error("Upload failed", err);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Add print design from dynamic GCS or local library
  const addDesignFromLibrary = async (imageUrl, title) => {
    setUploading(true);
    setError("");
    try {
      const localUrl = await fetchAsDataUrl(imageUrl);
      if (!localUrl) {
        setError("Failed to load design from library.");
        return;
      }
      const newEl = {
        id: generateId(),
        type: "image",
        url: localUrl,
        originalUrl: localUrl,
        serverUrl: imageUrl,
        x: 0,
        y: 0,
        scale: 0.5,
        rotate: 0,
        opacity: 1,
        filter: "none",
        bgRemoved: false
      };
      setElements((prev) => [...prev, newEl]);
      setActiveId(newEl.id);
    } catch (err) {
      setError("Failed to add design.");
    } finally {
      setUploading(false);
    }
  };

  const activeElement = elements.find(el => el.id === activeId);

  const updateActiveElement = (updates) => {
    setElements(elements.map(el => el.id === activeId ? { ...el, ...updates } : el));
  };

  // ── Drag & Resize Logic ──
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState(null); // 'move', 'resize', 'rotate'
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialElState, setInitialElState] = useState(null);

  const handlePointerDown = (e, id, type) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveId(id);
    setIsDragging(true);
    setDragType(type);

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    setDragStart({ x: clientX, y: clientY });

    const el = elements.find(e => e.id === id);
    setInitialElState({ ...el });
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !activeId || !initialElState) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const dx = clientX - dragStart.x;
    const dy = clientY - dragStart.y;

    if (dragType === 'move') {
      updateActiveElement({ x: initialElState.x + dx, y: initialElState.y + dy });
    } else if (dragType === 'resize') {
      const scaleDelta = -dy * 0.01;
      const newScale = Math.max(0.1, initialElState.scale + scaleDelta);
      updateActiveElement({ scale: newScale });
    } else if (dragType === 'rotate') {
      const rect = studioRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2 + initialElState.x;
      const centerY = rect.top + rect.height / 2 + initialElState.y;
      const angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
      const startAngle = Math.atan2(dragStart.y - centerY, dragStart.x - centerX) * (180 / Math.PI);

      updateActiveElement({ rotate: initialElState.rotate + (angle - startAngle) });
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setDragType(null);
  };

  // ── Layer Management ──
  const moveLayer = (direction) => {
    if (!activeId) return;
    const idx = elements.findIndex(el => el.id === activeId);
    if (direction === 'up' && idx < elements.length - 1) {
      const newEls = [...elements];
      [newEls[idx], newEls[idx + 1]] = [newEls[idx + 1], newEls[idx]];
      setElements(newEls);
    } else if (direction === 'down' && idx > 0) {
      const newEls = [...elements];
      [newEls[idx], newEls[idx - 1]] = [newEls[idx - 1], newEls[idx]];
      setElements(newEls);
    }
  };

  const deleteActiveElement = () => {
    setElements(elements.filter(el => el.id !== activeId));
    setActiveId(null);
  };

  // ── Background Removal ──
  const handleRemoveBg = useCallback(async () => {
    if (!activeElement || activeElement.type !== 'image') return;
    setBgRemoving(true);
    setError("");
    try {
      const result = await removeBackground(activeElement.originalUrl, bgTolerance);
      updateActiveElement({ url: result, bgRemoved: true });
    } catch (err) {
      setError("Background removal failed.");
    } finally {
      setBgRemoving(false);
    }
  }, [activeElement, bgTolerance]);

  const handleRestoreOriginal = () => {
    if (activeElement && activeElement.type === 'image') {
      updateActiveElement({ url: activeElement.originalUrl, bgRemoved: false });
    }
  };

  // ── Save/Confirm ──
  const fetchAsDataUrl = async (url) => {
    if (!url) return null;
    if (url.startsWith("data:")) return url;

    // Rewrite URL to go through backend media proxy to avoid CORS blocks
    let proxyUrl = url;
    const baseApiUrl = API.defaults.baseURL || "http://localhost:8000/api";

    if (url.includes("/storage/")) {
      const parts = url.split("/storage/");
      const path = parts[parts.length - 1];
      proxyUrl = `${baseApiUrl}/media?path=${encodeURIComponent(path)}`;
    } else if (url.startsWith("http")) {
      const match = url.match(/designs\/[^/]+$/);
      if (match) {
        proxyUrl = `${baseApiUrl}/media?path=${encodeURIComponent(match[0])}`;
      }
    }

    try {
      const response = await fetch(proxyUrl);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error("Proxy fetch error:", err);
      return null;
    }
  };

  const loadImage = (dataUrl) => {
    return new Promise((resolve, reject) => {
      if (!dataUrl) { reject(new Error("No URL")); return; }
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Image load failed"));
      img.src = dataUrl;
    });
  };

  const handleConfirmDesign = async () => {
    if (elements.length === 0) {
      setError("Please add at least one design element.");
      return;
    }
    setUploading(true);
    setError("");

    try {
      const studioW = studioRef.current?.clientWidth || 400;
      const studioH = studioRef.current?.clientHeight || 400;

      const garmentDataUrl = await fetchAsDataUrl(garmentImage);

      const loadedImages = {};
      for (const el of elements) {
        if (el.type === 'image') {
          const dUrl = await fetchAsDataUrl(el.url);
          if (dUrl) loadedImages[el.id] = await loadImage(dUrl);
        }
      }

      const W = 1200, H = 1200;
      const scaleX = W / studioW;
      const scaleY = H / studioH;

      const drawElements = (tCtx) => {
        elements.forEach(el => {
          tCtx.save();
          tCtx.globalAlpha = el.opacity;

          if (el.type === 'image') {
            const img = loadedImages[el.id];
            if (img) {
              const lw = 160 * el.scale * scaleX;
              const lh = 160 * el.scale * scaleY;
              const lx = (W - lw) / 2 + el.x * scaleX;
              const ly = (H - lh) / 2 + el.y * scaleY;
              tCtx.translate(lx + lw / 2, ly + lh / 2);
              tCtx.rotate((el.rotate * Math.PI) / 180);
              tCtx.filter = el.filter;
              tCtx.drawImage(img, -lw / 2, -lh / 2, lw, lh);
            }
          } else if (el.type === 'text') {
            tCtx.font = `${el.fontWeight} ${el.fontSize * el.scale * scaleY}px ${el.fontFamily}`;
            tCtx.fillStyle = el.color;
            tCtx.textAlign = "center";
            tCtx.textBaseline = "middle";
            tCtx.translate(W / 2 + el.x * scaleX, H / 2 + el.y * scaleY);
            tCtx.rotate((el.rotate * Math.PI) / 180);

            if (el.strokeWidth > 0) {
              tCtx.strokeStyle = el.strokeColor;
              tCtx.lineWidth = el.strokeWidth * scaleY;
              tCtx.strokeText(el.text, 0, 0);
            }
            tCtx.fillText(el.text, 0, 0);
          }

          tCtx.restore();
        });
      };

      const previewCanvas = document.createElement("canvas");
      previewCanvas.width = W; previewCanvas.height = H;
      const pCtx = previewCanvas.getContext("2d");

      if (garmentDataUrl) {
        try {
          const shirtImg = await loadImage(garmentDataUrl);
          pCtx.drawImage(shirtImg, 0, 0, W, H);
        } catch { }
      }
      drawElements(pCtx);
      const previewDataUrl = previewCanvas.toDataURL("image/png");

      const printCanvas = document.createElement("canvas");
      printCanvas.width = W; printCanvas.height = H;
      const printCtx = printCanvas.getContext("2d");
      drawElements(printCtx);

      printCanvas.toBlob(async (blob) => {
        if (!blob) { setError("Failed to generate print file."); setUploading(false); return; }
        const fd = new FormData();
        fd.append("image", blob, "print_design.png");
        try {
          const res = await API.post("/custom-design/upload", fd, {
            headers: { "Content-Type": "multipart/form-data" }
          });
          if (res.data.success) {
            onSave({
              custom_design_url: res.data.url,
              custom_preview_url: previewDataUrl,
              custom_elements: JSON.stringify(elements.map(e => ({ ...e, url: e.serverUrl })))
            });
            onClose();
          } else { setError("Failed to save print layout."); }
        } catch { setError("Server error."); }
        finally { setUploading(false); }
      }, "image/png");

    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
      setUploading(false);
    }
  };

  const handleReset = () => {
    setElements([]);
    setActiveId(null);
    setError("");
  };

  return (
    <div className="ds-modal-overlay"
      onMouseMove={handlePointerMove} onMouseUp={handlePointerUp} onMouseLeave={handlePointerUp}
      onTouchMove={handlePointerMove} onTouchEnd={handlePointerUp}>
      <div class="ds-modal-card">
        {/* Header */}
        <div className="ds-modal-header">
          <div className="ds-modal-title">
            <span className="ds-hanger-icon">🎨</span>
            <div>
              <h3>Advanced Custom Design Studio</h3>
              <p>Design Your Men's Printed T-Shirt</p>
            </div>
          </div>
          <button className="ds-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="ds-modal-body">
          {error && <div className="ds-error-bar">{error}</div>}

          <div className="ds-studio-container">
            {/* ── Left: Preview Canvas ── */}
            <div className="ds-canvas-panel">
              <div
                className="ds-studio-canvas"
                ref={studioRef}
                style={{ backgroundImage: `url(${garmentImage})` }}
              >
                {elements.map((el) => {
                  const isActive = el.id === activeId;

                  return (
                    <div
                      key={el.id}
                      className={`ds-element-wrapper ${isActive ? 'active' : ''}`}
                      style={{
                        transform: `translate(${el.x}px, ${el.y}px) rotate(${el.rotate}deg)`,
                        opacity: el.opacity,
                        zIndex: elements.findIndex(e => e.id === el.id) + 5
                      }}
                      onMouseDown={(e) => handlePointerDown(e, el.id, 'move')}
                      onTouchStart={(e) => handlePointerDown(e, el.id, 'move')}
                    >
                      {el.type === 'image' ? (
                        <img
                          src={el.url}
                          alt="design"
                          draggable={false}
                          style={{
                            width: 160 * el.scale,
                            height: 'auto',
                            filter: el.filter,
                            userSelect: 'none'
                          }}
                        />
                      ) : (
                        <div style={{
                          fontSize: `${el.fontSize * el.scale}px`,
                          fontWeight: el.fontWeight,
                          fontFamily: el.fontFamily,
                          color: el.color,
                          WebkitTextStroke: `${el.strokeWidth}px ${el.strokeColor}`,
                          whiteSpace: 'nowrap',
                          userSelect: 'none'
                        }}>
                          {el.text}
                        </div>
                      )}

                      {/* Active Box Handles */}
                      {isActive && (
                        <div className="ds-bounding-box">
                          <div
                            className="ds-handle resize-handle"
                            onMouseDown={(e) => handlePointerDown(e, el.id, 'resize')}
                            onTouchStart={(e) => handlePointerDown(e, el.id, 'resize')}
                          />
                          <div
                            className="ds-handle rotate-handle"
                            onMouseDown={(e) => handlePointerDown(e, el.id, 'rotate')}
                            onTouchStart={(e) => handlePointerDown(e, el.id, 'rotate')}
                          >
                            ↻
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add Buttons */}
              <div className="ds-toolbar">
                <button onClick={addText} className="ds-toolbar-btn">📝 Add Text</button>
                <div
                  className="ds-toolbar-btn"
                  onClick={() => document.getElementById("ds-logo-uploader").click()}
                >
                  <input
                    type="file"
                    id="ds-logo-uploader"
                    accept="image/*"
                    onChange={(e) => handleUpload(e.target.files[0])}
                    style={{ display: "none" }}
                  />
                  📸 Upload Custom Image
                </div>
              </div>
            </div>

            {/* ── Right: Controls Panel ── */}
            <div className="ds-controls-panel">
              <div className="ds-tabs">
                <button
                  className={`ds-tab-btn ${rightTab === "library" ? "active" : ""}`}
                  onClick={() => setRightTab("library")}
                >
                  Design Library
                </button>
                <button
                  className={`ds-tab-btn ${rightTab === "edit" ? "active" : ""}`}
                  onClick={() => setRightTab("edit")}
                  disabled={!activeElement}
                >
                  Edit Element
                </button>
              </div>

              {rightTab === "library" ? (
                <div className="ds-library-tab">
                  <div className="ds-library-filters">
                    <input
                      type="text"
                      placeholder="Search designs..."
                      className="ds-search-input"
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    />
                    <select
                      className="ds-category-select"
                      value={selectedCat}
                      onChange={(e) => { setSelectedCat(e.target.value); setCurrentPage(1); }}
                    >
                      <option value="">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {loadingDesigns ? (
                    <div className="ds-library-loading">Loading designs...</div>
                  ) : designs.length === 0 ? (
                    <div className="ds-library-empty">No designs found.</div>
                  ) : (
                    <>
                      <div className="ds-library-grid">
                        {designs.map(design => (
                          <div
                            key={design.id}
                            className="ds-library-item"
                            onClick={() => addDesignFromLibrary(design.image_url, design.title)}
                          >
                            <div className="ds-library-img-wrapper">
                              <img src={design.image_url} alt={design.title} className="ds-library-img" />
                            </div>
                            <span>{design.title}</span>
                          </div>
                        ))}
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="ds-pagination">
                          <button
                            className="ds-page-btn"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                          >
                            Prev
                          </button>
                          <span>Page {currentPage} of {totalPages}</span>
                          <button
                            className="ds-page-btn"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : activeElement ? (
                <>
                  <div className="ds-control-section">
                    <p className="ds-control-title">Element Settings</p>
                    <div className="ds-action-row">
                      <button onClick={() => moveLayer('up')}>Bring Forward</button>
                      <button onClick={() => moveLayer('down')}>Send Backward</button>
                      <button onClick={deleteActiveElement} style={{ color: 'red' }}>Delete</button>
                    </div>
                  </div>

                  {activeElement.type === 'text' && (
                    <div className="ds-control-section">
                      <p className="ds-control-title">Text Options</p>
                      <input
                        type="text"
                        className="ds-text-input"
                        value={activeElement.text}
                        onChange={(e) => updateActiveElement({ text: e.target.value })}
                      />
                      <div className="ds-text-options">
                        <div className="ds-option-row">
                          <label>Color</label>
                          <input type="color" value={activeElement.color} onChange={(e) => updateActiveElement({ color: e.target.value })} />
                        </div>
                        <div className="ds-option-row">
                          <label>Font</label>
                          <select value={activeElement.fontFamily} onChange={(e) => updateActiveElement({ fontFamily: e.target.value })}>
                            <option value="Outfit">Outfit</option>
                            <option value="Arial">Arial</option>
                            <option value="Times New Roman">Classic Serif</option>
                            <option value="Courier New">Monospace</option>
                            <option value="Georgia">Georgia</option>
                          </select>
                        </div>
                        <div className="ds-option-row">
                          <label>Weight</label>
                          <select value={activeElement.fontWeight} onChange={(e) => updateActiveElement({ fontWeight: e.target.value })}>
                            <option value="normal">Normal</option>
                            <option value="bold">Bold</option>
                            <option value="900">Black</option>
                          </select>
                        </div>
                        <div className="ds-option-row">
                          <label>Outline Color</label>
                          <input type="color" value={activeElement.strokeColor} onChange={(e) => updateActiveElement({ strokeColor: e.target.value })} />
                        </div>
                        <div className="ds-option-row">
                          <label>Outline Size</label>
                          <input type="range" min="0" max="10" value={activeElement.strokeWidth} onChange={(e) => updateActiveElement({ strokeWidth: parseInt(e.target.value) })} />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeElement.type === 'image' && (
                    <>
                      <div className="ds-control-section ds-bg-remove-section">
                        <p className="ds-control-title">
                          🪄 Remove Background
                          {activeElement.bgRemoved && <span className="ds-bg-badge">✓ Applied</span>}
                        </p>
                        <div className="ds-slider-group">
                          <label><span>Tolerance</span><strong>{bgTolerance}</strong></label>
                          <input type="range" min="5" max="120" value={bgTolerance} onChange={(e) => setBgTolerance(parseInt(e.target.value))} />
                        </div>
                        <div className="ds-bg-buttons">
                          <button className="ds-bg-btn ds-bg-btn--remove" onClick={handleRemoveBg} disabled={bgRemoving}>
                            {bgRemoving ? "Removing..." : "Remove Background"}
                          </button>
                          {activeElement.bgRemoved && (
                            <button className="ds-bg-btn ds-bg-btn--restore" onClick={handleRestoreOriginal}>Restore Original</button>
                          )}
                        </div>
                      </div>

                      <div className="ds-control-section">
                        <p className="ds-control-title">Filters</p>
                        <div className="ds-option-row">
                          <select value={activeElement.filter} onChange={(e) => updateActiveElement({ filter: e.target.value })}>
                            <option value="none">Normal</option>
                            <option value="grayscale(100%)">Black & White</option>
                            <option value="sepia(100%)">Sepia</option>
                            <option value="contrast(150%)">High Contrast</option>
                            <option value="brightness(1.5)">Bright</option>
                            <option value="invert(100%)">Invert</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="ds-control-section">
                    <p className="ds-control-title">Adjustments</p>
                    <div className="ds-slider-group">
                      <label><span>Opacity</span><strong>{Math.round(activeElement.opacity * 100)}%</strong></label>
                      <input type="range" min="0.1" max="1.0" step="0.01" value={activeElement.opacity} onChange={(e) => updateActiveElement({ opacity: parseFloat(e.target.value) })} />
                    </div>
                  </div>
                </>
              ) : (
                <div className="ds-empty-state">
                  <p>Select an element or choose a design to edit</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="ds-buttons-group" style={{ marginTop: 'auto' }}>
                <button className="ds-action-btn secondary" onClick={handleReset}>🔄 Reset All</button>
                <button className="ds-action-btn primary" onClick={handleConfirmDesign} disabled={uploading}>
                  {uploading ? "💾 Saving..." : "🎨 Confirm Design"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TShirtDesignModal;
