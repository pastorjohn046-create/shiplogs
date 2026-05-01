import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";
import compression from "compression";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "peak-logistics-secret-key-2026";
const DATA_FILE = path.join(process.cwd(), "data.json");

async function startServer() {
  const app = express();

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(morgan("dev"));
  app.use(compression());
  app.use(express.json());
  app.use(cookieParser());

  // Data Management
  const initialData = {
    users: [
      {
        uid: "admin1",
        email: "pastorjohn046@gmail.com",
        password: await bcrypt.hash("password123", 10),
        role: "admin",
        name: "Central Admin"
      }
    ],
    shipments: [],
    tickets: []
  };

  async function getData() {
    try {
      const content = await fs.readFile(DATA_FILE, "utf-8");
      return JSON.parse(content);
    } catch {
      await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
      return initialData;
    }
  }

  async function saveData(data: any) {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  }

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    const { email, password, name } = req.body;
    const data = await getData();
    if (data.users.find((u: any) => u.email === email)) {
      return res.status(400).json({ error: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      uid: Math.random().toString(36).substring(7),
      email,
      password: hashedPassword,
      name: name || "User",
      role: "user"
    };
    data.users.push(newUser);
    await saveData(data);
    
    const token = jwt.sign({ uid: newUser.uid, role: newUser.role }, JWT_SECRET);
    res.cookie("token", token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
    res.json({ uid: newUser.uid, email: newUser.email, role: newUser.role, name: newUser.name });
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const data = await getData();
    const user = data.users.find((u: any) => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ uid: user.uid, role: user.role }, JWT_SECRET);
    res.cookie("token", token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
    res.json({ uid: user.uid, email: user.email, role: user.role, name: user.name });
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ status: "ok" });
  });

  app.get("/api/auth/me", async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Not logged in" });
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const data = await getData();
      const user = data.users.find((u: any) => u.uid === decoded.uid);
      if (!user) return res.status(401).json({ error: "User not found" });
      res.json({ uid: user.uid, email: user.email, role: user.role, name: user.name });
    } catch {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  // Shipment Routes
  app.get("/api/shipments", async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const data = await getData();
    
    if (decoded.role === "admin") {
      res.json(data.shipments);
    } else {
      res.json(data.shipments.filter((s: any) => s.userId === decoded.uid));
    }
  });

  app.get("/api/shipments/:trackingId", async (req, res) => {
    const data = await getData();
    const shipment = data.shipments.find((s: any) => s.trackingId === req.params.trackingId);
    if (!shipment) return res.status(404).json({ error: "Shipment not found" });
    res.json(shipment);
  });

  app.post("/api/shipments", async (req, res) => {
    const data = await getData();
    const newShipment = {
      ...req.body,
      id: Math.random().toString(36).substring(7),
      createdAt: new Date().toISOString()
    };
    data.shipments.push(newShipment);
    await saveData(data);
    res.json(newShipment);
  });

  app.patch("/api/shipments/:id", async (req, res) => {
    const data = await getData();
    const index = data.shipments.findIndex((s: any) => s.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Not found" });
    data.shipments[index] = { ...data.shipments[index], ...req.body };
    await saveData(data);
    res.json(data.shipments[index]);
  });

  app.delete("/api/shipments/:id", async (req, res) => {
    const data = await getData();
    data.shipments = data.shipments.filter((s: any) => s.id !== req.params.id);
    await saveData(data);
    res.json({ status: "ok" });
  });

  // Ticket Routes
  app.get("/api/tickets", async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const data = await getData();
      if (decoded.role === "admin") {
        res.json(data.tickets);
      } else {
        res.json(data.tickets.filter((t: any) => t.customerId === decoded.uid));
      }
    } catch {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  app.post("/api/tickets", async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const data = await getData();
      const newTicket = {
        ...req.body,
        id: Math.random().toString(36).substring(7),
        customerId: decoded.uid,
        status: "open",
        createdAt: new Date().toISOString(),
        messages: req.body.messages || []
      };
      data.tickets.push(newTicket);
      await saveData(data);
      res.json(newTicket);
    } catch {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  app.post("/api/tickets/:id/messages", async (req, res) => {
    const data = await getData();
    const index = data.tickets.findIndex((t: any) => t.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Not found" });
    if (!data.tickets[index].messages) data.tickets[index].messages = [];
    data.tickets[index].messages.push(req.body);
    await saveData(data);
    res.json(data.tickets[index]);
  });

  app.patch("/api/tickets/:id", async (req, res) => {
    const data = await getData();
    const index = data.tickets.findIndex((t: any) => t.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Not found" });
    data.tickets[index].status = req.body.status;
    await saveData(data);
    res.json(data.tickets[index]);
  });

  // Admin Routes
  app.get("/api/admin/users", async (req, res) => {
    const data = await getData();
    res.json(data.users.map(({ password, ...u }: any) => u));
  });

  // Vite middleware
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
    console.log(`[Peak Logistics] Server running on http://localhost:${PORT}`);
  });
}

startServer();
