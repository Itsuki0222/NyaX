window.addEventListener('DOMContentLoaded', () => {
    // --- 1. 初期設定 & グローバル変数 ---
    const SUPABASE_URL = 'https://mnvdpvsivqqbzbtjtpws.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1udmRwdnNpdnFxYnpidGp0cHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwNTIxMDMsImV4cCI6MjA1NTYyODEwM30.yasDnEOlUi6zKNsnuPXD8RA6tsPljrwBRQNPVLsXAks';
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // 【【【 警告：これは極めて危険な実装です 】】】
    const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1udmRwdnNpdnFxYnpidGp0cHdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MjEwMywiZXhwIjoyMDU1NjI4MTAzfQ.oeUdur2k0VsoLcaMn8XHnQGuRfwf3Qwbc3OkDeeOI_A";
    const supabaseAdmin = window.supabase.createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    let selectedFiles = [];

    let currentUser = null; let realtimeChannel = null; let currentTimelineTab = 'foryou';
    let replyingTo = null;

    // ▼▼▼ [修正点1] 無限スクロール関連の変数 ▼▼▼
    let isLoadingMore = false;
    let observer;
    const POSTS_PER_PAGE = 15;
    // ▲▲▲ [修正点1] ここまで ▼▼▼

    // --- 2. アイコンSVG定義 ---
    const ICONS = {
        home: `<svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><rect x="9" y="12" width="6" height="10"></rect></svg>`,
        explore: `<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
        notifications: `<svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`,
        likes: `<svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
        stars: `<svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
        profile: `<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
        settings: `<svg viewBox="0 0 24 24"><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0 .33 1.82V12a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
        attachment: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>`,
    };

    // --- 3. DOM要素の取得 ---
    const DOM = {
        mainContent: document.getElementById('main-content'),
        navMenuTop: document.getElementById('nav-menu-top'),
        navMenuBottom: document.getElementById('nav-menu-bottom'),
        pageHeader: document.getElementById('page-header'),
        screens: document.querySelectorAll('.screen'),
        postFormContainer: document.querySelector('.post-form-container'),
        postModal: document.getElementById('post-modal'),
        imagePreviewModal: document.getElementById('image-preview-modal'),
        imagePreviewModalContent: document.getElementById('image-preview-modal-content'),
        timeline: document.getElementById('timeline'),
        exploreContent: document.getElementById('explore-content'),
        notificationsContent: document.getElementById('notifications-content'),
        likesContent: document.getElementById('likes-content'),
        starsContent: document.getElementById('stars-content'),
        postDetailContent: document.getElementById('post-detail-content'),
        searchResultsScreen: document.getElementById('search-results-screen'),
        searchResultsContent: document.getElementById('search-results-content'),
        loadingOverlay: document.getElementById('loading-overlay'),
        loginBanner: document.getElementById('login-banner'),
        rightSidebar: {
            recommendations: document.getElementById('recommendations-widget-container'),
            searchWidget: document.getElementById('right-sidebar-search-widget-container')
        }
    };

    // --- 4. ユーティリティ関数 ---
    function showLoading(show) { DOM.loadingOverlay.classList.toggle('hidden', !show); }
    function showScreen(screenId) {
        DOM.screens.forEach(screen => screen.classList.add('hidden'));
        document.getElementById(screenId)?.classList.remove('hidden');
    }
    function escapeHTML(str) { if (typeof str !== 'string') return ''; const div = document.createElement('div'); div.textContent = str; return div.innerHTML; }

    function updateFollowButtonState(buttonElement, isFollowing) {
        buttonElement.classList.remove('follow-button-not-following', 'follow-button-following');
        if (isFollowing) {
            buttonElement.textContent = 'フォロー中';
            buttonElement.classList.add('follow-button-following');
            buttonElement.onmouseenter = () => { buttonElement.textContent = 'フォロー解除'; };
            buttonElement.onmouseleave = () => { buttonElement.textContent = 'フォロー中'; };
        } else {
            buttonElement.textContent = 'フォロー';
            buttonElement.classList.add('follow-button-not-following');
            buttonElement.onmouseenter = null;
            buttonElement.onmouseleave = null;
        }
        buttonElement.disabled = false;
    }

    async function sendNotification(recipientId, message) {
        if (!currentUser || !recipientId || !message || recipientId === currentUser.id) return;
        try {
            const { data: userData, error: fetchError } = await supabase.from('user').select('notice, notice_count').eq('id', recipientId).single();
            if (fetchError || !userData) { console.error('通知受信者の情報取得に失敗:', fetchError); return; }
            const currentNotices = userData.notice || [];
            const updatedNotices = [`${new Date().toLocaleDateString('ja-JP')} ${new Date().toLocaleTimeString('ja-JP')} - ${message}`, ...currentNotices].slice(0, 50);
            const updatedNoticeCount = (userData.notice_count || 0) + 1;
            const { error: updateError } = await supabase.from('user').update({ notice: updatedNotices, notice_count: updatedNoticeCount }).eq('id', recipientId);
            if (updateError) { console.error('通知の更新に失敗:', updateError); }
        } catch (e) { console.error('通知送信中にエラー発生:', e); }
    }
    
    async function formatPostContent(text) {
        let formattedText = escapeHTML(text);
        const urlRegex = /(https?:\/\/[^\s<>"'’]+)/g;
        formattedText = formattedText.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">$1</a>');
        const hashtagRegex = /#([a-zA-Z0-9_ぁ-んァ-ヶー一-龠]+)/g;
        formattedText = formattedText.replace(hashtagRegex, (match, tagName) => `<a href="#search/${encodeURIComponent(tagName)}" onclick="event.stopPropagation()">${match}</a>`);
        const mentionRegex = /@(\d+)/g;
        const userIds = [...formattedText.matchAll(mentionRegex)].map(match => parseInt(match[1]));
        if (userIds.length > 0) {
            const { data: users, error } = await supabase.from('user').select('id, name').in('id', userIds);
            if (!error && users) {
                const userMap = new Map(users.map(user => [user.id, user.name]));
                formattedText = formattedText.replace(mentionRegex, (match, userId) => {
                    const numericId = parseInt(userId);
                    if (userMap.has(numericId)) {
                        const userName = userMap.get(numericId);
                        return `<a href="#profile/${numericId}" onclick="event.stopPropagation()">@${escapeHTML(userName)}</a>`;
                    }
                    return match;
                });
            }
        }
        return formattedText;
    }

    // --- 5. ルーティングと画面管理 ---
    async function router() {
        await updateNavAndSidebars();
        const hash = window.location.hash || '#';
        showLoading(true);
        try {
            if (observer) observer.disconnect(); // 画面遷移時にobserverを停止
            if (hash.startsWith('#post/')) await showPostDetail(hash.substring(6));
            else if (hash.startsWith('#profile/')) await showProfileScreen(parseInt(hash.substring(9)));
            else if (hash.startsWith('#search/')) await showSearchResults(decodeURIComponent(hash.substring(8)));
            else if (hash === '#settings' && currentUser) await showSettingsScreen();
            else if (hash === '#explore') await showExploreScreen();
            else if (hash === '#notifications' && currentUser) await showNotificationsScreen();
            else if (hash === '#likes' && currentUser) await showLikesScreen();
            else if (hash === '#stars' && currentUser) await showStarsScreen();
            else await showMainScreen();
        } catch (error) {
            console.error("Routing error:", error);
            DOM.pageHeader.innerHTML = `<h2>エラー</h2>`;
            showScreen('main-screen');
            DOM.timeline.innerHTML = `<p class="error-message">ページの読み込み中にエラーが発生しました。</p>`;
        } finally {
            showLoading(false);
        }
    }

    // --- 6. ナビゲーションとサイドバー ---
    async function updateNavAndSidebars() {
        const hash = window.location.hash || '#';
        const menuItems = [ { name: 'ホーム', hash: '#', icon: ICONS.home }, { name: '検索', hash: '#explore', icon: ICONS.explore } ];
        if (currentUser && !currentUser.notice_count_fetched_recently) {
            const { data: updatedUser, error } = await supabase.from('user').select('notice, notice_count').eq('id', currentUser.id).single();
            if (!error && updatedUser) {
                currentUser.notice = updatedUser.notice;
                currentUser.notice_count = updatedUser.notice_count;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
            currentUser.notice_count_fetched_recently = true;
            setTimeout(() => { if (currentUser) currentUser.notice_count_fetched_recently = false; }, 10000);
        }
        if (currentUser) {
            menuItems.push( { name: '通知', hash: '#notifications', icon: ICONS.notifications, badge: currentUser.notice_count }, { name: 'いいね', hash: '#likes', icon: ICONS.likes }, { name: 'お気に入り', hash: '#stars', icon: ICONS.stars }, { name: 'プロフィール', hash: `#profile/${currentUser.id}`, icon: ICONS.profile }, { name: '設定', hash: '#settings', icon: ICONS.settings } );
        }
        DOM.navMenuTop.innerHTML = menuItems.map(item => ` <a href="${item.hash}" class="nav-item ${hash === item.hash ? 'active' : ''}"> ${item.icon} <span>${item.name}</span> ${item.badge && item.badge > 0 ? `<span class="notification-badge">${item.badge > 99 ? '99+' : item.badge}</span>` : ''} </a>`).join('');
        if(currentUser) DOM.navMenuTop.innerHTML += `<button class="nav-item nav-item-post"><span>ポスト</span></button>`;
        DOM.navMenuBottom.innerHTML = currentUser ? `<button id="account-button" class="nav-item account-button"> <img src="https://trampoline.turbowarp.org/avatars/by-username/${currentUser.scid}" class="user-icon" alt="${currentUser.name}'s icon"> <div class="account-info"> <span class="name">${escapeHTML(currentUser.name)}</span> <span class="id">#${currentUser.id}</span> </div> </button>` : `<button id="login-button" class="nav-item"><span>ログイン</span></button>`;
        DOM.loginBanner.classList.toggle('hidden', !!currentUser);
        DOM.navMenuTop.querySelectorAll('a.nav-item').forEach(link => link.addEventListener('click', (e) => { e.preventDefault(); window.location.hash = link.getAttribute('href'); }));
        DOM.navMenuBottom.querySelector('button')?.addEventListener('click', currentUser ? handleLogout : goToLoginPage);
        DOM.navMenuTop.querySelector('.nav-item-post')?.addEventListener('click', () => openPostModal());
        loadRightSidebar();
    }
    async function loadRightSidebar() {
        if (DOM.rightSidebar.searchWidget) {
            DOM.rightSidebar.searchWidget.innerHTML = ` <div class="sidebar-search-widget"> ${ICONS.explore} <input type="search" id="sidebar-search-input" placeholder="検索"> </div>`;
            document.getElementById('sidebar-search-input').addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const query = e.target.value.trim();
                    if (query) { window.location.hash = `#search/${encodeURIComponent(query)}`; }
                }
            });
        }
        const { data, error } = await supabase.rpc('get_recommended_users', { count_limit: 3 });
        if (error || !data || data.length === 0) { if(DOM.rightSidebar.recommendations) DOM.rightSidebar.recommendations.innerHTML = ''; return; }
        let recHTML = '<div class="widget-title">おすすめユーザー</div>';
        recHTML += data.map(user => {
            const isFollowing = currentUser?.follow?.includes(user.id);
            const btnClass = isFollowing ? 'follow-button-following' : 'follow-button-not-following';
            const btnText = isFollowing ? 'フォロー中' : 'フォロー';
            return ` <div class="widget-item recommend-user"> <a href="#profile/${user.id}" style="text-decoration:none; color:inherit; display:flex; align-items:center; gap:0.5rem;"> <img src="https://trampoline.turbowarp.org/avatars/by-username/${user.scid}" style="width:40px;height:40px;border-radius:50%;" alt="${user.name}'s icon"> <div> <span>${escapeHTML(user.name)}</span> <small style="color:var(--secondary-text-color); display:block;">#${user.id}</small> </div> </a> ${currentUser && currentUser.id !== user.id ? `<button class="${btnClass}" data-user-id="${user.id}">${btnText}</button>` : ''} </div>`;
        }).join('');
        if(DOM.rightSidebar.recommendations) DOM.rightSidebar.recommendations.innerHTML = `<div class="sidebar-widget">${recHTML}</div>`;
        DOM.rightSidebar.recommendations?.querySelectorAll('.recommend-user button').forEach(button => {
            const userId = parseInt(button.dataset.userId);
            if (!isNaN(userId)) {
                const isFollowing = currentUser?.follow?.includes(userId);
                updateFollowButtonState(button, isFollowing);
                button.onclick = () => handleFollowToggle(userId, button);
            }
        });
    }

    // --- 7. 認証とセッション ---
    function goToLoginPage() { window.location.href = 'login.html'; }
    function handleLogout() {
        if(!confirm("ログアウトしますか？")) return;
        currentUser = null; localStorage.removeItem('currentUser');
        if (realtimeChannel) { supabase.removeChannel(realtimeChannel); realtimeChannel = null; }
        window.location.hash = '#';
        router();
    }
    function checkSession() {
        const userJson = localStorage.getItem('currentUser');
        currentUser = userJson ? JSON.parse(userJson) : null;
        if(currentUser) subscribeToChanges();
        router();
    }

    // --- 8. ポスト関連のUIとロジック ---
    function openPostModal(replyInfo = null) {
        if (!currentUser) return goToLoginPage();
        DOM.postModal.classList.remove('hidden');
        const modalContainer = DOM.postModal.querySelector('.post-form-container-modal');
        modalContainer.innerHTML = createPostFormHTML();
        attachPostFormListeners(modalContainer);

        if (replyInfo) {
            replyingTo = replyInfo;
            const replyInfoDiv = modalContainer.querySelector('#reply-info');
            replyInfoDiv.innerHTML = `<span>@${replyInfo.name}に返信中</span>`;
            replyInfoDiv.classList.remove('hidden');
        }
        DOM.postModal.querySelector('.modal-close-btn').onclick = closePostModal;
        modalContainer.querySelector('textarea').focus();
    }
    function closePostModal() {
        DOM.postModal.classList.add('hidden');
        replyingTo = null;
        selectedFiles = [];
    }
    const handleCtrlEnter = (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            e.target.closest('.post-form').querySelector('button[id^="post-submit-button"]').click();
        }
    };
    
    function createPostFormHTML() {
        return `
            <div class="post-form">
                <img src="https://trampoline.turbowarp.org/avatars/by-username/${currentUser.scid}" class="user-icon" alt="your icon">
                <div class="form-content">
                    <div id="reply-info" class="hidden" style="margin-bottom: 0.5rem; color: var(--secondary-text-color);"></div>
                    <textarea id="post-content" placeholder="いまどうしてる？" maxlength="280"></textarea>
                    <div class="file-preview-container"></div>
                    <div class="post-form-actions">
                        <button type="button" class="attachment-button" title="ファイルを添付">
                            ${ICONS.attachment}
                        </button>
                        <input type="file" id="file-input" class="hidden" multiple>
                        <button id="post-submit-button">ポスト</button>
                    </div>
                </div>
            </div>`;
    }
    function attachPostFormListeners(container) {
        container.querySelector('.attachment-button').addEventListener('click', () => {
            container.querySelector('#file-input').click();
        });
        container.querySelector('#file-input').addEventListener('change', (e) => handleFileSelection(e, container));
        container.querySelector('#post-submit-button').addEventListener('click', () => handlePostSubmit(container));
        container.querySelector('textarea').addEventListener('keydown', handleCtrlEnter);
    }

    function handleFileSelection(event, container) {
        const previewContainer = container.querySelector('.file-preview-container');
        previewContainer.innerHTML = '';
        selectedFiles = Array.from(event.target.files);
        
        selectedFiles.forEach((file, index) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'file-preview-item';
            
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    previewItem.innerHTML = `<img src="${e.target.result}" alt="${file.name}"><button class="file-preview-remove" data-index="${index}">×</button>`;
                    previewContainer.appendChild(previewItem);
                };
                reader.readAsDataURL(file);
            } else if (file.type.startsWith('video/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    previewItem.innerHTML = `<video src="${e.target.result}" controls></video><button class="file-preview-remove" data-index="${index}">×</button>`;
                    previewContainer.appendChild(previewItem);
                };
                reader.readAsDataURL(file);
            } else if (file.type.startsWith('audio/')) {
                previewItem.innerHTML = `<span>🎵 ${escapeHTML(file.name)}</span><button class="file-preview-remove" data-index="${index}">×</button>`;
                previewContainer.appendChild(previewItem);
            } else {
                previewItem.innerHTML = `<span>📄 ${escapeHTML(file.name)}</span><button class="file-preview-remove" data-index="${index}">×</button>`;
                previewContainer.appendChild(previewItem);
            }
        });
        
        previewContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('file-preview-remove')) {
                const indexToRemove = parseInt(e.target.dataset.index);
                selectedFiles.splice(indexToRemove, 1);
                handleFileSelection({ target: { files: new DataTransfer().files } }, container);
                const newFiles = new DataTransfer();
                selectedFiles.forEach(file => newFiles.items.add(file));
                container.querySelector('#file-input').files = newFiles.files;
            }
        });
    }
    
    async function handlePostSubmit(container) {
        if (!currentUser) return alert("ログインが必要です。");
        const contentEl = container.querySelector('textarea');
        const content = contentEl.value.trim();
        if (!content && selectedFiles.length === 0) return alert('内容を入力するか、ファイルを添付してください。');
        
        const button = container.querySelector('#post-submit-button');
        button.disabled = true; button.textContent = '投稿中...';
        showLoading(true);

        try {
            let attachmentsData = [];
            if (selectedFiles.length > 0) {
                for (const file of selectedFiles) {
                    const fileId = crypto.randomUUID();
                    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage.from('nyax').upload(fileId, file);
                    if (uploadError) throw new Error(`ファイルアップロードに失敗しました: ${uploadError.message}`);
                    
                    const fileType = file.type.startsWith('image/') ? 'image' : (file.type.startsWith('video/') ? 'video' : (file.type.startsWith('audio/') ? 'audio' : 'file'));
                    attachmentsData.push({ type: fileType, id: fileId, name: file.name });
                }
            }
            
            const postData = { userid: currentUser.id, content, reply_id: replyingTo?.id || null, attachments: attachmentsData.length > 0 ? attachmentsData : null };
            const { data: newPost, error: postError } = await supabase.from('post').insert(postData).select().single();
            if(postError) throw postError;

            const currentPostIds = currentUser.post || [];
            const updatedPostIds = [newPost.id, ...currentPostIds];
            const { error: userUpdateError } = await supabase.from('user').update({ post: updatedPostIds }).eq('id', currentUser.id);
            if (userUpdateError) throw new Error('ユーザー情報の更新に失敗しました。');
            
            currentUser.post = updatedPostIds;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            if (replyingTo) {
                const { data: parentPost } = await supabase.from('post').select('userid').eq('id', replyingTo.id).single();
                if (parentPost && parentPost.userid !== currentUser.id) {
                    sendNotification(parentPost.userid, `${escapeHTML(currentUser.name)}さんがあなたのポストに返信しました。`);
                }
            }
            
            selectedFiles = [];
            contentEl.value = '';
            container.querySelector('.file-preview-container').innerHTML = '';
            if (container.closest('.modal-overlay')) {
                closePostModal();
            } else {
                clearReply();
            }
        } catch(e) { console.error(e); alert(e.message); }
        finally { button.disabled = false; button.textContent = 'ポスト'; showLoading(false); }
    }
    
    window.openImageModal = (src) => {
        DOM.imagePreviewModalContent.src = src;
        DOM.imagePreviewModal.classList.remove('hidden');
    }
    window.closeImageModal = () => {
        DOM.imagePreviewModal.classList.add('hidden');
        DOM.imagePreviewModalContent.src = '';
    }
    
    window.handleDownload = async (fileUrl, fileName) => {
        try {
            const response = await fetch(fileUrl);
            if (!response.ok) throw new Error('ファイルの取得に失敗しました。');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (e) {
            console.error('ダウンロードエラー:', e);
            alert('ファイルのダウンロードに失敗しました。');
        }
    }

    async function renderPost(post, author, container, prepend = false) {
        if (!post || !author) return;
        const postEl = document.createElement('div');
        postEl.className = 'post';
        postEl.dataset.postId = post.id;

        const userIcon = document.createElement('img');
        userIcon.src = `https://trampoline.turbowarp.org/avatars/by-username/${author.scid}`;
        userIcon.className = 'user-icon';
        userIcon.alt = `${author.name}'s icon`;
        postEl.appendChild(userIcon);

        const postMain = document.createElement('div');
        postMain.className = 'post-main';

        if (post.reply_to?.user) {
            const replyDiv = document.createElement('div');
            replyDiv.className = 'replying-to';
            const replyLink = document.createElement('a');
            replyLink.href = `#profile/${post.reply_to.user.id}`;
            replyLink.textContent = `@${escapeHTML(post.reply_to.user.name)}`;
            replyDiv.appendChild(replyLink);
            replyDiv.append(' さんに返信');
            postMain.appendChild(replyDiv);
        }

        const postHeader = document.createElement('div');
        postHeader.className = 'post-header';
        
        const authorLink = document.createElement('a');
        authorLink.href = `#profile/${author.id}`;
        authorLink.className = 'post-author';
        authorLink.textContent = escapeHTML(author.name || '不明');
        postHeader.appendChild(authorLink);

        const postTime = document.createElement('span');
        postTime.className = 'post-time';
        postTime.textContent = `#${author.id || '????'} · ${new Date(post.time).toLocaleString('ja-JP')}`;
        postHeader.appendChild(postTime);

        if (currentUser?.id === post.userid) {
            const menuBtn = document.createElement('button');
            menuBtn.className = 'post-menu-btn';
            menuBtn.innerHTML = '…';
            postHeader.appendChild(menuBtn);

            const menu = document.createElement('div');
            menu.id = `menu-${post.id}`;
            menu.className = 'post-menu hidden';

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = '削除';
            menu.appendChild(deleteBtn);
            postHeader.appendChild(menu);
        }
        postMain.appendChild(postHeader);

        const postContent = document.createElement('div');
        postContent.className = 'post-content';
        const contentP = document.createElement('p');
        contentP.innerHTML = await formatPostContent(post.content);
        postContent.appendChild(contentP);
        postMain.appendChild(postContent);

        if (post.attachments && post.attachments.length > 0) {
            const attachmentsContainer = document.createElement('div');
            attachmentsContainer.className = 'attachments-container';
            for (const attachment of post.attachments) {
                const { data: publicUrlData } = supabase.storage.from('nyax').getPublicUrl(attachment.id);
                const publicURL = publicUrlData.publicUrl;
                
                const itemDiv = document.createElement('div');
                itemDiv.className = 'attachment-item';

                if (attachment.type === 'image') {
                    const img = document.createElement('img');
                    img.className = 'attachment-image';
                    img.src = publicURL;
                    img.alt = escapeHTML(attachment.name);
                    itemDiv.appendChild(img);
                } else if (attachment.type === 'video') {
                    const video = document.createElement('video');
                    video.src = publicURL;
                    video.controls = true;
                    itemDiv.appendChild(video);
                } else if (attachment.type === 'audio') {
                    const audio = document.createElement('audio');
                    audio.src = publicURL;
                    audio.controls = true;
                    itemDiv.appendChild(audio);
                }
                
                if (attachment.type === 'file' || attachment.type === 'image' || attachment.type === 'video' || attachment.type === 'audio') {
                    const downloadLink = document.createElement('a');
                    downloadLink.className = 'attachment-download-link';
                    downloadLink.href = '#';
                    downloadLink.dataset.url = publicURL;
                    downloadLink.dataset.name = escapeHTML(attachment.name);
                    downloadLink.textContent = `ダウンロード: ${escapeHTML(attachment.name)}`;
                    itemDiv.appendChild(downloadLink);
                }
                attachmentsContainer.appendChild(itemDiv);
            }
            postMain.appendChild(attachmentsContainer);
        }

        if (currentUser) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'post-actions';

            const { count: replyCountData } = await supabase.from('post').select('id', {count: 'exact', head: true}).eq('reply_id', post.id);

            const replyBtn = document.createElement('button');
            replyBtn.className = 'reply-button';
            replyBtn.title = '返信';
            replyBtn.innerHTML = `🗨 <span>${replyCountData || 0}</span>`;
            replyBtn.dataset.username = escapeHTML(author.name);
            actionsDiv.appendChild(replyBtn);

            const likeBtn = document.createElement('button');
            const isLiked = currentUser.like?.includes(post.id);
            likeBtn.className = `like-button ${isLiked ? 'liked' : ''}`;
            likeBtn.innerHTML = `<span class="icon">${isLiked ? '♥' : '♡'}</span> <span>${post.like}</span>`;
            actionsDiv.appendChild(likeBtn);

            const starBtn = document.createElement('button');
            const isStarred = currentUser.star?.includes(post.id);
            starBtn.className = `star-button ${isStarred ? 'starred' : ''}`;
            starBtn.innerHTML = `<span class="icon">${isStarred ? '★' : '☆'}</span> <span>${post.star}</span>`;
            actionsDiv.appendChild(starBtn);
            
            postMain.appendChild(actionsDiv);
        }
        
        postEl.appendChild(postMain);
        if (prepend) container.prepend(postEl); else container.appendChild(postEl);
    }
    
    // --- 9. ページごとの表示ロジック ---
    async function showMainScreen() {
        DOM.pageHeader.innerHTML = `<h2 id="page-title">ホーム</h2>`;
        showScreen('main-screen');
        if (currentUser) {
            DOM.postFormContainer.innerHTML = createPostFormHTML();
            attachPostFormListeners(DOM.postFormContainer);
        } else { DOM.postFormContainer.innerHTML = ''; }
        document.querySelector('.timeline-tabs [data-tab="following"]').style.display = currentUser ? 'flex' : 'none';
        await switchTimelineTab(currentUser ? currentTimelineTab : 'foryou');
    }

    async function showExploreScreen() {
        DOM.pageHeader.innerHTML = `
            <div class="header-search-bar">
                <input type="search" id="search-input" placeholder="検索">
                <button id="search-button">
                    ${ICONS.explore}
                </button>
            </div>`;
        document.getElementById('search-button').onclick = () => performSearch();
        document.getElementById('search-input').onkeydown = (e) => { if(e.key === 'Enter') performSearch(); };
        showScreen('explore-screen');
        await loadTimeline('foryou', DOM.exploreContent, true);
    }

    async function performSearch() {
        const headerSearchInput = document.getElementById('search-input');
        const sidebarSearchInput = document.getElementById('sidebar-search-input');
        let query = '';
        if (headerSearchInput && document.getElementById('explore-screen')?.classList.contains('hidden') === false) {
             query = headerSearchInput.value.trim();
        } else if (sidebarSearchInput) {
             query = sidebarSearchInput.value.trim();
        }
        if (!query) return;
        window.location.hash = `#search/${encodeURIComponent(query)}`;
    }

    async function showSearchResults(query) {
        DOM.pageHeader.innerHTML = `<h2 id="page-title">検索結果: "${escapeHTML(query)}"</h2>`;
        showScreen('search-results-screen');
        const contentDiv = DOM.searchResultsContent;
        contentDiv.innerHTML = '<div class="spinner"></div>';
        try {
            let resultsHTML = '';
            const { data: users, error: userError } = await supabase.from('user').select('*').or(`name.ilike.%${query}%,scid.ilike.%${query}%,me.ilike.%${query}%`).order('id', { ascending: true }).limit(10);
            if (userError) console.error("ユーザー検索エラー:", userError);
            if (users && users.length > 0) {
                resultsHTML += `<h3 style="padding:1rem;">ユーザー (${users.length}件)</h3>`;
                resultsHTML += users.map(u => ` <div class="profile-card widget-item"> <div class="profile-card-info" style="display:flex; align-items:center; gap:0.8rem;"> <a href="#profile/${u.id}" style="display:flex; align-items:center; gap:0.8rem; text-decoration:none; color:inherit;"> <img src="https://trampoline.turbowarp.org/avatars/by-username/${u.scid}" style="width:48px; height:48px; border-radius:50%;" alt="${u.name}'s icon"> <div> <span class="name" style="font-weight:700;">${escapeHTML(u.name)}</span> <span class="id" style="color:var(--secondary-text-color);">#${u.id}</span> <p class="me" style="margin:0.2rem 0 0;">${escapeHTML(u.me || '')}</p> </div> </a> </div> </div>`).join('');
            } else {
                resultsHTML += `<h3 style="padding:1rem;">ユーザー (0件)</h3><p style="padding:1rem; text-align:center;">ユーザーは見つかりませんでした。</p>`;
            }
            const { data: posts, error: postError } = await supabase.from('post').select('*, user(*), reply_to:reply_id(*, user(*))').ilike('content', `%${query}%`).order('time', { ascending: false });
            if (postError) console.error("ポスト検索エラー:", postError);
            resultsHTML += `<h3 style="padding:1rem; border-top:1px solid var(--border-color); margin-top:1rem; padding-top:1rem;">ポスト (${posts?.length || 0}件)</h3>`;
            contentDiv.innerHTML = resultsHTML;
            if (posts && posts.length > 0) {
                for (const post of posts) { await renderPost(post, post.user, contentDiv); }
            } else {
                contentDiv.innerHTML += `<p style="padding:1rem; text-align:center;">ポストは見つかりませんでした。</p>`;
            }
            if ((!users || users.length === 0) && (!posts || posts.length === 0)) {
                contentDiv.innerHTML = `<p style="padding:2rem; text-align:center;">「${escapeHTML(query)}」に一致する結果は見つかりませんでした。</p>`;
            }
        } catch (e) {
            contentDiv.innerHTML = `<p class="error-message">検索結果の読み込みに失敗しました。</p>`;
            console.error("検索結果表示エラー:", e);
        }
    }
    
    async function showNotificationsScreen() {
        if (!currentUser) {
            DOM.pageHeader.innerHTML = `<h2 id="page-title">通知</h2>`;
            showScreen('notifications-screen');
            DOM.notificationsContent.innerHTML = '<p style="padding: 2rem; text-align:center; color: var(--secondary-text-color);">通知を見るにはログインが必要です。</p>';
            return;
        }
        DOM.pageHeader.innerHTML = `<h2 id="page-title">通知</h2>`;
        showScreen('notifications-screen');
        const contentDiv = DOM.notificationsContent;
        contentDiv.innerHTML = '<div class="spinner"></div>';
        try {
            await updateNavAndSidebars();
            if (currentUser.notice_count > 0) {
                const { error: resetError } = await supabase.from('user').update({ notice_count: 0 }).eq('id', currentUser.id);
                if (resetError) { console.error('通知数のリセットに失敗:', resetError); } 
                else {
                    currentUser.notice_count = 0;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    await updateNavAndSidebars();
                }
            }
            contentDiv.innerHTML = '';
            if (currentUser.notice?.length) {
                currentUser.notice.forEach(n => {
                    const noticeEl = document.createElement('div'); noticeEl.className = 'widget-item';
                    noticeEl.textContent = n;
                    contentDiv.appendChild(noticeEl);
                });
            } else {
                contentDiv.innerHTML = '<p style="padding: 2rem; text-align:center; color: var(--secondary-text-color);">通知はまだありません。</p>';
            }
        } catch (e) {
            console.error("通知画面エラー:", e);
            contentDiv.innerHTML = `<p class="error-message">通知の読み込みに失敗しました。</p>`;
        } finally {
            showLoading(false);
        }
    }

    async function showLikesScreen() { DOM.pageHeader.innerHTML = `<h2 id="page-title">いいね</h2>`; showScreen('likes-screen'); await loadPostsByIds(DOM.likesContent, "いいねしたポストはまだありません。", { likedBy: currentUser.id }); }
    async function showStarsScreen() { DOM.pageHeader.innerHTML = `<h2 id="page-title">お気に入り</h2>`; showScreen('stars-screen'); await loadPostsByIds(DOM.starsContent, "お気に入りに登録したポストはまだありません。", { starredBy: currentUser.id }); }

    async function showPostDetail(postId) {
        DOM.pageHeader.innerHTML = `<h2 id="page-title">ポスト</h2>`;
        showScreen('post-detail-screen');
        const contentDiv = DOM.postDetailContent; contentDiv.innerHTML = '<div class="spinner"></div>';
        try {
            const { data: post, error } = await supabase.from('post').select('*, user(*), reply_to:reply_id(*, user(*))').eq('id', postId).single();
            if (error || !post) throw new Error('ポストが見つかりません。');
            contentDiv.innerHTML = '';
            
            if (post.reply_id && post.reply_to) {
                const parentPostContainer = document.createElement('div');
                parentPostContainer.className = 'parent-post-container';
                await renderPost(post.reply_to, post.reply_to.user, parentPostContainer);
                contentDiv.appendChild(parentPostContainer);
            }
            
            await renderPost(post, post.user, contentDiv);
            
            const { data: replies, error: repliesError } = await supabase.from('post').select('*, user(*), reply_to:reply_id(*, user(*))').eq('reply_id', postId).order('time', { ascending: true });
            if (repliesError) { console.error("返信の読み込みに失敗しました:", repliesError); } 
            else if (replies?.length > 0) {
                const repliesHeader = document.createElement('h3');
                repliesHeader.textContent = '返信';
                repliesHeader.style.padding = '1rem';
                repliesHeader.style.borderTop = '1px solid var(--border-color)';
                repliesHeader.style.borderBottom = '1px solid var(--border-color)';
                repliesHeader.style.marginTop = '1rem';
                repliesHeader.style.margin = '0';
                repliesHeader.style.fontSize = '1.2rem';
                contentDiv.appendChild(repliesHeader);
                for (const reply of replies) { await renderPost(reply, reply.user, contentDiv); }
            }
        } catch (err) { contentDiv.innerHTML = `<p class="error-message">${err.message}</p>`; }
    }
    
    // --- 10. コンテンツ読み込み & レンダリング ---
    async function loadPostsByIds(container, emptyMessage, options = {}, page = 0) {
        if (page === 0) { container.innerHTML = ''; }
        showLoading(true);
        try {
            let query = supabase.from('post').select('*, user(*)');
            if(options.likedBy) query = query.contains('like_users', [options.likedBy]);
            else if(options.starredBy) query = query.contains('star_users', [options.starredBy]);
            else if(options.authorId) query = query.eq('userid', options.authorId);

            const { data, error } = await query.order('time', { ascending: false }).range(page * POSTS_PER_PAGE, (page + 1) * POSTS_PER_PAGE - 1);
            if (error) throw error;

            if (page === 0 && (!data || data.length === 0)) {
                container.innerHTML = `<p style="padding: 2rem; text-align:center;">${emptyMessage}</p>`;
                return;
            }
            for (const p of data) { await renderPost(p, p.user, container); }
            
            if (data.length < POSTS_PER_PAGE) {
                if(observer) observer.disconnect();
            } else {
                setupIntersectionObserver(container, (nextPage) => loadPostsByIds(container, emptyMessage, options, nextPage), page + 1);
            }
        } catch (err) { container.innerHTML = `<p class="error-message">ポストの読み込みに失敗しました。</p>`; console.error("loadPostsByIds error:", err); }
        finally { showLoading(false); }
    }

    async function loadTimeline(tab, container, isInitial = true) {
        if (isInitial) {
            container.innerHTML = '';
            showLoading(true);
        }
        
        const page = isInitial ? 0 : parseInt(container.dataset.page || '0');
        
        try {
            let query = supabase.from('post').select('*, user(*), reply_to:reply_id(*, user(*))');
            if (tab === 'following') {
                if (currentUser?.follow?.length > 0) {
                    query = query.in('userid', currentUser.follow);
                } else {
                    if(isInitial) container.innerHTML = `<p style="padding: 2rem; text-align: center;">まだ誰もフォローしていません。</p>`;
                    return;
                }
            }

            const { data: posts, error } = await query.order('time', { ascending: false }).range(page * POSTS_PER_PAGE, (page + 1) * POSTS_PER_PAGE - 1);
            if (error) throw error;
            
            if (isInitial && posts.length === 0) {
                container.innerHTML = `<p style="padding: 2rem; text-align: center;">まだポストがありません。</p>`;
                return;
            }
            
            for (const post of posts) { await renderPost(post, post.user || {}, container); }

            container.dataset.page = page + 1;
            
            if (posts.length < POSTS_PER_PAGE) {
                if (observer) observer.disconnect();
            } else {
                setupIntersectionObserver(container, () => loadTimeline(tab, container, false));
            }

        } catch(err) { container.innerHTML = `<p class="error-message">${err.message}</p>`; console.error("loadTimeline error:", err);}
        finally { if (isInitial) showLoading(false); }
    }

    function setupIntersectionObserver(container, callback) {
        if (observer) observer.disconnect();
        const lastPost = container.querySelector('.post:last-child');
        if (!lastPost) return;

        observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !isLoadingMore) {
                isLoadingMore = true;
                callback();
                isLoadingMore = false;
            }
        }, { threshold: 0.1 });
        observer.observe(lastPost);
    }
    
    // --- 11. ユーザーアクション ---
    // (変更なし、省略)

    // --- 12. プロフィール関連 ---
    // (変更なし、省略)

    // --- 13. 初期化処理 ---
    DOM.mainContent.addEventListener('click', (e) => {
        const target = e.target;
        const postElement = target.closest('.post');
        
        const timelineTab = target.closest('.timeline-tab-button');
        if (timelineTab) {
            switchTimelineTab(timelineTab.dataset.tab);
            return;
        }

        if (!postElement) return;

        const postId = postElement.dataset.postId;
        
        const menuButton = target.closest('.post-menu-btn');
        if (menuButton) { e.stopPropagation(); togglePostMenu(postId); return; }
        
        const deleteButton = target.closest('.delete-btn');
        if (deleteButton) { e.stopPropagation(); deletePost(postId); return; }

        const replyButton = target.closest('.reply-button');
        if (replyButton) { e.stopPropagation(); handleReplyClick(postId, replyButton.dataset.username); return; }

        const likeButton = target.closest('.like-button');
        if (likeButton) { e.stopPropagation(); handleLike(likeButton, postId); return; }

        const starButton = target.closest('.star-button');
        if (starButton) { e.stopPropagation(); handleStar(starButton, postId); return; }

        const imageAttachment = target.closest('.attachment-image');
        if (imageAttachment) { e.stopPropagation(); openImageModal(imageAttachment.src); return; }

        const downloadLink = target.closest('.attachment-download-link');
        if (downloadLink) { e.preventDefault(); e.stopPropagation(); handleDownload(downloadLink.dataset.url, downloadLink.dataset.name); return; }
        
        if (!target.closest('a, video, audio, button')) {
            window.location.hash = `#post/${postId}`;
        }
    });

    document.getElementById('banner-signup-button').addEventListener('click', goToLoginPage);
    document.getElementById('banner-login-button').addEventListener('click', goToLoginPage);
    window.addEventListener('hashchange', router);
    checkSession();
});
