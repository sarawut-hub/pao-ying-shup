import PptxGenJS from "pptxgenjs";
import fs from "fs";

(async () => {
  try {
    // Ensure output dir
    fs.mkdirSync('presentation', { recursive: true });

    const pptx = new PptxGenJS();
    pptx.author = 'RPS Royale - Auto-generated';

    // Helper: common cute emoji images (twemoji CDN). These are optional; require internet when running.
    const IMG_GAME = 'https://twemoji.maxcdn.com/v/latest/72x72/1f3ae.png'; // 🎮
    const IMG_SPARKLE = 'https://twemoji.maxcdn.com/v/latest/72x72/2728.png'; // ✨
    const IMG_TROPHY = 'https://twemoji.maxcdn.com/v/latest/72x72/1f3c6.png'; // 🏆
    const IMG_AVATAR = 'https://twemoji.maxcdn.com/v/latest/72x72/1f464.png'; // 👤

    // Slide 1: Title (colorful background + images)
    let slide = pptx.addSlide({ masterName: undefined });
    slide.background = { fill: 'FDE68A' };
    slide.addImage({ path: IMG_GAME, x: 8.2, y: 0.2, w: 1.0, h: 1.0 });
    slide.addImage({ path: IMG_SPARKLE, x: 8.6, y: 0.9, w: 0.6, h: 0.6 });
    slide.addShape(pptx.ShapeType.roundRect, { x: 0.3, y: 0.9, w: 9.4, h: 2.2, fill: { color: 'FFFBEB' }, line: { color: 'F59E0B' } });
    slide.addText('RPS Royale', { x: 0.6, y: 1.0, fontSize: 44, bold: true, color: '9A3412' });
    slide.addText('เกมเป่า-ยิ้ง-ฉุบ Online (Multiplayer)', { x: 0.6, y: 1.7, fontSize: 18, color: '7C2D12' });
    slide.addText('สรุปโปรเจ็คและฟังก์ชันหลัก ✨', { x: 0.6, y: 2.2, fontSize: 12, color: '92400E' });

    // Slide 2: Overview with bullet icons
    slide = pptx.addSlide();
    slide.background = { fill: 'EFF6FF' };
    slide.addText('Overview', { x: 0.5, y: 0.4, fontSize: 28, bold: true, color: '1E3A8A' });
    slide.addImage({ path: IMG_GAME, x: 9.0, y: 0.3, w: 0.8, h: 0.8 });
    slide.addText([
      { text: '🎮 เกมเป่า-ยิ้ง-ฉุบ แบบ multiplayer ผ่านเว็บ\n', options: { fontSize: 16 } },
      { text: '🧩 สร้างห้อง, เข้าร่วมห้องด้วยโค้ด, spectate, ดูรายงาน\n', options: { fontSize: 14 } },
      { text: '✨ เน้นเล่นง่าย และเก็บสถิติการแข่งขัน', options: { fontSize: 14 } }
    ], { x: 0.6, y: 1.2, w: '85%', h: 3 });

    // Slide 3: Tech Stack with small icons
    slide = pptx.addSlide();
    slide.background = { fill: 'ECFCCB' };
    slide.addText('Tech Stack', { x: 0.5, y: 0.4, fontSize: 26, bold: true, color: '065F46' });
    slide.addImage({ path: IMG_SPARKLE, x: 9.0, y: 0.3, w: 0.7, h: 0.7 });
    slide.addText('• AdonisJS (TypeScript)\n• Lucid ORM (better-sqlite3)\n• SQLite / mysql2\n• socket.io (real-time)\n• Vite + TypeScript', { x: 0.6, y: 1.2, fontSize: 14 });

    // Slide 4: Key Features with badges
    slide = pptx.addSlide();
    slide.background = { fill: 'FEF3C7' };
    slide.addText('Key Features', { x: 0.5, y: 0.4, fontSize: 26, bold: true });
    const features = ['สร้างห้อง', 'เข้าร่วมห้องด้วยโค้ด', 'เล่นหลายรอบ', 'Spectator', 'รายงานผล', 'ระบบผู้ใช้'];
    features.forEach((f, i) => {
      const x = 0.6 + (i % 2) * 4.6;
      const y = 1.1 + Math.floor(i / 2) * 0.8;
      slide.addShape(pptx.ShapeType.ellipse, { x, y, w: 0.5, h: 0.5, fill: { color: 'FFEDD5' }, line: { color: 'FB923C' } });
      slide.addText(` ${['🎲','🔑','🏁','👀','📊','👥'][i]} ${f}`, { x: x + 0.6, y: y + 0.05, fontSize: 12 });
    });

    // Slide 5: Controllers & Methods (with avatar)
    slide = pptx.addSlide();
    slide.background = { fill: 'EFF6FF' };
    slide.addImage({ path: IMG_AVATAR, x: 8.9, y: 0.2, w: 0.7, h: 0.7 });
    slide.addText('Controllers & Main Methods', { x: 0.5, y: 0.3, fontSize: 22, bold: true });
    slide.addText(
      '• NewAccountController: create(), store() — สมัคร\n' +
      '• SessionController: create(), store(), destroy(), guestLogin() — auth\n' +
      '• ProfilesController: show(), update() — โปรไฟล์\n' +
      '• GamesController: createRoom(), joinRoom(), showRoom(), report(), roomReport(), deleteRoom()',
      { x: 0.6, y: 1.0, fontSize: 12 }
    );

    // Slide 6: Data Models (cute cards)
    slide = pptx.addSlide();
    slide.background = { fill: 'FFF7ED' };
    slide.addText('Data Models', { x: 0.5, y: 0.4, fontSize: 26, bold: true });
    const cards = [
      { title: 'User', desc: 'ผู้เล่น, ชื่อ, email, avatar' },
      { title: 'Room', desc: 'code, hostId, status, currentRound' },
      { title: 'RoomPlayer', desc: 'userId, roomId, score' },
      { title: 'Match', desc: 'ผลการแข่งขันต่อรอบ' }
    ];
    cards.forEach((c, i) => {
      const x = 0.5 + (i % 2) * 4.7;
      const y = 1.1 + Math.floor(i / 2) * 1.1;
      slide.addShape(pptx.ShapeType.rectRounded, { x, y, w: 4.0, h: 0.9, fill: { color: 'FFFFFF' }, line: { color: 'FBBF24' } });
      slide.addText(c.title, { x: x + 0.2, y: y + 0.1, fontSize: 14, bold: true });
      slide.addText(c.desc, { x: x + 0.2, y: y + 0.45, fontSize: 11 });
    });

    // Slide 7: How to run (with trophy)
    slide = pptx.addSlide();
    slide.background = { fill: 'ECFEFF' };
    slide.addImage({ path: IMG_TROPHY, x: 9.0, y: 0.3, w: 0.7, h: 0.7 });
    slide.addText('How to run', { x: 0.5, y: 0.4, fontSize: 24, bold: true });
    slide.addText('1) npm install\n2) node ace serve --watch\nหรือ: npm run start', { x: 0.6, y: 1.0, fontSize: 14 });

    // Slide 8: Demo Flow with arrows
    slide = pptx.addSlide();
    slide.background = { fill: 'FFF1F2' };
    slide.addText('Typical flow (demo)', { x: 0.5, y: 0.4, fontSize: 22, bold: true });
    slide.addText('สมัคร → สร้าง/เข้าห้อง → เล่นหลายรอบ → ดูรายงาน', { x: 0.8, y: 1.1, fontSize: 14 });
    slide.addImage({ path: IMG_GAME, x: 0.5, y: 1.6, w: 0.9, h: 0.9 });
    slide.addImage({ path: IMG_AVATAR, x: 3.6, y: 1.6, w: 0.9, h: 0.9 });
    slide.addImage({ path: IMG_TROPHY, x: 6.7, y: 1.6, w: 0.9, h: 0.9 });

    // Slide 9: Next steps / Improvements
    slide = pptx.addSlide();
    slide.addText('Next steps / Improvements', { x: 0.5, y: 0.4, fontSize: 24, bold: true });
    slide.addText('• เพิ่ม unit/integration tests\n• ปรับปรุง UI/UX และ realtime status\n• scale real-time server\n• global leaderboard', { x: 0.6, y: 1.0, fontSize: 13 });

    // Slide 10: Contact / Q&A with footer
    slide = pptx.addSlide();
    slide.background = { fill: 'FFFFFF' };
    slide.addText('Contact / Q&A', { x: 0.5, y: 0.4, fontSize: 26, bold: true });
    slide.addText('Presentation generated by script. File: presentation/RPS_Royale_Presentation.pptx', { x: 0.6, y: 1.0, fontSize: 12 });
    slide.addText('ขอให้โชคดีกับการ present! ✨', { x: 0.6, y: 1.4, fontSize: 14, italic: true });

    // Write file
    await pptx.writeFile({ fileName: 'presentation/RPS_Royale_Presentation.pptx' });
    console.log('Presentation created: presentation/RPS_Royale_Presentation.pptx');
  } catch (err) {
    console.error('Error creating presentation:', err);
    process.exit(1);
  }
})();
