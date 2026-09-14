const express = require('express');
const router = express.Router();

// In-memory data store for the queue (for demonstration purposes)
// In a real application, you would use a database like MySQL, PostgreSQL, or MongoDB.
let queueData = {
  currentNumber: 0, // The number currently being served
  lastIssuedNumber: 0, // The last ticket number given out
  waitingList: [] // Array of waiting tickets (optional detail)
};

/**
 * @swagger
 * /api/queue/status:
 *   get:
 *     summary: Mendapatkan status antrean saat ini
 *     tags: [Queue]
 *     responses:
 *       200:
 *         description: Berhasil mengambil status antrean
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     current_number:
 *                       type: integer
 *                     last_issued_number:
 *                       type: integer
 *                     total_waiting:
 *                       type: integer
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    message: 'Status antrean berhasil diambil',
    data: {
      current_number: queueData.currentNumber,
      last_issued_number: queueData.lastIssuedNumber,
      total_waiting: queueData.lastIssuedNumber - queueData.currentNumber
    }
  });
});

/**
 * @swagger
 * /api/queue/ticket:
 *   post:
 *     summary: Mengambil tiket antrean baru
 *     tags: [Queue]
 *     responses:
 *       201:
 *         description: Berhasil mengambil tiket baru
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     ticket_number:
 *                       type: integer
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 */
router.post('/ticket', (req, res) => {
  queueData.lastIssuedNumber += 1;
  
  const newTicket = {
    ticket_number: queueData.lastIssuedNumber,
    timestamp: new Date().toISOString()
  };
  
  queueData.waitingList.push(newTicket);
  
  res.status(201).json({
    success: true,
    message: 'Tiket antrean berhasil dibuat',
    data: newTicket
  });
});

/**
 * @swagger
 * /api/queue/call:
 *   post:
 *     summary: Memanggil nomor antrean selanjutnya (oleh admin/loket)
 *     tags: [Queue]
 *     responses:
 *       200:
 *         description: Berhasil memanggil antrean berikutnya
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     called_number:
 *                       type: integer
 *       400:
 *         description: Tidak ada antrean yang menunggu
 */
router.post('/call', (req, res) => {
  if (queueData.currentNumber >= queueData.lastIssuedNumber) {
    return res.status(400).json({
      success: false,
      message: 'Tidak ada antrean yang menunggu'
    });
  }
  
  queueData.currentNumber += 1;
  
  // Remove the called ticket from waiting list if tracking it
  queueData.waitingList = queueData.waitingList.filter(t => t.ticket_number > queueData.currentNumber);
  
  res.json({
    success: true,
    message: `Nomor antrean ${queueData.currentNumber} berhasil dipanggil`,
    data: {
      called_number: queueData.currentNumber
    }
  });
});

/**
 * @swagger
 * /api/queue/reset:
 *   post:
 *     summary: Mereset antrean kembali ke 0
 *     tags: [Queue]
 *     responses:
 *       200:
 *         description: Berhasil mereset antrean
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post('/reset', (req, res) => {
  queueData = {
    currentNumber: 0,
    lastIssuedNumber: 0,
    waitingList: []
  };
  
  res.json({
    success: true,
    message: 'Antrean berhasil direset'
  });
});

module.exports = router;
