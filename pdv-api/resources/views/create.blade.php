<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Create Post Data (Dynamic)</title>
    <style>
        body { font-family: system-ui, sans-serif; max-width: 900px; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; color: #333; }
        h1 { margin-bottom: 2rem; color: #DC2626; }
        .tabs { display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid #ccc; padding-bottom: 1rem; }
        .tab { cursor: pointer; padding: 0.5rem 1rem; border: 1px solid transparent; border-radius: 0.25rem; font-weight: 500; }
        .tab:hover { background: #f3f4f6; }
        .tab.active { background: #DC2626; color: white; }
        form { display: none; }
        form.active { display: block; }
        .form-group { margin-bottom: 1rem; }
        label { display: block; margin-bottom: 0.25rem; font-weight: 600; font-size: 0.875rem; }
        input[type="text"], input[type="number"], input[type="date"], textarea, select { width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.25rem; }
        textarea { min-height: 100px; }
        .row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .section-title { margin-top: 1.5rem; margin-bottom: 0.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid #eee; color: #666; font-size: 1.1rem; }
        button[type="submit"] { background: #111827; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 0.25rem; cursor: pointer; font-size: 1rem; width: 100%; margin-top: 2rem; }
        button[type="submit"]:hover { background: #000; }
        .checkbox-group { display: flex; gap: 0.5rem; align-items: center; }
        .checkbox-group input { width: auto; margin: 0; }
        
        .lookup-group { display: flex; gap: 0.5rem; }
        .lookup-group select { flex-grow: 1; }
        .lookup-group button { width: auto; padding: 0.5rem 1rem; background: #2563EB; color: white; border: none; border-radius: 0.25rem; cursor: pointer; margin-top:0; }
        .lookup-group button:hover { background: #1D4ED8; }
    </style>
</head>
<body>

    <h1>Create New Post (Dynamic)</h1>

    <div class="tabs">
        <div class="tab active" onclick="showForm('flight')">Flight</div>
        <div class="tab" onclick="showForm('accommodation')">Accommodation</div>
        <div class="tab" onclick="showForm('package')">Package</div>
        <div class="tab" onclick="showForm('blog')">Blog Post</div>
    </div>

    <!-- FLIGHT FORM -->
    <form id="flight-form" class="active" onsubmit="submitForm(event, '/api/flights')">
        <div class="section-title">General Info</div>
        <div class="form-group"><label>Name</label><input type="text" name="name" required></div>
        <div class="form-group"><label>Overview</label><textarea name="overview" required></textarea></div>
        <div class="form-group"><label>Extended Information</label><textarea name="information"></textarea></div>
        <div class="row">
            <div class="form-group"><label>Banner URL</label><input type="text" name="banner"></div>
            <div class="form-group"><label>Thumbnail URL</label><input type="text" name="thumbnail"></div>
        </div>
        <div class="form-group"><label>Additional Images (URLs, one per line)</label><textarea name="images_input"></textarea></div>

        <div class="section-title">Flight Details</div>
        <div class="row">
            <div class="form-group"><label>Destination</label><input type="text" name="destination" required></div>
            <div class="form-group"><label>Starting Price</label><input type="number" step="0.01" name="starting_price" required></div>
        </div>
        <div class="row">
            <div class="form-group">
                <label>Country</label>
                <div class="lookup-group">
                    <select name="country_FK" class="country-select" required></select>
                    <button type="button" onclick="createNewLookup(this, 'country', '/api/lookups/countries', 'name')">+</button>
                </div>
            </div>
            <div class="form-group"><label>Map Location (Coords)</label><input type="text" name="map_location"></div>
        </div>
        <div class="form-group"><label>Features</label><textarea name="features"></textarea></div>
        <div class="form-group"><label>Requirements</label><textarea name="requirements"></textarea></div>
        
        <button type="submit">Create Flight</button>
    </form>

    <!-- ACCOMMODATION FORM -->
    <form id="accommodation-form" onsubmit="submitForm(event, '/api/accommodations')">
        <div class="section-title">General Info</div>
        <div class="form-group"><label>Name</label><input type="text" name="name" required></div>
        <div class="form-group"><label>Overview</label><textarea name="overview" required></textarea></div>
        <div class="form-group"><label>Extended Information</label><textarea name="information"></textarea></div>
        <div class="row">
            <div class="form-group"><label>Banner URL</label><input type="text" name="banner"></div>
            <div class="form-group"><label>Thumbnail URL</label><input type="text" name="thumbnail"></div>
        </div>
        <div class="form-group"><label>Additional Images (URLs, one per line)</label><textarea name="images_input"></textarea></div>

        <div class="section-title">Accommodation Details</div>
        <div class="row">
            <div class="form-group"><label>Destination</label><input type="text" name="destination" required></div>
            <div class="form-group"><label>Starting Price</label><input type="number" step="0.01" name="starting_price" required></div>
        </div>
        <div class="row">
            <div class="form-group">
                <label>Guest Type</label>
                <div class="lookup-group">
                    <select name="guest_type_FK" class="guest-type-select" required></select>
                    <button type="button" onclick="createNewLookup(this, 'guest_type', '/api/lookups/guest-types', 'type')">+</button>
                </div>
            </div>
            <div class="form-group">
                <label>Board Type</label>
                <div class="lookup-group">
                    <select name="board_type_FK" class="board-type-select" required></select>
                    <button type="button" onclick="createNewLookup(this, 'board_type', '/api/lookups/board-types', 'type')">+</button>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="form-group"><label>Days/Duration</label><input type="text" name="days" placeholder="e.g. 3 Days"></div>
            <div class="form-group"><label>Stars</label><input type="number" name="stars" min="1" max="5"></div>
        </div>
        <div class="form-group"><label>Map Location (Coords)</label><input type="text" name="map_location"></div>
        
        <button type="submit">Create Accommodation</button>
    </form>

    <!-- PACKAGE FORM -->
    <form id="package-form" onsubmit="submitForm(event, '/api/packages')">
        <div class="section-title">General Info</div>
        <div class="form-group"><label>Name</label><input type="text" name="name" required></div>
        <div class="form-group"><label>Overview</label><textarea name="overview" required></textarea></div>
        <div class="form-group"><label>Extended Information</label><textarea name="information"></textarea></div>
        <div class="row">
            <div class="form-group"><label>Banner URL</label><input type="text" name="banner"></div>
            <div class="form-group"><label>Thumbnail URL</label><input type="text" name="thumbnail"></div>
        </div>
        <div class="form-group"><label>Additional Images (URLs, one per line)</label><textarea name="images_input"></textarea></div>

        <div class="section-title">Package Details</div>
        <div class="form-group"><label>Starting Price</label><input type="number" step="0.01" name="starting_price" required></div>
        <div class="row">
            <div class="form-group">
                <label>Accommodation</label>
                <div class="lookup-group">
                    <select name="accommodation_FK" class="accommodation-select" required></select>
                    <button type="button" onclick="createNewLookup('accommodation', '/api/lookups/accommodations', 'name')">+</button>
                </div>
            </div>
            <div class="form-group">
                <label>Guest Type</label>
                <div class="lookup-group">
                    <select name="guest_type_FK" class="guest-type-select" required></select>
                    <button type="button" onclick="createNewLookup('guest_type', '/api/lookups/guest-types', 'type')">+</button>
                </div>
            </div>
        </div>
        <div class="form-group">
            <label>Board Type</label>
            <div class="lookup-group">
                <select name="board_type_FK" class="board-type-select" required></select>
                <button type="button" onclick="createNewLookup('board_type', '/api/lookups/board-types', 'type')">+</button>
            </div>
        </div>
        <div class="form-group"><label>Features</label><textarea name="features"></textarea></div>
        <div class="row">
            <div class="form-group"><label>Days/Duration</label><input type="text" name="days"></div>
            <div class="form-group"><label>End Date</label><input type="date" name="end_date"></div>
        </div>
        <div class="row">
            <div class="checkbox-group"><input type="checkbox" name="isActive" value="1" checked><label>Is Active</label></div>
            <div class="checkbox-group"><input type="checkbox" name="isFeatured" value="1"><label>Is Featured</label></div>
        </div>

        <button type="submit">Create Package</button>
    </form>

    <!-- BLOG POST FORM -->
    <form id="blog-form" onsubmit="submitForm(event, '/api/blog-posts')">
        <div class="section-title">General Info</div>
        <div class="form-group"><label>Name</label><input type="text" name="name" required></div>
        <div class="form-group"><label>Overview</label><textarea name="overview" required></textarea></div>
        <div class="form-group"><label>Extended Information</label><textarea name="information"></textarea></div>
        <div class="row">
            <div class="form-group"><label>Banner URL</label><input type="text" name="banner"></div>
            <div class="form-group"><label>Thumbnail URL</label><input type="text" name="thumbnail"></div>
        </div>
        <div class="form-group"><label>Additional Images (URLs, one per line)</label><textarea name="images_input"></textarea></div>

        <div class="section-title">Blog Details</div>
        <div class="form-group">
            <label>Category</label>
            <div class="lookup-group">
                <select name="blog_category_FK" class="blog-category-select" required></select>
                <button type="button" onclick="createNewLookup('blog_category', '/api/lookups/blog-categories', 'name')">+</button>
            </div>
        </div>

        <div class="form-group">
            <label>Tags</label>
            <div class="tags-container" id="blog-tags-container">
                <!-- Checkboxes populated via JS -->
            </div>
            <button type="button" onclick="createNewLookup('blog_tag', '/api/lookups/blog-tags', 'name')" style="margin-top:0.5rem; padding:0.25rem 0.5rem;">+ Add New Tag</button>
        </div>
        
        <button type="submit">Create Blog Post</button>
    </form>

    <script>
        // Global storage for lookups to avoid re-fetching constantly
        let lookups = {
            countries: [],
            guest_types: [],
            board_types: [],
            blog_categories: [],
            blog_tags: [],
            accommodations: []
        };

        window.onload = async () => {
             await fetchLookups();
        };

        async function fetchLookups() {
            try {
                const res = await fetch('/api/lookups');
                if(res.ok) {
                    lookups = await res.json();
                    populateAllSelects();
                    renderTags();
                }
            } catch(e) {
                console.error("Failed to fetch lookups", e);
            }
        }

        function populateAllSelects() {
            populateSelects('.country-select', lookups.countries, 'country_ID', 'name');
            populateSelects('.guest-type-select', lookups.guest_types, 'guest_type_ID', 'type');
            populateSelects('.board-type-select', lookups.board_types, 'board_type_ID', 'type');
            populateSelects('.blog-category-select', lookups.blog_categories, 'blog_category_ID', 'name');
            populateSelects('.accommodation-select', lookups.accommodations, 'accommodation_ID', 'name');
        }

        function renderTags() {
            const container = document.getElementById('blog-tags-container');
            container.innerHTML = '';
            lookups.blog_tags.forEach(tag => {
                const label = document.createElement('label');
                label.style.display = 'inline-block';
                label.style.marginRight = '10px';
                label.style.fontWeight = 'normal';
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.name = 'tags[]';
                checkbox.value = tag.blog_tag_ID;
                
                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(' ' + tag.name));
                container.appendChild(label);
            });
        }

        function populateSelects(selector, data, valueKey, labelKey) {
            document.querySelectorAll(selector).forEach(select => {
                const currentVal = select.value;
                select.innerHTML = '<option value="">Select...</option>';
                data.forEach(item => {
                    const opt = document.createElement('option');
                    opt.value = item[valueKey];
                    opt.textContent = item[labelKey];
                    select.appendChild(opt);
                });
                if(currentVal) select.value = currentVal; 
            });
        }

        async function createNewLookup(type, url, fieldName) {
            const name = prompt(`Enter name for new ${type.replace('_', ' ')}:`);
            if (!name) return;

            try {
                const payload = {};
                payload[fieldName] = name; // e.g. { name: 'France' } or { type: 'Full Board' }

                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    const newItem = await res.json();
                    // Determine which list to update based on type
                    if(type === 'country') lookups.countries.push(newItem);
                    if(type === 'guest_type') lookups.guest_types.push(newItem);
                    if(type === 'board_type') lookups.board_types.push(newItem);
                    if(type === 'blog_category') lookups.blog_categories.push(newItem);
                    if(type === 'accommodation') lookups.accommodations.push(newItem);
                    
                    if(type === 'blog_tag') {
                        lookups.blog_tags.push(newItem);
                        renderTags();
                        return; // Tags handled separately
                    }

                    populateAllSelects();
                    // Select the newly created item in the closest select to the button
                    const btn = event.target;
                    const select = btn.previousElementSibling;
                    if(select) {
                        // find key name by checking first item or guessing
                        const valKey = type + '_ID'; 
                        select.value = newItem[valKey];
                    }
                } else {
                    const err = await res.json();
                    alert('Error creating item: ' + JSON.stringify(err));
                }
            } catch(e) {
                alert('Network error: ' + e.message);
            }
        }

        function showForm(type) {
            document.querySelectorAll('form').forEach(f => f.classList.remove('active'));
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            
            document.getElementById(type + '-form').classList.add('active');
            event.target.classList.add('active');
        }

        async function submitForm(e, url) {
            e.preventDefault();
            const form = e.target;
            const formData = new FormData(form);
            
            // Collect Checkboxes and Handle Arrays Manually if needed
            // FormData handles 'tags[]' automatically as multiple entries, 
            // but JSON.stringify(Object.fromEntries(formData)) keeps only the last one.
            
            const data = {};
            formData.forEach((value, key) => {
                if (key.endsWith('[]')) {
                    const realKey = key.slice(0, -2); // remove []
                    if (!data[realKey]) {
                        data[realKey] = [];
                    }
                    data[realKey].push(value);
                } else {
                    data[key] = value;
                }
            });

            if (data.images_input) {
                const images = data.images_input.split('\n').map(s => s.trim()).filter(s => s.length > 0);
                if (images.length > 0) {
                    data.images = images;
                }
                delete data.images_input;
            }

            if (form.id === 'package-form') {
                data.isActive = form.querySelector('[name="isActive"]').checked ? 1 : 0;
                data.isFeatured = form.querySelector('[name="isFeatured"]').checked ? 1 : 0;
            }

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    const result = await response.json();
                    alert('Created successfully! Post ID: ' + (result.post_FK || result.id));
                    form.reset();
                    // Reset selects which might have lost value on reset
                    populateAllSelects(); 
                } else {
                    const error = await response.json();
                    console.error('Error:', error);
                    alert('Error: ' + JSON.stringify(error));
                }
            } catch (err) {
                console.error(err);
                alert('Network Error: ' + err.message);
            }
        }
    </script>
</body>
</html>
