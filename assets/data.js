/* Kavurma Roasters - demo dataset.
   Every figure on the screen is rendered from this file. Amounts are TRY.
   The checks at the bottom keep the parts and the totals in agreement. */
(() => {
  const snapshot = {
    date: '2026-11-22',
    time: '09:42',
    activeSubscribers: 1842,
    mrr: 1284458,
    priorMrr: 1252382,
    arpu: 1284458 / 1842
  };

  // Monday-starting weeks, oldest first. `joined` and `cancelled` are subscribers.
  const weeks = [
    { start: '2026-08-24', joined: 17, cancelled: 8 },
    { start: '2026-08-31', joined: 19, cancelled: 7 },
    { start: '2026-09-07', joined: 18, cancelled: 8 },
    { start: '2026-09-14', joined: 20, cancelled: 9 },
    { start: '2026-09-21', joined: 21, cancelled: 8 },
    { start: '2026-09-28', joined: 21, cancelled: 7 },
    { start: '2026-10-05', joined: 20, cancelled: 8 },
    { start: '2026-10-12', joined: 19, cancelled: 9 },
    { start: '2026-10-19', joined: 18, cancelled: 9 },
    { start: '2026-10-26', joined: 25, cancelled: 9 },
    { start: '2026-11-02', joined: 23, cancelled: 10 },
    { start: '2026-11-09', joined: 22, cancelled: 12 },
    { start: '2026-11-16', joined: 20, cancelled: 13 }
  ];

  // Monthly plan book. Counts and revenue are summed, never typed as totals.
  const plans = [
    { name: 'Keşif', price: 549, subscribers: 1022 },
    { name: 'Tek Menşe', price: 749, subscribers: 612 },
    { name: 'Ofis', price: 1274, subscribers: 208 }
  ];

  // New subscribers in the last four weeks by where they first heard of Kavurma.
  const channels = [
    { label: 'Instagram', value: 39 },
    { label: 'Tavsiye', value: 24 },
    { label: 'Kafe standı', value: 17 },
    { label: 'E-posta', value: 10 }
  ];

  const roast = {
    boxes: 1764,
    capacity: 2100,
    skipped: 78,
    nextRoast: '2026-11-24T06:00',
    origins: 'Etiyopya Guji · Brezilya Fazenda'
  };

  const customers = [
    {
      id: 'KV-1042', name: 'Selin Aydın', email: 'selin.aydin@kavurma.co',
      plan: 'Tek Menşe', months: 14, lastBox: '2026-11-13', risk: 82,
      signal: 'Üst üste 3 kutu atladı',
      message: 'Merhaba Selin, son üç kutuyu atladığını gördük. Tek Menşe’de kalmak ister misin, yoksa bu ay Keşif’e geçip daha hafif bir tempoyla mı devam edelim? 24 Kasım teslimatını senin için ayırabilirim.\n\nSevgiler,\nElif'
    },
    {
      id: 'KV-1087', name: 'Mert Kaya', email: 'mert.kaya@kavurma.co',
      plan: 'Keşif', months: 8, lastBox: '2026-11-06', risk: 78,
      signal: 'Kartı iki kez reddedildi',
      message: 'Merhaba Mert, kartın iki kez reddedildi; aboneliğin kesilmesin diye bu ayın ödemesini sana uygun bir güne alabilirim. İstersen yeni kart bilgisini güvenli bağlantıdan birlikte güncelleyelim.\n\nSevgiler,\nElif'
    },
    {
      id: 'KV-0921', name: 'Deniz Yalçın', email: 'deniz.yalcin@kavurma.co',
      plan: 'Ofis', months: 22, lastBox: '2026-10-30', risk: 74,
      signal: 'Ofis siparişi 3 haftadır durdu',
      message: 'Merhaba Deniz, ofis siparişin üç haftadır görünmüyor. Bu hafta 24 kutuluk partiyi Çarşamba’ya yetiştirebiliriz; ofisteki teslim saatini teyit eder misin?\n\nSevgiler,\nElif'
    },
    {
      id: 'KV-1164', name: 'Ayşe Öztürk', email: 'ayse.ozturk@kavurma.co',
      plan: 'Tek Menşe', months: 31, lastBox: '2026-11-10', risk: 69,
      signal: 'Teslimat 4 gün gecikti',
      message: 'Merhaba Ayşe, son teslimatın dört gün gecikti; bunun için özür dileriz. Bu ayın kutusunu ücretsiz göndermek istiyoruz, adresin aynı mı?\n\nSevgiler,\nElif'
    },
    {
      id: 'KV-1203', name: 'Burak Şen', email: 'burak.sen@kavurma.co',
      plan: 'Keşif', months: 5, lastBox: '2026-11-02', risk: 66,
      signal: 'Kutuyu iki kez iade etti',
      message: 'Merhaba Burak, iki kutuyu iade ettiğini gördük. Belki çekirdek seçimi sana uymadı; damak zevkine göre daha gövdeli ya da daha asidik bir profil önerebilirim.\n\nSevgiler,\nElif'
    },
    {
      id: 'KV-0998', name: 'Ece Aksoy', email: 'ece.aksoy@kavurma.co',
      plan: 'Tek Menşe', months: 17, lastBox: '2026-11-15', risk: 61,
      signal: 'Son anket puanı 3/5',
      message: 'Merhaba Ece, son kutuyu 3/5 puanladın. Hangi noktada beklentinin altında kaldığını yazarsan bir sonraki kavurmayı ona göre seçelim.\n\nSevgiler,\nElif'
    },
    {
      id: 'KV-1240', name: 'Kerem Arslan', email: 'kerem.arslan@kavurma.co',
      plan: 'Keşif', months: 11, lastBox: '2026-11-08', risk: 58,
      signal: 'Adres doğrulanmadı',
      message: 'Merhaba Kerem, adresin doğrulanmadığı için teslimat bekliyor. Kapı numarasını teyit edersen kutunu yarın kargoya verebiliriz.\n\nSevgiler,\nElif'
    },
    {
      id: 'KV-0864', name: 'Zeynep Koç', email: 'zeynep.koc@kavurma.co',
      plan: 'Ofis', months: 27, lastBox: '2026-11-12', risk: 54,
      signal: 'Fatura onayı bekliyor',
      message: 'Merhaba Zeynep, ofis faturası onay bekliyor. Onayı bu hafta içinde tamamlarsak 24 Kasım partisine yetişiyor; faturayı tekrar iletebilirim.\n\nSevgiler,\nElif'
    },
    {
      id: 'KV-1311', name: 'Cem Yıldız', email: 'cem.yildiz@kavurma.co',
      plan: 'Keşif', months: 3, lastBox: '2026-11-01', risk: 48,
      signal: 'Hediye aboneliği bitiyor',
      message: 'Merhaba Cem, hediye aboneliğin bitiyor. Devam etmek istersen ilk ay indirimli tanışma planını ayarlayabilirim.\n\nSevgiler,\nElif'
    },
    {
      id: 'KV-1055', name: 'Nilay Şahin', email: 'nilay.sahin@kavurma.co',
      plan: 'Tek Menşe', months: 19, lastBox: '2026-11-04', risk: 45,
      signal: 'Taşınma bildirimi verdi',
      message: 'Merhaba Nilay, taşınma bildirimini aldık. Yeni adresini paylaşırsan kutunun rotasını değiştirelim; bu ayki teslimatı da yeni adrese gönderelim.\n\nSevgiler,\nElif'
    },
    {
      id: 'KV-1188', name: 'Onur Çelik', email: 'onur.celik@kavurma.co',
      plan: 'Keşif', months: 9, lastBox: '2026-10-28', risk: 41,
      signal: 'Uygulamada 21 gündür yok',
      message: 'Merhaba Onur, 21 gündür uygulamaya girmemişsin. Aboneliğin senin için hâlâ doğru mu, yoksa bir süre ara vermek ister misin?\n\nSevgiler,\nElif'
    },
    {
      id: 'KV-1012', name: 'İpek Demir', email: 'ipek.demir@kavurma.co',
      plan: 'Tek Menşe', months: 24, lastBox: '2026-11-09', risk: 38,
      signal: 'Desteğe iki kez yazdı',
      message: 'Merhaba İpek, iki kez yazdığın konuyu kapattığımızı sanmıştım; hâlâ devam ediyorsa bu kez doğrudan ben ilgileneyim.\n\nSevgiler,\nElif'
    },
    {
      id: 'KV-1330', name: 'Can Aydın', email: 'can.aydin@kavurma.co',
      plan: 'Keşif', months: 4, lastBox: '2026-11-19', risk: 28,
      signal: 'Düzenli · son kutu 3 gün önce'
    },
    {
      id: 'KV-0761', name: 'Elif Kara', email: 'elif.kara@kavurma.co',
      plan: 'Tek Menşe', months: 16, lastBox: '2026-11-18', risk: 24,
      signal: '12 aydır kesintisiz'
    },
    {
      id: 'KV-0582', name: 'Emre Güneş', email: 'emre.gunes@kavurma.co',
      plan: 'Ofis', months: 33, lastBox: '2026-11-17', risk: 22,
      signal: 'Aylık 24 kutu'
    },
    {
      id: 'KV-1299', name: 'Seda Polat', email: 'seda.polat@kavurma.co',
      plan: 'Keşif', months: 7, lastBox: '2026-11-20', risk: 19,
      signal: 'İki arkadaşını getirdi'
    },
    {
      id: 'KV-1107', name: 'Tolga Erdem', email: 'tolga.erdem@kavurma.co',
      plan: 'Tek Menşe', months: 12, lastBox: '2026-11-16', risk: 16,
      signal: 'Son kutuyu 5/5 puanladı'
    },
    {
      id: 'KV-1392', name: 'Derya Kılıç', email: 'derya.kilic@kavurma.co',
      plan: 'Keşif', months: 2, lastBox: '2026-11-21', risk: 14,
      signal: 'Yeni abone · ilk kutu yolda'
    },
    {
      id: 'KV-0477', name: 'Baran Uysal', email: 'baran.uysal@kavurma.co',
      plan: 'Ofis', months: 41, lastBox: '2026-11-14', risk: 12,
      signal: 'Üç şubeye teslimat'
    },
    {
      id: 'KV-0838', name: 'Gizem Acar', email: 'gizem.acar@kavurma.co',
      plan: 'Tek Menşe', months: 21, lastBox: '2026-11-11', risk: 9,
      signal: 'Yıllık plana geçti'
    },
    {
      id: 'KV-1265', name: 'Hakan Yavuz', email: 'hakan.yavuz@kavurma.co',
      plan: 'Keşif', months: 6, lastBox: '2026-11-19', risk: 8,
      signal: 'İki kutuyu zamanında aldı'
    },
    {
      id: 'KV-0950', name: 'Melis Ateş', email: 'melis.ates@kavurma.co',
      plan: 'Tek Menşe', months: 13, lastBox: '2026-11-17', risk: 6,
      signal: 'Kutuyu 5/5 puanladı'
    },
    {
      id: 'KV-1418', name: 'Serkan Doğan', email: 'serkan.dogan@kavurma.co',
      plan: 'Keşif', months: 1, lastBox: '2026-11-20', risk: 4,
      signal: 'Yeni abone · hoş geldin araması'
    },
    {
      id: 'KV-0703', name: 'İrem Yalçın', email: 'irem.yalcin@kavurma.co',
      plan: 'Ofis', months: 18, lastBox: '2026-11-15', risk: 2,
      signal: 'Sözleşme yenilendi'
    }
  ];

  const actions = [
    { id: 'AK-201', customerId: 'KV-1042', category: 'geri-kazanim', categoryLabel: 'Geri kazanım', due: '2026-11-23', status: 'pending', resolution: '', note: '' },
    { id: 'AK-202', customerId: 'KV-1087', category: 'odeme', categoryLabel: 'Ödeme', due: '2026-11-23', status: 'pending', resolution: '', note: '' },
    { id: 'AK-203', customerId: 'KV-0921', category: 'geri-kazanim', categoryLabel: 'Geri kazanım', due: '2026-11-24', status: 'pending', resolution: '', note: '' },
    { id: 'AK-204', customerId: 'KV-1164', category: 'teslimat', categoryLabel: 'Teslimat', due: '2026-11-23', status: 'pending', resolution: '', note: '' },
    { id: 'AK-205', customerId: 'KV-1203', category: 'teslimat', categoryLabel: 'Teslimat', due: '2026-11-24', status: 'pending', resolution: '', note: '' },
    { id: 'AK-206', customerId: 'KV-0998', category: 'geri-kazanim', categoryLabel: 'Geri kazanım', due: '2026-11-25', status: 'pending', resolution: '', note: '' },
    { id: 'AK-207', customerId: 'KV-1240', category: 'teslimat', categoryLabel: 'Teslimat', due: '2026-11-23', status: 'pending', resolution: '', note: '' },
    { id: 'AK-208', customerId: 'KV-0864', category: 'odeme', categoryLabel: 'Ödeme', due: '2026-11-24', status: 'pending', resolution: '', note: '' },
    { id: 'AK-209', customerId: 'KV-1311', category: 'odeme', categoryLabel: 'Ödeme', due: '2026-11-26', status: 'pending', resolution: '', note: '' },
    { id: 'AK-210', customerId: 'KV-1055', category: 'teslimat', categoryLabel: 'Teslimat', due: '2026-11-24', status: 'pending', resolution: '', note: '' },
    { id: 'AK-211', customerId: 'KV-1188', category: 'geri-kazanim', categoryLabel: 'Geri kazanım', due: '2026-11-27', status: 'pending', resolution: '', note: '' },
    { id: 'AK-212', customerId: 'KV-1012', category: 'geri-kazanim', categoryLabel: 'Geri kazanım', due: '2026-11-22', status: 'resolved', resolution: 'Birebir arama ile çözüldü', note: 'Yeni kargo takip bağlantısı paylaşıldı.' }
  ];

  const sum = (rows, key) => rows.reduce((total, row) => total + row[key], 0);
  const net = (rows) => sum(rows, 'joined') - sum(rows, 'cancelled');
  const last4 = weeks.slice(-4);
  const prior4 = weeks.slice(-8, -4);
  const totalMrr = plans.reduce((total, plan) => total + plan.price * plan.subscribers, 0);
  const totalSubs = sum(plans, 'subscribers');
  const atRisk = customers.filter((customer) => customer.risk >= 35);
  const customerIds = new Set(customers.map((customer) => customer.id));

  console.assert(totalSubs === snapshot.activeSubscribers, 'plan counts must add to active subscribers');
  console.assert(totalMrr === snapshot.mrr, 'plan revenue must add to MRR');
  console.assert(net(last4) === 46, 'last four weeks must net +46');
  console.assert(net(prior4) === 45, 'prior four weeks must net +45');
  console.assert(sum(last4, 'joined') === 90, 'last four weeks joined must be 90');
  console.assert(sum(last4, 'cancelled') === 44, 'last four weeks cancelled must be 44');
  console.assert(sum(channels, 'value') === 90, 'channels must add to the joined total');
  console.assert(roast.boxes + roast.skipped === snapshot.activeSubscribers, 'boxes plus skips must equal subscribers');
  console.assert(atRisk.length === 12, 'there must be twelve at-risk subscribers');
  console.assert(snapshot.mrr - snapshot.priorMrr === 32076, 'MRR change must match the displayed figures');
  console.assert(customers.length === 24, 'the list holds 24 subscribers');
  console.assert(customers.every((c) => c.lastBox <= snapshot.date), 'last box dates are in the past');
  console.assert(weeks.every((w, i) => i === 0 || w.start > weeks[i - 1].start), 'weeks are in order');
  console.assert(actions.every((a) => customerIds.has(a.customerId)), 'every action must reference an existing customer');

  window.KAVURMA = {
    snapshot, weeks, plans, channels, roast, customers, actions,
    atRisk,
    totals: {
      totalMrr, totalSubs,
      last4: { joined: sum(last4, 'joined'), cancelled: sum(last4, 'cancelled'), net: net(last4) },
      prior4: { joined: sum(prior4, 'joined'), cancelled: sum(prior4, 'cancelled'), net: net(prior4) },
      churn: sum(last4, 'cancelled') / (snapshot.activeSubscribers - net(last4)),
      priorChurn: sum(prior4, 'cancelled') / (snapshot.activeSubscribers - net(last4) - net(prior4)),
      boxesPct: roast.boxes / roast.capacity,
      channelsTotal: sum(channels, 'value')
    }
  };
})();
