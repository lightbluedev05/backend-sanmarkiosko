import bcrypt from "bcryptjs";
import { db } from "../config/db.js";

const seedDatabase = async () => {
  try {
    console.log("🌱 Iniciando inserción de datos de prueba (Seeding)...");

    // Iniciar transacción SQL
    await db.query("BEGIN");

    // Limpiar tablas existentes en orden
    console.log("🗑️ Limpiando tablas de base de datos...");
    await db.query("TRUNCATE TABLE transactions CASCADE");
    await db.query("TRUNCATE TABLE favorites CASCADE");
    await db.query("TRUNCATE TABLE listings CASCADE");
    await db.query("TRUNCATE TABLE users CASCADE");

    // 1. Crear contraseña genérica hasheada
    const defaultPassword = "password123";
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(defaultPassword, salt);

    console.log("👤 Creando estudiantes de San Marcos (Usuarios)...");
    
    // Insertar Juan Estudiante (Usuario Principal de la demo)
    const juanRes = await db.query(
      `INSERT INTO users (name, email, password_hash, faculty, career, year, bio, avatar_url, phone, is_pro, rating)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id`,
      [
        "Juan Estudiante",
        "juan@unmsm.edu.pe",
        passwordHash,
        "Facultad de Ciencias Contables",
        "Contabilidad",
        "2021",
        "Estudiante de 5to ciclo. Vendo mis apuntes resumidos de contabilidad de costos e impuestos, y algunos libros que ya no uso en el campus.",
        "JE",
        "987654321",
        true,
        4.90
      ]
    );
    const juanId = juanRes.rows[0].id;

    // Andrea Vizcarra (Comida Saludable)
    const andreaRes = await db.query(
      `INSERT INTO users (name, email, password_hash, faculty, career, year, bio, avatar_url, phone, is_pro, rating)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id`,
      [
        "Andrea Vizcarra",
        "andrea@unmsm.edu.pe",
        passwordHash,
        "Facultad de Ciencias Biológicas",
        "Ciencias Biológicas",
        "2022",
        "Apasionada por la nutrición y comida saludable. Preparo lomos y hamburguesas veganas los días martes y jueves en la ciudad universitaria.",
        "AV",
        "912345678",
        false,
        4.80
      ]
    );
    const andreaId = andreaRes.rows[0].id;

    // Marco Aurelio (Vendedor Merch)
    const marcoRes = await db.query(
      `INSERT INTO users (name, email, password_hash, faculty, career, year, bio, avatar_url, phone, is_pro, rating)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id`,
      [
        "Marco Aurelio",
        "marco@unmsm.edu.pe",
        passwordHash,
        "Facultad de Letras y Ciencias Humanas",
        "Literatura",
        "2020",
        "Estudiante de Literatura de últimos ciclos. Coordinador de merchandising oficial y alquiler de togas para ceremonias.",
        "MA",
        "934567890",
        true,
        4.85
      ]
    );
    const marcoId = marcoRes.rows[0].id;

    // Carlos Pérez (Asesor Académico)
    const carlosRes = await db.query(
      `INSERT INTO users (name, email, password_hash, faculty, career, year, bio, avatar_url, phone, is_pro, rating)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id`,
      [
        "Carlos Pérez",
        "carlos@unmsm.edu.pe",
        passwordHash,
        "Facultad de Ingeniería de Sistemas e Informática (FISI)",
        "Ingeniería de Sistemas",
        "2019",
        "Último año de sistemas. Ofrezco clases de apoyo y resolución de problemas para Cálculo I, II, III y Física General.",
        "CP",
        "945678123",
        true,
        5.00
      ]
    );
    const carlosId = carlosRes.rows[0].id;

    // Ana Martínez (Tickets Comedor)
    const anaRes = await db.query(
      `INSERT INTO users (name, email, password_hash, faculty, career, year, bio, avatar_url, phone, is_pro, rating)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id`,
      [
        "Ana Martínez",
        "ana@unmsm.edu.pe",
        passwordHash,
        "Facultad de Ciencias Administrativas (FCA)",
        "Administración",
        "2023",
        "Estudiante de 4to ciclo. A veces me sobran tickets de almuerzo del comedor y los transfiero al instante.",
        "AM",
        "976543210",
        false,
        4.20
      ]
    );
    const anaId = anaRes.rows[0].id;

    // Diego Sánchez (Soporte Técnico)
    const diegoRes = await db.query(
      `INSERT INTO users (name, email, password_hash, faculty, career, year, bio, avatar_url, phone, is_pro, rating)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id`,
      [
        "Diego Sánchez",
        "diego@unmsm.edu.pe",
        passwordHash,
        "Facultad de Ingeniería Electrónica y Eléctrica (FIEE)",
        "Ingeniería de Telecomunicaciones",
        "2021",
        "Ofrezco servicios de formateo de computadoras, instalación de software y mantenimiento preventivo en la biblioteca central.",
        "DS",
        "963258741",
        true,
        4.95
      ]
    );
    const diegoId = diegoRes.rows[0].id;

    // Estefany López (Derecho)
    const estefanyRes = await db.query(
      `INSERT INTO users (name, email, password_hash, faculty, career, year, bio, avatar_url, phone, is_pro, rating)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id`,
      [
        "Estefany López",
        "estefany@unmsm.edu.pe",
        passwordHash,
        "Facultad de Derecho y Ciencia Política",
        "Derecho",
        "2022",
        "Estudiante de Derecho. Comparto mis carpetas temáticas y resúmenes estructurados para parciales y finales.",
        "EL",
        "951478632",
        false,
        4.60
      ]
    );
    const estefanyId = estefanyRes.rows[0].id;

    // Sofía Medina (Medicina - Nueva)
    const sofiaRes = await db.query(
      `INSERT INTO users (name, email, password_hash, faculty, career, year, bio, avatar_url, phone, is_pro, rating)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id`,
      [
        "Sofía Medina",
        "sofia@unmsm.edu.pe",
        passwordHash,
        "Facultad de Medicina Humana (San Fernando)",
        "Medicina Humana",
        "2020",
        "Estudiante de San Fernando. Vendo materiales de disección y libros médicos de segunda mano.",
        "SM",
        "982468135",
        true,
        4.98
      ]
    );
    const sofiaId = sofiaRes.rows[0].id;

    // Jorge Altamirano (Psicología - Nuevo)
    const jorgeRes = await db.query(
      `INSERT INTO users (name, email, password_hash, faculty, career, year, bio, avatar_url, phone, is_pro, rating)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id`,
      [
        "Jorge Altamirano",
        "jorge@unmsm.edu.pe",
        passwordHash,
        "Facultad de Psicología",
        "Psicología",
        "2023",
        "Ofrezco asesoría y tutorías básicas para ingresantes en temas de organización y hábitos de estudio.",
        "JA",
        "993355771",
        false,
        4.40
      ]
    );
    const jorgeId = jorgeRes.rows[0].id;

    console.log("📝 Creando anuncios (Listings con tipos y stock)...");

    // LISTINGS ACTIVOS
    const listing1 = await db.query(
      `INSERT INTO listings (title, description, price, category, image_url, seller_id, is_boosted, status, type, stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        "Almuerzo Casero - Lomo Saltado",
        "Lomo saltado con papas fritas y arroz. Ingredientes de calidad y frescos. Entrega a la 1:00 PM frente a la Facultad de Biología.",
        15.00,
        "Comida",
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop",
        andreaId,
        true,
        "Activo",
        "Producto",
        10
      ]
    );

    const listing2 = await db.query(
      `INSERT INTO listings (title, description, price, category, image_url, seller_id, is_boosted, status, type, stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        "Polera Oficial San Marcos - Talla M",
        "Polera azul marino de algodón reactivo con el escudo oficial bordado. Talla M, nueva y embolsada.",
        45.00,
        "Otros Productos",
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
        marcoId,
        true,
        "Activo",
        "Producto",
        5
      ]
    );

    const listing3 = await db.query(
      `INSERT INTO listings (title, description, price, category, image_url, seller_id, is_boosted, status, type, stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        "Asesoría Cálculo III - Temas 1 al 5",
        "Clases particulares para resolver problemas complejos de Cálculo III (Integrales múltiples, campos vectoriales). Sesión presencial de 2 horas en la biblioteca central o FISI.",
        25.00,
        "Académico",
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800&auto=format&fit=crop",
        carlosId,
        false,
        "Activo",
        "Servicio",
        0
      ]
    );

    const listing4 = await db.query(
      `INSERT INTO listings (title, description, price, category, image_url, seller_id, is_boosted, status, type, stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        "Ticket de Comedor - Almuerzo (Viernes)",
        "Vendo mi ticket de almuerzo para este viernes. Hacemos la transferencia del QR en el momento.",
        5.50,
        "Vida Diaria",
        "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=800&q=80",
        anaId,
        false,
        "Activo",
        "Producto",
        1
      ]
    );

    const listing5 = await db.query(
      `INSERT INTO listings (title, description, price, category, image_url, seller_id, is_boosted, status, type, stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        "Formateo de Laptop + Antivirus",
        "Instalación limpia de Windows 10 u 11 Pro, Office completo y software utilitario para estudiantes. Trabajo garantizado, se realiza en la FIEE.",
        40.00,
        "Tecnología",
        "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=800&auto=format&fit=crop",
        diegoId,
        false,
        "Activo",
        "Servicio",
        0
      ]
    );

    const listing6 = await db.query(
      `INSERT INTO listings (title, description, price, category, image_url, seller_id, is_boosted, status, type, stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        "Resúmenes Derecho Civil II",
        "Apuntes claros y ordenados de todo el ciclo de Derecho Civil II. Incluye análisis de casos reales e interpretaciones del Código Civil.",
        10.00,
        "Académico",
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop",
        estefanyId,
        false,
        "Activo",
        "Producto",
        25
      ]
    );

    const listing7 = await db.query(
      `INSERT INTO listings (title, description, price, category, image_url, seller_id, is_boosted, status, type, stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        "Estuche de Disección Médico",
        "Estuche completo con 12 piezas de acero inoxidable para prácticas de anatomía y cirugía. En excelentes condiciones.",
        65.00,
        "Académico",
        "https://images.unsplash.com/photo-1606206591513-0f7ff55ef3a1?q=80&w=800&auto=format&fit=crop",
        sofiaId,
        true,
        "Activo",
        "Producto",
        3
      ]
    );

    const listing8 = await db.query(
      `INSERT INTO listings (title, description, price, category, image_url, seller_id, is_boosted, status, type, stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        "Hamburguesas Veganas de Lentejas",
        "Pack de 4 unidades de hamburguesas caseras elaboradas con lentejas, quinua y especias. Súper saludables y congeladas.",
        12.00,
        "Comida",
        "https://images.unsplash.com/photo-1585238342024-78d387f4a707?q=80&w=800&auto=format&fit=crop",
        andreaId,
        false,
        "Activo",
        "Producto",
        8
      ]
    );

    const listing9 = await db.query(
      `INSERT INTO listings (title, description, price, category, image_url, seller_id, is_boosted, status, type, stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        "Calculadora Científica Casio FX-570",
        "Calculadora científica Casio FX-570 original. Ideal para ingenierías o matemáticas básicas. Funciona al 100%.",
        55.00,
        "Tecnología",
        "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop",
        diegoId,
        false,
        "Activo",
        "Producto",
        2
      ]
    );

    const listing10 = await db.query(
      `INSERT INTO listings (title, description, price, category, image_url, seller_id, is_boosted, status, type, stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        "Libro Anatomía de Gray 42a Edición",
        "Libro oficial en pasta dura. Perfecto estado, no está rayado ni resaltado. Entrega en la facultad de medicina.",
        180.00,
        "Académico",
        "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=800&auto=format&fit=crop",
        sofiaId,
        false,
        "Activo",
        "Producto",
        1
      ]
    );

    const listing11 = await db.query(
      `INSERT INTO listings (title, description, price, category, image_url, seller_id, is_boosted, status, type, stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        "Alquiler de Toga y Birrete",
        "Toga y birrete de color negro oficial para ceremonias de graduación de San Marcos. Lavada y planchada lista para usar.",
        35.00,
        "Vida Diaria",
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop",
        marcoId,
        false,
        "Activo",
        "Servicio",
        0
      ]
    );

    // Listings de Juan Estudiante (Ventas Activas)
    const listingJuan1 = await db.query(
      `INSERT INTO listings (title, description, price, category, image_url, seller_id, is_boosted, status, type, stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        "Resúmenes de Derecho Mercantil",
        "Súper resúmenes que preparé para aprobar Derecho Mercantil. Contiene diagramas de flujo de cheques y contratos comerciales.",
        15.00,
        "Académico",
        "https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=800&auto=format&fit=crop",
        juanId,
        false,
        "Activo",
        "Producto",
        15
      ]
    );

    const listingJuan2 = await db.query(
      `INSERT INTO listings (title, description, price, category, image_url, seller_id, is_boosted, status, type, stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        "Calculadora Casio FX-991LAX Classwiz",
        "Calculadora científica de alta gama con hojas de cálculo y resolución de matrices. En perfecto estado y con tapa protectora.",
        85.00,
        "Tecnología",
        "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop",
        juanId,
        false,
        "Activo",
        "Producto",
        1
      ]
    );

    // Listings ya Vendidos (Agotados)
    const listingJuanSold = await db.query(
      `INSERT INTO listings (title, description, price, category, image_url, seller_id, is_boosted, status, type, stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        "Libro Álgebra Lineal",
        "Libro clásico de Álgebra Lineal de Grossman. Tiene anotaciones a lápiz en los márgenes.",
        30.00,
        "Académico",
        "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=800&auto=format&fit=crop",
        juanId,
        false,
        "Vendido",
        "Producto",
        0
      ]
    );

    const listingPurchasedSold1 = await db.query(
      `INSERT INTO listings (title, description, price, category, image_url, seller_id, is_boosted, status, type, stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        "Cargador Universal Laptop",
        "Cargador para laptop con voltaje regulable de 15v a 24v. Incluye adaptadores multimarca.",
        45.00,
        "Tecnología",
        "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=800&auto=format&fit=crop",
        diegoId,
        false,
        "Vendido",
        "Producto",
        0
      ]
    );

    const listingPurchasedSold2 = await db.query(
      `INSERT INTO listings (title, description, price, category, image_url, seller_id, is_boosted, status, type, stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        "Cuaderno Cuadriculado A4",
        "Cuaderno A4 anillado tapa dura. Nuevo, 100 hojas de 80gr.",
        4.00,
        "Vida Diaria",
        "https://images.unsplash.com/photo-1531346878377-a5be20888e57?q=80&w=800&auto=format&fit=crop",
        anaId,
        false,
        "Vendido",
        "Producto",
        0
      ]
    );

    console.log("🤝 Registrando transacciones e historial...");

    // Transacción 1: Juan vendió "Libro Álgebra Lineal" a Andrea (Hace 10 días)
    await db.query(
      `INSERT INTO transactions (listing_id, buyer_id, seller_id, price, status, created_at)
       VALUES ($1, $2, $3, $4, 'Completado', NOW() - INTERVAL '10 days')`,
      [listingJuanSold.rows[0].id, andreaId, juanId, 30.00]
    );

    // Transacción 2: Juan compró "Cargador Universal Laptop" a Diego (Hace 5 días)
    await db.query(
      `INSERT INTO transactions (listing_id, buyer_id, seller_id, price, status, created_at)
       VALUES ($1, $2, $3, $4, 'Completado', NOW() - INTERVAL '5 days')`,
      [listingPurchasedSold1.rows[0].id, juanId, diegoId, 45.00]
    );

    // Transacción 3: Juan compró "Cuaderno Cuadriculado A4" a Ana (Hace 2 días)
    await db.query(
      `INSERT INTO transactions (listing_id, buyer_id, seller_id, price, status, created_at)
       VALUES ($1, $2, $3, $4, 'Completado', NOW() - INTERVAL '2 days')`,
      [listingPurchasedSold2.rows[0].id, juanId, anaId, 4.00]
    );

    // Transacción 4: Andrea reservó / compró "Estuche de Disección" de Sofía (Hace 1 día)
    await db.query(
      `INSERT INTO transactions (listing_id, buyer_id, seller_id, price, status, created_at)
       VALUES ($1, $2, $3, $4, 'Completado', NOW() - INTERVAL '1 day')`,
      [listing7.rows[0].id, andreaId, sofiaId, 65.00]
    );

    // Transacción 5: Diego reservó "Asesoría Cálculo III" de Carlos (Activo - Hace unas horas)
    await db.query(
      `INSERT INTO transactions (listing_id, buyer_id, seller_id, price, status, created_at)
       VALUES ($1, $2, $3, $4, 'Completado', NOW() - INTERVAL '3 hours')`,
      [listing3.rows[0].id, diegoId, carlosId, 25.00]
    );

    console.log("❤️ Vinculando favoritos iniciales...");

    // Juan tiene de favoritos: Polera de Marco, Asesoría de Carlos y Estuche de Sofía
    await db.query(
      `INSERT INTO favorites (user_id, listing_id) VALUES 
       ($1, $2), ($1, $3), ($1, $4)`,
      [juanId, listing2.rows[0].id, listing3.rows[0].id, listing7.rows[0].id]
    );

    // Confirmar transacción SQL
    await db.query("COMMIT");
    console.log("✨ Base de datos sembrada con éxito (Seeding completado).");
    console.log(`💡 Para iniciar sesión como Juan Estudiante en el Frontend:
       Correo: juan@unmsm.edu.pe
       Contraseña: ${defaultPassword}`);

  } catch (error) {
    await db.query("ROLLBACK");
    console.error("❌ Error al sembrar la base de datos:", error);
  } finally {
    await db.pool.end();
  }
};

seedDatabase();
