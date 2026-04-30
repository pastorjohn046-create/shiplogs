import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { promises as fs } from "fs";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { z } from "zod";

const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "swift-track-secret-key-123";
const DATA_FILE = path.join(process.cwd(), "data.json");

// Initial data structure
const initialData = {
  users: [],
  shipments: [],
  tickets: [],
  logs: []
};

// ... existing code ...

async function addLog(action: string, details: string, user?: any) {
  try {
    const data = await getData();
    const log = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      action,
      details,
      user: user ? user.email : "System"
    };
    data.logs = [log, ...(data.logs || [])].slice(0, 100); // Keep last 100 logs
    await saveData(data);
  } catch (err) {
    console.error("Error adding log:", err);
  }
}

// Cache for data
let dataCache: any = null;

async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE);
    const content = await fs.readFile(DATA_FILE, "utf-8");
    dataCache = JSON.parse(content);
    
    // Seed admin if not exists
    const adminEmail = "pastorjohn046@gmail.com";
    if (dataCache.users && !dataCache.users.find((u: any) => u.email === adminEmail)) {
      const hashedPassword = await bcrypt.hash("pastorjohn046@gmail.com", 10);
      dataCache.users.push({
        uid: "admin1",
        email: adminEmail,
        password: hashedPassword,
        role: "admin"
      });
      await saveData(dataCache);
      console.log("Admin user seeded.");
    }
  } catch {
    const adminEmail = "pastorjohn046@gmail.com";
    const hashedPassword = await bcrypt.hash("pastorjohn046@gmail.com", 10);
    const initialWithAdmin = {
      ...initialData,
      users: [{
        uid: "admin1",
        email: adminEmail,
        password: hashedPassword,
        role: "admin"
      }]
    };
    dataCache = initialWithAdmin;
    await fs.writeFile(DATA_FILE, JSON.stringify(initialWithAdmin, null, 2));
    console.log("Initial data and admin user created.");
  }
}

async function getData() {
  if (dataCache) return dataCache;
  try {
    const content = await fs.readFile(DATA_FILE, "utf-8");
    if (!content.trim()) {
      dataCache = { ...initialData };
      return dataCache;
    }
    dataCache = JSON.parse(content);
    // Ensure structure
    if (!dataCache.logs) dataCache.logs = [];
    if (!dataCache.users) dataCache.users = [];
    if (!dataCache.shipments) dataCache.shipments = [];
    if (!dataCache.tickets) dataCache.tickets = [];
    return dataCache;
  } catch (err) {
    console.error("Error reading data file:", err);
    dataCache = { ...initialData };
    return dataCache;
  }
}

async function saveData(data: any) {
  const tempFile = `${DATA_FILE}.tmp`;
  try {
    dataCache = data;
    // Atomic-like write: write to temp then rename
    const content = JSON.stringify(data, null, 2);
    await fs.writeFile(tempFile, content, "utf-8");
    await fs.rename(tempFile, DATA_FILE);
  } catch (err) {
    console.error("Error saving data file:", err);
    // Cleanup temp file if it exists
    try {
      await fs.unlink(tempFile);
    } catch {}
  }
}

// Validation Schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const shipmentSchema = z.object({
  trackingId: z.string().optional(),
  type: z.enum(["Flight", "Shipment"]),
  customerEmail: z.string().email(),
  userId: z.string().optional(),
  origin: z.string().min(2),
  destination: z.string().min(2),
  status: z.string(),
  productName: z.string().optional(),
  productDescription: z.string().optional(),
  productImage: z.string().optional(),
  weight: z.string().optional(),
  dimensions: z.string().optional(),
  history: z.array(z.object({
    status: z.string(),
    timestamp: z.string(),
    location: z.string().optional(),
    description: z.string().optional(),
    photoUrl: z.string().optional()
  })).optional(),
  receipts: z.array(z.object({
    id: z.string(),
    title: z.string(),
    amount: z.string(),
    date: z.string(),
    fileUrl: z.string().optional(),
    description: z.string().optional()
  })).optional()
});

async function startServer() {
  await ensureDataFile();
  
  const app = express();
  
  // Trust all proxies
  app.set('trust proxy', true);
  
  // Security Middlewares
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));
  app.use(cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
  }));
  app.use(compression()); // Compress responses
  app.use(morgan("dev")); // Logging
  
  // Custom API Logging
  app.use("/api", (req, res, next) => {
    console.log(`[API Request] ${req.method} ${req.path}`);
    next();
  });

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10000, // Increased even further
    message: { error: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
  });
  app.use("/api/", limiter);

  app.use(express.json({ limit: "10mb" })); // Increase limit for base64 images
  app.use(cookieParser());

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  const isAdmin = (req: any, res: any, next: any) => {
    if (req.user?.role !== "admin" || req.user?.email !== "pastorjohn046@gmail.com") {
      return res.status(403).json({ error: "Forbidden: Admin access restricted" });
    }
    next();
  };

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password } = registerSchema.parse(req.body);
      const data = await getData();
      if (data.users.find((u: any) => u.email === email)) {
        return res.status(400).json({ error: "User already exists" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        uid: Math.random().toString(36).substr(2, 9),
        email,
        password: hashedPassword,
        role: email === "pastorjohn046@gmail.com" ? "admin" : "customer"
      };
      data.users.push(newUser);
      await saveData(data);
      
      await addLog("User Registration", `New user registered: ${email}`, { email });

      const token = jwt.sign({ uid: newUser.uid, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: "30d" });
      res.cookie("token", token, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production", 
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
      return res.json({ uid: newUser.uid, email: newUser.email, role: newUser.role });
    } catch (err: any) {
      console.error("Registration error:", err);
      return res.status(400).json({ error: err.errors?.[0]?.message || "Invalid input or processing error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const data = await getData();
      const user = data.users.find((u: any) => u.email === email);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const token = jwt.sign({ uid: user.uid, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "30d" });
      res.cookie("token", token, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production", 
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
      await addLog("User Login", `User logged in: ${email}`, { email });
      return res.json({ uid: user.uid, email: user.email, role: user.role });
    } catch (err: any) {
      console.error("Login error:", err);
      return res.status(400).json({ error: err.errors?.[0]?.message || "Invalid input or processing error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ success: true });
  });

  app.get("/api/auth/me", (req: any, res) => {
    const token = req.cookies.token;
    if (!token) return res.json(null);
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      res.json(decoded);
    } catch (err) {
      res.json(null);
    }
  });

  app.get("/api/admin/users", authenticate, isAdmin, async (req: any, res) => {
    try {
      const data = await getData();
      res.json(data.users.map((u: any) => ({ uid: u.uid, email: u.email, role: u.role })));
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/logs", authenticate, isAdmin, async (req: any, res) => {
    try {
      const data = await getData();
      res.json(data.logs || []);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  });

  // Shipment Routes
  app.get("/api/shipments", authenticate, async (req: any, res) => {
    const data = await getData();
    if (req.user.role === "admin") {
      res.json(data.shipments);
    } else {
      res.json(data.shipments.filter((s: any) => s.userId === req.user.uid || s.customerEmail === req.user.email));
    }
  });

  app.post("/api/shipments/claim", authenticate, async (req: any, res) => {
    const { trackingId } = req.body;
    if (!trackingId) return res.status(400).json({ error: "Tracking ID is required" });
    
    const data = await getData();
    const shipment = data.shipments.find((s: any) => s.trackingId === trackingId);
    
    if (!shipment) return res.status(404).json({ error: "Shipment not found" });
    
    // Update shipment with current user's UID
    shipment.userId = req.user.uid;
    shipment.customerEmail = req.user.email; // Also update email to match current user
    shipment.updatedAt = new Date().toISOString();
    
    await saveData(data);
    res.json({ success: true, shipment });
  });

  app.get("/api/shipments/:id", async (req, res) => {
    const data = await getData();
    const shipment = data.shipments.find((s: any) => s.trackingId === req.params.id || s.id === req.params.id);
    if (!shipment) return res.status(404).json({ error: "Not found" });
    res.json(shipment);
  });

  app.post("/api/shipments", authenticate, isAdmin, async (req: any, res) => {
    try {
      const validatedData = shipmentSchema.parse(req.body);
      const data = await getData();
      const newShipment = {
        ...validatedData,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      data.shipments.push(newShipment);
      await saveData(data);
      await addLog("Shipment Created", `Created shipment: ${newShipment.trackingId}`, req.user);
      res.json(newShipment);
    } catch (err: any) {
      res.status(400).json({ error: err.errors?.[0]?.message || "Invalid input" });
    }
  });

  app.patch("/api/shipments/:id", authenticate, isAdmin, async (req: any, res) => {
    const data = await getData();
    const index = data.shipments.findIndex((s: any) => s.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Not found" });
    
    const oldStatus = data.shipments[index].status;
    data.shipments[index] = {
      ...data.shipments[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    await saveData(data);
    
    if (req.body.status && req.body.status !== oldStatus) {
      await addLog("Shipment Updated", `Updated status to ${req.body.status} for shipment ${data.shipments[index].trackingId}`, req.user);
    }
    
    res.json(data.shipments[index]);
  });
  
  app.delete("/api/shipments/:id", authenticate, isAdmin, async (req: any, res) => {
    const data = await getData();
    const index = data.shipments.findIndex((s: any) => s.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Not found" });
    
    const trackingId = data.shipments[index].trackingId;
    data.shipments.splice(index, 1);
    await saveData(data);
    await addLog("Shipment Deleted", `Deleted shipment: ${trackingId}`, req.user);
    res.json({ success: true });
  });

  // Ticket Routes
  app.get("/api/tickets", authenticate, async (req: any, res) => {
    const data = await getData();
    if (req.user.role === "admin") {
      res.json(data.tickets);
    } else {
      res.json(data.tickets.filter((t: any) => t.customerId === req.user.uid));
    }
  });

  app.post("/api/tickets", authenticate, async (req: any, res) => {
    const data = await getData();
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Message is required" });
    
    const newTicket = {
      id: Math.random().toString(36).substr(2, 9),
      customerId: req.user.uid,
      customerEmail: req.user.email,
      status: "open",
      createdAt: new Date().toISOString(),
      messages: [{
        sender: "Customer",
        text,
        timestamp: new Date().toISOString()
      }]
    };
    data.tickets.push(newTicket);
    await saveData(data);
    await addLog("Ticket Created", `New ticket created by ${req.user.email}`, req.user);
    res.json(newTicket);
  });

  app.post("/api/tickets/:id/messages", authenticate, async (req: any, res) => {
    const data = await getData();
    const ticket = data.tickets.find((t: any) => t.id === req.params.id);
    if (!ticket) return res.status(404).json({ error: "Not found" });
    
    // Check permission
    if (req.user.role !== "admin" && ticket.customerId !== req.user.uid) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Message is required" });
    
    ticket.messages.push({
      sender: req.user.role === "admin" ? "Admin" : "Customer",
      text,
      timestamp: new Date().toISOString()
    });
    ticket.status = "open"; // Re-open or keep open on new message
    await saveData(data);
    res.json(ticket);
  });

  app.patch("/api/tickets/:id", authenticate, isAdmin, async (req: any, res) => {
    const data = await getData();
    const index = data.tickets.findIndex((t: any) => t.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Not found" });
    data.tickets[index] = {
      ...data.tickets[index],
      ...req.body
    };
    await saveData(data);
    res.json(data.tickets[index]);
  });

  // Error handling middleware
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Server Error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
