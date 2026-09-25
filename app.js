const $ = (id) => document.getElementById(id);
const defaultMessage = activeProfile?.message || '愿你所念皆如愿，所行皆坦途。\n月圆人团圆，千里共婵娟。中秋快乐！';
let current = { recipient: '', sender: '', message: defaultMessage, title: '中秋快乐' };
let toastTimer, count = 0;
function toast(message) { $('toast').textContent = message; $('toast').classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').classList.remove('show'), 3200); }
function openCard(data, fortune = false) {
  current = data;
  $('result-kicker').textContent = fortune ? '月亮送给你的今夜月签' : '一封月光来信';
  $('result-title').textContent = data.title;
  $('result-to').textContent = data.recipient ? `致 ${data.recipient}：` : '';
  $('result-message').textContent = data.message;
  $('result-from').textContent = data.sender ? `${data.sender} · 遥祝` : '月下寄相思 · 中秋安康';
  if (!$('result').open) $('result').showModal();
}
function openPersonalLetter() { openCard({ recipient: activeProfile.name, sender: '', message: activeProfile.message, title: activeProfile.title }); }
$('start').addEventListener('click', () => { if (activeProfile) { openPersonalLetter(); return; } $('wishes').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); $('recipient').focus({ preventScroll: true }); });
$('open-letter')?.addEventListener('click', openPersonalLetter);
$('wish-form')?.addEventListener('submit', (event) => { event.preventDefault(); openCard({ recipient: $('recipient').value.trim(), sender: $('sender').value.trim(), message: $('message').value.trim() || defaultMessage, title: '中秋快乐' }); });
$('close-dialog').addEventListener('click', () => $('result').close());
$('result').addEventListener('click', (event) => { if (event.target === $('result')) { const r = $('result').getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) $('result').close(); } });
$('release').addEventListener('click', () => {
  if ($('sky').children.length >= 12) { toast('让心愿慢慢升空，再放下一盏吧'); return; }
  count++; const lantern = document.createElement('div'); lantern.className = 'flying-lantern'; lantern.style.left = `${12 + Math.random() * 70}%`;
  const light = document.createElement('div'); light.className = 'large-lantern'; const word = document.createElement('span'); word.textContent = ['愿', '福', '圆', '安'][count % 4]; light.append(word); lantern.append(light); $('sky').append(lantern); setTimeout(() => lantern.remove(), 7200);
  $('lantern-counter').textContent = `你已放飞 ${count} 盏心愿灯 · 愿美好如期而至`; toast('心愿已启程，愿你所盼皆有回响');
});
const fortunes = [
  ['花好月圆', '你所牵挂的人，也在悄悄牵挂着你。\n今夜月圆，愿每一份思念，都有温柔的回音。'],
  ['万事胜意', '不必急着赶路，月亮也会等你。\n愿接下来的日子，惊喜多一点，烦恼少一点。'],
  ['喜乐长安', '日子有小暖，寻常也浪漫。\n愿你三餐四季，平安喜乐，有人陪你细水长流。'],
  ['好事将近', '你认真走过的路，都算数。\n愿一切等待都有答案，一切美好正在赶来。'],
  ['自在如风', '把烦恼留给昨天，把心事交给月光。\n愿你心有热望，自在明亮，活成喜欢的模样。'],
  ['所念皆圆', '山河远阔，月光会替你捎去想念。\n愿你与心中所爱，早日相见，好好团圆。']
];
let lastFortune = -1;
$('draw').addEventListener('click', () => { let index = Math.floor(Math.random() * fortunes.length); if (index === lastFortune) index = (index + 1) % fortunes.length; lastFortune = index; const [title, message] = fortunes[index]; $('fortune-hint').textContent = `今夜的月签：${title}`; openCard({ title, message, recipient: '', sender: '' }, true); });
function shareUrl() { const url = new URL(location.href); url.hash = new URLSearchParams({ to: current.recipient, from: current.sender, wish: current.message, title: current.title }).toString(); return url.href; }
$('share').addEventListener('click', async () => {
  const url = shareUrl();
  try { await navigator.clipboard.writeText(url); toast('祝福链接已复制，发给你牵挂的人吧'); }
  catch { const field = document.createElement('textarea'); field.value = url; $('result').append(field); field.select(); const ok = document.execCommand('copy'); field.remove(); if (ok) toast('祝福链接已复制'); else { const manual = document.createElement('input'); manual.value = url; manual.readOnly = true; manual.setAttribute('aria-label', '请手动复制祝福链接'); $('result').append(manual); manual.select(); toast('请长按或按 Ctrl+C 复制下方链接'); } }
});
$('save').addEventListener('click', async () => {
  await document.fonts.ready;
  const canvas = document.createElement('canvas'); canvas.width = 1000; canvas.height = 1400; const ctx = canvas.getContext('2d');
  ctx.fillStyle = activeProfile?.paper || '#f6f3e7'; ctx.fillRect(0, 0, 1000, 1400); ctx.strokeStyle = activeProfile?.gold || '#b8bc9e'; ctx.lineWidth = 2; ctx.strokeRect(35, 35, 930, 1330);
  const glow = ctx.createRadialGradient(480, 220, 0, 500, 240, 125); glow.addColorStop(0, '#f3e7b6'); glow.addColorStop(1, '#d7bd79'); ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(500, 240, 125, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = activeProfile?.ink || '#294c40'; ctx.textAlign = 'center'; ctx.font = '52px "Noto Serif SC", SimSun, serif'; ctx.fillText(current.title, 500, 455, 780);
  ctx.textAlign = 'left'; ctx.font = '28px "Noto Serif SC", SimSun, serif'; if (current.recipient) ctx.fillText(`致 ${current.recipient}：`, 110, 555, 780);
  const lines = []; for (const paragraph of current.message.split('\n')) { let line = ''; for (const char of paragraph) { if (ctx.measureText(line + char).width > 780) { lines.push(line); line = ''; } line += char; } lines.push(line); }
  const lineHeight = Math.min(56, 500 / Math.max(lines.length, 1)); ctx.font = `${Math.min(28, lineHeight * .75)}px "Noto Serif SC", SimSun, serif`; lines.forEach((line, i) => ctx.fillText(line, 110, 640 + i * lineHeight));
  ctx.textAlign = 'right'; ctx.font = '25px "Noto Serif SC", SimSun, serif'; ctx.fillText(current.sender ? `${current.sender} · 遥祝` : '月下寄相思', 890, 1190, 780); ctx.textAlign = 'center'; ctx.fillStyle = '#99936f'; ctx.font = '22px "Noto Serif SC", SimSun, serif'; ctx.fillText('天涯共此时 · 千里共婵娟', 500, 1300);
  canvas.toBlob((blob) => { if (!blob) { toast('保存失败，请重试'); return; } const link = document.createElement('a'); const url = URL.createObjectURL(blob); link.href = url; link.download = '月下寄相思-中秋祝福.png'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 10000); toast('祝福卡片已生成，请查看下载'); }, 'image/png');
});
let audioContext, musicTimer, musicOn = false, noteIndex = 0;
const melody = [523.25, 659.25, 783.99, 659.25, 587.33, 523.25, 440, 392, 440, 523.25, 587.33, 659.25, 587.33, 523.25, 440, 523.25];
function playNote() { const oscillator = audioContext.createOscillator(); const gain = audioContext.createGain(); oscillator.type = 'sine'; oscillator.frequency.value = melody[noteIndex++ % melody.length]; gain.gain.setValueAtTime(0, audioContext.currentTime); gain.gain.linearRampToValueAtTime(.075, audioContext.currentTime + .04); gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + 1.7); oscillator.connect(gain); gain.connect(audioContext.destination); oscillator.start(); oscillator.stop(audioContext.currentTime + 1.8); oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); }; }
$('sound').addEventListener('click', async () => { try { if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)(); if (musicOn) { clearInterval(musicTimer); await audioContext.suspend(); musicOn = false; } else { await audioContext.resume(); playNote(); musicTimer = setInterval(playNote, 850); musicOn = true; } $('sound').setAttribute('aria-pressed', String(musicOn)); $('sound-label').textContent = musicOn ? '暂停月色' : '听见月色'; } catch { toast('当前浏览器暂不支持播放音乐'); } });
function readSharedWish() { const params = new URLSearchParams(location.hash.slice(1)); if (params.has('wish')) openCard({ recipient: (params.get('to') || '').slice(0,20), sender: (params.get('from') || '').slice(0,20), message: (params.get('wish') || defaultMessage).slice(0,160), title: (params.get('title') || '中秋快乐').slice(0,20) }); }
readSharedWish(); window.addEventListener('hashchange', readSharedWish);
let secretIndex = 0;
$('moon-secret')?.addEventListener('click', () => {
  if (!activeProfile) return;
  $('secret-message').textContent = activeProfile.secrets[secretIndex++ % activeProfile.secrets.length];
  $('moon-secret').classList.remove('sparkle');
  requestAnimationFrame(() => $('moon-secret').classList.add('sparkle'));
});
