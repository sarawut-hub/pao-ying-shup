import PptxGenJS from "pptxgenjs";
import fs from "fs";

(async () => {
  try {
    // Ensure output dir
    fs.mkdirSync('presentation', { recursive: true });

    const pptx = new PptxGenJS();
    pptx.author = 'RPS Royale - Auto-generated';

    // Slide 1: Title
    let slide = pptx.addSlide();
    slide.addText('RPS Royale', { x: 0.5, y: 1.0, fontSize: 40, bold: true });
    slide.addText('เกมเป่า-ยิ้ง-ฉุบ Online (Multiplayer Web Game)', { x: 0.5, y: 2.0, fontSize: 20 });
    slide.addText('สรุปโปรเจ็คและฟังก์ชันหลัก', { x: 0.5, y: 2.7, fontSize: 14, color: '666666' });

    // Slide 2: Overview
    slide = pptx.addSlide();
    slide.addText('Overview', { x: 0.5, y: 0.4, fontSize: 28, bold: true });
    slide.addText([
      { text: '• เกมเป่า-ยิ้ง-ฉุบ แบบ multiplayer ผ่านเว็บ\n', options: { fontSize: 16 } },
      { text: '• เล่นแบบสร้างห้อง, เข้าร่วมห้อง, spectate, และดูรายงานผลการแข่งขัน', options: { fontSize: 14 } }
    ], { x: 0.5, y: 1.2, w: '90%', h: 3 });

    // Slide 3: Tech Stack
    slide = pptx.addSlide();
    slide.addText('Tech Stack', { x: 0.5, y: 0.4, fontSize: 28, bold: true });
    slide.addText('• AdonisJS (TypeScript)\n• Lucid ORM (better-sqlite3)\n• SQLite (dev) / mysql2 available\n• socket.io (real-time)\n• Vite + TypeScript', { x: 0.5, y: 1.2, fontSize: 14 });

    // Slide 4: Key Features
    slide = pptx.addSlide();
    slide.addText('Key Features', { x: 0.5, y: 0.4, fontSize: 28, bold: true });
    slide.addText('• สร้างห้อง (create room)\n• เข้าร่วมห้องด้วยโค้ด (join room)\n• เล่นหลายรอบ เก็บคะแนน\n• Spectator mode\n• รายงานผลการแข่งขัน (room & host reports)\n• ระบบผู้ใช้: สมัคร, เข้าสู่ระบบ, guest login, โปรไฟล์', { x: 0.5, y: 1.2, fontSize: 13 });

    // Slide 5: Controllers & Functions
    slide = pptx.addSlide();
    slide.addText('Controllers & Main Methods', { x: 0.5, y: 0.3, fontSize: 24, bold: true });
    slide.addText(
      '• NewAccountController: create(), store() — จัดการสมัครสมาชิก\n' +
      '• SessionController: create(), store(), destroy(), guestLogin() — ลงชื่อเข้าใช้ / ออกจากระบบ / guest\n' +
      '• ProfilesController: show(), update() — ดู/แก้ไขโปรไฟล์\n' +
      '• GamesController: createRoom(), joinRoom(), showRoom(), report(), roomReport(), deleteRoom() — ฟังก์ชันห้องและรายงาน',
      { x: 0.5, y: 1.0, fontSize: 12 }
    );

    // Slide 6: Data Models (high-level)
    slide = pptx.addSlide();
    slide.addText('Data Models', { x: 0.5, y: 0.4, fontSize: 28, bold: true });
    slide.addText('• User — ผู้เล่น\n• Room — ห้องเกม (code, hostId, status, currentRound)\n• RoomPlayer — ผู้เล่นในห้อง (score)\n• Match — บันทึกผลการแข่งขัน', { x: 0.5, y: 1.2, fontSize: 13 });

    // Slide 7: How to run
    slide = pptx.addSlide();
    slide.addText('How to run', { x: 0.5, y: 0.4, fontSize: 28, bold: true });
    slide.addText('1) npm install\n2) node ace serve --watch (dev)\nหรือใช้: npm run start (run migrations then server)', { x: 0.5, y: 1.2, fontSize: 14 });

    // Slide 8: Demo / Flow
    slide = pptx.addSlide();
    slide.addText('Typical flow (demo)', { x: 0.5, y: 0.4, fontSize: 24, bold: true });
    slide.addText('1. สมัครหรือ guest login → 2. สร้างห้องหรือเข้าร่วมห้องด้วยรหัส → 3. เล่นรอบหลายครั้ง บันทึกคะแนน → 4. ดูรายงานห้องหรือรายงาน host', { x: 0.5, y: 1.0, fontSize: 12 });

    // Slide 9: Next steps / Improvements
    slide = pptx.addSlide();
    slide.addText('Next steps / Improvements', { x: 0.5, y: 0.4, fontSize: 28, bold: true });
    slide.addText('• เพิ่ม unit/integration tests\n• ปรับปรุง UI/UX และแสดงสถานะเวลาจริงด้วย socket.io\n• รองรับ scaling (separate real-time server)\n• เพิ่มระบบ leaderboard ระดับโลก', { x: 0.5, y: 1.2, fontSize: 13 });

    // Slide 10: Contact / Q&A
    slide = pptx.addSlide();
    slide.addText('Contact / Q&A', { x: 0.5, y: 0.4, fontSize: 28, bold: true });
    slide.addText('Prepared for presentation. File saved as presentation/RPS_Royale_Presentation.pptx', { x: 0.5, y: 1.2, fontSize: 14 });

    // Write file
    await pptx.writeFile({ fileName: 'presentation/RPS_Royale_Presentation.pptx' });
    console.log('Presentation created: presentation/RPS_Royale_Presentation.pptx');
  } catch (err) {
    console.error('Error creating presentation:', err);
    process.exit(1);
  }
})();
