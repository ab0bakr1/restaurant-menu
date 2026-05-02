/**
 * server/services/printer.js
 * طابعة المطبخ — مع معالجة آمنة للأخطاء
 * إذا لم تكن الطابعة متصلة يطبع في الكونسول فقط ولا يوقف السيرفر
 */

const PRINTER_IP   = process.env.PRINTER_IP   || '192.168.1.50';
const PRINTER_PORT = process.env.PRINTER_PORT  || 9100;
const PRINTER_ENABLED = process.env.PRINTER_ENABLED === 'true';

async function printKitchenTicket(order) {
  // ── طباعة في الكونسول دائماً (للمراقبة) ──────────────────
  console.log('\n====== تذكرة مطبخ ======');
  console.log('طاولة :', order.table_number);
  console.log('طلب   :', order.id);
  console.log('الوقت :', new Date().toLocaleTimeString('ar-SA'));
  console.log('------------------------');
  (order.items || []).forEach(item => {
    console.log(`  ${item.qty || 1}x  ${item.name_ar || item.id}`);
    if (item.notes) console.log(`     ملاحظة: ${item.notes}`);
  });
  console.log('========================\n');

  // ── طباعة فعلية — فقط إذا كانت مفعّلة في .env ────────────
  if (!PRINTER_ENABLED) {
    console.log('ℹ️  الطابعة غير مفعّلة (PRINTER_ENABLED=false)');
    return;
  }

  try {
    const { Printer } = require('@node-escpos/core');
    const NetworkAdapter = require('@node-escpos/network-adapter');

    const device = new NetworkAdapter(PRINTER_IP, Number(PRINTER_PORT));

    // timeout للاتصال — 3 ثوانٍ كحد أقصى
    await Promise.race([
      device.open(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 3000)
      )
    ]);

    const printer = new Printer(device, { encoding: 'GB18030' });

    printer
      .align('ct').size(1, 1)
      .text('=== طلب جديد ===')
      .align('lt')
      .text('طاولة : ' + order.table_number)
      .text('طلب   : ' + order.id)
      .text('الوقت : ' + new Date().toLocaleTimeString('ar-SA'))
      .text('----------------');

    (order.items || []).forEach(item => {
      printer.text(`  ${item.qty || 1}x  ${item.name_ar || item.id}`);
      if (item.notes) printer.text(`     ملاحظة: ${item.notes}`);
    });

    printer.text('================').cut().close();
    console.log('✅ تم إرسال الطلب للطابعة');

  } catch (err) {
    // ❌ لا نرمي الخطأ — فقط نسجّله ونكمل
    console.warn(`⚠️  الطابعة غير متاحة: ${err.message}`);
  }
}

module.exports = { printKitchenTicket };