// ============================================
// CONFIGURACIÓN DE VIDEOS - EDITA AQUÍ
// ============================================
const videoLibrary = {
    anime: [
        { title: 'Bocchi The Rock - Capítulo 1', file: 'video1.mp4' },
        { title: 'Bocchi The Rock - Capítulo 2', file: 'video2.mp4' },
        { title: 'Attack on Titan - Capítulo 1', file: 'video3.mp4' }
    ],
    peliculas: [
        { title: 'Spider-Man: No Way Home', file: 'video1.mp4' },
        { title: 'The Batman', file: 'video2.mp4' }
    ],
    series: [
        { title: 'Breaking Bad - Capítulo 1', file: 'video1.mp4' },
        { title: 'Breaking Bad - Capítulo 2', file: 'video2.mp4' },
        { title: 'Stranger Things - Capítulo 1', file: 'video3.mp4' }
    ]
};

// Guardar orden original
const originalOrder = {};
Object.keys(videoLibrary).forEach(folder => {
    originalOrder[folder] = [...videoLibrary[folder]];
});

// ============================================
// FUNCIONES DE CARPETAS
// ============================================

function toggleFolder(folderName) {
    const folder = document.getElementById('folder-' + folderName);
    const arrow = folder.previousElementSibling.previousElementSibling.querySelector('.folder-arrow');
    
    if (folder.classList.contains('active')) {
        folder.classList.remove('active');
        arrow.innerText = '▼';
    } else {
        folder.classList.add('active');
        arrow.innerText = '▲';
    }
}

function sortFolder(folderName, type) {
    let videos = videoLibrary[folderName];
    
    switch(type) {
        case 'name':
            videos.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'number':
            videos.sort((a, b) => {
                const numA = parseInt(a.title.match(/\d+/)?.[0] || 0);
                const numB = parseInt(b.title.match(/\d+/)?.[0] || 0);
                return numA - numB;
            });
            break;
        case 'default':
            videoLibrary[folderName] = [...originalOrder[folderName]];
            break;
    }
    
    loadFolderVideos(folderName);
    updateStars();
}

function loadFolderVideos(folderName) {
    const grid = document.getElementById(folderName + '-grid');
    const videos = videoLibrary[folderName];
    
    if (!videos || videos.length === 0) {
        grid.innerHTML = '<p style="color: #666; text-align: center; grid-column: 1/-1;">No hay videos en esta carpeta</p>';
        return;
    }
    
    grid.innerHTML = videos.map((video, index) => {
        const videoPath = `images/${folderName}/${video.file}`;
        
        return `
            <div class="video-item">
                <video controls preload="metadata">
                    <source src="${videoPath}" type="video/mp4">
                    Tu navegador no soporta el video.
                </video>
                <div class="video-info">
                    <p>${video.title}</p>
                    <span class="star-icon" onclick="toggleFavorite(this, '${video.title}', '${videoPath}')">☆</span>
                </div>
            </div>
        `;
    }).join('');
}

function loadAllFolders() {
    Object.keys(videoLibrary).forEach(folder => {
        loadFolderVideos(folder);
    });
}

// ============================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================

function switchTab(tab) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const buttons = document.querySelectorAll('.tab-button');

    if (tab === 'login') {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        buttons[0].classList.add('active');
        buttons[1].classList.remove('active');
        clearErrors('login');
    } else {
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
        buttons[1].classList.add('active');
        buttons[0].classList.remove('active');
        clearErrors('register');
    }
}

function previewProfilePic() {
    const fileInput = document.getElementById('register-pic');
    const preview = document.getElementById('pic-preview');

    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.classList.add('show');
        };
        reader.readAsDataURL(fileInput.files[0]);
    }
}

function getUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function getFavorites() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) return [];
    
    const user = JSON.parse(currentUser);
    const allFavorites = localStorage.getItem('favorites');
    const favorites = allFavorites ? JSON.parse(allFavorites) : {};
    
    return favorites[user.username] || [];
}

function saveFavorites(favorites) {
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) return;
    
    const user = JSON.parse(currentUser);
    const allFavorites = localStorage.getItem('favorites');
    const favoritesData = allFavorites ? JSON.parse(allFavorites) : {};
    
    favoritesData[user.username] = favorites;
    localStorage.setItem('favorites', JSON.stringify(favoritesData));
}

function toggleFavorite(element, title, url) {
    const favorites = getFavorites();
    const index = favorites.findIndex(f => f.url === url);

    if (index === -1) {
        favorites.push({ title, url });
        element.classList.add('filled');
        element.innerText = '★';
    } else {
        favorites.splice(index, 1);
        element.classList.remove('filled');
        element.innerText = '☆';
    }

    saveFavorites(favorites);
    renderFavorites();
}

function renderFavorites() {
    const favorites = getFavorites();
    const grid = document.getElementById('favorites-grid');

    if (favorites.length === 0) {
        grid.innerHTML = '<div class="empty-favorites"><p>No tienes películas favoritas aún. ¡Haz clic en la estrella para agregar!</p></div>';
        return;
    }

    grid.innerHTML = favorites.map(fav => `
        <div class="video-item">
            <video controls preload="metadata"><source src="${fav.url}" type="video/mp4"></video>
            <div class="video-info">
                <p>${fav.title}</p>
                <span class="star-icon filled" onclick="toggleFavorite(this, '${fav.title}', '${fav.url}')">★</span>
            </div>
        </div>
    `).join('');
}

function updateStars() {
    const favorites = getFavorites();
    const favUrls = favorites.map(f => f.url);
    
    document.querySelectorAll('.folder-grid .star-icon').forEach(star => {
        const videoUrl = star.closest('.video-item').querySelector('video source').src;
        if (favUrls.includes(videoUrl)) {
            star.classList.add('filled');
            star.innerText = '★';
        } else {
            star.classList.remove('filled');
            star.innerText = '☆';
        }
    });
}

function register() {
    const username = document.getElementById('register-user').value.trim();
    const password = document.getElementById('register-pass').value;
    const passwordConfirm = document.getElementById('register-pass-confirm').value;
    const fileInput = document.getElementById('register-pic');
    const errorMsg = document.getElementById('register-error');
    const successMsg = document.getElementById('register-success');

    errorMsg.innerText = '';
    successMsg.innerText = '';

    if (!username) {
        errorMsg.innerText = '❌ Ingresa un nombre de usuario';
        return;
    }

    if (username.length < 3) {
        errorMsg.innerText = '❌ El usuario debe tener al menos 3 caracteres';
        return;
    }

    if (!password || password.length < 6) {
        errorMsg.innerText = '❌ La contraseña debe tener al menos 6 caracteres';
        return;
    }

    if (password !== passwordConfirm) {
        errorMsg.innerText = '❌ Las contraseñas no coinciden';
        return;
    }

    const users = getUsers();
    if (users.some(u => u.username === username)) {
        errorMsg.innerText = '❌ Este usuario ya existe';
        return;
    }

    let profilePic = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(username) + '&background=c86f8b&color=fff';

    const finishRegistration = (pic) => {
        const newUser = {
            username: username,
            password: password,
            profilePic: pic
        };

        users.push(newUser);
        saveUsers(users);

        successMsg.innerText = '✅ Cuenta creada exitosamente. Inicia sesión.';

        setTimeout(() => {
            document.getElementById('register-user').value = '';
            document.getElementById('register-pass').value = '';
            document.getElementById('register-pass-confirm').value = '';
            document.getElementById('register-pic').value = '';
            document.getElementById('pic-preview').classList.remove('show');
            switchTab('login');
        }, 1500);
    };

    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            finishRegistration(e.target.result);
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        finishRegistration(profilePic);
    }
}

function login() {
    const username = document.getElementById('login-user').value.trim();
    const password = document.getElementById('login-pass').value;
    const errorMsg = document.getElementById('login-error');

    errorMsg.innerText = '';

    if (!username || !password) {
        errorMsg.innerText = '❌ Completa todos los campos';
        return;
    }

    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        sessionStorage.setItem('currentUser', JSON.stringify(user));

        document.getElementById('header-username').innerText = user.username;
        document.getElementById('header-avatar').src = user.profilePic;

        document.getElementById('login-container').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        document.getElementById('user-header').style.display = 'flex';

        loadAllFolders();
        renderFavorites();
        updateStars();

        document.getElementById('login-user').value = '';
        document.getElementById('login-pass').value = '';
    } else {
        errorMsg.innerText = '❌ Usuario o contraseña incorrectos';
    }
}

function logout() {
    sessionStorage.removeItem('currentUser');

    document.getElementById('login-container').style.display = 'block';
    document.getElementById('main-content').style.display = 'none';
    document.getElementById('user-header').style.display = 'none';

    document.getElementById('login-user').value = '';
    document.getElementById('login-pass').value = '';

    // Cerrar carpetas
    document.querySelectorAll('.folder-content').forEach(f => f.classList.remove('active'));
    document.querySelectorAll('.folder-arrow').forEach(a => a.innerText = '▼');

    switchTab('login');
}

function clearErrors(type) {
    if (type === 'login') {
        document.getElementById('login-error').innerText = '';
    } else {
        document.getElementById('register-error').innerText = '';
        document.getElementById('register-success').innerText = '';
    }
}

// ============================================
// INICIALIZACIÓN
// ============================================

window.addEventListener('load', function() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
        const user = JSON.parse(currentUser);
        document.getElementById('header-username').innerText = user.username;
        document.getElementById('header-avatar').src = user.profilePic;

        document.getElementById('login-container').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        document.getElementById('user-header').style.display = 'flex';

        loadAllFolders();
        renderFavorites();
        updateStars();
    }
});

// Enter para enviar formularios
document.getElementById('login-user').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') login();
});
document.getElementById('login-pass').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') login();
});
document.getElementById('register-user').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') register();
});
document.getElementById('register-pass').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') register();
});
document.getElementById('register-pass-confirm').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') register();
});