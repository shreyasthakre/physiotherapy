import { query } from './pool.js';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import { hashPassword } from '../utils/password.js';

const services = [
  {
    slug: 'sports-injury',
    name: 'Sports Injury Rehabilitation',
    category: 'Rehabilitation',
    short_description:
      'Targeted recovery programs to get athletes safely back to peak performance.',
    description:
      'Our sports injury rehabilitation combines hands-on manual therapy, progressive strength training, and biomechanical assessment. We treat sprains, strains, ligament injuries, tendinopathies, and post-competition recovery with evidence-based protocols tailored to your sport.',
    duration_minutes: 45,
    price: 90.0,
    image_url: '/images/services/sports-injury.jpg',
  },
  {
    slug: 'post-surgery-rehab',
    name: 'Post-Surgery Rehabilitation',
    category: 'Rehabilitation',
    short_description:
      'Structured recovery after orthopaedic surgery to restore mobility and strength.',
    description:
      'Following surgery such as ACL reconstruction, joint replacement, or spinal procedures, our physiotherapists guide you through a carefully staged plan. We focus on restoring range of motion, rebuilding strength, and returning you to daily activities with confidence.',
    duration_minutes: 60,
    price: 110.0,
    image_url: '/images/services/post-surgery-rehab.jpg',
  },
  {
    slug: 'chronic-pain-management',
    name: 'Chronic Pain Management',
    category: 'Pain Management',
    short_description:
      'Holistic, long-term strategies to reduce persistent pain and improve quality of life.',
    description:
      'Chronic pain requires a multi-dimensional approach. We combine graded exercise therapy, manual techniques, education on pain science, and lifestyle coaching to help you manage conditions such as lower back pain, arthritis, fibromyalgia, and persistent neck pain.',
    duration_minutes: 50,
    price: 95.0,
    image_url: '/images/services/chronic-pain-management.jpg',
  },
  {
    slug: 'neurological-physiotherapy',
    name: 'Neurological Physiotherapy',
    category: 'Neuro Rehab',
    short_description:
      'Specialised rehab for stroke, MS, and other neurological conditions.',
    description:
      'Our neurological physiotherapy supports people recovering from stroke, living with multiple sclerosis, Parkinson\u2019s disease, or recovering from brain and spinal injuries. We work on balance, coordination, gait re-training, and functional independence.',
    duration_minutes: 60,
    price: 120.0,
    image_url: '/images/services/neurological-physiotherapy.jpg',
  },
  {
    slug: 'tecar-therapy',
    name: 'TECAR Therapy',
    category: 'Electrotherapy',
    short_description:
      'Capacitive-resistive energy transfer to speed tissue healing and ease deep pain.',
    description:
      'TECAR (Transfer of Energy Capacitive and Resistive) uses radiofrequency to heat deep tissues, increase circulation, and reduce inflammation. It is used for muscle strains, joint stiffness, tendon injuries, and post-activity recovery. Sessions are comfortable and often combined with hands-on physiotherapy and exercise.',
    duration_minutes: 30,
    price: 85.0,
    image_url: '/images/services/tecar-therapy.jpg',
  },
  {
    slug: 'laser-therapy',
    name: 'Laser Therapy',
    category: 'Electrotherapy',
    short_description:
      'Low-level and class IV laser to reduce pain, swelling, and support tissue repair.',
    description:
      'Laser physiotherapy (photobiomodulation) delivers targeted light energy to injured tissue. It is used for tendinopathy, osteoarthritis, wound healing after surgery, sports injuries, and persistent inflammation. Treatment is non-invasive, typically painless, and can be paired with exercise rehab.',
    duration_minutes: 25,
    price: 75.0,
    image_url: '/images/services/laser-therapy.jpg',
  },
  {
    slug: 'ift-interferential-therapy',
    name: 'Interferential Therapy (IFT)',
    category: 'Electrotherapy',
    short_description:
      'Medium-frequency electrical stimulation for pain relief and muscle relaxation.',
    description:
      'Interferential Therapy (IFT) uses two medium-frequency currents that intersect in the tissue to relieve pain, reduce swelling, and relax spasm. It is commonly used for back and neck pain, knee osteoarthritis, frozen shoulder, and post-injury oedema. Pads are placed around the painful area; most patients feel a gentle tingling.',
    duration_minutes: 20,
    price: 60.0,
    image_url: '/images/services/ift-interferential-therapy.jpg',
  },
  {
    slug: 'ultrasound-therapy',
    name: 'Therapeutic Ultrasound',
    category: 'Electrotherapy',
    short_description:
      'Sound-wave treatment to warm deep tissue, reduce scar tightness, and aid healing.',
    description:
      'Therapeutic ultrasound uses high-frequency sound waves to increase local blood flow, soften adhesions, and support healing of muscle, ligament, and tendon injuries. It is often used for tennis elbow, plantar fasciitis, bursitis, and post-fracture stiffness as part of a wider physiotherapy plan.',
    duration_minutes: 20,
    price: 55.0,
    image_url: '/images/services/ultrasound-therapy.jpg',
  },
  {
    slug: 'tens-therapy',
    name: 'TENS Therapy',
    category: 'Electrotherapy',
    short_description:
      'Transcutaneous electrical nerve stimulation for drug-free pain control.',
    description:
      'TENS delivers mild electrical pulses through the skin to interrupt pain signals and encourage natural endorphins. It is used for chronic back and neck pain, nerve pain, and post-operative discomfort. We also teach selected patients how to use a unit safely at home between clinic visits.',
    duration_minutes: 20,
    price: 50.0,
    image_url: '/images/services/tens-therapy.jpg',
  },
  {
    slug: 'shockwave-therapy',
    name: 'Shockwave Therapy',
    category: 'Electrotherapy',
    short_description:
      'Focused acoustic waves for stubborn tendons and heel pain that has not settled.',
    description:
      'Extracorporeal shockwave therapy (ESWT) delivers acoustic pulses to stimulate healing in chronic tendinopathies. It is commonly used for plantar fasciitis, Achilles tendinopathy, tennis elbow, and calcific shoulder tendinitis when rest and exercise alone have plateaued.',
    duration_minutes: 30,
    price: 95.0,
    image_url: '/images/services/shockwave-therapy.jpg',
  },
];

const testimonials = [
  {
    patient_name: 'Sarah Mitchell',
    rating: 5,
    quote:
      'After my knee reconstruction I could barely walk. The team built a plan that got me running again in six months. I could not be more grateful.',
    location: 'Marathon runner',
    avatar_url: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
  {
    patient_name: 'James Okoye',
    rating: 5,
    quote:
      'Years of chronic back pain, gone. They taught me how my body works and gave me the tools to stay pain-free. Genuinely life-changing care.',
    location: 'Office worker',
    avatar_url: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    patient_name: 'Priya Sharma',
    rating: 5,
    quote:
      'Warm, professional, and incredibly knowledgeable. My shoulder mobility is better than it has been in a decade. Highly recommend this clinic.',
    location: 'Yoga instructor',
    avatar_url: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    patient_name: 'David Chen',
    rating: 5,
    quote:
      'The post-surgery program was structured and reassuring at every step. I always knew what to do next and why. Outstanding physiotherapists.',
    location: 'Cyclist',
    avatar_url: 'https://randomuser.me/api/portraits/men/75.jpg',
  },
];

const blogPosts = [
  {
    slug: '5-stretches-for-lower-back-pain',
    title: '5 Gentle Stretches to Ease Lower Back Pain',
    excerpt:
      'Simple, physiotherapist-approved stretches you can do at home to relieve and prevent lower back discomfort.',
    content:
      'Lower back pain affects most people at some point in their lives. The good news is that gentle, regular movement is one of the most effective ways to manage it.\n\n## 1. Knee-to-chest stretch\nLie on your back and gently pull one knee toward your chest, holding for 20\u201330 seconds. Repeat on each side.\n\n## 2. Cat-cow\nOn hands and knees, alternate between arching and rounding your spine to mobilise the vertebrae.\n\n## 3. Child\u2019s pose\nA restful stretch that lengthens the lower back and hips.\n\n## 4. Pelvic tilts\nStrengthen the deep core muscles that stabilise the spine.\n\n## 5. Glute bridges\nActivate the glutes to take load off the lower back.\n\nAlways move within a comfortable range and stop if you feel sharp pain. If symptoms persist, book an assessment with one of our physiotherapists.',
    tags: ['back pain', 'stretching', 'home exercises'],
    cover_image_url:
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80',
    video_url: 'https://www.youtube.com/embed/2X4pMTPUgQE',
  },
  {
    slug: 'return-to-sport-after-injury',
    title: 'Returning to Sport After Injury: A Safe Roadmap',
    excerpt:
      'How to progress from injury back to full training without risking re-injury.',
    content:
      'Rushing back to sport is the most common cause of re-injury. A structured return-to-sport program balances tissue healing with progressive loading.\n\n### Phase 1 \u2014 Protect and restore\nControl swelling and restore pain-free range of motion.\n\n### Phase 2 \u2014 Rebuild strength\nProgressive resistance training targeting the injured area and surrounding muscles.\n\n### Phase 3 \u2014 Sport-specific drills\nReintroduce cutting, jumping, and sprinting under supervision.\n\n### Phase 4 \u2014 Return to play\nGradually increase training volume before returning to competition.\n\nYour physiotherapist will use objective criteria \u2014 not just time \u2014 to clear each phase.',
    tags: ['sports', 'recovery', 'rehab'],
    cover_image_url:
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
  },
  {
    slug: 'desk-ergonomics-for-neck-pain',
    title: 'Desk Ergonomics: Beat Neck and Shoulder Pain at Work',
    excerpt:
      'Small changes to your workstation that make a big difference for your neck and shoulders.',
    content:
      'If you spend hours at a desk, your setup matters. Poor ergonomics loads the neck and shoulders and contributes to tension headaches.\n\n- Position your monitor at eye level.\n- Keep elbows at roughly 90 degrees.\n- Support your lower back with the chair or a cushion.\n- Take a movement break every 30\u201345 minutes.\n\nPair these changes with regular mobility exercises for the best results.',
    tags: ['ergonomics', 'neck pain', 'workplace'],
    cover_image_url:
      'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=1200&q=80',
  },
];

/**
 * Populate the database with demo content and accounts. Idempotent —
 * safe to run repeatedly (uses ON CONFLICT / NOT EXISTS guards).
 */
export const seedDatabase = async () => {
  // ─── Admin ───
  const adminHash = await hashPassword(config.seed.adminPassword);
  const adminRes = await query(
    `INSERT INTO users (role, full_name, email, password_hash, phone)
     VALUES ('admin', 'Clinic Administrator', $1, $2, '+61400000000')
     ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
     RETURNING id`,
    [config.seed.adminEmail, adminHash],
  );
  const adminId = adminRes.rows[0].id;

  // ─── Physiotherapist ───
  const physioHash = await hashPassword('Physio@12345');
  const physioRes = await query(
    `INSERT INTO users (role, full_name, email, password_hash, phone)
     VALUES ('physiotherapist', 'Dr. Emily Carter', 'physio@physioclinic.example', $1, '+61400111222')
     ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
     RETURNING id`,
    [physioHash],
  );
  const physioId = physioRes.rows[0].id;

  // ─── Patient ───
  const patientHash = await hashPassword('Patient@12345');
  const patientRes = await query(
    `INSERT INTO users (role, full_name, email, password_hash, phone)
     VALUES ('patient', 'John Patient', 'patient@physioclinic.example', $1, '+61400333444')
     ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
     RETURNING id`,
    [patientHash],
  );
  const patientId = patientRes.rows[0].id;

  // ─── Services ───
  const serviceIds = {};
  for (const s of services) {
    const res = await query(
      `INSERT INTO services (slug, name, category, short_description, description, duration_minutes, price, image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (slug) DO UPDATE SET
         name = EXCLUDED.name,
         category = EXCLUDED.category,
         short_description = EXCLUDED.short_description,
         description = EXCLUDED.description,
         duration_minutes = EXCLUDED.duration_minutes,
         price = EXCLUDED.price,
         image_url = EXCLUDED.image_url
       RETURNING id`,
      [
        s.slug,
        s.name,
        s.category,
        s.short_description,
        s.description,
        s.duration_minutes,
        s.price,
        s.image_url,
      ],
    );
    serviceIds[s.slug] = res.rows[0].id;
  }

  // ─── Testimonials ───
  for (const t of testimonials) {
    await query(
      `INSERT INTO testimonials (patient_name, rating, quote, location, avatar_url)
       SELECT $1,$2,$3,$4,$5
       WHERE NOT EXISTS (SELECT 1 FROM testimonials WHERE patient_name = $1 AND quote = $3)`,
      [t.patient_name, t.rating, t.quote, t.location, t.avatar_url],
    );
  }

  // ─── Blog posts ───
  for (const p of blogPosts) {
    await query(
      `INSERT INTO blog_posts (slug, title, excerpt, content, cover_image_url, video_url, tags, author_id, is_published, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,TRUE,now())
       ON CONFLICT (slug) DO UPDATE SET
         title = EXCLUDED.title,
         excerpt = EXCLUDED.excerpt,
         content = EXCLUDED.content,
         cover_image_url = EXCLUDED.cover_image_url,
         video_url = EXCLUDED.video_url,
         tags = EXCLUDED.tags`,
      [
        p.slug,
        p.title,
        p.excerpt,
        p.content,
        p.cover_image_url,
        p.video_url || null,
        p.tags,
        physioId,
      ],
    );
  }

  // ─── Sample appointment ───
  await query(
    `INSERT INTO appointments (patient_id, physiotherapist_id, service_id, scheduled_at, duration_minutes, status, reason)
     SELECT $1,$2,$3, now() + interval '3 days', 45, 'confirmed', 'Follow-up on knee rehab'
     WHERE NOT EXISTS (
       SELECT 1 FROM appointments WHERE patient_id = $1 AND service_id = $3
     )`,
    [patientId, physioId, serviceIds['sports-injury']],
  );

  // ─── Sample patient records ───
  const records = [
    {
      type: 'prescription',
      title: 'Anti-inflammatory regimen',
      body: 'Ibuprofen 400mg with food, up to 3x daily for 5 days as needed for pain.',
      data: { medication: 'Ibuprofen', dosage: '400mg', frequency: '3x daily' },
    },
    {
      type: 'exercise_plan',
      title: 'Week 4 knee strengthening',
      body: 'Progressive loading program to rebuild quadriceps strength.',
      data: {
        exercises: [
          { name: 'Straight leg raises', sets: 3, reps: 12 },
          { name: 'Mini squats', sets: 3, reps: 10 },
          { name: 'Step-ups', sets: 3, reps: 10 },
        ],
      },
    },
    {
      type: 'progress_report',
      title: 'Month 1 review',
      body: 'Range of motion improved from 90 to 120 degrees. Pain reduced from 6/10 to 2/10.',
      data: { rangeOfMotion: '120deg', painScore: '2/10', adherence: '95%' },
    },
  ];
  for (const r of records) {
    await query(
      `INSERT INTO patient_records (patient_id, physiotherapist_id, type, title, body, data)
       SELECT $1,$2,$3,$4,$5,$6
       WHERE NOT EXISTS (
         SELECT 1 FROM patient_records WHERE patient_id = $1 AND title = $4
       )`,
      [patientId, physioId, r.type, r.title, r.body, JSON.stringify(r.data)],
    );
  }

  logger.info('Seed complete. Demo accounts:');
  logger.info(`  admin    -> ${config.seed.adminEmail} / ${config.seed.adminPassword}`);
  logger.info('  physio   -> physio@physioclinic.example / Physio@12345');
  logger.info('  patient  -> patient@physioclinic.example / Patient@12345');
};
